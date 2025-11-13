import React, { useEffect, useState } from "react";
import api from "../services/api";
import { useNavigate } from "react-router-dom";

export default function TopbarAdmin() {
  const [user, setUser] = useState({ nama: "Admin", role: "Super Admin" });
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [results, setResults] = useState([]);
  const [darkMode, setDarkMode] = useState(false);
  const navigate = useNavigate();

  // 🧩 Fetch user info dari backend
  useEffect(() => {
    const fetchUser = async () => {
      try {
        const res = await api.get("/user/current");
        setUser(res.data ?? { nama: "Admin", role: "Super Admin" });
      } catch {
        setUser({ nama: "Admin", role: "Super Admin" });
      }
    };
    fetchUser();
  }, []);

  // 🔍 Search handler
  useEffect(() => {
    if (!search.trim()) return setResults([]);
    const loadResults = async () => {
      try {
        const res = await api.get(`/search?q=${search}`);
        setResults(res.data);
      } catch {
        // Dummy fallback (kalau belum ada backend search)
        const dummy = [
          { type: "tanaman", label: "Padi", id: 1 },
          { type: "lahan", label: "Lahan A", id: 2 },
          { type: "manajer", label: "Andi", id: 3 },
        ].filter((d) => d.label.toLowerCase().includes(search.toLowerCase()));
        setResults(dummy);
      }
    };
    loadResults();
  }, [search]);

  // 🌙 Handle dark mode toggle
  useEffect(() => {
    const savedTheme = localStorage.getItem("theme");
    const prefersDark = window.matchMedia(
      "(prefers-color-scheme: dark)"
    ).matches;
    const shouldUseDark = savedTheme ? savedTheme === "dark" : prefersDark;
    setDarkMode(shouldUseDark);
    document.documentElement.classList.toggle("dark", shouldUseDark);
  }, []);

  const toggleDarkMode = () => {
    const newMode = !darkMode;
    setDarkMode(newMode);
    document.documentElement.classList.toggle("dark", newMode);
    localStorage.setItem("theme", newMode ? "dark" : "light");
  };

  return (
    <header className="sticky top-0 z-50 flex w-full bg-white border-b border-gray-200 dark:bg-gray-900 dark:border-gray-800">
      <div className="flex items-center justify-between w-full px-4 py-3 xl:px-6">
        <a href="/dashboard/admin" className="flex items-center gap-2">
          <span className="text-lg font-semibold text-gray-800 dark:text-white">
            AgriManagement
          </span>
        </a>

        {/* 🔍 Search */}
        <div className="relative w-full max-w-md hidden md:block">
          <input
            type="text"
            placeholder="Cari tanaman, lahan, manajer..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full rounded-lg border border-gray-200 bg-gray-50 py-2 pl-10 pr-3 text-sm text-gray-800 placeholder:text-gray-400 focus:border-green-400 focus:ring-2 focus:ring-green-100 dark:bg-gray-800 dark:text-white dark:placeholder-gray-400"
          />
          <svg
            className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
            width="18"
            height="18"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            viewBox="0 0 24 24"
          >
            <path d="M21 21l-4.35-4.35M11 19a8 8 0 100-16 8 8 0 000 16z" />
          </svg>

          {/* 🔎 Dropdown hasil pencarian */}
          {results.length > 0 && (
            <div className="absolute top-full left-0 w-full mt-1 rounded-md border bg-white shadow-lg z-50 dark:bg-gray-900 dark:border-gray-800">
              {results.map((r) => (
                <button
                  key={`${r.type}-${r.id}`}
                  onClick={() => {
                    navigate(`/dashboard/admin/${r.type}`);
                    setResults([]);
                    setSearch("");
                  }}
                  className="block w-full px-4 py-2 text-left text-sm hover:bg-gray-100 dark:hover:bg-gray-800"
                >
                  <span className="font-medium capitalize">{r.type}</span>:{" "}
                  {r.label}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* 🌙 Dark mode toggle + 👤 Profil */}
        <div className="flex items-center gap-4">
          {/* 🌙 Dark mode toggle */}
          <button
            onClick={toggleDarkMode}
            className="p-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 transition"
            title={darkMode ? "Switch to Light Mode" : "Switch to Dark Mode"}
          >
            {darkMode ? (
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="w-5 h-5 text-yellow-400"
                viewBox="0 0 24 24"
                fill="currentColor"
              >
                <path d="M12 3a1 1 0 010 2 7 7 0 000 14 1 1 0 010 2A9 9 0 1112 3z" />
              </svg>
            ) : (
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="w-5 h-5 text-gray-700 dark:text-gray-200"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth="1.8"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M12 3v1m0 16v1m8.485-8.485h1M4.515 12H3m15.071 6.071l.707.707M5.636 5.636l-.707-.707m12.142 0l.707.707M5.636 18.364l-.707.707M12 8a4 4 0 100 8 4 4 0 000-8z"
                />
              </svg>
            )}
          </button>

          {/* 👤 Profil */}
          <div className="relative">
            <button
              className="flex items-center text-gray-700 dark:text-gray-400"
              onClick={() => setDropdownOpen(!dropdownOpen)}
            >
              <img
                alt="User"
                src="/images/logo/icons8-admin-24.png"
                className="mr-3 h-10 w-10 rounded-full border border-gray-200 dark:border-gray-700"
              />
              <div className="text-left">
                <span className="font-medium">{user.nama}</span>
                <p className="text-xs text-gray-500 dark:text-gray-400 capitalize">
                  {user.role || "Admin"}
                </p>
              </div>
              <svg
                className={`ml-2 transition-transform duration-200 ${
                  dropdownOpen ? "rotate-180" : ""
                }`}
                width="18"
                height="20"
                viewBox="0 0 18 20"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M4.3125 8.65625L9 13.3437L13.6875 8.65625"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                ></path>
              </svg>
            </button>

            {dropdownOpen && (
              <div className="absolute right-0 mt-2 w-40 rounded-md border border-gray-200 bg-white shadow-lg dark:border-gray-800 dark:bg-gray-900">
                <a
                  href="/dashboard/admin/profile"
                  className="block px-4 py-2 text-sm hover:bg-gray-100 dark:hover:bg-gray-800"
                >
                  Profile
                </a>
                <button
                  onClick={() => {
                    localStorage.removeItem("token");
                    window.location.href = "/";
                  }}
                  className="w-full text-left px-4 py-2 text-sm hover:bg-gray-100 dark:hover:bg-gray-800"
                >
                  Logout
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
