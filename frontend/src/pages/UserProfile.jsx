import React from "react";
export default function UserProfile() {
  return (
    <div className="userprofile-container">
      <h2 className="card-title">
        Profil utilisateur
      </h2>
      <p style={{ color: '#666', marginBottom: '20px' }}>
        Gérez vos préférences et paramètres
      </p>
      <div className="card">
        <div className="profile-header">
          <div className="profile-avatar">👤</div>
          <div>
            <h3>Jean Dupont</h3>
            <p style={{ color: "gray", fontSize: "0.95rem" }}>jean.dupont@example.com</p>
          </div>
        </div>
        <div className="section">
          <label>Adresse e-mail</label>
          <input
            className="profile-input"
            defaultValue="jean.dupont@example.com"
            type="email"
          />
        </div>
        <div className="section">
          <label>Langue</label>
          <select className="select-input">
            <option value="fr">Français</option>
            <option value="en">Anglais</option>
          </select>
        </div>
      </div>
      <div className="card">
        <h2 className="card-title">Préférences de notification</h2>
        <div className="switch-container">
          <div className="switch-info">
            <strong>Notifications push</strong>
            <small>Recevoir des alertes sur ce navigateur</small>
          </div>
          <label className="switch">
            <input type="checkbox" />
            <span className="slider"></span>
          </label>
        </div>
        <div className="switch-container">
          <div className="switch-info">
            <strong>Notifications e-mail</strong>
            <small>Recevoir des alertes par e-mail</small>
          </div>
          <label className="switch">
            <input type="checkbox" />
            <span className="slider"></span>
          </label>
        </div>
        <div className="switch-container">
          <div className="switch-info">
            <strong>Résumé quotidien</strong>
            <small>Rapport journalier des zones surveillées</small>
          </div>
          <label className="switch">
            <input type="checkbox"/>
            <span className="slider"></span>
          </label>
        </div>
      </div>
      <div className="card">
        <h2 className="card-title">Zones abonnées</h2>
        <div className="zone-list">
          <div className="zone-item">
            <span>Centre-Ville</span>
            <button className="zone-button">Gérer</button>
          </div>
          <div className="zone-item">
            <span>Zone Forestière Sud</span>
            <button className="zone-button">Gérer</button>
          </div>

          <div className="zone-item">
            <span>Zone Industrielle Nord</span>
            <button className="zone-button">Gérer</button>
          </div>
        </div>
        <div className="save-buttons">
          <button className="btn-primary">Enregistrer les modifications</button>
          <button className="btn-secondary">Annuler</button>
        </div>
      </div>
    </div>
  );
}
  