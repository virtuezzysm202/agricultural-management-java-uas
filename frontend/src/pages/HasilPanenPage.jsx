import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";
import SidebarManager from "../components/SidebarManager";
import TopbarManager from "../components/TopbarManager";
import { Pie } from "react-chartjs-2";
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from "chart.js";

ChartJS.register(ArcElement, Tooltip, Legend);

export default function HasilPanenPage() {
  const navigate = useNavigate();
  const [hasilPanen, setHasilPanen] = useState([]);
  const [tanamans, setTanamans] = useState([]);
  const [lahans, setLahans] = useState([]);
  const [managers, setManagers] = useState([]);
  const [currentUser, setCurrentUser] = useState(null);
  const [form, setForm] = useState({
    id_hasil: null,
    id_tanaman: "",
    id_lahan: "",
    id_pengawas: "",
    tanggal_panen: "",
    kuantitas: "",
    kualitas: "A",
    harga_satuan: "",
    status: "Menunggu Validasi",
  });
  const [loading, setLoading] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const fetchHasilPanen = async () => {
    try {
      const res = await api.get("/manager/hasil-panen");
      setHasilPanen(res.data.data || []);
    } catch (err) {
      console.error("Gagal memuat data hasil panen:", err);
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
      const res = await api.get("/lahan");
      setLahans(res.data || []);
    } catch (err) {
      console.error("Gagal memuat data lahan:", err);
      // Don't redirect on lahan error, just log it
      console.log("Lahan data unavailable, user can input ID manually");
    }
  };

  const fetchManagers = async () => {
    try {
      const res = await api.get("/user/manajer");
      setManagers(res.data || []);
    } catch (err) {
      console.error("Gagal memuat data manajer:", err);
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
    fetchHasilPanen();
    fetchTanamans();
    fetchLahans();
    fetchManagers();
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
        id_tanaman: parseInt(form.id_tanaman),
        id_lahan: parseInt(form.id_lahan),
        id_pengawas: parseInt(form.id_pengawas),
        tanggal_panen: form.tanggal_panen,
        kuantitas: parseFloat(form.kuantitas),
        kualitas: form.kualitas,
        harga_satuan: parseFloat(form.harga_satuan),
        status: form.status,
      };

      if (isEditing) {
        await api.put(`/manager/hasil-panen/${form.id_hasil}`, dataToSubmit);
        alert("Hasil panen berhasil diupdate!");
      } else {
        await api.post("/manager/hasil-panen", dataToSubmit);
        alert("Hasil panen berhasil ditambahkan!");
      }

      fetchHasilPanen();
      setForm({
        id_hasil: null,
        id_tanaman: "",
        id_lahan: "",
        id_pengawas: "",
        tanggal_panen: "",
        kuantitas: "",
        kualitas: "A",
        harga_satuan: "",
        status: "Menunggu Validasi",
      });
      setIsEditing(false);
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

  const handleEdit = (data) => {
    setForm({
      ...data,
      tanggal_panen: data.tanggal_panen ? data.tanggal_panen.split("T")[0] : "",
      kuantitas: String(data.kuantitas),
      harga_satuan: String(data.harga_satuan),
      id_tanaman: String(data.id_tanaman),
      id_lahan: String(data.id_lahan),
      id_pengawas: String(data.id_pengawas),
    });
    setIsEditing(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Yakin ingin menghapus hasil panen ini?")) return;
    try {
      await api.delete(`/manager/hasil-panen/${id}`);
      alert("Hasil panen berhasil dihapus!");
      fetchHasilPanen();
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
    const statusCount = hasilPanen.reduce((acc, hp) => {
      const status = hp.status || "unknown";
      acc[status] = (acc[status] || 0) + 1;
      return acc;
    }, {});

    const labels = Object.keys(statusCount);
    const dataCounts = Object.values(statusCount);

    const backgroundColors = [
      "#22c55e",
      "#f59e0b",
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
          label: "Jumlah Hasil Panen",
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

  const getManagerName = (id) => {
    const manager = managers.find((m) => m.id_user === id);
    return manager ? manager.nama : `ID ${id}`;
  };

  const filteredHasilPanen = hasilPanen
    .filter((hp) => currentUser && hp.id_pengawas === currentUser.id_user)
    .filter((hp) => {
      if (!searchQuery) return true;
      const query = searchQuery.toLowerCase();
      return (
        String(hp.id_hasil).includes(query) ||
        getTanamanName(hp.id_tanaman).toLowerCase().includes(query) ||
        getLahanName(hp.id_lahan).toLowerCase().includes(query) ||
        getManagerName(hp.id_pengawas).toLowerCase().includes(query) ||
        String(hp.kuantitas).includes(query) ||
        hp.kualitas.toLowerCase().includes(query) ||
        hp.status.toLowerCase().includes(query) ||
        (hp.tanggal_panen && new Date(hp.tanggal_panen).toLocaleDateString("id-ID").includes(query))
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
            <span>🌾</span> Data Hasil Panen
          </h2>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            Tambahkan dan kelola hasil panen dari berbagai tanaman dan lahan.
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
                  {isEditing ? "Edit Data Hasil Panen" : "Tambah Hasil Panen Baru"}
                </h3>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                  Lengkapi detail hasil panen untuk pencatatan.
                </p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-2">
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
                        {t.nama_tanaman} ({t.jenis})
                      </option>
                    ))}
                  </select>
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
                    Pengawas
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

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-xs font-medium text-gray-600 dark:text-gray-300 mb-0.5">
                      Kuantitas (kg)
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      name="kuantitas"
                      value={form.kuantitas}
                      onChange={handleChange}
                      className="w-full rounded-lg border border-gray-200 bg-emerald-50 px-2.5 py-1.5 text-xs text-gray-900 focus:border-emerald-400 focus:ring-1 focus:ring-emerald-100 dark:bg-emerald-900/60 dark:border-gray-700 dark:text-gray-100"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-gray-600 dark:text-gray-300 mb-0.5">
                      Harga Satuan
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      name="harga_satuan"
                      value={form.harga_satuan}
                      onChange={handleChange}
                      className="w-full rounded-lg border border-gray-200 bg-emerald-50 px-2.5 py-1.5 text-xs text-gray-900 focus:border-emerald-400 focus:ring-1 focus:ring-emerald-100 dark:bg-emerald-900/60 dark:border-gray-700 dark:text-gray-100"
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-xs font-medium text-gray-600 dark:text-gray-300 mb-0.5">
                      Kualitas
                    </label>
                    <select
                      name="kualitas"
                      value={form.kualitas}
                      onChange={handleChange}
                      className="w-full rounded-lg border border-gray-200 bg-emerald-50 px-2.5 py-1.5 text-xs text-gray-900 focus:border-emerald-400 focus:ring-1 focus:ring-emerald-100 dark:bg-emerald-900/60 dark:border-gray-700 dark:text-gray-100"
                      required
                    >
                      <option value="A">A</option>
                      <option value="B">B</option>
                      <option value="C">C</option>
                    </select>
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
                      <option value="Menunggu Validasi">Menunggu Validasi</option>
                      <option value="Siap Dijual">Siap Dijual</option>
                      <option value="Terjual">Terjual</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-medium text-gray-600 dark:text-gray-300 mb-0.5">
                    Tanggal Panen
                  </label>
                  <input
                    type="date"
                    name="tanggal_panen"
                    value={form.tanggal_panen}
                    onChange={handleChange}
                    className="w-full rounded-lg border border-gray-200 bg-emerald-50 px-2.5 py-1.5 text-xs text-gray-900 focus:border-emerald-400 focus:ring-1 focus:ring-emerald-100 dark:bg-emerald-900/60 dark:border-gray-700 dark:text-gray-100"
                    required
                  />
                </div>

                <div className="flex gap-2 pt-2">
                  <button
                    type="submit"
                    disabled={loading}
                    className="flex-1 inline-flex items-center justify-center rounded-lg bg-emerald-600 px-3 py-2 text-xs font-semibold text-white shadow-sm hover:bg-emerald-700 disabled:opacity-60 transition-colors"
                  >
                    {loading ? "Menyimpan..." : isEditing ? "Simpan Perubahan" : "Tambah Hasil Panen"}
                  </button>
                  {isEditing && (
                    <button
                      type="button"
                      onClick={() => {
                        setForm({
                          id_hasil: null,
                          id_tanaman: "",
                          id_lahan: "",
                          id_pengawas: "",
                          tanggal_panen: "",
                          kuantitas: "",
                          kualitas: "A",
                          harga_satuan: "",
                          status: "Menunggu Validasi",
                        });
                        setIsEditing(false);
                      }}
                      className="rounded-lg border border-gray-300 bg-white px-3 py-2 text-xs font-medium text-gray-700 hover:bg-gray-50 dark:bg-gray-900 dark:border-gray-700 dark:text-gray-200 dark:hover:bg-gray-800"
                    >
                      Batal
                    </button>
                  )}
                </div>
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
                Distribusi Status Hasil Panen
              </h3>
              <p className="text-xs text-gray-500 dark:text-gray-400 mb-3 text-center">
                Jumlah hasil panen berdasarkan status.
              </p>
              <div className="w-full max-w-[200px] mx-auto">
                {hasilPanen.length > 0 ? (
                  <Pie data={getChartData()} options={{ maintainAspectRatio: true }} />
                ) : (
                  <p className="text-center text-xs text-gray-500 dark:text-gray-400 py-8">
                    Data hasil panen kosong, silakan tambah data terlebih dahulu.
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* TABEL HASIL PANEN - Same as before, just showing first few rows for brevity */}
        <section className="space-y-3 mb-10">
          <div className="flex items-center justify-between">
            <h3 className="text-base md:text-lg font-semibold text-gray-900 dark:text-gray-50">
              Tabel Data Hasil Panen
            </h3>
            <div className="relative">
              <input
                type="text"
                placeholder="Cari hasil panen..."
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
                  <th className="px-4 py-3 text-left">Tanaman</th>
                  <th className="px-4 py-3 text-left">Lahan</th>
                  <th className="px-4 py-3 text-left">Pengawas</th>
                  <th className="px-4 py-3 text-left">Kuantitas</th>
                  <th className="px-4 py-3 text-left">Kualitas</th>
                  <th className="px-4 py-3 text-left">Harga</th>
                  <th className="px-4 py-3 text-left">Status</th>
                  <th className="px-4 py-3 text-left">Tanggal</th>
                  <th className="px-4 py-3 text-center">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-gray-800">
                {filteredHasilPanen.map((hp) => (
                  <tr
                    key={hp.id_hasil}
                    className="hover:bg-gray-50 dark:hover:bg-gray-900/70 transition-colors"
                  >
                    <td className="px-4 py-3 text-sm">{hp.id_hasil}</td>
                    <td className="px-4 py-3 text-sm">{getTanamanName(hp.id_tanaman)}</td>
                    <td className="px-4 py-3 text-sm">{getLahanName(hp.id_lahan)}</td>
                    <td className="px-4 py-3 text-sm">{getManagerName(hp.id_pengawas)}</td>
                    <td className="px-4 py-3 text-sm">{hp.kuantitas} kg</td>
                    <td className="px-4 py-3 text-sm">{hp.kualitas}</td>
                    <td className="px-4 py-3 text-sm">
                      Rp {hp.harga_satuan?.toLocaleString("id-ID")}
                    </td>
                    <td className="px-4 py-3 text-sm capitalize">
                      <span
                        className={`px-2 py-1 rounded-full text-xs ${
                          hp.status === "Siap Dijual"
                            ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
                            : hp.status === "Terjual"
                            ? "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200"
                            : "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200"
                        }`}
                      >
                        {hp.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-sm">
                      {hp.tanggal_panen
                        ? new Date(hp.tanggal_panen).toLocaleDateString("id-ID")
                        : "-"}
                    </td>
                    <td className="px-4 py-3 text-center space-x-2">
                      <button
                        onClick={() => handleEdit(hp)}
                        className="text-xs px-3 py-1.5 rounded-full border bg-blue-50 text-blue-700 border-blue-200 hover:bg-blue-100 dark:bg-blue-500/15 dark:text-blue-300 dark:border-blue-400/40 dark:hover:bg-blue-500/25 transition-colors"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDelete(hp.id_hasil)}
                        className="text-xs px-3 py-1.5 rounded-full border bg-red-50 text-red-700 border-red-200 hover:bg-red-100 dark:bg-red-500/15 dark:text-red-300 dark:border-red-400/40 dark:hover:bg-red-500/25 transition-colors"
                      >
                        Hapus
                      </button>
                    </td>
                  </tr>
                ))}
                {filteredHasilPanen.length === 0 && (
                  <tr>
                    <td
                      colSpan="10"
                      className="px-4 py-4 text-center text-sm text-gray-500 dark:text-gray-400"
                    >
                      Tidak ada data hasil panen.
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