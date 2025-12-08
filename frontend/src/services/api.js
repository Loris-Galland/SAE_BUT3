const API_URL = "https://my.meteoblue.com/packages/basic-1h_basic-day";
const API_KEY = "hXzoyrvlCEwIVRD3";
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
