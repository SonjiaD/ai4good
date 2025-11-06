//configuration file
//so only need to change api configuration here and changes in rest of code

// API Configuration
//configuration file
//so only need to change api configuration here and changes in rest of code

// API Configuration
export const API_BASE_URL = 
  (import.meta as any).env?.DEV
    ? "http://localhost:5000" 
    : "https://ai4good.onrender.com";