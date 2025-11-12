// frontend/src/components/MonthlySalesChart.jsx
import React, { useEffect, useState } from "react";
import Chart from "react-apexcharts";
import api from "../services/api"; // pastikan ini ada dan export default api

// helper: format bulan dari angka 0..11 ke label singkat
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
    // Accept either aggregated or raw purchases
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
          // no data, no backend -> demo
          const demo = [
            1200, 2100, 1800, 2500, 3100, 2800, 3300, 3000, 3400, 3600, 3900,
            4100,
          ];
          if (mounted) setSeriesData(demo);
          setLoading(false);
          return;
        }

        // fetch from backend (/pembelian)
        const res = await api.get("/pembelian").catch(() => ({ data: null }));
        const purchases = res.data ?? [];
        const computed = computeMonthlyFromPurchases(purchases);
        if (mounted) setSeriesData(computed);
      } catch (err) {
        console.error("MonthlySalesChart load error:", err);
        // fallback demo
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

  const chartOptions = {
    chart: {
      id: "monthly-sales",
      toolbar: { show: false },
      zoom: { enabled: false },
      animations: { enabled: true },
    },
    stroke: { curve: "smooth", width: 3 },
    grid: { borderColor: "#eee" },
    xaxis: {
      categories: MONTH_LABELS,
      labels: { style: { colors: "#6b7280" } },
    },
    yaxis: {
      labels: {
        formatter: (val) => String(Math.round(val)),
        style: { colors: "#6b7280" },
      },
    },
    dataLabels: { enabled: false },
    tooltip: { theme: "light" },
    fill: {
      type: "gradient",
      gradient: {
        shade: "light",
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

  return (
    <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white px-4 py-4 sm:px-6">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-lg font-semibold text-gray-800">Monthly Sales</h3>
        <div className="text-sm text-gray-500">
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

      <div className="mt-3 text-sm text-gray-500">
        Total tahun ini:{" "}
        <span className="font-semibold text-gray-800">
          {seriesData.reduce((s, v) => s + v, 0)}
        </span>
      </div>
    </div>
  );
};

export default MonthlySalesChart;
