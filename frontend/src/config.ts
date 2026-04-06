// This allows the app to dynamically connect to localhost in development, 
// and the deployed backend URL in production.
export const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";
