import React, { useEffect, useState } from "react";
import Chart from "react-apexcharts";
import api from "../services/api";

const MONTH_LABELS = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "Mei",
  "Jun",
  "Jul",
  "Agu",
  "Sep",
  "Okt",
  "Nov",
  "Des",
];

export const MonthlySalesChart = ({ data = null, fromBackend = true }) => {
  const [seriesData, setSeriesData] = useState(new Array(12).fill(0));
  const [loading, setLoading] = useState(false);
  const [darkMode, setDarkMode] = useState(false);

  // Sinkron sama Tailwind dark mode
  useEffect(() => {
    const updateDarkMode = () => {
      const isDark = document.documentElement.classList.contains("dark");
      setDarkMode(isDark);
    };

    updateDarkMode();

    const observer = new MutationObserver(updateDarkMode);
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["class"],
    });

    return () => observer.disconnect();
  }, []);

  const computeMonthlyFromPurchases = (purchases) => {
    const totals = new Array(12).fill(0);
    purchases.forEach((p) => {
      const t = p.tanggal ? new Date(p.tanggal) : null;
      const monthIdx = t ? t.getMonth() : null;
      const value = p.total_harga ?? p.jumlah ?? 0;
      if (monthIdx !== null && monthIdx >= 0 && monthIdx <= 11) {
        totals[monthIdx] += Number(value || 0);
      }
    });
    return totals;
  };

  const computeFromProp = (propData) => {
    const totals = new Array(12).fill(0);
    if (!Array.isArray(propData)) return totals;

    if (propData.length > 0 && propData[0].month !== undefined) {
      propData.forEach((r) => {
        const idx = Number(r.month) - 1;
        if (idx >= 0 && idx < 12) totals[idx] = Number(r.total ?? 0);
      });
    } else {
      return computeMonthlyFromPurchases(propData);
    }
    return totals;
  };

  useEffect(() => {
    let mounted = true;

    const load = async () => {
      setLoading(true);
      try {
        if (data) {
          const computed = computeFromProp(data);
          if (mounted) setSeriesData(computed);
          setLoading(false);
          return;
        }

        if (!fromBackend) {
          const demo = [
            1200, 2100, 1800, 2500, 3100, 2800, 3300, 3000, 3400, 3600, 3900,
            4100,
          ];
          if (mounted) setSeriesData(demo);
          setLoading(false);
          return;
        }

        const res = await api.get("/pembelian").catch(() => ({ data: null }));
        const purchases = res.data ?? [];
        const computed = computeMonthlyFromPurchases(purchases);
        if (mounted) setSeriesData(computed);
      } catch (err) {
        console.error("MonthlySalesChart load error:", err);
        const demo = [
          1200, 2100, 1800, 2500, 3100, 2800, 3300, 3000, 3400, 3600, 3900,
          4100,
        ];
        if (mounted) setSeriesData(demo);
      } finally {
        if (mounted) setLoading(false);
      }
    };

    load();
    return () => {
      mounted = false;
    };
  }, [data, fromBackend]);

  // Info bulan dengan nilai tertinggi
  const maxVal = Math.max(...seriesData);
  const maxIndex = seriesData.findIndex((v) => v === maxVal);
  const peakMonth = maxVal > 0 && maxIndex >= 0 ? MONTH_LABELS[maxIndex] : "-";

  const chartOptions = {
    chart: {
      id: "monthly-sales",
      toolbar: { show: false },
      zoom: { enabled: false },
      animations: { enabled: true },
      background: "transparent",
      foreColor: darkMode ? "#e5e7eb" : "#374151",
    },
    stroke: { curve: "smooth", width: 3 },
    grid: {
      borderColor: darkMode ? "#374151" : "#e5e7eb",
      strokeDashArray: 4,
      padding: { left: 8, right: 12, bottom: 6 },
    },
    xaxis: {
      categories: MONTH_LABELS,
      labels: {
        style: {
          colors: darkMode ? "#9ca3af" : "#6b7280",
          fontSize: "11px",
        },
      },
      axisBorder: {
        color: darkMode ? "#4b5563" : "#e5e7eb",
      },
      axisTicks: {
        color: darkMode ? "#4b5563" : "#e5e7eb",
      },
    },
    yaxis: {
      labels: {
        formatter: (val) => String(Math.round(val)),
        style: {
          colors: darkMode ? "#9ca3af" : "#6b7280",
          fontSize: "11px",
        },
      },
    },
    dataLabels: { enabled: false },
    tooltip: {
      theme: darkMode ? "dark" : "light",
      y: {
        formatter: (val) => `Rp ${val.toLocaleString("id-ID")}`,
      },
    },
    fill: {
      type: "gradient",
      gradient: {
        shade: darkMode ? "dark" : "light",
        gradientToColors: ["#16a34a"],
        shadeIntensity: 1,
        type: "vertical",
        opacityFrom: 0.6,
        opacityTo: 0.08,
        stops: [0, 40, 100],
      },
    },
    colors: ["#16a34a"],
  };

  const chartSeries = [{ name: "Total Penjualan", data: seriesData }];

  return (
    <div className="relative overflow-hidden rounded-2xl border border-gray-200/80 bg-white/95 dark:bg-gray-950/80 dark:border-gray-800/80 shadow-[0_18px_45px_rgba(15,23,42,0.6)] px-4 py-4 sm:px-6 sm:py-5 transition-colors">
      {/* accent line di atas */}
      <div className="absolute inset-x-0 top-0 h-0.5 bg-gradient-to-r from-emerald-400/80 via-lime-300/80 to-sky-400/80" />

      {/* glow halus */}
      <div className="pointer-events-none absolute inset-0 opacity-40">
        <div className="absolute -top-20 right-0 h-40 w-40 rounded-full bg-emerald-500/15 blur-3xl" />
        <div className="absolute -bottom-16 left-0 h-36 w-36 rounded-full bg-lime-400/10 blur-3xl" />
      </div>

      <div className="relative mb-4 flex items-center justify-between gap-3">
        <div className="space-y-1">
          {/* judul dibikin lebih gede dikit */}
          <h3 className="text-base md:text-lg font-semibold text-gray-900 dark:text-gray-50">
            Monthly Sales
          </h3>
          <p className="text-xs md:text-sm text-gray-500 dark:text-gray-400">
            Grafik penjualan bulanan untuk 12 bulan terakhir.
          </p>
        </div>
        <div className="inline-flex items-center gap-2 rounded-full border border-gray-200/80 bg-white/80 px-3 py-1 text-[11px] md:text-xs text-gray-600 shadow-sm dark:border-gray-700 dark:bg-gray-900/80 dark:text-gray-300">
          <span className="inline-block h-2 w-2 rounded-full bg-emerald-500" />
          {loading ? "Loading data..." : "Last 12 months · Live"}
        </div>
      </div>

      <div className="relative w-full h-[220px]">
        <Chart
          options={chartOptions}
          series={chartSeries}
          type="area"
          height={220}
        />
      </div>

      <div className="relative mt-3 flex flex-wrap items-center justify-between gap-2 text-xs md:text-sm text-gray-500 dark:text-gray-400">
        <span>
          Bulan tertinggi:{" "}
          <span className="font-semibold text-gray-800 dark:text-gray-100">
            {peakMonth === "-"
              ? "-"
              : `${peakMonth} (Rp ${maxVal.toLocaleString("id-ID")})`}
          </span>
        </span>
      </div>
    </div>
  );
};

export default MonthlySalesChart;
