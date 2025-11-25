import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { registerPembeli } from "../services/api";
import { LayoutGrid } from "lucide-react";

export default function RegisterPembeliPage() {
  const [form, setForm] = useState({
    nama: "",
    username: "",
    password: "",
  });

  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();

  function handleChange(e) {
    setForm({ ...form, [e.target.name]: e.target.value });
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setLoading(true);
    setMessage("");

    try {
      await registerPembeli(form.username, form.password, form.nama);
      setMessage("Registrasi berhasil. Anda bisa login sekarang.");
    } catch (err) {
      setMessage("Registrasi gagal: " + err.message);
    }

    setLoading(false);
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-100 via-blue-50 to-white dark:from-gray-900 dark:via-gray-950 dark:to-gray-900 transition-colors">
      <div className="w-full max-w-md mx-auto">
        <div className="relative overflow-hidden rounded-2xl border border-gray-200/80 bg-white/95 dark:bg-gray-950/90 dark:border-gray-800/80 p-8 shadow-[0_18px_50px_rgba(15,23,42,0.25)]">

          {/* Logo + Title */}
          <div className="flex flex-col items-center mb-8">
            <div className="flex items-center gap-2 mb-2">
              <LayoutGrid size={32} className="text-blue-600" />
              <span className="text-2xl font-bold text-gray-800 dark:text-white">AgroPanel</span>
            </div>
            <span className="text-sm text-gray-500 dark:text-gray-400 tracking-wide">
              Agricultural Management System
            </span>
          </div>

          <form onSubmit={handleSubmit}>
            <h1 className="text-xl font-bold mb-4 text-center text-gray-900 dark:text-gray-100">
              Register Pembeli
            </h1>

            <input
              type="text"
              name="nama"
              placeholder="Nama Lengkap"
              value={form.nama}
              onChange={handleChange}
              className="border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 
              px-3 py-2 w-full mb-3 rounded-md text-gray-900 dark:text-gray-100 
              focus:outline-none focus:ring-2 focus:ring-blue-400"
              required
            />

            <input
              type="text"
              name="username"
              placeholder="Username"
              value={form.username}
              onChange={handleChange}
              className="border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 
              px-3 py-2 w-full mb-3 rounded-md text-gray-900 dark:text-gray-100 
              focus:outline-none focus:ring-2 focus:ring-blue-400"
              required
            />

            <input
              type="password"
              name="password"
              placeholder="Password"
              value={form.password}
              onChange={handleChange}
              className="border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 
              px-3 py-2 w-full mb-3 rounded-md text-gray-900 dark:text-gray-100 
              focus:outline-none focus:ring-2 focus:ring-blue-400"
              required
            />

            <button
              type="submit"
              disabled={loading}
              className="bg-blue-600 hover:bg-blue-700 text-white w-full py-2 rounded-md 
              font-semibold shadow-sm transition-colors mt-2"
            >
              {loading ? "Memproses..." : "Register"}
            </button>

            <p className="text-center mt-3 text-sm min-h-[1.5em] text-green-600 dark:text-green-400">
              {message}
            </p>

            {/* Link ke halaman Login */}
            <p className="text-center mt-4 text-sm text-gray-700 dark:text-gray-300">
              Sudah punya akun?{" "}
              <Link
  to="/"
  className="text-blue-600 hover:underline dark:text-blue-400"
>
  Login di sini
</Link>

            </p>
          </form>
        </div>
      </div>
    </div>
  );
}
