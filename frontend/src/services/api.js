const API_URL = "https://my.meteoblue.com/packages/basic-1h_basic-day";
const API_KEY = "RvXWZzPSbjUrpEc0";
const BACKEND_URL = "http://localhost:3000/api";

export async function getWeather() {
  const url = `${API_URL}?lat=43.61669&lon=7.07106&apikey=${API_KEY}`;
  try {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error("Erreur API Meteoblue");
    }
    return await response.json();
  } catch (err) {
    console.error("Erreur lors du fetch météo :", err);
    return null;
  }
}

//  Fonction pour s'abonner
export async function toggleZoneSubscription(userId, zoneName) {
    try {
        const response = await fetch(`${BACKEND_URL}/users/${userId}/toggle-zone`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ zoneName })
        });

        if (!response.ok) throw new Error("Erreur réseau");
        return await response.json();
    } catch (err) {
        console.error("Erreur abonnement:", err);
        return { success: false };
    }
}
