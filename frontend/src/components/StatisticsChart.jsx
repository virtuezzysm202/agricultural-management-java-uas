import React from "react";
// Ganti 'ChartPlaceholder' dengan 'Chart' asli dari 'react-apexcharts'
// import Chart from "react-apexcharts";

const AreaChartPlaceholder = () => (
  <div
    className="apexcharts-canvas"
    style={{
      width: "100%",
      height: "310px",
      background: "#f9f9f9",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      color: "#999",
      border: "1px dashed #ddd",
    }}
  >
    [Placeholder Grafik Area Statistik]
  </div>
);

export default function StatisticsChart() {
  // Di sini Anda akan mendefinisikan 'options' dan 'series' untuk ApexCharts
  // const options = { ... };
  // const series = [ ... ];

  return (
    <div className="rounded-2xl border border-gray-200 bg-white px-5 pb-5 pt-5 dark:border-gray-800 dark:bg-white/[0.03] sm:px-6 sm:pt-6">
      <div className="flex flex-col gap-5 mb-6 sm:flex-row sm:justify-between">
        <div className="w-full">
          <h3 className="text-lg font-semibold text-gray-800 dark:text-white/90">
            Statistics
          </h3>
          <p className="mt-1 text-gray-500 text-theme-sm dark:text-gray-400">
            Target you’ve set for each month
          </p>
        </div>
        <div className="flex items-start w-full gap-3 sm:justify-end">
          <div className="flex items-center gap-0.5 rounded-lg bg-gray-100 p-0.5 dark:bg-gray-900">
            <button className="px-3 py-2 font-medium w-full rounded-md text-theme-sm hover:text-gray-900 dark:hover:text-white shadow-theme-xs text-gray-900 dark:text-white bg-white dark:bg-gray-800">
              Monthly
            </button>
            <button className="px-3 py-2 font-medium w-full rounded-md text-theme-sm hover:text-gray-900 dark:hover:text-white text-gray-500 dark:text-gray-400">
              Quarterly
            </button>
            <button className="px-3 py-2 font-medium w-full rounded-md text-theme-sm hover:text-gray-900 dark:hover:text-white text-gray-500 dark:text-gray-400">
              Annually
            </button>
          </div>
        </div>
      </div>
      <div className="max-w-full overflow-x-auto custom-scrollbar">
        <div className="min-w-[1000px] xl:min-w-full">
          <div className="" style={{ minHeight: "325px" }}>
            {/* Ganti ini dengan komponen <Chart> area Anda
              <Chart
                options={options}
                series={series}
                type="area"
                width="100%"
                height="325"
              />
            */}
            <AreaChartPlaceholder />
          </div>
        </div>
      </div>
    </div>
  );
}
