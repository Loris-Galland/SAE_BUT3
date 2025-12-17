import React, { useState, useEffect } from "react";
import "../../styles/connect.css";

export default function LoginForm({ onSignupClick, onLogin }) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const [texts] = useState([
    "Analysez les risques naturels",
    "Accédez à des données fiables",
  ]);

  const [textIndex, setTextIndex] = useState(0);
  const [fade, setFade] = useState(false);

  useEffect(() => {
    const interval = setInterval(() => {
      setFade(true);
      setTimeout(() => {
        setTextIndex((i) => (i + 1) % texts.length);
        setFade(false);
      }, 400);
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();

    //const res = await fetch(`${import.meta.env.VITE_API_URL}/api/login`, {
    const res = await fetch(`http://localhost:3000/api/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, password })
    });

    const data = await res.json();

    if (!data.success) {
      alert(data.error || "Identifiants incorrects");
      return;
    }

    console.log("Utilisateur connecté :", data.user);
    onLogin(data.user);
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

          <div style={{ position: "relative" }}>
            <input
              type={showPassword ? "text" : "password"}
              placeholder="Mot de passe"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="auth-input"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              style={{
                position: "absolute",
                right: 10,
                top: 8,
                background: "none",
                border: "none",
                cursor: "pointer",
                fontSize: "1.2rem"
              }}
            >
              {showPassword ? "🙈" : "👁️"}
            </button>
          </div>

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
