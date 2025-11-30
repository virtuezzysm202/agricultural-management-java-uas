import React from "react";
import { LayoutGrid } from "lucide-react";
import { Link } from "react-router-dom";

export default function SidebarBuyer({ onTabChange, activeTab }) {
  const isActive = (tab) => activeTab === tab;

  const baseLink =
    "flex items-center gap-3 py-2 px-4 rounded-lg transition-colors duration-200";
  const activeStyle =
    "bg-blue-100 text-blue-700 dark:bg-blue-600/20 dark:text-blue-400 font-semibold";
  const inactiveStyle =
    "text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800";

    return (
      <aside className="fixed flex flex-col top-0 left-0 bg-white dark:bg-gray-900 dark:border-gray-800 text-gray-900 h-screen z-[60] border-r border-gray-200 w-[260px]">
        <div className="px-6 pt-4 pb-6 flex items-center justify-start border-b border-gray-200 dark:border-gray-800">
          <Link to="/dashboard/buyer" className="flex items-center gap-2">
            <LayoutGrid size={28} className="text-blue-600" />
            <span className="text-xl font-bold text-gray-800 dark:text-white">AgroPanel</span>
          </Link>
        </div>
        <nav className="px-4 space-y-2 mt-4">
          <button
            type="button"
            onClick={() => onTabChange("pembelian")}
            className={`${baseLink} ${isActive("pembelian") ? activeStyle : inactiveStyle}`}
          >
            <span>🛒 My Purchases</span>
          </button>
          <button
            type="button"
            onClick={() => onTabChange("hasilpanen")}
            className={`${baseLink} ${isActive("hasilpanen") ? activeStyle : inactiveStyle}`}
          >
            <span>🌾 Available Products</span>
          </button>
        </nav>
      </aside>
    );
}