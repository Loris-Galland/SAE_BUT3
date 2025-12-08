import React, { useEffect, useState, useRef } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import ZoneDetails from "../common/ZoneDetails";
import "../../styles/zonedetails.css";
import logoIUT from "../../assets/logo-iut.png";
import logoRepublique from "../../assets/logo-republique.png";
import { getWeather as getMeteoBlu } from "../../services/api";
import { getWeather as getOpenMeteo } from "../../services/apiDirect";

const zones = [
    {
        name: "Valbonne",
        polygon: [[43.62, 7.01], [43.62, 7.045], [43.60, 7.045], [43.60, 7.01]],
        risks: { incendie: "Moyen", inondation: "Faible", verglas: "Élevé", tempête: "Faible" },
        forecast: "Alerte verglas et Chaussée glissante !",
        subscribed: false
    },
    {
        name: "Biot",
        polygon: [[43.64, 7.08], [43.64, 7.11], [43.61, 7.11], [43.61, 7.08]],
        risks: { incendie: "Faible", inondation: "Élevé", verglas: "Moyen", tempête: "Faible" },
        forecast: "Alerte inondation",
        subscribed: false
    },
    {
        name: "Sophia Antipolis",
        polygon: [[43.635, 7.05], [43.635, 7.075], [43.61, 7.075], [43.61, 7.05]],
        risks: { incendie: "Moyen", inondation: "Moyen", verglas: "Faible", tempête: "Élevé" },
        forecast: "Alerte vent fort",
        subscribed: false
    }
];
const riskColors = { Faible: "green", Moyen: "orange", Élevé: "red" };
export default function RiskMap({ selectedRisk, useDailyAPI }) {
    const [selectedZone, setSelectedZone] = useState(zones[0]);
    const [weatherData, setWeatherData] = useState(null);
    const polygonRefs = useRef({});
    const lastFetchRef = useRef(0);
    useEffect(() => {
        lastFetchRef.current = 0;
        setWeatherData(null);
    }, [useDailyAPI]);
    useEffect(() => {
        if (useDailyAPI === null) return;
        const fetchData = async () => {
            const now = Date.now();
            if (now - lastFetchRef.current < 3600 * 1000 && weatherData) {
                return;
            }
            try {
                const data = useDailyAPI ? await getMeteoBlu() : await getOpenMeteo();
                if (!data) return;
                lastFetchRef.current = now;
                let normalized;
                if (useDailyAPI) {
                    normalized = {
                        temperature: Array.isArray(data.data_1h.temperature) ? data.data_1h.temperature : [data.data_1h.temperature ?? 0],
                        relativehumidity: Array.isArray(data.data_1h.relativehumidity) ? data.data_1h.relativehumidity : [data.data_1h.relativehumidity ?? 0],
                        windspeed: Array.isArray(data.data_1h.windspeed) ? data.data_1h.windspeed : [data.data_1h.windspeed ?? 0],
                        precipitation_probability: Array.isArray(data.data_1h.precipitation_probability) ? data.data_1h.precipitation_probability : [data.data_1h.precipitation_probability ?? 0]
                    };
                } else {
                    normalized = {
                        temperature: Array.isArray(data.temperature) ? data.temperature : [data.temperature ?? 0],
                        relativehumidity: Array.isArray(data.relativehumidity || data.humidity) ? (data.relativehumidity ?? data.humidity) : [data.relativehumidity ?? data.humidity ?? 0],
                        windspeed: Array.isArray(data.windspeed || data.wind) ? (data.windspeed ?? data.wind) : [data.windspeed ?? data.wind ?? 0],
                        precipitation_probability: Array.isArray(data.precipitation_probability || data.rainProb) ? (data.precipitation_probability ?? data.rainProb) : [data.precipitation_probability ?? data.rainProb ?? 0]
                    };
                }
                setWeatherData(normalized);
            } catch (err) {
                console.error("Erreur récupération météo :", err);
            }
        };
        fetchData();
    }, [useDailyAPI]);

    useEffect(() => {
        if (!document.getElementById("map")) return;
        const isMobile = window.innerWidth < 768;
        const initialZoom = isMobile ? 11 : 13;
        const map = L.map("map", { zoomControl: false })
            .setView([43.6167, 7.0676], initialZoom);
        L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
            attribution: "© OpenStreetMap contributors"
        }).addTo(map);

        const logosControl = L.control({ position: "topright" });
        logosControl.onAdd = () => {
            const div = L.DomUtil.create("div", "logos-container");
            div.style.display = "flex";
            div.style.gap = "10px";
            div.style.alignItems = "center";
            div.style.background = "white";
            div.style.padding = "6px 10px";
            div.style.borderRadius = "8px";
            div.style.boxShadow = "0 2px 6px rgba(0,0,0,0.15)";
            const img1 = L.DomUtil.create("img", "", div);
            img1.src = logoIUT;
            img1.style.height = "35px";
            const img2 = L.DomUtil.create("img", "", div);
            img2.src = logoRepublique;
            img2.style.height = "35px";
            return div;
        };

        logosControl.addTo(map);
        zones.forEach(zone => {
            const poly = L.polygon(zone.polygon, { color: "blue", weight: 2, fillOpacity: 0.15 }).addTo(map);
            poly.bindTooltip(zone.name, { permanent: true, direction: "center", className: "zone-label" }).openTooltip();
            polygonRefs.current[zone.name] = poly;
            poly.on("mouseover", () => {
                if (!weatherData) return;
                const popupHTML = `
                    <b>${zone.name}</b><br/>
                    Température : ${weatherData.temperature[0]}°C<br/>
                    Humidité : ${weatherData.relativehumidity[0]}%<br/>
                    Vent : ${weatherData.windspeed[0]} km/h<br/>
                    Probabilité pluie : ${weatherData.precipitation_probability[0]}%
                `;
                poly.bindPopup(popupHTML).openPopup();
            });
            poly.on("mouseout", () => poly.closePopup());
            poly.on("click", () => {
                setSelectedZone({ ...zone, weather: weatherData });
            });
        });
        const zoomControl = L.Control.extend({
            options: { position: "bottomright" },
            onAdd: () => {
                const container = L.DomUtil.create("div", "custom-zoom");
                container.innerHTML = `<button id="zoom-in">+</button><button id="zoom-out">-</button>`;
                container.style.display = "flex";
                container.style.flexDirection = "column";
                container.style.gap = "4px";
                container.style.background = "white";
                container.style.padding = "4px";
                container.style.borderRadius = "4px";
                L.DomEvent.disableClickPropagation(container);
                return container;
            }
        });
        map.addControl(new zoomControl());
        document.getElementById("zoom-in").onclick = () => map.zoomIn();
        document.getElementById("zoom-out").onclick = () => map.zoomOut();

        const legend = L.control({ position: "topleft" });
        legend.onAdd = () => {
            const div = L.DomUtil.create("div", "legend");
            div.style.background = "rgba(255,255,255,0.9)";
            div.style.padding = "8px";
            div.style.borderRadius = "8px";
            div.style.fontSize = "12px";
            div.innerHTML = `
                <b>Zones à risques</b><br/>
                <span style="display:inline-block;width:12px;height:12px;background:green;margin-right:5px;"></span> Faible<br/>
                <span style="display:inline-block;width:12px;height:12px;background:orange;margin-right:5px;"></span> Moyen<br/>
                <span style="display:inline-block;width:12px;height:12px;background:red;margin-right:5px;"></span> Élevé
            `;
            return div;
        };
        legend.addTo(map);
        return () => map.remove();
    }, [weatherData]);

    useEffect(() => {
        zones.forEach(zone => {
            const poly = polygonRefs.current[zone.name];
            if (!poly) return;
            if (!selectedRisk) {
                poly.setStyle({ color: "blue", fillColor: "blue", fillOpacity: 0.15 });
            } else {
                const level = zone.risks[selectedRisk];
                const color = riskColors[level] || "blue";
                poly.setStyle({ color, fillColor: color, fillOpacity: 0.45 });
            }
        });
    }, [selectedRisk]);
    const handleToggleSubscription = () => {
        setSelectedZone(prev => ({ ...prev, subscribed: !prev.subscribed }));
    };
    return (
        <div className="map-container">
            <div id="map" className="map"></div>
            <ZoneDetails zone={selectedZone} onToggleSubscription={handleToggleSubscription} />
        </div>
    );
}
