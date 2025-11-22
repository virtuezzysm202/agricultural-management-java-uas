import React, { useEffect, useState } from "react";
import axios from "axios";
import { Bar } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

export default function PembelianPage() {
  const [pembelian, setPembelian] = useState([]);
  const [hasilPanen, setHasilPanen] = useState([]);
  const [buyers, setBuyers] = useState([]);
  const [form, setForm] = useState({
    id_pembelian: null,
    jumlah: "",
    total_harga: "",
  });
  const [loading, setLoading] = useState(false);
  const [isEditing, setIsEditing] = useState(false);

  const API_PEMBELIAN = "http://localhost:4567/api/manager/pembelian";
  const API_BASE = "http://localhost:4567/api/manager";

  const fetchPembelian = async () => {
    try {
      const res = await axios.get(API_PEMBELIAN);
      setPembelian(res.data.data || []);
    } catch (err) {
      console.error("Gagal memuat data pembelian:", err);
    }
  };

  const fetchHasilPanen = async () => {
    try {
      const res = await axios.get(`${API_BASE}/hasil-panen`);
      setHasilPanen(res.data.data || []);
    } catch (err) {
      console.error("Gagal memuat data hasil panen:", err);
    }
  };

  const fetchBuyers = async () => {
    try {
      const res = await axios.get("http://localhost:4567/api/user/pembeli");
      setBuyers(res.data || []);
    } catch (err) {
      console.error("Gagal memuat data pembeli:", err);
    }
  };

  useEffect(() => {
    fetchPembelian();
    fetchHasilPanen();
    fetchBuyers();
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
        jumlah: parseFloat(form.jumlah),
        total_harga: parseFloat(form.total_harga),
      };

      await axios.put(`${API_PEMBELIAN}/${form.id_pembelian}`, dataToSubmit);
      alert("Data pembelian berhasil diupdate!");

      fetchPembelian();
      setForm({
        id_pembelian: null,
        jumlah: "",
        total_harga: "",
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
      id_pembelian: data.id_pembelian,
      jumlah: String(data.jumlah),
      total_harga: String(data.total_harga),
    });
    setIsEditing(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Yakin ingin menghapus data pembelian ini?")) return;
    try {
      await axios.delete(`${API_PEMBELIAN}/${id}`);
      alert("Data pembelian berhasil dihapus!");
      fetchPembelian();
    } catch (err) {
      console.error("Gagal menghapus data:", err);
      alert("Gagal menghapus data.");
    }
  };

  const getChartData = () => {
    // Group by month
    const monthlyRevenue = pembelian.reduce((acc, p) => {
      const date = new Date(p.tanggal);
      const monthYear = date.toLocaleDateString("id-ID", {
        month: "short",
        year: "numeric",
      });
      acc[monthYear] = (acc[monthYear] || 0) + (p.total_harga || 0);
      return acc;
    }, {});

    const labels = Object.keys(monthlyRevenue);
    const dataRevenue = Object.values(monthlyRevenue);

    return {
      labels,
      datasets: [
        {
          label: "Revenue (Rp)",
          data: dataRevenue,
          backgroundColor: "rgba(34, 197, 94, 0.6)",
          borderColor: "rgba(34, 197, 94, 1)",
          borderWidth: 1,
        },
      ],
    };
  };

  const getHasilPanenInfo = (id) => {
    const hasil = hasilPanen.find((hp) => hp.id_hasil === id);
    return hasil ? `${hasil.id_tanaman} - Lahan ${hasil.id_lahan}` : `ID ${id}`;
  };

  const getBuyerName = (id) => {
    const buyer = buyers.find((b) => b.id_user === id);
    return buyer ? buyer.nama : `ID ${id}`;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-emerald-50 dark:from-gray-950 dark:via-gray-900 dark:to-gray-950 text-gray-900 dark:text-gray-100">
      {/* Header */}
      <header className="sticky top-0 z-40 border-b border-gray-200/70 dark:border-gray-800/70 bg-white/80 dark:bg-gray-950/80 backdrop-blur-lg px-4 py-3 shadow-sm">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-400 to-pink-600 flex items-center justify-center text-white font-bold text-sm shadow-md">
              P
            </div>
            <div>
              <h1 className="text-lg md:text-xl font-bold text-gray-900 dark:text-gray-100">
                Kelola Pembelian
              </h1>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Pantau dan kelola transaksi pembelian
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
            <span>💰</span> Data Pembelian
          </h2>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            Lihat dan kelola data pembelian hasil panen oleh pembeli.
          </p>
        </div>

        {/* FORM + CHART */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* FORM CARD */}
          {isEditing && (
            <div className="relative overflow-hidden rounded-2xl border border-gray-200/80 bg-white/95 dark:bg-gray-950/80 dark:border-gray-800/80 shadow-[0_18px_45px_rgba(15,23,42,0.6)]">
              <div className="absolute inset-x-0 top-0 h-0.5 bg-gradient-to-r from-purple-400/80 via-pink-300/80 to-fuchsia-400/80" />
              <div className="pointer-events-none absolute inset-0 opacity-40">
                <div className="absolute -top-16 right-0 h-32 w-32 rounded-full bg-purple-500/15 blur-3xl" />
                <div className="absolute -bottom-16 left-0 h-32 w-32 rounded-full bg-pink-400/10 blur-3xl" />
              </div>

              <div className="relative p-6 space-y-5">
                <div>
                  <h3 className="text-base md:text-lg font-semibold text-gray-900 dark:text-gray-50">
                    Edit Data Pembelian
                  </h3>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                    Update informasi jumlah dan total harga pembelian.
                  </p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-600 dark:text-gray-300 mb-1">
                      Jumlah
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      name="jumlah"
                      value={form.jumlah}
                      onChange={handleChange}
                      className="w-full rounded-xl border border-gray-200 bg-gray-50 px-3 py-2.5 text-sm text-gray-900 focus:border-purple-400 focus:ring-2 focus:ring-purple-100 dark:bg-gray-900 dark:border-gray-700 dark:text-gray-100"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-600 dark:text-gray-300 mb-1">
                      Total Harga
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      name="total_harga"
                      value={form.total_harga}
                      onChange={handleChange}
                      className="w-full rounded-xl border border-gray-200 bg-gray-50 px-3 py-2.5 text-sm text-gray-900 focus:border-purple-400 focus:ring-2 focus:ring-purple-100 dark:bg-gray-900 dark:border-gray-700 dark:text-gray-100"
                      required
                    />
                  </div>

                  <div className="flex gap-2 pt-2">
                    <button
                      type="submit"
                      disabled={loading}
                      className="flex-1 inline-flex items-center justify-center rounded-xl bg-purple-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-purple-700 disabled:opacity-60 transition-colors"
                    >
                      Simpan Perubahan
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setForm({
                          id_pembelian: null,
                          jumlah: "",
                          total_harga: "",
                        });
                        setIsEditing(false);
                      }}
                      className="rounded-xl border border-gray-300 bg-white px-4 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50 dark:bg-gray-900 dark:border-gray-700 dark:text-gray-200 dark:hover:bg-gray-800"
                    >
                      Batal
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}

          {/* CHART CARD */}
          <div className={`relative overflow-hidden rounded-2xl border border-gray-200/80 bg-white/95 dark:bg-gray-950/80 dark:border-gray-800/80 shadow-[0_18px_45px_rgba(15,23,42,0.6)] flex flex-col items-center ${isEditing ? "" : "lg:col-span-2"}`}>
            <div className="absolute inset-x-0 top-0 h-0.5 bg-gradient-to-r from-fuchsia-400/80 via-purple-300/80 to-pink-400/80" />
            <div className="pointer-events-none absolute inset-0 opacity-40">
              <div className="absolute -top-16 left-0 h-32 w-32 rounded-full bg-fuchsia-500/15 blur-3xl" />
              <div className="absolute -bottom-20 right-0 h-36 w-36 rounded-full bg-purple-500/10 blur-3xl" />
            </div>

            <div className="relative w-full p-6 flex flex-col items-center">
              <h3 className="text-base md:text-lg font-semibold text-gray-900 dark:text-gray-50 mb-2 text-center">
                Revenue Pembelian per Bulan
              </h3>
              <p className="text-xs text-gray-500 dark:text-gray-400 mb-6 text-center">
                Menampilkan total revenue dari pembelian berdasarkan bulan.
              </p>
              <div className="w-full">
                {pembelian.length > 0 ? (
                  <Bar
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
                    Data pembelian kosong.
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* TABEL PEMBELIAN */}
        <section className="space-y-3 mb-10">
          <h3 className="text-base md:text-lg font-semibold text-gray-900 dark:text-gray-50">
            Tabel Data Pembelian
          </h3>
          <div className="overflow-auto bg-white/95 dark:bg-gray-950/80 rounded-2xl border border-gray-200/80 dark:border-gray-800/80 shadow-sm">
            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-800 text-sm">
              <thead className="bg-gray-50/90 dark:bg-gray-900/80 sticky top-0 z-10">
                <tr className="text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">
                  <th className="px-4 py-3 text-left">ID</th>
                  <th className="px-4 py-3 text-left">Pembeli</th>
                  <th className="px-4 py-3 text-left">Hasil Panen</th>
                  <th className="px-4 py-3 text-left">Jumlah</th>
                  <th className="px-4 py-3 text-left">Total Harga</th>
                  <th className="px-4 py-3 text-left">Tanggal</th>
                  <th className="px-4 py-3 text-center">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-gray-800">
                {pembelian.map((p) => (
                  <tr
                    key={p.id_pembelian}
                    className="hover:bg-gray-50 dark:hover:bg-gray-900/70 transition-colors"
                  >
                    <td className="px-4 py-3 text-sm">{p.id_pembelian}</td>
                    <td className="px-4 py-3 text-sm">{getBuyerName(p.id_pembeli)}</td>
                    <td className="px-4 py-3 text-sm">{getHasilPanenInfo(p.id_hasil)}</td>
                    <td className="px-4 py-3 text-sm">{p.jumlah}</td>
                    <td className="px-4 py-3 text-sm">
                      Rp {p.total_harga?.toLocaleString("id-ID")}
                    </td>
                    <td className="px-4 py-3 text-sm">
                      {p.tanggal
                        ? new Date(p.tanggal).toLocaleDateString("id-ID", {
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
                        onClick={() => handleEdit(p)}
                        className="text-xs px-3 py-1.5 rounded-full border bg-blue-50 text-blue-700 border-blue-200 hover:bg-blue-100 dark:bg-blue-500/15 dark:text-blue-300 dark:border-blue-400/40 dark:hover:bg-blue-500/25 transition-colors"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDelete(p.id_pembelian)}
                        className="text-xs px-3 py-1.5 rounded-full border bg-red-50 text-red-700 border-red-200 hover:bg-red-100 dark:bg-red-500/15 dark:text-red-300 dark:border-red-400/40 dark:hover:bg-red-500/25 transition-colors"
                      >
                        Hapus
                      </button>
                    </td>
                  </tr>
                ))}
                {pembelian.length === 0 && (
                  <tr>
                    <td
                      colSpan="7"
                      className="px-4 py-4 text-center text-sm text-gray-500 dark:text-gray-400"
                    >
                      Tidak ada data pembelian.
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
