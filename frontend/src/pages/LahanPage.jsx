import React, { useEffect, useState } from "react";
import SidebarAdmin from "../components/SidebarAdmin";
import TopbarAdmin from "../components/TopbarAdmin";
import api from "../services/api";

// --- START CHART IMPORTS ---
import { Pie } from "react-chartjs-2";
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from "chart.js";

// Register chart components
ChartJS.register(ArcElement, Tooltip, Legend);
// --- END CHART IMPORTS ---

export default function LahanPage() {
  const [lahan, setLahan] = useState([]);
  const [manajerList, setManajerList] = useState([]);
  const [form, setForm] = useState({
    id_lahan: null,
    nama_lahan: "",
    luas: "", // Tipe data number/string
    lokasi: "",
    id_pengawas: "", // Foreign Key
  });
  const [loading, setLoading] = useState(false);
  const [isEditing, setIsEditing] = useState(false);

  // Load data lahan dari backend
  const fetchLahan = async () => {
    try {
      const res = await api.get("/lahan");
      setLahan(res.data);
    } catch (err) {
      console.error("Gagal memuat data lahan:", err);
    }
  };

  // Load data Pengawas untuk dropdown
  // ASUMSI: Ada endpoint /pengawas yang mengembalikan list Pengawas.
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
    fetchPengawas(); // Panggil fungsi fetch Pengawas
  }, []);

  // Handle input form
  const handleChange = (e) => {
    const { name, value, type } = e.target;
    // Konversi luas menjadi angka jika tipe inputnya number
    const newValue = type === "number" ? parseFloat(value) : value;

    setForm({ ...form, [name]: newValue });
  };

  // Submit tambah/update lahan
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
      // Reset form
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

  // Edit data
  const handleEdit = (data) => {
    // Pastikan `luas` adalah string agar bisa ditampilkan di input number
    setForm({
      ...data,
      luas: String(data.luas),
      // Pastikan id_pengawas adalah string atau number yang valid untuk <select>
      id_pengawas: String(data.id_pengawas),
    });
    setIsEditing(true);
  };

  // Hapus data
  const handleDelete = async (id) => {
    if (!window.confirm("Yakin ingin menghapus lahan ini?")) return;
    try {
      await api.delete(`/lahan/${id}`);
      fetchLahan();
    } catch (err) {
      console.error("Gagal menghapus data:", err);
    }
  };

  // --- START CHART LOGIC ---
  const getChartData = () => {
    // Menghitung total luas berdasarkan Pengawas
    const luasByPengawas = lahan.reduce((acc, l) => {
      const pengawas = manajerList.find((p) => p.id_user === l.id_pengawas);
      const nama = pengawas ? pengawas.nama : `Pengawas ID ${l.id_pengawas}`; // Asumsi Pengawas punya kolom 'nama'
      const luas = l.luas || 0;
      acc[nama] = (acc[nama] || 0) + luas;
      return acc;
    }, {});

    const labels = Object.keys(luasByPengawas);
    const dataLuas = Object.values(luasByPengawas);

    // Palet warna sederhana
    const backgroundColors = [
      "#3b82f6", // Biru
      "#10b981", // Hijau
      "#f59e0b", // Kuning
      "#ef4444", // Merah
      "#8b5cf6", // Ungu
      "#06b6d4", // Cyan
      "#f97316", // Oranye
      "#64748b", // Abu-abu
    ];

    return {
      labels: labels,
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
  // --- END CHART LOGIC ---

  return (
    <div className="min-h-screen xl:flex bg-gray-50 dark:bg-gray-950">
      <SidebarAdmin />
      <div className="flex-1 xl:ml-[256px]">
        <TopbarAdmin />

        <main className="p-6 space-y-8">
          <h2 className="text-2xl font-semibold text-gray-800 dark:text-white">
            🏞️ Kelola Data Lahan
          </h2>

          {/* LAYOUT GRID UNTUK FORM & CHART */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Kolom 1: 🧾 Form Tambah / Edit */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6 h-fit">
              <h3 className="text-xl font-medium mb-4 text-gray-800 dark:text-white">
                {isEditing ? "Edit Data Lahan" : "Tambah Lahan Baru"}
              </h3>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-gray-700 dark:text-gray-300">
                    Nama Lahan
                  </label>
                  <input
                    type="text"
                    name="nama_lahan"
                    value={form.nama_lahan}
                    onChange={handleChange}
                    className="w-full rounded-md border border-gray-300 px-3 py-2 mt-1 dark:bg-gray-700 dark:text-white"
                    required
                  />
                </div>

                <div>
                  <label className="block text-gray-700 dark:text-gray-300">
                    Luas (Ha)
                  </label>
                  <input
                    type="number"
                    step="0.01" // Gunakan step untuk angka desimal
                    name="luas"
                    value={form.luas}
                    onChange={handleChange}
                    className="w-full rounded-md border border-gray-300 px-3 py-2 mt-1 dark:bg-gray-700 dark:text-white"
                    required
                  />
                </div>

                <div>
                  <label className="block text-gray-700 dark:text-gray-300">
                    Lokasi
                  </label>
                  <input
                    type="text"
                    name="lokasi"
                    value={form.lokasi}
                    onChange={handleChange}
                    className="w-full rounded-md border border-gray-300 px-3 py-2 mt-1 dark:bg-gray-700 dark:text-white"
                    required
                  />
                </div>

                <div>
                  <label className="block text-gray-700 dark:text-gray-300">
                    Pengawas
                  </label>
                  <select
                    name="id_pengawas"
                    value={form.id_pengawas}
                    onChange={handleChange}
                    className="w-full rounded-md border border-gray-300 px-3 py-2 mt-1 dark:bg-gray-700 dark:text-white"
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

                <div className="flex space-x-2">
                  <button
                    type="submit"
                    disabled={loading}
                    className="flex-1 bg-green-600 text-white px-5 py-2 rounded-lg hover:bg-green-700 disabled:opacity-50"
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
                      className="bg-gray-400 text-white px-5 py-2 rounded-lg hover:bg-gray-500"
                    >
                      Batal
                    </button>
                  )}
                </div>
              </form>
            </div>

            {/* Kolom 2: 📊 Pie Chart */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6 flex flex-col items-center justify-center">
              <h3 className="text-xl font-medium mb-6 text-gray-800 dark:text-white">
                Distribusi Luas Lahan Berdasarkan Pengawas
              </h3>
              <div className="w-full max-w-sm">
                {lahan.length > 0 ? (
                  <Pie data={getChartData()} />
                ) : (
                  <p className="text-center text-gray-500 dark:text-gray-400">
                    Data lahan kosong, silakan tambah lahan.
                  </p>
                )}
              </div>
            </div>
          </div>
          {/* END LAYOUT GRID */}

          {/* 📋 Tabel Lahan */}
          <div className="overflow-x-auto bg-white dark:bg-gray-800 rounded-lg shadow-md border border-gray-200 dark:border-gray-700">
            <table className="min-w-full border-collapse">
              <thead className="bg-green-100 dark:bg-gray-800 text-gray-800 dark:text-gray-200">
                <tr>
                  <th className="px-4 py-2 border">ID</th>
                  <th className="px-4 py-2 border">Nama Lahan</th>
                  <th className="px-4 py-2 border">Luas (Ha)</th>
                  <th className="px-4 py-2 border">Lokasi</th>
                  <th className="px-4 py-2 border">Pengawas</th>
                  <th className="px-4 py-2 border text-center">Aksi</th>
                </tr>
              </thead>
              <tbody>
                {lahan.map((l) => {
                  const pengawas = manajerList.find(
                    (p) => p.id_user === l.id_pengawas
                  );
                  const namaPengawas = pengawas
                    ? pengawas.nama
                    : "Tidak Diketahui";

                  return (
                    <tr
                      key={l.id_lahan}
                      className="hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                    >
                      <td className="border px-4 py-2 text-center">
                        {l.id_lahan}
                      </td>
                      <td className="border px-4 py-2">{l.nama_lahan}</td>
                      <td className="border px-4 py-2">{l.luas}</td>
                      <td className="border px-4 py-2">{l.lokasi}</td>
                      <td className="border px-4 py-2">{namaPengawas}</td>
                      <td className="border px-4 py-2 text-center">
                        <button
                          onClick={() => handleEdit(l)}
                          className="bg-blue-500 text-white px-3 py-1 rounded mr-2 hover:bg-blue-600"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDelete(l.id_lahan)}
                          className="bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600"
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
                      className="text-center py-4 text-gray-500 dark:text-gray-400"
                    >
                      Tidak ada data lahan
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </main>
      </div>
    </div>
  );
}
