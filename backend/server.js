require('dotenv').config();

const express = require('express');
const nodemailer = require('nodemailer')
const fetch = require('node-fetch');
const fs = require('fs-extra');
const path = require('path');
const cron = require('node-cron');
const cors = require('cors');
const mysql = require('mysql2/promise');

const db = mysql.createPool({
  host: process.env.DB_HOST || 'mysql',
  user: process.env.DB_USER || 'nodered',
  password: process.env.DB_PASSWORD || 'noderedpassword',
  database: process.env.DB_NAME || 'nodered'
});

const app = express();
app.use(cors());
app.use(express.json());

const DATA_PATH = path.join(__dirname, 'data', 'storage.json');
const API_KEY = process.env.API_KEY;
const PORT = process.env.PORT || 3000;

// Mapping des zones concernées
const ZONES = {
  "Valbonne": { lat: 43.62, lon: 7.01 },
  "Biot": { lat: 43.64, lon: 7.09 },
  "Sophia Antipolis": { lat: 43.635, lon: 7.05 }
};


// Récupère les données utilisateur de la base de donnée
const userDB = mysql.createPool({
  host: process.env.DB_HOST || 'mysql',
  user: process.env.DB_USER || 'nodered',
  password: process.env.DB_PASSWORD || 'noderedpassword',
  database: 'utilisateurs'
});

(async () => {
  try {
    const connection = await mysql.createConnection({
      host: process.env.DB_HOST || 'mysql',
      user: process.env.DB_USER || 'nodered',
      password: process.env.DB_PASSWORD || 'noderedpassword'
    });
    await connection.query(`CREATE DATABASE IF NOT EXISTS utilisateurs`);
    await connection.query(`USE utilisateurs`);
    await connection.query(`
      CREATE TABLE IF NOT EXISTS users (
        id INT AUTO_INCREMENT PRIMARY KEY,
        username VARCHAR(100) NOT NULL UNIQUE,
        email VARCHAR(150) NOT NULL UNIQUE,
        password VARCHAR(255) NOT NULL,
        \`usage_type\` TEXT,
        langue VARCHAR(20) DEFAULT 'fr',
        notifications TEXT,
        zones TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    console.log("Base de données locale configurée");
  } catch (e) {
    console.log("Info DB: " + e.message);
  }
})();

async function ensureStorage() {
  await fs.ensureFile(DATA_PATH);
  const exists = await fs.readJson(DATA_PATH).catch(() => null);
  if (!exists) {
    await fs.writeJson(DATA_PATH, { zones: Object.fromEntries(Object.keys(ZONES).map(z => [z, []])) }, { spaces: 2 });
  }
}

// Récupération des données pour l'historique
async function fetchMeteoblue(zoneName) {
  const z = ZONES[zoneName];
  if (!z) throw new Error('Zone inconnue');
  const url = `https://my.meteoblue.com/packages/basic-1h_basic-day?lat=${z.lat}&lon=${z.lon}&apikey=${API_KEY}`;
  const res = await fetch(url);
  if (!res.ok) {
    const text = await res.text();
    console.error('Meteoblue error', res.status, text);
    throw new Error('Erreur Meteoblue');
  }
  return res.json();
}

// Récupération d'une heure spécifique dans la journée pour y constituer un historique par jour
function computeDailySummary(apiJson) {
  const d = apiJson.data_1h;
  if (!d || !d.time) return null;
  const dates = d.time.map(t => t.split(' ')[0]);
  const targetDate = dates[0];
  const indices = dates.map((dt, idx) => dt === targetDate ? idx : -1).filter(i => i !== -1);
  if (indices.length === 0) return null;
  // Données récupérées et affichées
  const fields = ['temperature', 'relativehumidity', 'windspeed', 'precipitation_probability'];
  const summary = { date: targetDate };
  fields.forEach(field => {
    const arr = d[field];
    if (!arr) {
      summary[field] = null;
      return;
    }
    const vals = indices.map(i => arr[i]).filter(v => v !== null && v !== undefined);
    const avg = vals.length ? vals.reduce((s, v) => s + v, 0) / vals.length : null;
    summary[field] = avg !== null ? Math.round(avg * 100) / 100 : null;
  });
  summary.snapshot = {
    temperature: d.temperature && d.temperature[indices[0]] != null ? d.temperature[indices[0]] : null,
    humidity: d.relativehumidity && d.relativehumidity[indices[0]] != null ? d.relativehumidity[indices[0]] : null,
    windSpeed: d.windspeed && d.windspeed[indices[0]] != null ? d.windspeed[indices[0]] : null,
    precipProb: d.precipitation_probability && d.precipitation_probability[indices[0]] != null ? d.precipitation_probability[indices[0]] : null
  };
  return summary;
}

// éviter des doublons de résumé pour un même jour
async function appendSummary(zoneName, summary) {
  await ensureStorage();
  const storage = await fs.readJson(DATA_PATH);
  const arr = storage.zones[zoneName] || [];
  if (arr.length && arr[arr.length - 1].date === summary.date) {
    arr[arr.length - 1] = summary;
  } else {
    arr.push(summary);
    if (arr.length > 365) arr.shift();
  }
  storage.zones[zoneName] = arr;
  await fs.writeJson(DATA_PATH, storage, { spaces: 2 });
}

// Séparation dans la récupération des données zones par zones
async function fetchAndStoreZone(zoneName) {
  try {
    console.log('Fetching for', zoneName);
    const apiJson = await fetchMeteoblue(zoneName);
    const summary = computeDailySummary(apiJson);
    if (!summary) throw new Error('Impossible de calculer le résumé journalier');
    await appendSummary(zoneName, summary);
    console.log('Stored summary for', zoneName, summary.date);
    return summary;
  } catch (err) {
    console.error('Erreur fetchAndStoreZone', zoneName, err.message);
    throw err;
  }
}

app.get('/api/history/:zoneId', async (req, res) => {
  const { zoneId } = req.params;
  const days = parseInt(req.query.days || '7', 10);
  try {
    await ensureStorage();
    const storage = await fs.readJson(DATA_PATH);
    const arr = storage.zones[zoneId] || [];
    const slice = arr.slice(-days).map(item => {
      const d = new Date(item.date + 'T00:00:00');
      const dd = d.toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit' });
      return {
        date: dd,
        temperature: item.temperature !== undefined ? item.temperature : (item.snapshot ? item.snapshot.temperature : null),
        humidity: item.relativehumidity !== undefined ? item.relativehumidity : (item.snapshot ? item.snapshot.humidity : null),
        windSpeed: item.snapshot ? item.snapshot.windSpeed : null,
        raw: item
      };
    });
    res.json(slice);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

app.post('/api/fetch-now', async (req, res) => {
  try {
    const results = {};
    for (const zoneName of Object.keys(ZONES)) {
      try {
        const summary = await fetchAndStoreZone(zoneName);
        results[zoneName] = { ok: true, date: summary.date };
      } catch (err) {
        results[zoneName] = { ok: false, error: err.message };
      }
    }
    res.json({ results });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Erreur lors du fetch manuel' });
  }
});

app.get('/api/zones', (req, res) => {
  res.json(Object.keys(ZONES));
});

// Inscription utilisateur
app.post('/api/signup', async (req, res) => {
  try {
    const { username, email, password, purposes, langue, notifications, zones } = req.body;

    // Champs obligatoires
    if (!username || !email || !password) {
      return res.status(400).json({ error: "Champs manquants" });
    }

    // Vérifier si username existe déjà
    const [existingUser] = await userDB.query(
      "SELECT id FROM users WHERE username = ?",
      [username]
    );

    if (existingUser.length > 0) {
      return res.status(409).json({ error: "Nom d'utilisateur déjà utilisé" });
    }

    const purposeMap = {
      firefighter: 'Je suis pompier et souhaite prévoir les risques avec précision',
      forestGuard: 'Je suis garde forestier et souhaite préserver les zones à risque',
      insurance: 'Je travaille pour une assurance et souhaite voir les zones avec un risque élevé',
      housing: 'Je cherche un logement et souhaite voir les zones sécurisées'
    };

    const selectedPurposes = purposes.map(p => purposeMap[p]);

    await userDB.query(
      `INSERT INTO users (username, email, password, \`usage_type\`, langue, notifications, zones)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [
        username,
        email,
        password,
        selectedPurposes.join(',') || null,
        langue || 'fr',
        notifications.join(',') || null,
        zones.join(',') || null,
      ]
    );

    res.json({ success: true });
  } catch (err) {
    console.error("Signup error:", err);
    res.status(500).json({ error: "Erreur serveur" });
  }
});
app.post('/api/submit-report', async (req, res) => {
  const { type, description, userEmail } = req.body;

  if (!type || !description) {
    return res.status(400).json({ error: 'Champs manquants.' });
  }

  // La configuration de l'expediteur
  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: 'saebut3@gmail.com', 
      pass: 'fkyo kwxd gcjz xqun'
    }
  });

  // La configuration du message
  const mailOptions = {
    from: '"App SAE IOT" saebut3@gmail.com', 
    to: 'loris.galland123@gmail.com', 
    replyTo: userEmail, 
    subject: `[Rapport ${type}] Nouveau message de l'app`,
    text: `
      Nouveau rapport reçu depuis l'application.
      
      Type : ${type}
      Auteur : ${userEmail}
      Date : ${new Date().toLocaleString()}

      -----------------------------------------
      Message :
      ${description}
    `
  };

  // Envoi de l'email
  try {
    await transporter.sendMail(mailOptions);
    console.log('Email envoyé avec succès !');
    res.json({ message: 'Email envoyé !' });
  } catch (error) {
    console.error("Erreur d'envoi mail:", error);
    res.status(500).json({ error: "Erreur lors de l'envoi du mail." });
  }
});

// Connexion utilisateur
app.post('/api/login', async (req, res) => {
  try {
    const { username, password } = req.body;
    const [rows] = await userDB.query(
      `SELECT * FROM users WHERE username = ?`,
      [username]
    );
    if (rows.length === 0) {
      return res.status(401).json({ error: "Utilisateur introuvable" });
    }
    const user = rows[0];
    if (password !== user.password) {
      return res.status(401).json({ error: "Mot de passe incorrect" });
    }
    res.json({
      success: true,
      user: {
        id: user.id,
        username: user.username,
        password: user.password,
        email: user.email,
        langue: user.langue || 'fr',
        notifications: user.notifications
          ? user.notifications.split(',')
          : [],
        zones: user.zones
          ? user.zones.split(',')
          : []
      }
    });
  } catch (err) {
    console.error("Login error:", err);
    res.status(500).json({ error: "Erreur serveur" });
  }
});
app.put('/api/users/:id', async (req, res) => {
  const userId = req.params.id;
  const { username, email, langue, newPassword, notifications, zones } = req.body;

  try {
    let query = "UPDATE users SET username = ?, email = ?, langue = ?, notifications = ?, zones = ?";
    let params = [ username, email, langue, notifications?.join(',') || null, zones?.join(',') || null];
    if (newPassword && newPassword.trim() !== "") {
      query += ", password = ?";
      params.push(newPassword);
    }


    query += " WHERE id = ?";
    params.push(userId);

    await userDB.query(query, params);

    res.json({
      success: true,
      message: "Profil mis à jour",
      user: { id: userId, username, email, langue }
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, error: "Erreur serveur" });
  }
});
app.get('/api/latest-sensors', async (req, res) => {
  try {
    const [rows] = await db.query(`
      SELECT m1.*
      FROM mqtt_messages m1
      INNER JOIN (
        SELECT deviceId, MAX(received_at) AS last_time
        FROM mqtt_messages
        GROUP BY deviceId
      ) m2 ON m1.deviceId = m2.deviceId AND m1.received_at = m2.last_time
    `);
    res.json(rows);
  } catch (err) {
    console.error("Erreur /api/latest-sensors :", err);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

app.get('/api/utilisateurs', async (req, res) => {
  try {
    const [rows] = await userDB.query(`
      SELECT id, username, email, password, langue, \`usage_type\`, notifications, zones, created_at
      FROM users
    `);
    res.json(rows);
  } catch (err) {
    console.error("Erreur /api/utilisateurs:", err);
    res.status(500).json({ error: err.message });
  }
});

cron.schedule('5 0 * * *', async () => {
  console.log('Cron: starting daily fetch of zones');
  for (const z of Object.keys(ZONES)) {
    try {
      await fetchAndStoreZone(z);
    } catch (err) {
      console.error('Cron fetch failed for', z, err.message);
    }
  }
});

// Démarrage du serveur 
app.listen(PORT, async () => {
  console.log(`History backend listening on http://localhost:${PORT}`);
  await ensureStorage();
});