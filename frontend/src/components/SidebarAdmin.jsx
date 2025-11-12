import React from "react";
import { ChevronDown, LayoutGrid } from "lucide-react";

// Komponen Item Menu Sederhana
const MenuItem = ({
  icon: Icon,
  title,
  active,
  badge,
  onClick,
  hasSub,
  isOpen,
}) => {
  const baseClasses =
    "flex items-center gap-3.5 py-2 px-4 rounded-lg transition-colors";
  const activeClasses = active
    ? "bg-brand-50 text-brand-600 font-medium"
    : "text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800";

  return (
    <button
      onClick={onClick}
      className={`${baseClasses} ${activeClasses} ${
        hasSub ? "justify-between" : ""
      } w-full`}
    >
      <div className="flex items-center gap-3.5">
        {Icon && <Icon size={20} />}
        <span>{title}</span>
      </div>
      <div className="flex items-center gap-2">
        {badge && (
          <span className="text-theme-xs font-semibold bg-success-100 text-success-700 dark:bg-success-500/15 dark:text-success-500 px-2 py-0.5 rounded-full">
            {badge}
          </span>
        )}
        {hasSub && (
          <ChevronDown
            size={16}
            className={`transition-transform duration-200 ${
              isOpen ? "rotate-180" : ""
            }`}
          />
        )}
      </div>
    </button>
  );
};

export default function SidebarAdmin() {
  // Perubahan utama: Sidebar full width secara default
  const sidebarClasses =
    "fixed flex flex-col top-0 left-0 bg-white dark:bg-gray-900 dark:border-gray-800 text-gray-900 h-screen transition-all duration-300 ease-in-out z-50 border-r border-gray-200 w-[260px] xl:translate-x-0";

  return (
    <aside className={sidebarClasses}>
      <div className="py-7 px-6 flex items-center justify-start">
        <a href="/" className="flex items-center gap-2">
          <LayoutGrid size={32} className="text-brand-600" />
          <span className="text-xl font-bold text-gray-800 dark:text-white">
            AgroPanel
          </span>
        </a>
      </div>

      <nav className="px-4 space-y-3">
        <a
          href="/dashboard/admin"
          className="flex items-center gap-3 py-2 px-4 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800"
        >
          <LayoutGrid size={20} /> Dashboard
        </a>
        <a
          href="/dashboard/admin/tanaman"
          className="flex items-center gap-3 py-2 px-4 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800"
        >
          🌱 Tanaman
        </a>
        <a
          href="/dashboard/admin/lahan"
          className="flex items-center gap-3 py-2 px-4 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800"
        >
          🏡 Lahan
        </a>
        <a
          href="/dashboard/admin/manajer"
          className="flex items-center gap-3 py-2 px-4 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800"
        >
          👨‍🌾 Manager
        </a>
      </nav>
    </aside>
  );
}
