import axios from "axios";

const baseURL = import.meta.env.VITE_API_BASE_URL || "http://localhost:3000";
const timeout = parseInt(import.meta.env.VITE_API_TIMEOUT || "5000", 10);

const axiosInstance = axios.create({
  baseURL,
  timeout,
  headers: {
    "Content-Type": "application/json",
  },
});

export default axiosInstance;