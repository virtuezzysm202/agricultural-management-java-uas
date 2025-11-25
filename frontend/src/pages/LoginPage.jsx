
import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { login } from "../services/api";
import { LayoutGrid } from "lucide-react";

export default function LoginPage() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const navigate = useNavigate();

  async function handleSubmit(e) {
    e.preventDefault();
    try {
      const data = await login(username, password);
      console.log("Login response:", data);

      localStorage.setItem("token", data.token);
      localStorage.setItem("user", JSON.stringify(data.user));

      const role = data.user.role;
      console.log("User role:", role);

      if (role === "admin") navigate("/dashboard/admin");
      else if (role === "manajer") navigate("/dashboard/manager");
      else if (role === "pembeli") navigate("/dashboard/buyer");
      else navigate("/");
    } catch (err) {
      console.error(err);
      setMessage("Login failed: " + err.message);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-100 via-blue-50 to-white dark:from-gray-900 dark:via-gray-950 dark:to-gray-900 transition-colors">
      <div className="w-full max-w-md mx-auto">
        <div className="relative overflow-hidden rounded-2xl border border-gray-200/80 bg-white/95 dark:bg-gray-950/90 dark:border-gray-800/80 p-8 shadow-[0_18px_50px_rgba(15,23,42,0.25)]">
          {/* Logo and Title */}
          <div className="flex flex-col items-center mb-8">
            <div className="flex items-center gap-2 mb-2">
              <LayoutGrid size={32} className="text-blue-600" />
              <span className="text-2xl font-bold text-gray-800 dark:text-white">AgroPanel</span>
            </div>
            <span className="text-sm text-gray-500 dark:text-gray-400 tracking-wide">Agricultural Management System</span>
          </div>
          <form onSubmit={handleSubmit}>
  <h1 className="text-xl font-bold mb-4 text-center text-gray-900 dark:text-gray-100">Login</h1>

      <input
        type="text"
        placeholder="Username"
        value={username}
        onChange={(e) => setUsername(e.target.value)}
        className="border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 px-3 py-2 w-full mb-3 rounded-md text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-400"
        autoFocus
      />

      <input
        type="password"
        placeholder="Password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        className="border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 px-3 py-2 w-full mb-3 rounded-md text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-400"
      />

      <button
        type="submit"
        className="bg-blue-600 hover:bg-blue-700 text-white w-full py-2 rounded-md font-semibold shadow-sm transition-colors mt-2"
      >
        Login
      </button>

      <p className="text-center mt-3 text-sm text-red-600 dark:text-red-400 min-h-[1.5em]">
        {message}
      </p>

      {/* Tambah tombol ke halaman register */}
      <p className="text-center mt-4 text-sm text-gray-700 dark:text-gray-300">
        Belum punya akun pembeli?{" "}
        <Link to="/register-pembeli" className="text-blue-600 hover:underline dark:text-blue-400">
          Daftar di sini
        </Link>
      </p>

      <p className="text-center mt-2 text-sm text-gray-700 dark:text-gray-300">
  Lupa password?{" "}
  <Link to="/reset-password" className="text-blue-600 hover:underline dark:text-blue-400">
    Reset di sini
  </Link>
</p>
    </form>
            </div>
          </div>
        </div>
      );
    }
