// services/api.js

import axios from "axios";

// API_URL harus didefinisikan atau di-import jika digunakan,
// tetapi karena baseURL sudah menggunakan 'http://localhost:8081/api',
// kita akan memprioritaskan baseURL di Axios instance.
// Jika Anda ingin menggunakan API_URL untuk baseURL, pastikan formatnya benar:
// const API_URL = import.meta.env.VITE_API_URL;
const API_BASE_URL = "http://localhost:8081/api";

// 1. Buat instance Axios
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
  // Penting untuk memastikan kredensial dikirim untuk CORS
  withCredentials: true,
});

// 2. Tambahkan Request Interceptor untuk JWT
// Interceptor ini berjalan sebelum setiap request dikirim.
api.interceptors.request.use(
  (config) => {
    // Ambil token dari LocalStorage (asumsi disimpan dengan kunci 'token')
    const token = localStorage.getItem("token");

    // Jika token ada, tambahkan ke header Authorization
    if (token) {
      config.headers["Authorization"] = `Bearer ${token}`;
    }

    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// 3. Konversi fungsi login dan register untuk menggunakan instance 'api' (Axios)
// Hal ini opsional, tetapi sangat direkomendasikan untuk konsistensi.

/**
 * Melakukan login dan menyimpan token JWT jika berhasil.
 * @param {string} username
 * @param {string} password
 * @returns {Promise<object>} Response data dari server
 */
export async function login(username, password) {
  try {
    const res = await api.post("/user/login", { username, password });

    // Asumsi server mengembalikan { token: "..." }
    // Simpan token di LocalStorage setelah login berhasil
    if (res.data && res.data.token) {
      localStorage.setItem("token", res.data.token);
    }

    return res.data;
  } catch (error) {
    // Axios melempar error untuk status non-2xx.
    // Kita bisa mendapatkan pesan error dari response data
    const errorMessage = error.response?.data || error.message;
    throw new Error(`Login failed: ${errorMessage}`);
  }
}

/**
 * Melakukan pendaftaran user baru.
 * @returns {Promise<object>} Response data dari server
 */
export async function register(username, password, role, nama) {
  try {
    const res = await api.post("/user/register", {
      username,
      password,
      role,
      nama,
    });
    return res.data;
  } catch (error) {
    const errorMessage = error.response?.data || error.message;
    throw new Error(`Registration failed: ${errorMessage}`);
  }
}

/**
 * Register khusus pembeli (role sudah fixed: 'pembeli')
 * @param {string} username
 * @param {string} password
 * @param {string} nama
 * @returns {Promise<object>}
 */
export async function registerPembeli(username, password, nama) {
  try {
    const res = await api.post("/user/register", {
      username,
      password,
      role: "pembeli",
      nama,
    });
    return res.data;
  } catch (error) {
    const errorMessage = error.response?.data || error.message;
    throw new Error(`Register pembeli failed: ${errorMessage}`);
  }
}

// Export instance 'api' untuk digunakan di komponen seperti TanamanPage
export default api;

// Jika Anda ingin tetap meng-export fungsi login/register dari sini,
// pastikan 'api' diexport sebagai default, dan fungsi-fungsi lain sebagai named export.
// Struktur di atas sudah memenuhi kebutuhan tersebut.
