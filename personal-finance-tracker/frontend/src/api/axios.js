import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'https://personal-finance-tracker-production-0df8.up.railway.app/api',
});

export default api;