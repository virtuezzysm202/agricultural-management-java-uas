import React from "react";
import { LayoutGrid } from "lucide-react";
import { useLocation, Link } from "react-router-dom";

export default function SidebarManager() {
  const location = useLocation();
  const isActive = (path) => location.pathname === path;

  const baseLink =
    "flex items-center gap-3 py-2 px-4 rounded-lg transition-colors duration-200";
  const activeStyle =
    "bg-green-100 text-green-700 dark:bg-green-600/20 dark:text-green-400 font-semibold";
  const inactiveStyle =
    "text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800";

  return (
    <aside className="fixed flex flex-col top-0 left-0 bg-white dark:bg-gray-900 dark:border-gray-800 text-gray-900 h-screen transition-all duration-300 ease-in-out z-40 border-r border-gray-200 w-[260px]">
      {/* 🔰 Logo */}
      <div className="py-7 px-6 flex items-center justify-start border-b border-gray-200 dark:border-gray-800">
        <Link to="/dashboard/manager" className="flex items-center gap-2">
          <LayoutGrid size={28} className="text-green-600" />
          <span className="text-xl font-bold text-gray-800 dark:text-white">
            AgroPanel
          </span>
        </Link>
      </div>

      {/* 📋 Navigasi */}
      <nav className="px-4 space-y-2 mt-4">
        <Link
          to="/dashboard/manager"
          className={`${baseLink} ${
            isActive("/dashboard/manager") ? activeStyle : inactiveStyle
          }`}
        >
          <span>📊 Dashboard</span>
        </Link>

        <Link
          to="/dashboard/manager/tanaman-lahan"
          className={`${baseLink} ${
            isActive("/dashboard/manager/tanaman-lahan") ? activeStyle : inactiveStyle
          }`}
        >
          <span>🌱 Tanaman Lahan</span>
        </Link>

        <Link
          to="/dashboard/manager/daftar-tanaman"
          className={`${baseLink} ${
            isActive("/dashboard/manager/daftar-tanaman") ? activeStyle : inactiveStyle
          }`}
        >
          <span>🪴 Daftar Tanaman</span>
        </Link>

        <Link
          to="/dashboard/manager/hasil-panen"
          className={`${baseLink} ${
            isActive("/dashboard/manager/hasil-panen") ? activeStyle : inactiveStyle
          }`}
        >
          <span>🌾 Hasil Panen</span>
        </Link>

        <Link
          to="/dashboard/manager/monitoring"
          className={`${baseLink} ${
            isActive("/dashboard/manager/monitoring") ? activeStyle : inactiveStyle
          }`}
        >
          <span>📊 Monitoring</span>
        </Link>

        <Link
          to="/dashboard/manager/pembelian"
          className={`${baseLink} ${
            isActive("/dashboard/manager/pembelian") ? activeStyle : inactiveStyle
          }`}
        >
          <span>🛒 Pembelian</span>
        </Link>
      </nav>
    </aside>
  );
}
