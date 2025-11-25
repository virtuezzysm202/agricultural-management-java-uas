import React from "react";

// Ikon panah naik/turun
const ArrowIcon = ({ up }) => {
  if (up) {
    return (
      <svg
        className="fill-current"
        width="1em"
        height="1em"
        viewBox="0 0 13 12"
        fill="none"
      >
        <path
          fillRule="evenodd"
          clipRule="evenodd"
          d="M6.06462 1.62393C6.20193 1.47072 6.40135 1.37432 6.62329 1.37432C6.6236 1.37432 6.62391 1.37432 6.62422 1.37432C6.81631 1.37415 7.00845 1.44731 7.15505 1.5938L10.1551 4.5918C10.4481 4.88459 10.4483 5.35946 10.1555 5.65246C9.86273 5.94546 9.38785 5.94562 9.09486 5.65283L7.37329 3.93247L7.37329 10.125C7.37329 10.5392 7.03751 10.875 6.62329 10.875C6.20908 10.875 5.87329 10.5392 5.87329 10.125L5.87329 3.93578L4.15516 5.65281C3.86218 5.94561 3.3873 5.94546 3.0945 5.65248C2.8017 5.35949 2.80185 4.88462 3.09484 4.59182L6.06462 1.62393Z"
        ></path>
      </svg>
    );
  }
  return (
    <svg
      className="fill-current"
      width="1em"
      height="1em"
      viewBox="0 0 12 12"
      fill="none"
    >
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M5.31462 10.3761C5.45194 10.5293 5.65136 10.6257 5.87329 10.6257C5.8736 10.6257 5.8739 10.6257 5.87421 10.6257C6.0663 10.6259 6.25845 10.5527 6.40505 10.4062L9.40514 7.4082C9.69814 7.11541 9.69831 6.64054 9.40552 6.34754C9.11273 6.05454 8.63785 6.05438 8.34486 6.34717L6.62329 8.06753L6.62329 1.875C6.62329 1.46079 6.28751 1.125 5.87329 1.125C5.45908 1.125 5.12329 1.46079 5.12329 1.875L5.12329 8.06422L3.40516 6.34719C3.11218 6.05439 2.6373 6.05454 2.3445 6.34752C2.0517 6.64051 2.05185 7.11538 2.34484 7.40818L5.31462 10.3761Z"
      ></path>
    </svg>
  );
};

export default function StatsCard({ title, value, change, up, icon }) {
  const chipColor = up
    ? "bg-emerald-50 text-emerald-600 border-emerald-200 dark:bg-emerald-500/15 dark:text-emerald-300 dark:border-emerald-400/40"
    : "bg-rose-50 text-rose-600 border-rose-200 dark:bg-rose-500/15 dark:text-rose-300 dark:border-rose-400/40";

  return (
    <div className="relative overflow-hidden rounded-2xl border border-gray-200/80 bg-white/95 dark:border-gray-800/80 dark:bg-gray-950/80 shadow-[0_14px_40px_rgba(15,23,42,0.45)] hover:shadow-[0_18px_65px_rgba(15,23,42,0.8)] transition-all duration-300 hover:-translate-y-0.5">
      {/* garis gradient PAS lebar card */}
      <div
        className="
          absolute left-0 right-0 top-0
          h-[2px]
          bg-gradient-to-r
          from-emerald-400/80 via-lime-300/80 to-sky-400/80
          rounded-t-2xl
        "
      />

      {/* glow halus di background */}
      <div className="pointer-events-none absolute inset-0 opacity-45">
        <div className="absolute -top-10 -right-8 h-24 w-24 rounded-full bg-emerald-500/12 blur-2xl" />
        <div className="absolute -bottom-14 -left-12 h-28 w-28 rounded-full bg-lime-400/10 blur-3xl" />
      </div>

      <div className="relative px-5 py-4 md:px-6 md:py-5">
        <div className="flex items-start justify-between gap-3">
          {/* kiri: icon + text */}
          <div className="flex items-start gap-3">
            <div className="flex items-center justify-center w-11 h-11 rounded-2xl bg-gray-100/90 dark:bg-gray-900 text-xl">
              {icon}
            </div>
            <div className="space-y-1">
              {/* title: ga kecil banget, masih kebaca jelas */}
              <div className="text-sm font-medium text-gray-500 dark:text-gray-400">
                {title}
              </div>
              {/* value: ga kegedean (text-lg) */}
              <div className="text-lg font-semibold text-gray-900 dark:text-gray-50 break-words">
                {value}
              </div>
            </div>
          </div>

          {/* kanan: chip change + arrow (selama prop change dikirim) */}
          {typeof change !== "undefined" && (
            <span
              className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[11px] font-medium ${chipColor}`}
            >
              <span className="inline-flex h-5 w-5 items-center justify-center rounded-full bg-white/80 dark:bg-black/30">
                <ArrowIcon up={up} />
              </span>
              {change}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
