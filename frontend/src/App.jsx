import React, { useState } from "react";
import UserProfile from "./pages/UserProfile";
import CompareZones from "./pages/CompareZones";
import { Sidebar } from "./components/common/Sidebar";
import RiskMap from "./components/risk/RiskMap";
import Settings from "./pages/Settings";
import { AlertsPanel } from "./components/common/AlertsPanel";
import SignupForm from "./components/common/SignupForm";
import LoginForm from "./components/common/LoginForm";
import "./styles/styles.css";

const initialAlerts = [
    { id: "1", zoneId: "valbonne", zoneName: "Valbonne", message: "Risque verglas", riskLevel: "high", timestamp: new Date(), read: false },
    { id: "2", zoneId: "biot", zoneName: "Biot", message: "Risque inondation", riskLevel: "high", timestamp: new Date(), read: false },
    { id: "3", zoneId: "Sophia Antipolis", zoneName: "Sophia Antipolis", message: "Risque tempête", riskLevel: "high", timestamp: new Date(), read: false },
];

export default function App() {
    const [activeView, setActiveView] = useState("map");
    const [activeFilter, setActiveFilter] = useState("Tous les risques");
    const [selectedRisk, setSelectedRisk] = useState(null);
    const [alerts, setAlerts] = useState(initialAlerts);
    const [useDailyAPI, setUseDailyAPI] = useState(true);
    const [isSignedUp, setIsSignedUp] = useState(false);
    const [authView, setAuthView] = useState("signup");

    const getBackgroundForFilter = () => {
        switch (activeFilter) {
            case "Incendie": return "linear-gradient(135deg, #fff5ee 30%, #fdbc7bff 100%)";
            case "Inondation": return "linear-gradient(135deg, #e6f8ff 30%, #86d6ffff 100%)";
            case "Verglas": return "linear-gradient(135deg, #f0f8ff 30%, #b0d3fbff 100%)";
            case "Tempête": return "linear-gradient(135deg, #f2f2f2 30%, #878787ff 100%)";
            default: return "#fff";
        }
    };
    const getTitleForFilter = () => {
        switch (activeFilter) {
            case "Incendie": return "Vue Incendie";
            case "Inondation": return "Vue Inondation";
            case "Verglas": return "Vue Verglas";
            case "Tempête": return "Vue Tempête";
            default: return "Vue générale";
        }
    };
    const handleMarkAsRead = (alertId) => {
        setAlerts(prev => prev.map(a => a.id === alertId ? { ...a, read: true } : a));
    };
    const handleAlertClick = (zoneId) => {
        console.log("Alert clicked for zone:", zoneId);
    };

    if (!isSignedUp) {
        return authView === "signup" ? (
            <SignupForm onSignup={() => setIsSignedUp(true)} onLoginClick={() => setAuthView("login")} />
        ) : (
            <LoginForm onLogin={() => setIsSignedUp(true)} onSignupClick={() => setAuthView("signup")} />
        );
    }
    return (
        <div className="app-root" style={{ display: "flex", height: "100vh", background: "#fff" }}>
            <Sidebar
                activeView={activeView}
                onViewChange={setActiveView}
                activeFilter={activeFilter}
                onFilterChange={setActiveFilter}
                setSelectedRisk={setSelectedRisk}
                useDailyAPI={useDailyAPI}
                setUseDailyAPI={setUseDailyAPI}
            />
            <main className="main-content" style={{ flex: 1, overflowY: "auto", position: "relative" }}>
                <div className="alerts-floating" style={{ position: "absolute", top: 16, right: 16, zIndex: 2000 }}>
                    <AlertsPanel alerts={alerts} onAlertClick={handleAlertClick} onMarkAsRead={handleMarkAsRead} />
                </div>
                {activeView === "map" && (
                    <div style={{
                        padding: 16,
                        height: "100%",
                        transition: "background .5s",
                        background: getBackgroundForFilter(),
                        fontSize: "13px"
                    }}>
                        <h2 className="map-header-title" style={{ marginBottom: 16, fontSize: "18px" }}>
                            Carte interactive : {getTitleForFilter()}
                        </h2>
                        <h3 style={{ fontSize: "12px" }}>Zones surveillées : 3 / Abonnements : 2</h3>
                        <div style={{ height: 500, borderRadius: 8, overflow: "hidden" }}>
                            <RiskMap selectedRisk={selectedRisk} useDailyAPI={useDailyAPI} />
                        </div>
                    </div>
                )}
                {activeView === "compare" && <CompareZones />}
                {activeView === "profile" && <UserProfile />}
                {activeView === "settings" && <Settings />}
            </main>
        </div>
    );
}
