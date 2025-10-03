import axios from "axios";

const access_token = localStorage.getItem('access_token');

const api = axios.create({
  baseURL: import.meta.env.VITE_BACKEND_URL,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
    'Authorization': 'Bearer ' + access_token
  }
});

export default api;
