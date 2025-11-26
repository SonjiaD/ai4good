//configuration file
//so only need to change api configuration here and changes in rest of code

// API Configuration
export const API_BASE_URL =
  window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1"
    ? "http://localhost:5000"
    : "https://ai4good.onrender.com";