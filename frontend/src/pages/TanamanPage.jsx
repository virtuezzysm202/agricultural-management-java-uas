import React, { useEffect, useState } from "react";
import SidebarAdmin from "../components/SidebarAdmin";
import TopbarAdmin from "../components/TopbarAdmin";
import api from "../services/api";

// --- START CHART IMPORTS ---
import { Pie } from "react-chartjs-2";
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from "chart.js";

ChartJS.register(ArcElement, Tooltip, Legend);
// --- END CHART IMPORTS ---

export default function TanamanPage() {
  const [tanaman, setTanaman] = useState([]);
  const [form, setForm] = useState({
    id_tanaman: null,
    nama_tanaman: "",
    jenis: "",
    waktu_tanam: "",
    jumlah_tanaman: "",
  });
  const [loading, setLoading] = useState(false);
  const [isEditing, setIsEditing] = useState(false);

  const fetchTanaman = async () => {
    try {
      const res = await api.get("/tanaman");
      setTanaman(res.data);
    } catch (err) {
      console.error("Gagal memuat data tanaman:", err);
    }
  };

  useEffect(() => {
    fetchTanaman();
  }, []);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (isEditing) {
        const dataToSubmit = { ...form };
        delete dataToSubmit.id_tanaman;
        await api.put(`/tanaman/${form.id_tanaman}`, dataToSubmit);
      } else {
        await api.post("/tanaman", form);
      }
      fetchTanaman();
      setForm({
        id_tanaman: null,
        nama_tanaman: "",
        jenis: "",
        waktu_tanam: "",
        jumlah_tanaman: "",
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
    const formattedDate = data.waktu_tanam
      ? new Date(data.waktu_tanam).toISOString().split("T")[0]
      : "";

    setForm({ ...data, waktu_tanam: formattedDate });
    setIsEditing(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Yakin ingin menghapus tanaman ini?")) return;
    try {
      await api.delete(`/tanaman/${id}`);
      fetchTanaman();
    } catch (err) {
      console.error("Gagal menghapus data:", err);
    }
  };

  const getChartData = () => {
    const jenisCount = tanaman.reduce((acc, t) => {
      const jenis = t.jenis || "Tidak Diketahui";
      acc[jenis] = (acc[jenis] || 0) + 1;
      return acc;
    }, {});

    const labels = Object.keys(jenisCount);
    const dataCounts = Object.values(jenisCount);

    const backgroundColors = [
      "#22c55e",
      "#f97316",
      "#0ea5e9",
      "#f43f5e",
      "#a855f7",
      "#06b6d4",
      "#eab308",
      "#64748b",
    ];

    return {
      labels,
      datasets: [
        {
          label: "Jumlah Tanaman",
          data: dataCounts,
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
              <span>🌱</span> Kelola Data Tanaman
            </h2>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
              Tambahkan, ubah, dan pantau seluruh jenis tanaman yang terdaftar.
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
                    {isEditing ? "Edit Data Tanaman" : "Tambah Tanaman Baru"}
                  </h3>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                    Isi informasi dasar tanaman untuk kebutuhan pendataan.
                  </p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-600 dark:text-gray-300 mb-1">
                      Nama Tanaman
                    </label>
                    <input
                      type="text"
                      name="nama_tanaman"
                      value={form.nama_tanaman}
                      onChange={handleChange}
                      className="w-full rounded-xl border border-gray-200 bg-gray-50 px-3 py-2.5 text-sm text-gray-900 placeholder:text-gray-400 focus:border-emerald-400 focus:ring-2 focus:ring-emerald-100 dark:bg-gray-900 dark:border-gray-700 dark:text-gray-100 dark:placeholder-gray-500"
                      required
                      placeholder="Contoh: Padi, Jagung, Brokoli..."
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-600 dark:text-gray-300 mb-1">
                      Jenis
                    </label>
                    <input
                      type="text"
                      name="jenis"
                      value={form.jenis}
                      onChange={handleChange}
                      className="w-full rounded-xl border border-gray-200 bg-gray-50 px-3 py-2.5 text-sm text-gray-900 placeholder:text-gray-400 focus:border-emerald-400 focus:ring-2 focus:ring-emerald-100 dark:bg-gray-900 dark:border-gray-700 dark:text-gray-100 dark:placeholder-gray-500"
                      required
                      placeholder="Contoh: Sayuran, Umbi Akar, Bunga..."
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-600 dark:text-gray-300 mb-1">
                      Waktu Tanam
                    </label>
                    <input
                      type="date"
                      name="waktu_tanam"
                      value={form.waktu_tanam}
                      onChange={handleChange}
                      className="w-full rounded-xl border border-gray-200 bg-gray-50 px-3 py-2.5 text-sm text-gray-900 focus:border-emerald-400 focus:ring-2 focus:ring-emerald-100 dark:bg-gray-900 dark:border-gray-700 dark:text-gray-100"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-600 dark:text-gray-300 mb-1">
                      Jumlah Tanaman
                    </label>
                    <input
                      type="number"
                      name="jumlah_tanaman"
                      value={form.jumlah_tanaman}
                      onChange={handleChange}
                      className="w-full rounded-xl border border-gray-200 bg-gray-50 px-3 py-2.5 text-sm text-gray-900 placeholder:text-gray-400 focus:border-emerald-400 focus:ring-2 focus:ring-emerald-100 dark:bg-gray-900 dark:border-gray-700 dark:text-gray-100 dark:placeholder-gray-500"
                      placeholder="Jumlah stok tanaman"
                      min="0"
                    />
                  </div>

                  <div className="flex gap-2 pt-2">
                    <button
                      type="submit"
                      disabled={loading}
                      className="flex-1 inline-flex items-center justify-center rounded-xl bg-emerald-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-emerald-700 disabled:opacity-60 transition-colors"
                    >
                      {isEditing ? "Simpan Perubahan" : "Tambah Tanaman"}
                    </button>
                    {isEditing && (
                      <button
                        type="button"
                        onClick={() => {
                          setForm({
                            id_tanaman: null,
                            nama_tanaman: "",
                            jenis: "",
                            waktu_tanam: "",
                            jumlah_tanaman: "",
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
                <h3 className="text-base md:text-lg font-semibold text-gray-900 dark:text-gray-50 mb-2">
                  Distribusi Jenis Tanaman
                </h3>
                <p className="text-xs text-gray-500 dark:text-gray-400 mb-6 text-center">
                  Ringkasan komposisi tanaman berdasarkan kategori jenis.
                </p>
                <div className="w-full max-w-xs mx-auto">
                  {tanaman.length > 0 ? (
                    <Pie data={getChartData()} />
                  ) : (
                    <p className="text-center text-sm text-gray-500 dark:text-gray-400">
                      Data masih kosong, silakan tambah tanaman terlebih dahulu.
                    </p>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* TABEL TANAMAN */}
          <section className="space-y-3 mb-10">
            <h3 className="text-base md:text-lg font-semibold text-gray-900 dark:text-gray-50">
              Tabel Data Tanaman
            </h3>
            <div className="overflow-auto bg-white/95 dark:bg-gray-950/80 rounded-2xl border border-gray-200/80 dark:border-gray-800/80 shadow-sm">
              <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-800 text-sm">
                <thead className="bg-gray-50/90 dark:bg-gray-900/80 sticky top-0 z-10">
                  <tr className="text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">
                    <th className="px-4 py-3 text-left">ID</th>
                    <th className="px-4 py-3 text-left">Nama Tanaman</th>
                    <th className="px-4 py-3 text-left">Jenis</th>
                    <th className="px-4 py-3 text-left">Jumlah</th>
                    <th className="px-4 py-3 text-left">Waktu Tanam</th>
                    <th className="px-4 py-3 text-center">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 dark:divide-gray-800">
                  {tanaman.map((t) => (
                    <tr
                      key={t.id_tanaman}
                      className="hover:bg-gray-50 dark:hover:bg-gray-900/70 transition-colors"
                    >
                      <td className="px-4 py-3 text-sm">{t.id_tanaman}</td>
                      <td className="px-4 py-3 text-sm">{t.nama_tanaman}</td>
                      <td className="px-4 py-3 text-sm">{t.jenis}</td>
                      <td className="px-4 py-3 text-sm">{t.jumlah_tanaman || 0}</td>
                      <td className="px-4 py-3 text-sm">
                        {t.waktu_tanam
                          ? new Date(t.waktu_tanam).toLocaleDateString("id-ID")
                          : "-"}
                      </td>
                      <td className="px-4 py-3 text-center space-x-2">
                        <button
                          onClick={() => handleEdit(t)}
                          className="text-xs px-3 py-1.5 rounded-full border bg-blue-50 text-blue-700 border-blue-200 hover:bg-blue-100 dark:bg-blue-500/15 dark:text-blue-300 dark:border-blue-400/40 dark:hover:bg-blue-500/25 transition-colors"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDelete(t.id_tanaman)}
                          className="text-xs px-3 py-1.5 rounded-full border bg-red-50 text-red-700 border-red-200 hover:bg-red-100 dark:bg-red-500/15 dark:text-red-300 dark:border-red-400/40 dark:hover:bg-red-500/25 transition-colors"
                        >
                          Hapus
                        </button>
                      </td>
                    </tr>
                  ))}
                  {tanaman.length === 0 && (
                    <tr>
                      <td
                        colSpan="6"
                        className="px-4 py-4 text-center text-sm text-gray-500 dark:text-gray-400"
                      >
                        Tidak ada data tanaman.
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

