import { useState } from "react";
import { resetPassword } from "../services/api";
import { Lock } from "lucide-react";

export default function ResetPasswordPage() {
  const [username, setUsername] = useState("");
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [message, setMessage] = useState("");
  const [isSuccess, setIsSuccess] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();

    try {
      if (!username) {
        setMessage("Masukkan username yang terdaftar.");
        setIsSuccess(false);
        return;
      }

      const response = await resetPassword(username, oldPassword, newPassword);
      setMessage(response.data.message || "Password berhasil diubah.");
      setIsSuccess(true);

      // Reset form
      setOldPassword("");
      setNewPassword("");
      setUsername("");

    } catch (err) {
      setMessage(err.response?.data?.error || "Gagal mereset password.");
      setIsSuccess(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-100 via-blue-50 to-white dark:from-gray-900 dark:via-gray-950 dark:to-gray-900 transition-colors">
      <div className="w-full max-w-md mx-auto">
        <div className="relative overflow-hidden rounded-2xl border border-gray-200/80 bg-white/95 dark:bg-gray-950/90 dark:border-gray-800/80 p-8 shadow-[0_18px_50px_rgba(15,23,42,0.25)]">
          {/* Logo dan Judul */}
          <div className="flex flex-col items-center mb-6">
            <div className="flex items-center gap-2 mb-2">
              <Lock size={32} className="text-blue-600" />
              <span className="text-2xl font-bold text-gray-800 dark:text-white">AgroPanel</span>
            </div>
            <span className="text-sm text-gray-500 dark:text-gray-400 tracking-wide">
              Agricultural Management System
            </span>
          </div>

          <form onSubmit={handleSubmit}>
            <h1 className="text-xl font-bold mb-4 text-center text-gray-900 dark:text-gray-100">
              Reset Password
            </h1>

            <input
              type="text"
              placeholder="Username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 px-3 py-2 w-full mb-3 rounded-md text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-400"
              autoFocus
              required
            />

            <input
              type="password"
              placeholder="Password Lama"
              value={oldPassword}
              onChange={(e) => setOldPassword(e.target.value)}
              className="border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 px-3 py-2 w-full mb-3 rounded-md text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-400"
              required
            />

            <input
              type="password"
              placeholder="Password Baru"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              className="border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 px-3 py-2 w-full mb-3 rounded-md text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-400"
              required
            />

            <button
              type="submit"
              className="bg-blue-600 hover:bg-blue-700 text-white w-full py-2 rounded-md font-semibold shadow-sm transition-colors mt-2"
            >
              Reset Password
            </button>

            <p
              className={`text-center mt-3 text-sm min-h-[1.5em] ${
                isSuccess ? "text-green-600 dark:text-green-400" : "text-red-600 dark:text-red-400"
              }`}
            >
              {message}
            </p>
          </form>
        </div>
      </div>
    </div>
  );
}
