import React, { useState } from "react";
import "../styles/comparezones.css";

export default function CompareZones({ zones = [] }) {
  const [zone1Visible, setZone1Visible] = useState(false);
  const [zone2Visible, setZone2Visible] = useState(false);
  const [zone3Visible, setZone3Visible] = useState(false);

  const zoneOptions = [
    "Sophia Centre",
    "Technopole Nord",
    "Zone Forestière Sud",
    "Quartier des Lucioles",
    "Quartier Valbonne",
  ];
  const riskOptions = [
    "Risque dominant",
    "Risque non dominant",
    "Incendie",
    "Inondation",
    "Verglas",
    "Tempête",
  ];
  return (
    <div className="compare-container">
      <h2 className="compare-title">Comparaison de zones</h2>
      <p className="compare-subtitle">
        Choisissez les zones pour afficher leurs différences
      </p>
      <div className="selector-grid">
        <div className="selector-block">
          <p>Zone 1</p>
          <button className="btn-primary btn-full-mobile" onClick={() => setZone1Visible(!zone1Visible)}>
            Voir Zone 1
          </button>
          {zone1Visible && (
            <ul className="zone-list">
              {zoneOptions.map((zone, idx) => (
                <li key={idx}>{zone}</li>
              ))}
            </ul>
          )}
        </div>
        <div className="selector-block">
          <p>Zone 2</p>
          <button className="btn-primary btn-full-mobile" onClick={() => setZone2Visible(!zone2Visible)}>
            Voir Zone 2
          </button>
          {zone2Visible && (
            <ul className="zone-list">
              {zoneOptions.map((zone, idx) => (
                <li key={idx}>{zone}</li>
              ))}
            </ul>
          )}
        </div>
        <div className="selector-block">
          <p>Zone 3</p>
          <button className="btn-primary btn-full-mobile" onClick={() => setZone3Visible(!zone3Visible)}>
            Voir Zone 3
          </button>
          {zone3Visible && (
            <ul className="zone-list">
              <li style={{ fontWeight: "700", marginTop: "10px" }}>Type de risque</li>
              {riskOptions.map((risk, idx) => (
                <li key={idx}>{risk}</li>
              ))}
            </ul>
          )}
        </div>
      </div>
      <div className="selector-block">
        <label>Comparaison statique</label>
        <div className="compare-table-container table-responsive">
          <table className="compare-table">
            <thead>
              <tr>
                <th>Métrique</th>
                <th>Technopole Nord</th>
                <th>Technopole Nord</th>
                <th>Différence</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>Niveau de risque</td>
                <td>Élevé</td>
                <td>Élevé</td>
                <td>-</td>
              </tr>
              <tr>
                <td>Température</td>
                <td>-2°C</td>
                <td>-2°C</td>
                <td>0°C</td>
              </tr>
              <tr>
                <td>Humidité</td>
                <td>90%</td>
                <td>90%</td>
                <td>0%</td>
              </tr>
              <tr>
                <td>Vitesse du vent</td>
                <td>8 km/h</td>
                <td>8 km/h</td>
                <td>0 km/h</td>
              </tr>
            </tbody>
          </table>
        </div>
        <button className="btn-primary btn-full-mobile" style={{ marginTop: "15px" }}>
          Exporter la comparaison (CSV)
        </button>
      </div>
    </div>
  );
}
