import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";
import SidebarManager from "../components/SidebarManager";
import TopbarManager from "../components/TopbarManager";
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
  const navigate = useNavigate();
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
  const [searchQuery, setSearchQuery] = useState("");
  const [currentUser, setCurrentUser] = useState(null); // used for filtering pembelian by manager

  const fetchPembelian = async (managerId) => {
    try {
      const res = await api.get("/pembelian");
      // Filter pembelian sesuai id_penjual (id_user manager saat ini)
      const allPembelian = res.data || [];
      const filtered = allPembelian.filter((p) => p.id_penjual === managerId);
      setPembelian(filtered);
    } catch (err) {
      console.error("Gagal memuat data pembelian:", err);
      if (err.response?.status === 401 || err.response?.status === 403) {
        alert("Session expired or unauthorized. Please login again.");
        localStorage.removeItem("token");
        navigate("/");
      }
    }
  };

  const fetchHasilPanen = async () => {
    try {
      const res = await api.get("/manager/hasil-panen");
      setHasilPanen(res.data.data || []);
    } catch (err) {
      console.error("Gagal memuat data hasil panen:", err);
      if (err.response?.status === 401 || err.response?.status === 403) {
        alert("Session expired or unauthorized. Please login again.");
        localStorage.removeItem("token");
        navigate("/");
      }
    }
  };

  const fetchBuyers = async () => {
    try {
      const res = await api.get("/user/pembeli");
      setBuyers(res.data || []);
    } catch (err) {
      console.error("Gagal memuat data pembeli:", err);
      if (err.response?.status === 401 || err.response?.status === 403) {
        alert("Session expired or unauthorized. Please login again.");
        localStorage.removeItem("token");
        navigate("/");
      }
    }
  };

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      alert("Please login first");
      navigate("/");
      return;
    }

    // Ambil user saat ini
    const fetchCurrentUserAndData = async () => {
      try {
        const res = await api.get("/user/current");
        setCurrentUser(res.data);
        // Setelah dapat user, fetch pembelian sesuai id_user manager
        fetchPembelian(res.data.id_user);
      } catch {
        alert("Gagal mengambil data user. Silakan login ulang.");
        localStorage.removeItem("token");
        navigate("/");
      }
      fetchHasilPanen();
      fetchBuyers();
    };
    fetchCurrentUserAndData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
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

      await api.put(`/pembelian/${form.id_pembelian}`, dataToSubmit);
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
      if (err.response?.status === 401 || err.response?.status === 403) {
        alert("Session expired or unauthorized. Please login again.");
        localStorage.removeItem("token");
        navigate("/");
      } else {
        alert("Gagal menyimpan data: " + (err.response?.data?.error || err.message));
      }
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
      await api.delete(`/pembelian/${id}`);
      alert("Data pembelian berhasil dihapus!");
      fetchPembelian();
    } catch (err) {
      console.error("Gagal menghapus data:", err);
      if (err.response?.status === 401 || err.response?.status === 403) {
        alert("Session expired or unauthorized. Please login again.");
        localStorage.removeItem("token");
        navigate("/");
      } else {
        alert("Gagal menghapus data.");
      }
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

    // Detect dark mode
    const isDark = typeof document !== 'undefined' && document.documentElement.classList.contains('dark');
    const barColor = isDark ? 'rgba(34,197,94,1)' : 'rgba(34,197,94,0.6)';
    const borderColor = isDark ? 'rgba(22,163,74,1)' : 'rgba(34,197,94,1)';

    return {
      labels,
      datasets: [
        {
          label: "Revenue (Rp)",
          data: dataRevenue,
          backgroundColor: barColor,
          borderColor: borderColor,
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

    const filteredPembelian = pembelian.filter((p) => {
    if (!searchQuery) return true;
    const query = searchQuery.toLowerCase();
    return (
      String(p.id_pembelian).includes(query) ||
      getBuyerName(p.id_pembeli).toLowerCase().includes(query) ||
      getHasilPanenInfo(p.id_hasil).toLowerCase().includes(query) ||
      String(p.jumlah).includes(query) ||
      String(p.total_harga).includes(query) ||
      (p.tanggal && new Date(p.tanggal).toLocaleDateString("id-ID").includes(query))
    );
  });

  return (
    <div className="min-h-screen xl:flex bg-gray-50 dark:bg-gray-950 text-gray-900 dark:text-gray-100 transition-colors">
      <SidebarManager />
      <div className="flex-1 xl:ml-[260px]">
        <TopbarManager />

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
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
          {/* FORM CARD */}
          {isEditing && (
            <div className="relative overflow-hidden rounded-lg border border-gray-200/80 bg-white/95 dark:bg-gray-950/80 dark:border-gray-800/80 shadow-md">
              <div className="absolute inset-x-0 top-0 h-0.5 bg-gradient-to-r from-purple-400/80 via-pink-300/80 to-fuchsia-400/80" />
              <div className="pointer-events-none absolute inset-0 opacity-20">
                <div className="absolute -top-8 right-0 h-16 w-16 rounded-full bg-purple-500/15 blur-xl" />
                <div className="absolute -bottom-8 left-0 h-16 w-16 rounded-full bg-pink-400/10 blur-xl" />
              </div>

              <div className="relative p-2.5 space-y-1.5">
                <div>
                  <h3 className="text-xs font-semibold text-gray-900 dark:text-gray-50">
                    Edit Data Pembelian
                  </h3>
                  <p className="text-[10px] text-gray-500 dark:text-gray-400 mt-0.5">
                    Update informasi jumlah dan total harga.
                  </p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-1.5">
                  <div className="grid grid-cols-2 gap-1.5">
                    <div>
                      <label className="block text-[10px] font-medium text-gray-600 dark:text-gray-300 mb-0.5">
                        Jumlah
                      </label>
                      <input
                        type="number"
                        step="0.01"
                        name="jumlah"
                        value={form.jumlah}
                        onChange={handleChange}
                        className="w-full rounded-md border border-gray-200 bg-gray-50 px-2 py-1 text-[11px] text-gray-900 focus:border-purple-400 focus:ring-1 focus:ring-purple-100 dark:bg-gray-900 dark:border-gray-700 dark:text-gray-100"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-[10px] font-medium text-gray-600 dark:text-gray-300 mb-0.5">
                        Total Harga
                      </label>
                      <input
                        type="number"
                        step="0.01"
                        name="total_harga"
                        value={form.total_harga}
                        onChange={handleChange}
                        className="w-full rounded-md border border-gray-200 bg-gray-50 px-2 py-1 text-[11px] text-gray-900 focus:border-purple-400 focus:ring-1 focus:ring-purple-100 dark:bg-gray-900 dark:border-gray-700 dark:text-gray-100"
                        required
                      />
                    </div>
                  </div>

                  <div className="flex gap-1.5 pt-1">
                    <button
                      type="submit"
                      disabled={loading}
                      className="flex-1 inline-flex items-center justify-center rounded-md bg-purple-600 px-2.5 py-1.5 text-[11px] font-semibold text-white shadow-sm hover:bg-purple-700 disabled:opacity-60 transition-colors"
                    >
                      {loading ? "Menyimpan..." : "Simpan"}
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
                      className="rounded-md border border-gray-300 bg-white px-2.5 py-1.5 text-[11px] font-medium text-gray-700 hover:bg-gray-50 dark:bg-gray-900 dark:border-gray-700 dark:text-gray-200 dark:hover:bg-gray-800"
                    >
                      Batal
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}

          {/* CHART CARD */}
          <div className={`relative overflow-hidden rounded-lg border border-gray-200/80 bg-white/95 dark:bg-gray-950/80 dark:border-gray-800/80 shadow-md flex flex-col items-center ${isEditing ? "" : "lg:col-span-2"}`}>
            <div className="absolute inset-x-0 top-0 h-0.5 bg-gradient-to-r from-fuchsia-400/80 via-purple-300/80 to-pink-400/80" />
            <div className="pointer-events-none absolute inset-0 opacity-20">
              <div className="absolute -top-8 left-0 h-16 w-16 rounded-full bg-fuchsia-500/15 blur-xl" />
              <div className="absolute -bottom-12 right-0 h-20 w-20 rounded-full bg-purple-500/10 blur-xl" />
            </div>

            <div className="relative w-full p-2.5 flex flex-col items-center">
              <h3 className="text-xs font-semibold text-gray-900 dark:text-gray-50 mb-0.5 text-center">
                Revenue Pembelian per Bulan
              </h3>
              <p className="text-[10px] text-gray-500 dark:text-gray-400 mb-2 text-center">
                Total revenue dari pembelian berdasarkan bulan.
              </p>
              <div className="w-48 h-72">
                {pembelian.length > 0 ? (
                  <Bar
                    data={getChartData()}
                    options={{
                      responsive: true,
                      maintainAspectRatio: false,
                      plugins: {
                        legend: {
                          position: "top",
                          labels: {
                            font: {
                              size: 8
                            },
                            padding: 6
                          }
                        },
                      },
                      scales: {
                        y: {
                          beginAtZero: true,
                          ticks: {
                            font: {
                              size: 8
                            }
                          },
                          grid: {
                            color: () => {
                              // Less opaque grid lines: white in dark mode, black in light mode
                              if (document.documentElement.classList.contains('dark')) {
                                return 'rgba(255,255,255,0.25)';
                              }
                              return 'rgba(0,0,0,0.15)';
                            }
                          }
                        },
                        x: {
                          ticks: {
                            font: {
                              size: 8
                            }
                          }
                        }
                      },
                    }}
                  />
                ) : (
                  <p className="text-center text-[10px] text-gray-500 dark:text-gray-400 py-6">
                    Data pembelian kosong.
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* TABEL PEMBELIAN */}
        <section className="space-y-2 mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
            <h3 className="text-sm md:text-base font-semibold text-gray-900 dark:text-gray-50">
              Tabel Data Pembelian
            </h3>
            <div className="relative">
              <input
                type="text"
                placeholder="Cari pembelian..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full sm:w-56 rounded-lg border border-gray-200 bg-gray-50 px-3 py-1.5 text-xs text-gray-900 placeholder-gray-500 focus:border-purple-400 focus:ring-1 focus:ring-purple-100 dark:bg-gray-900 dark:border-gray-700 dark:text-gray-100 dark:placeholder-gray-400"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery("")}
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 text-xs"
                >
                  ✕
                </button>
              )}
            </div>
          </div>
          <div className="overflow-auto bg-white/95 dark:bg-gray-950/80 rounded-lg border border-gray-200/80 dark:border-gray-800/80 shadow-sm">
            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-800 text-xs">
              <thead className="bg-gray-50/90 dark:bg-gray-900/80 sticky top-0 z-10">
                <tr className="text-[10px] font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">
                  <th className="px-2.5 py-2 text-left">ID</th>
                  <th className="px-2.5 py-2 text-left">Pembeli</th>
                  <th className="px-2.5 py-2 text-left">Hasil Panen</th>
                  <th className="px-2.5 py-2 text-left">Jumlah</th>
                  <th className="px-2.5 py-2 text-left">Total Harga</th>
                  <th className="px-2.5 py-2 text-left">Tanggal</th>
                  <th className="px-2.5 py-2 text-center">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-gray-800">
                {filteredPembelian.map((p) => (
                  <tr
                    key={p.id_pembelian}
                    className="hover:bg-gray-50 dark:hover:bg-gray-900/70 transition-colors"
                  >
                    <td className="px-2.5 py-2 text-[11px]">{p.id_pembelian}</td>
                    <td className="px-2.5 py-2 text-[11px]">{getBuyerName(p.id_pembeli)}</td>
                    <td className="px-2.5 py-2 text-[11px]">{getHasilPanenInfo(p.id_hasil)}</td>
                    <td className="px-2.5 py-2 text-[11px]">{p.jumlah}</td>
                    <td className="px-2.5 py-2 text-[11px]">
                      Rp {p.total_harga?.toLocaleString("id-ID")}
                    </td>
                    <td className="px-2.5 py-2 text-[11px]">
                      {p.tanggal
                        ? new Date(p.tanggal).toLocaleDateString("id-ID", {
                            day: "2-digit",
                            month: "short",
                            year: "numeric",
                          })
                        : "-"}
                    </td>
                    <td className="px-2.5 py-2 text-center space-x-1">
                      <button
                        onClick={() => handleEdit(p)}
                        className="text-[10px] px-2 py-1 rounded-full border bg-blue-50 text-blue-700 border-blue-200 hover:bg-blue-100 dark:bg-blue-500/15 dark:text-blue-300 dark:border-blue-400/40 dark:hover:bg-blue-500/25 transition-colors"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDelete(p.id_pembelian)}
                        className="text-[10px] px-2 py-1 rounded-full border bg-red-50 text-red-700 border-red-200 hover:bg-red-100 dark:bg-red-500/15 dark:text-red-300 dark:border-red-400/40 dark:hover:bg-red-500/25 transition-colors"
                      >
                        Hapus
                      </button>
                    </td>
                  </tr>
                ))}
                {filteredPembelian.length === 0 && (
                  <tr>
                    <td
                      colSpan="7"
                      className="px-2.5 py-3 text-center text-[11px] text-gray-500 dark:text-gray-400"
                    >
                      {searchQuery ? "Tidak ada hasil pencarian." : "Tidak ada data pembelian."}
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