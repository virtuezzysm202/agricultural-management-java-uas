// frontend/src/components/MonthlySalesChart.jsx
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
  const [seriesData, setSeriesData] = useState(new Array(12).fill(0)); // index 0 = Jan
  const [loading, setLoading] = useState(false);
  const [darkMode, setDarkMode] = useState(false);

  // ====== Sinkron sama Tailwind dark mode (class "dark" di <html>) ======
  useEffect(() => {
    const updateDarkMode = () => {
      const isDark = document.documentElement.classList.contains("dark");
      setDarkMode(isDark);
    };

    updateDarkMode();

    // Observe perubahan class di <html> (saat tombol dark mode diklik)
    const observer = new MutationObserver(updateDarkMode);
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["class"],
    });

    return () => observer.disconnect();
  }, []);

  // Convert purchases -> monthly totals (expects pembelian items with 'tanggal' and 'total_harga' or 'jumlah')
  const computeMonthlyFromPurchases = (purchases) => {
    const totals = new Array(12).fill(0);
    purchases.forEach((p) => {
      const t = p.tanggal ? new Date(p.tanggal) : null;
      const monthIdx = t ? t.getMonth() : null; // 0..11
      const value = p.total_harga ?? p.jumlah ?? 0;
      if (monthIdx !== null && monthIdx >= 0 && monthIdx <= 11)
        totals[monthIdx] += Number(value || 0);
    });
    return totals;
  };

  // If prop 'data' provided in aggregated form [{month:1,total:...}, ...]
  const computeFromProp = (propData) => {
    const totals = new Array(12).fill(0);
    if (!Array.isArray(propData)) return totals;

    if (propData.length > 0 && propData[0].month !== undefined) {
      // aggregated
      propData.forEach((r) => {
        const idx = Number(r.month) - 1;
        if (idx >= 0 && idx < 12) totals[idx] = Number(r.total ?? 0);
      });
    } else {
      // assume raw purchases array (with tanggal, total_harga)
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

  // ====== OPTIONS CHART ======
  const chartOptions = {
    chart: {
      id: "monthly-sales",
      toolbar: { show: false },
      zoom: { enabled: false },
      animations: { enabled: true },
      background: "transparent",
      foreColor: darkMode ? "#e5e7eb" : "#374151", // text di axis & tooltip
    },
    stroke: { curve: "smooth", width: 3 },
    grid: {
      borderColor: darkMode ? "#374151" : "#e5e7eb",
    },
    xaxis: {
      categories: MONTH_LABELS,
      labels: {
        style: {
          colors: darkMode ? "#9ca3af" : "#6b7280",
          fontSize: "12px",
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
          fontSize: "12px",
        },
      },
    },
    dataLabels: { enabled: false },
    tooltip: {
      theme: darkMode ? "dark" : "light",
    },
    fill: {
      type: "gradient",
      gradient: {
        shade: darkMode ? "dark" : "light",
        gradientToColors: ["#16a34a"],
        shadeIntensity: 1,
        type: "vertical",
        opacityFrom: 0.6,
        opacityTo: 0.1,
      },
    },
    colors: ["#16a34a"],
  };

  const chartSeries = [{ name: "Total Penjualan", data: seriesData }];

  const totalTahunIni = seriesData.reduce((s, v) => s + v, 0);

  return (
    <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white dark:bg-gray-900 dark:border-gray-700 px-4 py-4 sm:px-6 transition-colors">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-100">
          Monthly Sales
        </h3>
        <div className="text-sm text-gray-500 dark:text-gray-400">
          {loading ? "Loading..." : "Last 12 months"}
        </div>
      </div>

      <div className="w-full h-[220px]">
        <Chart
          options={chartOptions}
          series={chartSeries}
          type="area"
          height={220}
        />
      </div>

      <div className="mt-3 text-sm text-gray-500 dark:text-gray-400">
        Total tahun ini:{" "}
        <span className="font-semibold text-gray-800 dark:text-gray-100">
          {totalTahunIni}
        </span>
      </div>
    </div>
  );
};

export default MonthlySalesChart;
