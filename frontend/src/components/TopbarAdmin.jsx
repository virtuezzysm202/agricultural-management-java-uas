import React, { useEffect, useState } from "react";
import api from "../services/api";
import { useNavigate } from "react-router-dom";
import { SunMedium, MoonStar, Search as SearchIcon } from "lucide-react";

export default function TopbarAdmin() {
  const [user, setUser] = useState({ nama: "Admin", role: "Super Admin" });
  const [dropdownOpen, setDropdownOpen] = useState(false);

  // search
  const [search, setSearch] = useState("");
  const [results, setResults] = useState([]);

  // data untuk search
  const [tanamans, setTanamans] = useState([]);
  const [lahans, setLahans] = useState([]);

  // theme
  const [darkMode, setDarkMode] = useState(false);

  const navigate = useNavigate();

  // 🧩 Fetch user info
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

  // 🧩 Fetch data tanaman & lahan (untuk search)
  useEffect(() => {
    const loadData = async () => {
      try {
        const [tanRes, lahanRes] = await Promise.all([
          api.get("/tanaman").catch(() => ({ data: [] })),
          api.get("/lahan").catch(() => ({ data: [] })),
        ]);
        setTanamans(tanRes.data || []);
        setLahans(lahanRes.data || []);
      } catch {
        setTanamans([]);
        setLahans([]);
      }
    };
    loadData();
  }, []);

  // 🔍 Filter hasil pencarian (tanaman + lahan)
  useEffect(() => {
    const q = search.trim().toLowerCase();
    if (!q) {
      setResults([]);
      return;
    }

    // Tanaman
    const rTanaman = tanamans
      .filter((t) =>
        String(t.nama_tanaman || "")
          .toLowerCase()
          .includes(q)
      )
      .map((t) => ({
        type: "tanaman",
        label: t.nama_tanaman,
        id: t.id_tanaman,
        path: "/dashboard/admin/tanaman",
      }));

    // Lahan (pakai nama_lahan, tapi fallback kalau beda field)
    const rLahan = lahans
      .filter((l) => {
        const nama =
          l.nama_lahan ||
          l.nama ||
          l.nama_lokasi ||
          "";
        return nama.toLowerCase().includes(q);
      })
      .map((l) => {
        const nama =
          l.nama_lahan ||
          l.nama ||
          l.nama_lokasi ||
          `Lahan ${l.id_lahan || ""}`;
        return {
          type: "lahan",
          label: nama,
          id: l.id_lahan || l.id,
          path: "/dashboard/admin/lahan",
        };
      });

    setResults([...rTanaman, ...rLahan]);
  }, [search, tanamans, lahans]);

  // 🌙 Inisialisasi theme
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

  const toggleDarkMode = () => {
    applyTheme(!darkMode);
  };

  // Enter → buka hasil pertama, atau fallback ke halaman sesuai keyword
  const handleSearchSubmit = () => {
    const q = search.trim().toLowerCase();

    if (results.length > 0) {
      navigate(results[0].path);
      setSearch("");
      setResults([]);
      return;
    }

    // fallback jika tidak ada hasil tapi user ketik kata kunci
    if (q.includes("tanam")) {
      navigate("/dashboard/admin/tanaman");
    } else if (q.includes("lahan")) {
      navigate("/dashboard/admin/lahan");
    } else if (q.includes("manaj")) {
      navigate("/dashboard/admin/manajer");
    }

    setSearch("");
    setResults([]);
  };

  return (
    <header className="sticky top-0 z-50 flex w-full bg-white border-b border-gray-200 dark:bg-gray-900 dark:border-gray-800">
      <div className="flex items-center justify-between w-full px-4 py-3 xl:px-6">
        {/* 🔍 Search */}
        <div className="relative w-full max-w-md hidden md:block">
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 dark:text-gray-500">
              <SearchIcon className="w-4 h-4" />
            </span>

            <input
              type="text"
              placeholder="Cari tanaman, lahan, manajer..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  handleSearchSubmit();
                }
              }}
              className="w-full rounded-lg border border-gray-200 bg-gray-50 py-2 pl-9 pr-3 text-sm text-gray-800 placeholder:text-gray-400 focus:border-green-400 focus:ring-2 focus:ring-green-100 dark:bg-gray-800 dark:text-white dark:placeholder-gray-400 dark:border-gray-700"
            />
          </div>

          {/* 🔎 Dropdown hasil pencarian */}
          {results.length > 0 && (
            <div className="absolute top-full left-0 w-full mt-1 rounded-md border bg-white shadow-lg z-50 dark:bg-gray-900 dark:border-gray-800">
              {results.map((r) => (
                <button
                  key={`${r.type}-${r.id}`}
                  onClick={() => {
                    navigate(r.path);
                    setSearch("");
                    setResults([]);
                  }}
                  className="block w-full px-4 py-2 text-left text-sm hover:bg-gray-100 dark:hover:bg-gray-800"
                >
                  <span className="font-medium">
                    {r.type === "tanaman"
                      ? "Tanaman"
                      : r.type === "lahan"
                      ? "Lahan"
                      : r.type}
                  </span>
                  <span className="ml-1">: {r.label}</span>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* 🌙 Dark mode toggle + Logout */}
        <div className="flex items-center gap-4">
          {/* theme toggle */}
          <button
            onClick={toggleDarkMode}
            className="relative flex h-10 w-10 items-center justify-center rounded-full border border-gray-200 dark:border-gray-700 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 transition"
          >
            <span className="absolute inset-0 rounded-full bg-gradient-to-br from-emerald-400/20 to-cyan-300/10 blur-sm" />
            {darkMode ? (
              <MoonStar className="w-5 h-5 text-yellow-300" />
            ) : (
              <SunMedium className="w-5 h-5 text-amber-400" />
            )}
          </button>

          {/* 👤 Admin + Logout */}
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
              <div className="absolute right-0 mt-2 w-40 rounded-md border bg-white shadow-lg dark:bg-gray-900 dark:border-gray-800">
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

