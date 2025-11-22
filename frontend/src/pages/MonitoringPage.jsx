import React, { useEffect, useState } from "react";
import axios from "axios";
import { Line } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

export default function MonitoringPage() {
  const [monitoring, setMonitoring] = useState([]);
  const [lahans, setLahans] = useState([]);
  const [form, setForm] = useState({
    id_monitor: null,
    id_lahan: "",
    suhu: "",
    kelembaban: "",
    tanggal: "",
  });
  const [loading, setLoading] = useState(false);
  const [isEditing, setIsEditing] = useState(false);

  const API_BASE = "http://localhost:4567/api/manager";

  const fetchMonitoring = async () => {
    try {
      const res = await axios.get(`${API_BASE}/monitoring`);
      setMonitoring(res.data.data || []);
    } catch (err) {
      console.error("Gagal memuat data monitoring:", err);
    }
  };

  const fetchLahans = async () => {
    try {
      const res = await axios.get("http://localhost:4567/api/lahan");
      setLahans(res.data || []);
    } catch (err) {
      console.error("Gagal memuat data lahan:", err);
    }
  };

  useEffect(() => {
    fetchMonitoring();
    fetchLahans();
  }, []);

  const handleChange = (e) => {
    const { name, value, type } = e.target;
    const newValue = type === "number" ? parseFloat(value) : value;
    setForm({ ...form, [name]: newValue });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const dataToSubmit = {
        id_lahan: parseInt(form.id_lahan),
        suhu: parseFloat(form.suhu),
        kelembaban: parseFloat(form.kelembaban),
        tanggal: form.tanggal,
      };

      if (isEditing) {
        await axios.put(`${API_BASE}/monitoring/${form.id_monitor}`, dataToSubmit);
        alert("Data monitoring berhasil diupdate!");
      } else {
        await axios.post(`${API_BASE}/monitoring`, dataToSubmit);
        alert("Data monitoring berhasil ditambahkan!");
      }

      fetchMonitoring();
      setForm({
        id_monitor: null,
        id_lahan: "",
        suhu: "",
        kelembaban: "",
        tanggal: "",
      });
      setIsEditing(false);
    } catch (err) {
      console.error("Gagal menyimpan data:", err);
      alert("Gagal menyimpan data: " + (err.response?.data?.error || err.message));
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (data) => {
    setForm({
      ...data,
      tanggal: data.tanggal ? data.tanggal.split("T")[0] : "",
      suhu: String(data.suhu),
      kelembaban: String(data.kelembaban),
      id_lahan: String(data.id_lahan),
    });
    setIsEditing(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Yakin ingin menghapus data monitoring ini?")) return;
    try {
      await axios.delete(`${API_BASE}/monitoring/${id}`);
      alert("Data monitoring berhasil dihapus!");
      fetchMonitoring();
    } catch (err) {
      console.error("Gagal menghapus data:", err);
      alert("Gagal menghapus data.");
    }
  };

  const getChartData = () => {
    // Sort by date
    const sortedData = [...monitoring].sort(
      (a, b) => new Date(a.tanggal) - new Date(b.tanggal)
    );

    const labels = sortedData.map((m) =>
      new Date(m.tanggal).toLocaleDateString("id-ID", {
        day: "2-digit",
        month: "short",
      })
    );
    const suhuData = sortedData.map((m) => m.suhu);
    const kelembabanData = sortedData.map((m) => m.kelembaban);

    return {
      labels,
      datasets: [
        {
          label: "Suhu (°C)",
          data: suhuData,
          borderColor: "#ef4444",
          backgroundColor: "rgba(239, 68, 68, 0.1)",
          tension: 0.3,
        },
        {
          label: "Kelembaban (%)",
          data: kelembabanData,
          borderColor: "#3b82f6",
          backgroundColor: "rgba(59, 130, 246, 0.1)",
          tension: 0.3,
        },
      ],
    };
  };

  const getLahanName = (id) => {
    const lahan = lahans.find((l) => l.id_lahan === id);
    return lahan ? lahan.nama_lahan : `ID ${id}`;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-emerald-50 dark:from-gray-950 dark:via-gray-900 dark:to-gray-950 text-gray-900 dark:text-gray-100">
      {/* Header */}
      <header className="sticky top-0 z-40 border-b border-gray-200/70 dark:border-gray-800/70 bg-white/80 dark:bg-gray-950/80 backdrop-blur-lg px-4 py-3 shadow-sm">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-400 to-cyan-600 flex items-center justify-center text-white font-bold text-sm shadow-md">
              M
            </div>
            <div>
              <h1 className="text-lg md:text-xl font-bold text-gray-900 dark:text-gray-100">
                Kelola Monitoring
              </h1>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Pantau suhu dan kelembaban lahan
              </p>
            </div>
          </div>
          <a
            href="/dashboard/manager"
            className="text-sm px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
          >
            Kembali ke Dashboard
          </a>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-6 md:px-6 lg:px-8 lg:py-8 space-y-8">
        {/* HEADER */}
        <div>
          <h2 className="text-2xl font-semibold text-gray-900 dark:text-gray-50 flex items-center gap-2">
            <span>🌡️</span> Data Monitoring
          </h2>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            Tambahkan dan kelola data monitoring suhu dan kelembaban lahan.
          </p>
        </div>

        {/* FORM + CHART */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* FORM CARD */}
          <div className="relative overflow-hidden rounded-2xl border border-gray-200/80 bg-white/95 dark:bg-gray-950/80 dark:border-gray-800/80 shadow-[0_18px_45px_rgba(15,23,42,0.6)]">
            <div className="absolute inset-x-0 top-0 h-0.5 bg-gradient-to-r from-blue-400/80 via-cyan-300/80 to-sky-400/80" />
            <div className="pointer-events-none absolute inset-0 opacity-40">
              <div className="absolute -top-16 right-0 h-32 w-32 rounded-full bg-blue-500/15 blur-3xl" />
              <div className="absolute -bottom-16 left-0 h-32 w-32 rounded-full bg-cyan-400/10 blur-3xl" />
            </div>

            <div className="relative p-6 space-y-5">
              <div>
                <h3 className="text-base md:text-lg font-semibold text-gray-900 dark:text-gray-50">
                  {isEditing ? "Edit Data Monitoring" : "Tambah Data Monitoring Baru"}
                </h3>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  Lengkapi detail monitoring untuk lahan yang dipilih.
                </p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-600 dark:text-gray-300 mb-1">
                    Lahan
                  </label>
                  <select
                    name="id_lahan"
                    value={form.id_lahan}
                    onChange={handleChange}
                    className="w-full rounded-xl border border-gray-200 bg-gray-50 px-3 py-2.5 text-sm text-gray-900 focus:border-blue-400 focus:ring-2 focus:ring-blue-100 dark:bg-gray-900 dark:border-gray-700 dark:text-gray-100"
                    required
                  >
                    <option value="">Pilih Lahan</option>
                    {lahans.map((l) => (
                      <option key={l.id_lahan} value={l.id_lahan}>
                        {l.nama_lahan} - {l.lokasi}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-600 dark:text-gray-300 mb-1">
                      Suhu (°C)
                    </label>
                    <input
                      type="number"
                      step="0.1"
                      name="suhu"
                      value={form.suhu}
                      onChange={handleChange}
                      className="w-full rounded-xl border border-gray-200 bg-gray-50 px-3 py-2.5 text-sm text-gray-900 focus:border-blue-400 focus:ring-2 focus:ring-blue-100 dark:bg-gray-900 dark:border-gray-700 dark:text-gray-100"
                      required
                      placeholder="25.5"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-600 dark:text-gray-300 mb-1">
                      Kelembaban (%)
                    </label>
                    <input
                      type="number"
                      step="0.1"
                      name="kelembaban"
                      value={form.kelembaban}
                      onChange={handleChange}
                      className="w-full rounded-xl border border-gray-200 bg-gray-50 px-3 py-2.5 text-sm text-gray-900 focus:border-blue-400 focus:ring-2 focus:ring-blue-100 dark:bg-gray-900 dark:border-gray-700 dark:text-gray-100"
                      required
                      placeholder="70.0"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-600 dark:text-gray-300 mb-1">
                    Tanggal
                  </label>
                  <input
                    type="date"
                    name="tanggal"
                    value={form.tanggal}
                    onChange={handleChange}
                    className="w-full rounded-xl border border-gray-200 bg-gray-50 px-3 py-2.5 text-sm text-gray-900 focus:border-blue-400 focus:ring-2 focus:ring-blue-100 dark:bg-gray-900 dark:border-gray-700 dark:text-gray-100"
                    required
                  />
                </div>

                <div className="flex gap-2 pt-2">
                  <button
                    type="submit"
                    disabled={loading}
                    className="flex-1 inline-flex items-center justify-center rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-blue-700 disabled:opacity-60 transition-colors"
                  >
                    {isEditing ? "Simpan Perubahan" : "Tambah Data Monitoring"}
                  </button>
                  {isEditing && (
                    <button
                      type="button"
                      onClick={() => {
                        setForm({
                          id_monitor: null,
                          id_lahan: "",
                          suhu: "",
                          kelembaban: "",
                          tanggal: "",
                        });
                        setIsEditing(false);
                      }}
                      className="rounded-xl border border-gray-300 bg-white px-4 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50 dark:bg-gray-900 dark:border-gray-700 dark:text-gray-200 dark:hover:bg-gray-800"
                    >
                      Batal
                    </button>
                  )}
                </div>
              </form>
            </div>
          </div>

          {/* CHART CARD */}
          <div className="relative overflow-hidden rounded-2xl border border-gray-200/80 bg-white/95 dark:bg-gray-950/80 dark:border-gray-800/80 shadow-[0_18px_45px_rgba(15,23,42,0.6)] flex flex-col items-center">
            <div className="absolute inset-x-0 top-0 h-0.5 bg-gradient-to-r from-sky-400/80 via-blue-300/80 to-cyan-400/80" />
            <div className="pointer-events-none absolute inset-0 opacity-40">
              <div className="absolute -top-16 left-0 h-32 w-32 rounded-full bg-sky-500/15 blur-3xl" />
              <div className="absolute -bottom-20 right-0 h-36 w-36 rounded-full bg-blue-500/10 blur-3xl" />
            </div>

            <div className="relative w-full p-6 flex flex-col items-center">
              <h3 className="text-base md:text-lg font-semibold text-gray-900 dark:text-gray-50 mb-2 text-center">
                Grafik Suhu & Kelembaban
              </h3>
              <p className="text-xs text-gray-500 dark:text-gray-400 mb-6 text-center">
                Menampilkan tren suhu dan kelembaban dari waktu ke waktu.
              </p>
              <div className="w-full">
                {monitoring.length > 0 ? (
                  <Line
                    data={getChartData()}
                    options={{
                      responsive: true,
                      plugins: {
                        legend: {
                          position: "top",
                        },
                      },
                      scales: {
                        y: {
                          beginAtZero: true,
                        },
                      },
                    }}
                  />
                ) : (
                  <p className="text-center text-sm text-gray-500 dark:text-gray-400">
                    Data monitoring kosong, silakan tambah data terlebih dahulu.
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* TABEL MONITORING */}
        <section className="space-y-3 mb-10">
          <h3 className="text-base md:text-lg font-semibold text-gray-900 dark:text-gray-50">
            Tabel Data Monitoring
          </h3>
          <div className="overflow-auto bg-white/95 dark:bg-gray-950/80 rounded-2xl border border-gray-200/80 dark:border-gray-800/80 shadow-sm">
            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-800 text-sm">
              <thead className="bg-gray-50/90 dark:bg-gray-900/80 sticky top-0 z-10">
                <tr className="text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">
                  <th className="px-4 py-3 text-left">ID</th>
                  <th className="px-4 py-3 text-left">Lahan</th>
                  <th className="px-4 py-3 text-left">Suhu (°C)</th>
                  <th className="px-4 py-3 text-left">Kelembaban (%)</th>
                  <th className="px-4 py-3 text-left">Tanggal</th>
                  <th className="px-4 py-3 text-center">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-gray-800">
                {monitoring.map((m) => (
                  <tr
                    key={m.id_monitor}
                    className="hover:bg-gray-50 dark:hover:bg-gray-900/70 transition-colors"
                  >
                    <td className="px-4 py-3 text-sm">{m.id_monitor}</td>
                    <td className="px-4 py-3 text-sm">{getLahanName(m.id_lahan)}</td>
                    <td className="px-4 py-3 text-sm">{m.suhu}°C</td>
                    <td className="px-4 py-3 text-sm">{m.kelembaban}%</td>
                    <td className="px-4 py-3 text-sm">
                      {m.tanggal
                        ? new Date(m.tanggal).toLocaleDateString("id-ID", {
                            day: "2-digit",
                            month: "short",
                            year: "numeric",
                            hour: "2-digit",
                            minute: "2-digit",
                          })
                        : "-"}
                    </td>
                    <td className="px-4 py-3 text-center space-x-2">
                      <button
                        onClick={() => handleEdit(m)}
                        className="text-xs px-3 py-1.5 rounded-full border bg-blue-50 text-blue-700 border-blue-200 hover:bg-blue-100 dark:bg-blue-500/15 dark:text-blue-300 dark:border-blue-400/40 dark:hover:bg-blue-500/25 transition-colors"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDelete(m.id_monitor)}
                        className="text-xs px-3 py-1.5 rounded-full border bg-red-50 text-red-700 border-red-200 hover:bg-red-100 dark:bg-red-500/15 dark:text-red-300 dark:border-red-400/40 dark:hover:bg-red-500/25 transition-colors"
                      >
                        Hapus
                      </button>
                    </td>
                  </tr>
                ))}
                {monitoring.length === 0 && (
                  <tr>
                    <td
                      colSpan="6"
                      className="px-4 py-4 text-center text-sm text-gray-500 dark:text-gray-400"
                    >
                      Tidak ada data monitoring.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </section>
      </main>
    </div>
  );
}
