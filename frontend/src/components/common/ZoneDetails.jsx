import React, { useState, useEffect } from "react";
import "../../styles/zonedetails.css";
import HistoryChart from "../HistoryChart";

export default function ZoneDetails({ zone, onToggleSubscription, isSensorMode }) {
    const [activeTab, setActiveTab] = useState("current");
    const [isMobile, setIsMobile] = useState(window.innerWidth <= 900);
    const [open, setOpen] = useState(false);

    useEffect(() => {
        if (zone) setOpen(true);
    }, [zone]);

    useEffect(() => {
        const handleResize = () => setIsMobile(window.innerWidth <= 900);
        window.addEventListener("resize", handleResize);
        return () => window.removeEventListener("resize", handleResize);
    }, []);

    const getRiskColor = (level) => {
        switch (level) {
            case "Faible": return "#4CAF50";
            case "Moyen": return "#FF9800";
            case "Élevé": return "#F44336";
            default: return "#999";
        }
    };

    const content = zone ? (
        <>
            <div className="zone-tabs">
                <button
                    className={`tab-btn ${activeTab === "current" ? "active" : ""}`}
                    onClick={() => setActiveTab("current")}
                >
                    Données actuelles
                </button>
                <button
                    className={`tab-btn ${activeTab === "history" ? "active" : ""}`}
                    onClick={() => setActiveTab("history")}
                >
                    Historique
                </button>
            </div>

            {activeTab === "current" ? (
                <>
                    {/* SECTION DONNÉES TEMPS RÉEL */}
                    <div className="zone-section">
                        <h3>
                            {isSensorMode ? "Données Capteurs (Direct)" : "Données Météo (API)"}
                        </h3>

                        {zone.weather ? (
                            <>
                                {/* 1. TEMPÉRATURE (Toujours visible) */}
                                <div className="sensor-item">
                                    <span>Température</span>
                                    <span>{zone.weather.temperature[0]}°C</span>
                                </div>

                                {/* 2. HUMIDITÉ (Toujours visible) */}
                                <div className="sensor-item">
                                    <span>Humidité</span>
                                    <span>{zone.weather.relativehumidity[0]}%</span>
                                </div>

                                {/* 3. BRANCHEMENT CONDITIONNEL */}
                                {isSensorMode ? (
                                    // >>> CAS CAPTEUR : On affiche GAZ (et on cache vent/pluie)
                                    <div className="sensor-item" style={{ borderLeft: "3px solid #FF9800" }}>
                                        <span>Gaz / Fumée</span>
                                        {/* On affiche la valeur du gaz ou '--' si absent */}
                                        <span>
                                            {zone.weather.gaz !== undefined 
                                                ? `${zone.weather.gaz[0]} ppm` 
                                                : "-- ppm"}
                                        </span>
                                    </div>
                                ) : (
                                    // >>> CAS API : On affiche VENT et PLUIE
                                    <>
                                        <div className="sensor-item">
                                            <span>Vitesse du vent</span>
                                            <span>{zone.weather.windspeed[0]} km/h</span>
                                        </div>
                                        <div className="sensor-item">
                                            <span>Probabilité de pluie</span>
                                            <span>{zone.weather.precipitation_probability[0]}%</span>
                                        </div>
                                    </>
                                )}
                            </>
                        ) : (
                            <p>Données non disponibles pour le moment.</p>
                        )}
                    </div>

                    {/* SECTION RISQUES */}
                    <div className="zone-section">
                        <h3>Tous les risques pour cette zone</h3>
                        {zone.risks ? (
                            Object.entries(zone.risks).map(([key, level]) => (
                                <div key={key} className="risk-item" style={{ borderColor: getRiskColor(level) }}>
                                    <span>
                                        {key === "incendie" || key === "fire" ? "Incendie"
                                            : key === "flood" || key === "inondation" ? "Inondation"
                                            : key === "ice" || key === "verglas" ? "Verglas"
                                            : key === "storm" || key === "tempête" ? "Tempête"
                                            : key}
                                    </span>
                                    <span style={{ color: getRiskColor(level), fontWeight: "bold" }}>
                                        {level}
                                    </span>
                                </div>
                            ))
                        ) : <p>Aucun risque enregistré</p>}
                    </div>

                    <div className="zone-section">
                        <h3>Prévisions à court terme</h3>
                        <p>{zone.forecast || "Cliquer sur une zone pour voir les prévisions"}</p>
                    </div>
                </>
            ) : (
                <div className="zone-section">
                    <h3>Historique sur 7 jours</h3>
                    <HistoryChart zoneId={zone.name} />
                </div>
            )}
        </>
    ) : (
        <p style={{ padding: "20px" }}>Aucune zone sélectionnée</p>
    );

    return (
        <>
            <button
                className={`zone-details-toggle-btn ${open ? "btn-red" : ""}`}
                onClick={() => setOpen(!open)}
            >
                {open ? "Fermer" : "Zones"}
            </button>
            {open && (
                <div className={`zone-details-container ${isMobile ? "mobile" : ""}`}>
                    {zone && (
                        <div className="zone-details-header">
                            <h2>{zone.name}</h2>
                            {isMobile && (
                                <button className="close-btn" onClick={() => setOpen(false)}>✕</button>
                            )}
                        </div>
                    )}
                    <div className="zone-content">
                        {content}
                    </div>
                    <div className="zone-actions">
                        {onToggleSubscription && (
                            <button className="action-btn">
                                {zone?.subscribed ? "Se désabonner" : "S'abonner aux alertes"}
                            </button>
                        )}
                        <button className="action-btn">Exporter les données</button>
                    </div>
                </div>
            )}
        </>
    );
}