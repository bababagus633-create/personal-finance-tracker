import axios from 'axios';

// Saat development (npm run dev): VITE_API_URL kosong/'/api' -> dipakai Vite proxy ke localhost:3001
// Saat production (build/deploy): VITE_API_URL diisi URL backend Railway, misal https://xxx.up.railway.app/api
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '/api',
});

export default api;
