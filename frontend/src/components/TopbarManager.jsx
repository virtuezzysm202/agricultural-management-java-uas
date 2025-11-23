import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";
import { SunMedium, MoonStar } from "lucide-react";

export default function TopbarManager() {
  const [user, setUser] = useState({ nama: "Manager", role: "Manager" });
  const [darkMode, setDarkMode] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const res = await api.get("/user/current");
        setUser(res.data ?? { nama: "Manager", role: "Manager" });
      } catch {
        setUser({ nama: "Manager", role: "Manager" });
      }
    };
    fetchUser();
  }, []);

  useEffect(() => {
    const saved = localStorage.getItem("theme");
    let isDark;
    if (saved === "dark") isDark = true;
    else if (saved === "light") isDark = false;
    else isDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
    setDarkMode(isDark);
    if (isDark) document.documentElement.classList.add("dark");
    else document.documentElement.classList.remove("dark");
  }, []);

  const applyTheme = (isDark) => {
    setDarkMode(isDark);
    if (isDark) {
      document.documentElement.classList.add("dark");
      localStorage.setItem("theme", "dark");
    } else {
      document.documentElement.classList.remove("dark");
      localStorage.setItem("theme", "light");
    }
  };

  const toggleDarkMode = () => applyTheme(!darkMode);

  return (
    <header className="sticky top-0 z-50 flex w-full bg-white border-b border-gray-200 dark:bg-gray-900 dark:border-gray-800">
      <div className="flex items-center justify-between w-full px-4 py-3 xl:px-6">
        <div className="flex items-center gap-2">
          <span className="text-lg font-semibold text-gray-800 dark:text-white">
            Manager Portal
          </span>
        </div>

        <div className="flex items-center gap-4">
          <button
            onClick={toggleDarkMode}
            className="relative flex h-10 w-10 items-center justify-center rounded-full border border-gray-200 dark:border-gray-700 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 transition"
            title="Toggle theme"
          >
            {darkMode ? (
              <MoonStar className="w-5 h-5 text-yellow-300" />
            ) : (
              <SunMedium className="w-5 h-5 text-amber-400" />
            )}
          </button>

          {/* 👤 User Info + Dropdown */}
          <div className="relative">
            <button
              className="flex items-center text-gray-700 dark:text-gray-400"
              onClick={() => setDropdownOpen((o) => !o)}
            >
              <img
                alt="User"
                src="/images/logo/icons8-admin-24.png"
                className="mr-3 h-10 w-10 rounded-full border border-gray-200 dark:border-gray-700"
              />
              <div className="text-left">
                <span className="font-medium">{user.nama}</span>
                <p className="text-xs text-gray-500 dark:text-gray-400 capitalize">{user.role}</p>
              </div>

              <svg
                className={`ml-2 transition-transform duration-200 ${
                  dropdownOpen ? "rotate-180" : ""
                }`}
                width="18"
                height="20"
                viewBox="0 0 18 20"
                fill="none"
              >
                <path
                  d="M4.3125 8.65625L9 13.3437L13.6875 8.65625"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </button>

            {dropdownOpen && (
              <div className="absolute right-0 mt-2 w-40 rounded-md border bg-white shadow-lg dark:bg-gray-900 dark:border-gray-800 z-50">
                <button
                  onClick={() => {
                    localStorage.removeItem("token");
                    window.location.href = "/";
                  }}
                  className="w-full text-left px-4 py-2 text-sm hover:bg-gray-100 dark:hover:bg-gray-800 rounded-md"
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
