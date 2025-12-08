import React, { useEffect, useState } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer
} from "recharts";

export default function HistoryChart({ zoneId }) {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!zoneId) return;
    setLoading(true);
    setError(null);

    async function load() {
      try {
        const res = await fetch(`http://localhost:3000/api/history/${encodeURIComponent(zoneId)}?days=7`);
        if (!res.ok) throw new Error('Erreur fetch historique');
        const json = await res.json();
        // ensure numbers are numbers
        const normalized = json.map(d => ({
          date: d.date,
          temperature: d.temperature != null ? Number(d.temperature) : null,
          humidity: d.humidity != null ? Number(d.humidity) : null,
          windSpeed: d.windSpeed != null ? Number(d.windSpeed) : null
        }));
        setData(normalized);
      } catch (e) {
        console.error(e);
        setError(e.message);
      } finally {
        setLoading(false);
      }
    }

    load();
  }, [zoneId]);

  if (loading) return <p>Chargement de l'historique...</p>;
  if (error) return <p>Erreur: {error}</p>;
  if (!data || data.length === 0) return <p>Aucun historique disponible (exécute /api/fetch-now ou attends la collecte quotidienne).</p>;

  return (
    <div className="history-card" style={{
      background: "white",
      padding: "12px",
      borderRadius: "12px",
      boxShadow: "0 2px 4px rgba(0,0,0,0.06)",
      marginTop: "10px"
    }}>
      <h3 style={{ marginBottom: "12px" }}>Évolution sur 7 jours</h3>

      <div style={{ display: 'grid', gap: 18 }}>
        {/* Température */}
        <div>
          <p className="text-sm mb-3">Température (°C)</p>
          <ResponsiveContainer width="100%" height={200}>
            <LineChart data={data}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip />
              <Line type="monotone" dataKey="temperature" stroke="#ef4444" strokeWidth={2} dot={{ r: 3 }} />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Humidité */}
        <div>
          <p className="text-sm mb-3">Humidité (%)</p>
          <ResponsiveContainer width="100%" height={200}>
            <LineChart data={data}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip />
              <Line type="monotone" dataKey="humidity" stroke="#3b82f6" strokeWidth={2} dot={{ r: 3 }} />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Vent */}
        <div>
          <p className="text-sm mb-3">Vent (km/h)</p>
          <ResponsiveContainer width="100%" height={200}>
            <LineChart data={data}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip />
              <Line type="monotone" dataKey="windSpeed" stroke="#8b5cf6" strokeWidth={2} dot={{ r: 3 }} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
