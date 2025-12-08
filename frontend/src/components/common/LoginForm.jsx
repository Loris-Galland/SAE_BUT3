import React, { useState, useEffect } from "react";
import "../../styles/connect.css";

export default function LoginForm({ onLogin, onSignupClick }) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
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

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log("Connexion avec :", { username, password });
    onLogin();
  };

  return (
    <div className="auth-wrapper">
      <div className="welcome-section">
        <h1 className="gradient-title">Bienvenue sur</h1>
        <p className={`animated-subtitle ${fade ? "fade-out" : ""}`}>
          {texts[textIndex]}
        </p>
      </div>
      <div className="auth-card">
        <h2 className="auth-title">Connexion</h2>
        <form className="auth-form" onSubmit={handleSubmit}>
          <input
            type="text"
            placeholder="Nom d’utilisateur"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
            className="auth-input"
          />
          <input
            type="password"
            placeholder="Mot de passe"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            className="auth-input"
          />
          <button type="submit" className="auth-btn">
            Se connecter
          </button>
        </form>
        <p className="auth-footer">
          Pas encore de compte ?
          <span className="auth-link" onClick={onSignupClick}>
            S’inscrire
          </span>
        </p>
      </div>
    </div>
  );
}
