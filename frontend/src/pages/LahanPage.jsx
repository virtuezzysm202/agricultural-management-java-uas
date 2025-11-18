import React, { useEffect, useState } from "react";
import SidebarAdmin from "../components/SidebarAdmin";
import TopbarAdmin from "../components/TopbarAdmin";
import api from "../services/api";

import { Pie } from "react-chartjs-2";
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from "chart.js";

ChartJS.register(ArcElement, Tooltip, Legend);

export default function LahanPage() {
  const [lahan, setLahan] = useState([]);
  const [manajerList, setManajerList] = useState([]);
  const [form, setForm] = useState({
    id_lahan: null,
    nama_lahan: "",
    luas: "",
    lokasi: "",
    id_pengawas: "",
  });
  const [loading, setLoading] = useState(false);
  const [isEditing, setIsEditing] = useState(false);

  const fetchLahan = async () => {
    try {
      const res = await api.get("/lahan");
      setLahan(res.data);
    } catch (err) {
      console.error("Gagal memuat data lahan:", err);
    }
  };

  const fetchPengawas = async () => {
    try {
      const res = await api.get("/user/manajer");
      setManajerList(res.data);
    } catch (err) {
      console.error("Gagal memuat data pengawas:", err);
    }
  };

  useEffect(() => {
    fetchLahan();
    fetchPengawas();
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
      if (isEditing) {
        const dataToSubmit = { ...form };
        delete dataToSubmit.id_lahan;
        await api.put(`/lahan/${form.id_lahan}`, dataToSubmit);
      } else {
        await api.post("/lahan", form);
      }
      fetchLahan();
      setForm({
        id_lahan: null,
        nama_lahan: "",
        luas: "",
        lokasi: "",
        id_pengawas: "",
      });
      setIsEditing(false);
    } catch (err) {
      console.error("Gagal menyimpan data:", err);
      alert("Gagal menyimpan data. Cek konsol untuk detail error.");
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (data) => {
    setForm({
      ...data,
      luas: String(data.luas),
      id_pengawas: String(data.id_pengawas),
    });
    setIsEditing(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Yakin ingin menghapus lahan ini?")) return;
    try {
      await api.delete(`/lahan/${id}`);
      fetchLahan();
    } catch (err) {
      console.error("Gagal menghapus data:", err);
    }
  };

  const getChartData = () => {
    const luasByPengawas = lahan.reduce((acc, l) => {
      const pengawas = manajerList.find((p) => p.id_user === l.id_pengawas);
      const nama = pengawas ? pengawas.nama : `Pengawas ID ${l.id_pengawas}`;
      const luas = l.luas || 0;
      acc[nama] = (acc[nama] || 0) + luas;
      return acc;
    }, {});

    const labels = Object.keys(luasByPengawas);
    const dataLuas = Object.values(luasByPengawas);

    const backgroundColors = [
      "#0ea5e9",
      "#22c55e",
      "#f59e0b",
      "#ef4444",
      "#a855f7",
      "#06b6d4",
      "#f97316",
      "#64748b",
    ];

    return {
      labels,
      datasets: [
        {
          label: "Total Luas Lahan (Ha)",
          data: dataLuas,
          backgroundColor: backgroundColors.slice(0, labels.length),
          borderColor: backgroundColors.slice(0, labels.length),
          borderWidth: 1,
        },
      ],
    };
  };

  return (
    <div className="min-h-screen xl:flex bg-gray-50 dark:bg-gray-950 text-gray-900 dark:text-gray-100 transition-colors">
      <SidebarAdmin />
      <div className="flex-1 xl:ml-[260px]">
        <TopbarAdmin />

        <main className="max-w-7xl mx-auto px-4 py-6 md:px-6 lg:px-8 lg:py-8 space-y-8">
          {/* HEADER */}
          <div>
            <h2 className="text-2xl font-semibold text-gray-900 dark:text-gray-50 flex items-center gap-2">
              <span>🏞️</span> Kelola Data Lahan
            </h2>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
              Atur informasi lahan dan pengawas yang bertanggung jawab.
            </p>
          </div>

          {/* FORM + CHART */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* FORM CARD */}
            <div className="relative overflow-hidden rounded-2xl border border-gray-200/80 bg-white/95 dark:bg-gray-950/80 dark:border-gray-800/80 shadow-[0_18px_45px_rgba(15,23,42,0.6)]">
              <div className="absolute inset-x-0 top-0 h-0.5 bg-gradient-to-r from-emerald-400/80 via-lime-300/80 to-sky-400/80" />
              <div className="pointer-events-none absolute inset-0 opacity-40">
                <div className="absolute -top-16 right-0 h-32 w-32 rounded-full bg-emerald-500/15 blur-3xl" />
                <div className="absolute -bottom-16 left-0 h-32 w-32 rounded-full bg-lime-400/10 blur-3xl" />
              </div>

              <div className="relative p-6 space-y-5">
                <div>
                  <h3 className="text-base md:text-lg font-semibold text-gray-900 dark:text-gray-50">
                    {isEditing ? "Edit Data Lahan" : "Tambah Lahan Baru"}
                  </h3>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                    Lengkapi detail lahan dan pilih pengawas yang bertanggung
                    jawab.
                  </p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-600 dark:text-gray-300 mb-1">
                      Nama Lahan
                    </label>
                    <input
                      type="text"
                      name="nama_lahan"
                      value={form.nama_lahan}
                      onChange={handleChange}
                      className="w-full rounded-xl border border-gray-200 bg-gray-50 px-3 py-2.5 text-sm text-gray-900 placeholder:text-gray-400 focus:border-emerald-400 focus:ring-2 focus:ring-emerald-100 dark:bg-gray-900 dark:border-gray-700 dark:text-gray-100 dark:placeholder-gray-500"
                      required
                      placeholder="Contoh: Lahan A1, Lahan Utara..."
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-600 dark:text-gray-300 mb-1">
                      Luas (Ha)
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      name="luas"
                      value={form.luas}
                      onChange={handleChange}
                      className="w-full rounded-xl border border-gray-200 bg-gray-50 px-3 py-2.5 text-sm text-gray-900 focus:border-emerald-400 focus:ring-2 focus:ring-emerald-100 dark:bg-gray-900 dark:border-gray-700 dark:text-gray-100"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-600 dark:text-gray-300 mb-1">
                      Lokasi
                    </label>
                    <input
                      type="text"
                      name="lokasi"
                      value={form.lokasi}
                      onChange={handleChange}
                      className="w-full rounded-xl border border-gray-200 bg-gray-50 px-3 py-2.5 text-sm text-gray-900 placeholder:text-gray-400 focus:border-emerald-400 focus:ring-2 focus:ring-emerald-100 dark:bg-gray-900 dark:border-gray-700 dark:text-gray-100 dark:placeholder-gray-500"
                      required
                      placeholder="Contoh: Desa Cibodas, Blok 3..."
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-600 dark:text-gray-300 mb-1">
                      Pengawas
                    </label>
                    <select
                      name="id_pengawas"
                      value={form.id_pengawas}
                      onChange={handleChange}
                      className="w-full rounded-xl border border-gray-200 bg-gray-50 px-3 py-2.5 text-sm text-gray-900 focus:border-emerald-400 focus:ring-2 focus:ring-emerald-100 dark:bg-gray-900 dark:border-gray-700 dark:text-gray-100"
                      required
                    >
                      <option value="">Pilih Pengawas</option>
                      {manajerList.map((p) => (
                        <option key={p.id_user} value={p.id_user}>
                          {p.nama}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="flex gap-2 pt-2">
                    <button
                      type="submit"
                      disabled={loading}
                      className="flex-1 inline-flex items-center justify-center rounded-xl bg-emerald-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-emerald-700 disabled:opacity-60 transition-colors"
                    >
                      {isEditing ? "Simpan Perubahan" : "Tambah Lahan"}
                    </button>
                    {isEditing && (
                      <button
                        type="button"
                        onClick={() => {
                          setForm({
                            id_lahan: null,
                            nama_lahan: "",
                            luas: "",
                            lokasi: "",
                            id_pengawas: "",
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
              <div className="absolute inset-x-0 top-0 h-0.5 bg-gradient-to-r from-sky-400/80 via-emerald-300/80 to-lime-400/80" />
              <div className="pointer-events-none absolute inset-0 opacity-40">
                <div className="absolute -top-16 left-0 h-32 w-32 rounded-full bg-sky-500/15 blur-3xl" />
                <div className="absolute -bottom-20 right-0 h-36 w-36 rounded-full bg-emerald-500/10 blur-3xl" />
              </div>

              <div className="relative w-full p-6 flex flex-col items-center">
                <h3 className="text-base md:text-lg font-semibold text-gray-900 dark:text-gray-50 mb-2 text-center">
                  Distribusi Luas Lahan Berdasarkan Pengawas
                </h3>
                <p className="text-xs text-gray-500 dark:text-gray-400 mb-6 text-center">
                  Menampilkan total luas (Ha) yang dikelola oleh masing-masing
                  pengawas.
                </p>
                <div className="w-full max-w-xs mx-auto">
                  {lahan.length > 0 ? (
                    <Pie data={getChartData()} />
                  ) : (
                    <p className="text-center text-sm text-gray-500 dark:text-gray-400">
                      Data lahan kosong, silakan tambah lahan terlebih dahulu.
                    </p>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* TABEL LAHAN */}
          <section className="space-y-3 mb-10">
            <h3 className="text-base md:text-lg font-semibold text-gray-900 dark:text-gray-50">
              Tabel Data Lahan
            </h3>
            <div className="overflow-auto bg-white/95 dark:bg-gray-950/80 rounded-2xl border border-gray-200/80 dark:border-gray-800/80 shadow-sm">
              <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-800 text-sm">
                <thead className="bg-gray-50/90 dark:bg-gray-900/80 sticky top-0 z-10">
                  <tr className="text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">
                    <th className="px-4 py-3 text-left">ID</th>
                    <th className="px-4 py-3 text-left">Nama Lahan</th>
                    <th className="px-4 py-3 text-left">Luas (Ha)</th>
                    <th className="px-4 py-3 text-left">Lokasi</th>
                    <th className="px-4 py-3 text-left">Pengawas</th>
                    <th className="px-4 py-3 text-center">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 dark:divide-gray-800">
                  {lahan.map((l) => {
                    const pengawas = manajerList.find(
                      (p) => p.id_user === l.id_pengawas
                    );
                    const namaPengawas = pengawas ? pengawas.nama : "Tidak Diketahui";

                    return (
                      <tr
                        key={l.id_lahan}
                        className="hover:bg-gray-50 dark:hover:bg-gray-900/70 transition-colors"
                      >
                        <td className="px-4 py-3 text-sm text-center">
                          {l.id_lahan}
                        </td>
                        <td className="px-4 py-3 text-sm">{l.nama_lahan}</td>
                        <td className="px-4 py-3 text-sm">{l.luas}</td>
                        <td className="px-4 py-3 text-sm">{l.lokasi}</td>
                        <td className="px-4 py-3 text-sm">{namaPengawas}</td>
                        <td className="px-4 py-3 text-center space-x-2">
                          <button
                            onClick={() => handleEdit(l)}
                            className="text-xs px-3 py-1.5 rounded-full border bg-blue-50 text-blue-700 border-blue-200 hover:bg-blue-100 dark:bg-blue-500/15 dark:text-blue-300 dark:border-blue-400/40 dark:hover:bg-blue-500/25 transition-colors"
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => handleDelete(l.id_lahan)}
                            className="text-xs px-3 py-1.5 rounded-full border bg-red-50 text-red-700 border-red-200 hover:bg-red-100 dark:bg-red-500/15 dark:text-red-300 dark:border-red-400/40 dark:hover:bg-red-500/25 transition-colors"
                          >
                            Hapus
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                  {lahan.length === 0 && (
                    <tr>
                      <td
                        colSpan="6"
                        className="px-4 py-4 text-center text-sm text-gray-500 dark:text-gray-400"
                      >
                        Tidak ada data lahan.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </section>
        </main>
      </div>
    </div>
  );
}
