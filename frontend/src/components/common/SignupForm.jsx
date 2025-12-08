import React, { useState, useEffect } from "react";
import "../../styles/connect.css";

export default function SignupForm({ onSignup, onLoginClick }) {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [purposes, setPurposes] = useState({
    firefighter: false,
    forestGuard: false,
    insurance: false,
    housing: false,
  });

  const [textIndex, setTextIndex] = useState(0);
  const [fade, setFade] = useState(false);
  const texts = [
    "Visualisez les zones à risques naturels.",
    "Anticipez le danger et assurez votre sécurité."
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setFade(true);
      setTimeout(() => {
        setTextIndex((prev) => (prev + 1) % texts.length);
        setFade(false);
      }, 350);
    }, 3500);
    return () => clearInterval(interval);
  }, []);
  const handleCheckboxChange = (key) => {
    setPurposes(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!username || !email || !password) {
      alert("Veuillez remplir tous les champs !");
      return;
    }
    const selectedPurposes = Object.entries(purposes)
      .filter(([_, value]) => value)
      .map(([key]) => key);

    onSignup({ username, email, password, purposes: selectedPurposes });
  };
  return (
    <div className="auth-wrapper">
      <div className="welcome-section">
        <h1 className="gradient-title">Bienvenue sur Physis</h1>
        <p className={`animated-subtitle ${fade ? "fade-out" : ""}`}>
          {texts[textIndex]}
        </p>
      </div>
      <div className="auth-card">
        <h2 className="auth-title">Créer un compte</h2>
        <form className="auth-form" onSubmit={handleSubmit}>
          <input
            type="text"
            placeholder="Nom d’utilisateur"
            value={username}
            onChange={e => setUsername(e.target.value)}
            className="auth-input"
          />
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={e => setEmail(e.target.value)}
            className="auth-input"
          />
          <input
            type="password"
            placeholder="Mot de passe"
            value={password}
            onChange={e => setPassword(e.target.value)}
            className="auth-input"
          />
          <fieldset style={{ border: "none", padding: 0, marginTop: 10 }}>
            <legend className="legend-text">
              Pourquoi utilisez-vous cette application{'\u00A0'}?
            </legend>
            <div className="checkbox-group">
              <label className="checkbox-label">
                <input
                  type="checkbox"
                  checked={purposes.firefighter}
                  onChange={() => handleCheckboxChange("firefighter")}
                />
                Je suis pompier et souhaite prévoir les risques avec précision
              </label>
              <label className="checkbox-label">
                <input
                  type="checkbox"
                  checked={purposes.forestGuard}
                  onChange={() => handleCheckboxChange("forestGuard")}
                />
                Je suis garde forestier et souhaite préserver les zones à risque
              </label>
              <label className="checkbox-label">
                <input
                  type="checkbox"
                  checked={purposes.insurance}
                  onChange={() => handleCheckboxChange("insurance")}
                />
                Je travaille pour une assurance et souhaite voir les zones avec un risque élevé
              </label>
              <label className="checkbox-label">
                <input
                  type="checkbox"
                  checked={purposes.housing}
                  onChange={() => handleCheckboxChange("housing")}
                />
                Je cherche un logement et souhaite voir les zones sécurisées
              </label>
            </div>
          </fieldset>
          <button type="submit" className="auth-btn">
            Créer mon compte
          </button>
        </form>
        <p className="auth-footer">
          Déjà un compte ?
          <span className="auth-link" onClick={onLoginClick}>
            Se connecter
          </span>
        </p>
      </div>
    </div>
  );
}
