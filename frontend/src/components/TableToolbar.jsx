import React from "react";

export default function TableToolbar({ title, onRefresh }) {
  return (
    <div className="flex items-center justify-between mb-3">
      <h3 className="text-base md:text-lg font-semibold text-gray-800 dark:text-gray-100">
        {title}
      </h3>
      <button
        onClick={onRefresh}
        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-gray-300/70 bg-white/90 text-xs md:text-sm text-gray-700 shadow-sm hover:bg-gray-50 dark:bg-gray-900/80 dark:border-gray-700 dark:text-gray-200 dark:hover:bg-gray-800 transition-colors"
      >
        ⟳
        <span>Refresh</span>
      </button>
    </div>
  );
}
