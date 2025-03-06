import axios from "axios";

// Fonction pour obtenir un cookie par son nom
const getCookie = (name:any) => {
  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  if (parts.length === 2) return parts.pop()?.split(";").shift() || null;
  return null;
};

const apiClient = axios.create({
  baseURL: process.env.NEXT_PUBLIC_BASE_URL_API || "http://localhost:3000",
  headers: {
    "Content-Type": "application/json",
  },
});

// Intercepteur pour ajouter le token à chaque requête
apiClient.interceptors.request.use(
  (config) => {
    const token = getCookie("authToken");
    console.log("Sending request to:", config.url);
    console.log("Token in request:", token);
    if (token) {
      if (!config.headers) {
        config.headers = {};
      }
      config.headers["Authorization"] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export default apiClient;