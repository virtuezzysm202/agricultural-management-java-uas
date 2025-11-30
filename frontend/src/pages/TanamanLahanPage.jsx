import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";
import SidebarManager from "../components/SidebarManager";
import TopbarManager from "../components/TopbarManager";
import { Pie } from "react-chartjs-2";
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from "chart.js";

ChartJS.register(ArcElement, Tooltip, Legend);

export default function TanamanLahanPage() {
  const navigate = useNavigate();
  const [tanamanLahan, setTanamanLahan] = useState([]);
  const [tanamans, setTanamans] = useState([]);
  const [lahans, setLahans] = useState([]);
  const [currentUser, setCurrentUser] = useState(null);
  const [form, setForm] = useState({
    id_tl: null,
    id_lahan: "",
    id_tanaman: "",
    id_pengawas: "",
    jumlah_tanaman: "",
    tanggal_tanam: "",
    status: "tumbuh",
  });
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const fetchTanamanLahan = async () => {
    try {
      const res = await api.get("/manager/tanaman-lahan");
      setTanamanLahan(res.data.data || []);
    } catch (err) {
      console.error("Gagal memuat data tanaman lahan:", err);
      if (err.response?.status === 401 || err.response?.status === 403) {
        alert("Session expired. Please login again.");
        localStorage.removeItem("token");
        navigate("/");
      }
    }
  };

  const fetchTanamans = async () => {
    try {
      const res = await api.get("/manager/tanaman");
      setTanamans(res.data.data || []);
    } catch (err) {
      console.error("Gagal memuat data tanaman:", err);
      if (err.response?.status === 401 || err.response?.status === 403) {
        alert("Session expired. Please login again.");
        localStorage.removeItem("token");
        navigate("/");
      }
    }
  };

  const fetchLahans = async () => {
    try {
      // Try manager endpoint first, fall back to lahan if needed
      const res = await api.get("/lahan");
      setLahans(res.data || []);
    } catch (err) {
      console.error("Gagal memuat data lahan:", err);
      if (err.response?.status === 401 || err.response?.status === 403) {
        alert("Session expired. Please login again.");
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

    // Get current user from token
    const fetchCurrentUser = async () => {
      try {
        const res = await api.get("/user/current");
        setCurrentUser(res.data);
        // Set id_pengawas in form automatically
        setForm(prev => ({ ...prev, id_pengawas: res.data.id_user }));
      } catch (err) {
        console.error("Failed to get current user:", err);
      }
    };
    
    fetchCurrentUser();
    fetchTanamanLahan();
    fetchTanamans();
    fetchLahans();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [navigate]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm({ ...form, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const dataToSubmit = {
        id_lahan: parseInt(form.id_lahan),
        id_tanaman: parseInt(form.id_tanaman),
        id_pengawas: parseInt(form.id_pengawas),
        jumlah_tanaman: parseInt(form.jumlah_tanaman) || 0,
        tanggal_tanam: form.tanggal_tanam,
        status: form.status,
      };

      await api.post("/manager/tanaman-lahan", dataToSubmit);
      alert("Tanaman lahan berhasil ditambahkan!");
      fetchTanamanLahan();
      setForm({
        id_tl: null,
        id_lahan: "",
        id_tanaman: "",
        id_pengawas: currentUser?.id_user || "",
        jumlah_tanaman: "",
        tanggal_tanam: "",
        status: "tumbuh",
      });
    } catch (err) {
      console.error("Gagal menyimpan data:", err);
      if (err.response?.status === 401 || err.response?.status === 403) {
        alert("Session expired. Please login again.");
        localStorage.removeItem("token");
        navigate("/");
      } else {
        alert("Gagal menyimpan data: " + (err.response?.data?.error || err.message));
      }
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Yakin ingin menghapus tanaman lahan ini?")) return;
    try {
      await api.delete(`/manager/tanaman-lahan/${id}`);
      alert("Tanaman lahan berhasil dihapus!");
      fetchTanamanLahan();
    } catch (err) {
      console.error("Gagal menghapus data:", err);
      if (err.response?.status === 401 || err.response?.status === 403) {
        alert("Session expired. Please login again.");
        localStorage.removeItem("token");
        navigate("/");
      } else {
        alert("Gagal menghapus data.");
      }
    }
  };

  const getChartData = () => {
    const statusCount = tanamanLahan.reduce((acc, tl) => {
      const status = tl.status || "unknown";
      acc[status] = (acc[status] || 0) + 1;
      return acc;
    }, {});

    const labels = Object.keys(statusCount);
    const dataCounts = Object.values(statusCount);

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
          label: "Jumlah Tanaman Lahan",
          data: dataCounts,
          backgroundColor: backgroundColors.slice(0, labels.length),
          borderColor: backgroundColors.slice(0, labels.length),
          borderWidth: 1,
        },
      ],
    };
  };

  const getTanamanName = (id) => {
    const tanaman = tanamans.find((t) => t.id_tanaman === id);
    return tanaman ? tanaman.nama_tanaman : `ID ${id}`;
  };

  const getLahanName = (id) => {
    const lahan = lahans.find((l) => l.id_lahan === id);
    return lahan ? lahan.nama_lahan : `ID ${id}`;
  };

  const filteredTanamanLahan = tanamanLahan
    .filter((tl) => currentUser && tl.id_pengawas === currentUser.id_user)
    .filter((tl) => {
      if (!searchQuery) return true;
      const query = searchQuery.toLowerCase();
      return (
        String(tl.id_tl).includes(query) ||
        getLahanName(tl.id_lahan).toLowerCase().includes(query) ||
        getTanamanName(tl.id_tanaman).toLowerCase().includes(query) ||
        String(tl.jumlah_tanaman).includes(query) ||
        tl.status.toLowerCase().includes(query) ||
        (tl.tanggal_tanam && new Date(tl.tanggal_tanam).toLocaleDateString("id-ID").includes(query))
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
            <span>🌾</span> Data Tanaman Lahan
          </h2>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            Tambahkan dan kelola tanaman yang ditanam di setiap lahan.
          </p>
        </div>


        {/* FORM + CHART */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {/* FORM CARD */}
          <div className="relative overflow-hidden rounded-xl border border-gray-200/80 bg-white/95 dark:bg-gray-950/80 dark:border-gray-800/80 shadow-lg">
            <div className="absolute inset-x-0 top-0 h-0.5 bg-gradient-to-r from-emerald-400/80 via-lime-300/80 to-sky-400/80" />
            <div className="pointer-events-none absolute inset-0 opacity-30">
              <div className="absolute -top-12 right-0 h-24 w-24 rounded-full bg-emerald-500/15 blur-2xl" />
              <div className="absolute -bottom-12 left-0 h-24 w-24 rounded-full bg-lime-400/10 blur-2xl" />
            </div>

            <div className="relative p-3 space-y-2">
              <div>
                <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-50">
                  Tambah Tanaman Lahan Baru
                </h3>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                  Lengkapi detail penanaman untuk lahan yang dipilih.
                </p>
              </div>

             <form onSubmit={handleSubmit} className="space-y-2">
                <div>
                  <label className="block text-xs font-medium text-gray-600 dark:text-gray-300 mb-0.5">
                    ID Pengawas
                  </label>
                  <input
                    type="number"
                    name="id_pengawas"
                    value={form.id_pengawas}
                    className="w-full rounded-lg border border-gray-200 bg-emerald-50 px-2.5 py-1.5 text-xs text-gray-900 dark:bg-emerald-900/60 dark:border-gray-700 dark:text-gray-100"
                    readOnly
                    placeholder="ID Pengawas (Auto)"
                  />
                  <p className="mt-0.5 text-xs text-gray-500 dark:text-gray-400">
                    ID Anda: {currentUser?.nama}
                  </p>
                </div>

                <div>
                  <label className="block text-xs font-medium text-gray-600 dark:text-gray-300 mb-0.5">
                    Lahan
                  </label>
                  <select
                    name="id_lahan"
                    value={form.id_lahan}
                    onChange={handleChange}
                    className="w-full rounded-lg border border-gray-200 bg-emerald-50 px-2.5 py-1.5 text-xs text-gray-900 focus:border-emerald-400 focus:ring-1 focus:ring-emerald-100 dark:bg-emerald-900/60 dark:border-gray-700 dark:text-gray-100"
                    required
                  >
                    <option value="">Pilih Lahan</option>
                    {lahans.map((l) => (
                      <option key={l.id_lahan} value={l.id_lahan}>
                        {l.nama_lahan ? `${l.nama_lahan} (ID ${l.id_lahan})` : `ID ${l.id_lahan}`}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-medium text-gray-600 dark:text-gray-300 mb-0.5">
                    Tanaman
                  </label>
                  <select
                    name="id_tanaman"
                    value={form.id_tanaman}
                    onChange={handleChange}
                    className="w-full rounded-lg border border-gray-200 bg-emerald-50 px-2.5 py-1.5 text-xs text-gray-900 focus:border-emerald-400 focus:ring-1 focus:ring-emerald-100 dark:bg-emerald-900/60 dark:border-gray-700 dark:text-gray-100"
                    required
                  >
                    <option value="">Pilih Tanaman</option>
                    {tanamans.map((t) => (
                      <option key={t.id_tanaman} value={t.id_tanaman}>
                        {t.nama_tanaman}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-xs font-medium text-gray-600 dark:text-gray-300 mb-0.5">
                      Jumlah
                    </label>
                    <input
                      type="number"
                      name="jumlah_tanaman"
                      value={form.jumlah_tanaman}
                      onChange={handleChange}
                      className="w-full rounded-lg border border-gray-200 bg-emerald-50 px-2.5 py-1.5 text-xs text-gray-900 focus:border-emerald-400 focus:ring-1 focus:ring-emerald-100 dark:bg-emerald-900/60 dark:border-gray-700 dark:text-gray-100"
                      placeholder="Jumlah"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-gray-600 dark:text-gray-300 mb-0.5">
                      Status
                    </label>
                    <select
                      name="status"
                      value={form.status}
                      onChange={handleChange}
                      className="w-full rounded-lg border border-gray-200 bg-emerald-50 px-2.5 py-1.5 text-xs text-gray-900 focus:border-emerald-400 focus:ring-1 focus:ring-emerald-100 dark:bg-emerald-900/60 dark:border-gray-700 dark:text-gray-100"
                      required
                    >
                      <option value="tumbuh">Tumbuh</option>
                      <option value="panen">Panen</option>
                      <option value="gagal">Gagal</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-medium text-gray-600 dark:text-gray-300 mb-0.5">
                    Tanggal Tanam
                  </label>
                  <input
                    type="date"
                    name="tanggal_tanam"
                    value={form.tanggal_tanam}
                    onChange={handleChange}
                    className="w-full rounded-lg border border-gray-200 bg-emerald-50 px-2.5 py-1.5 text-xs text-gray-900 focus:border-emerald-400 focus:ring-1 focus:ring-emerald-100 dark:bg-emerald-900/60 dark:border-gray-700 dark:text-gray-100"
                    required
                  />
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full inline-flex items-center justify-center rounded-lg bg-emerald-600 px-3 py-2 text-xs font-semibold text-white shadow-sm hover:bg-emerald-700 disabled:opacity-60 transition-colors mt-3"
                >
                  {loading ? "Menyimpan..." : "Tambah Tanaman Lahan"}
                </button>
              </form>
            </div>
          </div>

          {/* CHART CARD */}
          <div className="relative overflow-hidden rounded-xl border border-gray-200/80 bg-white/95 dark:bg-gray-950/80 dark:border-gray-800/80 shadow-lg flex flex-col items-center">
            <div className="absolute inset-x-0 top-0 h-0.5 bg-gradient-to-r from-sky-400/80 via-emerald-300/80 to-lime-400/80" />
            <div className="pointer-events-none absolute inset-0 opacity-30">
              <div className="absolute -top-12 left-0 h-24 w-24 rounded-full bg-sky-500/15 blur-2xl" />
              <div className="absolute -bottom-12 right-0 h-24 w-24 rounded-full bg-emerald-500/10 blur-2xl" />
            </div>

            <div className="relative w-full p-3 flex flex-col items-center">
              <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-50 mb-0.5 text-center">
                Distribusi Status Tanaman Lahan
              </h3>
              <p className="text-xs text-gray-500 dark:text-gray-400 mb-3 text-center">
                Jumlah tanaman berdasarkan status pertumbuhan.
              </p>
              <div className="w-full max-w-[200px] mx-auto">
                {tanamanLahan.length > 0 ? (
                  <Pie data={getChartData()} options={{ maintainAspectRatio: true }} />
                ) : (
                  <p className="text-center text-xs text-gray-500 dark:text-gray-400 py-8">
                    Data tanaman lahan kosong, silakan tambah data terlebih dahulu.
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* TABEL TANAMAN LAHAN */}
        <section className="space-y-3 mb-10">
          <div className="flex items-center justify-between">
            <h3 className="text-base md:text-lg font-semibold text-gray-900 dark:text-gray-50">
              Tabel Data Tanaman Lahan
            </h3>
            <div className="relative">
              <input
                type="text"
                placeholder="Cari tanaman lahan..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-64 rounded-xl border border-gray-200 bg-gray-50 px-4 py-2 text-sm text-gray-900 placeholder-gray-500 focus:border-emerald-400 focus:ring-2 focus:ring-emerald-100 dark:bg-gray-900 dark:border-gray-700 dark:text-gray-100 dark:placeholder-gray-400"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery("")}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                >
                  ✕
                </button>
              )}
            </div>
          </div>
          <div className="overflow-auto bg-white/95 dark:bg-gray-950/80 rounded-2xl border border-gray-200/80 dark:border-gray-800/80 shadow-sm">
            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-800 text-sm">
              <thead className="bg-gray-50/90 dark:bg-gray-900/80 sticky top-0 z-10">
                <tr className="text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">
                  <th className="px-4 py-3 text-left">ID</th>
                  <th className="px-4 py-3 text-left">Lahan</th>
                  <th className="px-4 py-3 text-left">Tanaman</th>
                  <th className="px-4 py-3 text-left">Jumlah</th>
                  <th className="px-4 py-3 text-left">Tanggal Tanam</th>
                  <th className="px-4 py-3 text-left">Status</th>
                  <th className="px-4 py-3 text-center">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-gray-800">
                {filteredTanamanLahan.map((tl) => (
                  <tr
                    key={tl.id_tl}
                    className="hover:bg-gray-50 dark:hover:bg-gray-900/70 transition-colors"
                  >
                    <td className="px-4 py-3 text-sm">{tl.id_tl}</td>
                    <td className="px-4 py-3 text-sm">{getLahanName(tl.id_lahan)}</td>
                    <td className="px-4 py-3 text-sm capitalize">{getTanamanName(tl.id_tanaman)}</td>
                    <td className="px-4 py-3 text-sm">{tl.jumlah_tanaman || 0} crops</td>
                    <td className="px-4 py-3 text-sm">
                      {tl.tanggal_tanam
                        ? new Date(tl.tanggal_tanam).toLocaleDateString("id-ID")
                        : "-"}
                    </td>
                    <td className="px-4 py-3 text-sm capitalize">
                      <span
                        className={`px-2 py-1 rounded-full text-xs ${
                          tl.status === "panen"
                            ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
                            : tl.status === "gagal"
                            ? "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200"
                            : "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200"
                        }`}
                      >
                        {tl.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-center space-x-2">
                      <button
                        onClick={() => handleDelete(tl.id_tl)}
                        className="text-xs px-3 py-1.5 rounded-full border bg-red-50 text-red-700 border-red-200 hover:bg-red-100 dark:bg-red-500/15 dark:text-red-300 dark:border-red-400/40 dark:hover:bg-red-500/25 transition-colors"
                      >
                        Hapus
                      </button>
                    </td>
                  </tr>
                ))}
                {filteredTanamanLahan.length === 0 && (
                  <tr>
                    <td
                      colSpan="7"
                      className="px-4 py-4 text-center text-sm text-gray-500 dark:text-gray-400"
                    >
                      Tidak ada data tanaman lahan.
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