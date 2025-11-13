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

export default function TanamanPage() {
  const [tanaman, setTanaman] = useState([]);
  const [form, setForm] = useState({
    id_tanaman: null,
    nama_tanaman: "",
    jenis: "",
    waktu_tanam: "",
  });
  const [loading, setLoading] = useState(false);
  const [isEditing, setIsEditing] = useState(false);

  // Load data tanaman dari backend
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

  // Handle input form
  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  // Submit tambah/update tanaman
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (isEditing) {
        // Hapus id_tanaman dari data saat PUT, kecuali API Anda membutuhkannya di body
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
      });
      setIsEditing(false);
    } catch (err) {
      console.error("Gagal menyimpan data:", err);
      // Tambahkan alert/message jika ada error dari backend
      alert("Gagal menyimpan data. Cek konsol untuk detail error.");
    } finally {
      setLoading(false);
    }
  };

  // Edit data
  const handleEdit = (data) => {
    // Memastikan waktu_tanam diformat ke yyyy-MM-dd agar input type="date" berfungsi
    const formattedDate = data.waktu_tanam
      ? new Date(data.waktu_tanam).toISOString().split("T")[0]
      : "";

    setForm({ ...data, waktu_tanam: formattedDate });
    setIsEditing(true);
  };

  // Hapus data
  const handleDelete = async (id) => {
    if (!window.confirm("Yakin ingin menghapus tanaman ini?")) return;
    try {
      await api.delete(`/tanaman/${id}`);
      fetchTanaman();
    } catch (err) {
      console.error("Gagal menghapus data:", err);
    }
  };

  // --- START CHART LOGIC ---
  const getChartData = () => {
    const jenisCount = tanaman.reduce((acc, t) => {
      const jenis = t.jenis || "Tidak Diketahui";
      acc[jenis] = (acc[jenis] || 0) + 1;
      return acc;
    }, {});

    const labels = Object.keys(jenisCount);
    const dataCounts = Object.values(jenisCount);

    // Palet warna sederhana
    const backgroundColors = [
      "#4CAF50", // Hijau
      "#FF9800", // Oranye
      "#2196F3", // Biru
      "#F44336", // Merah
      "#9C27B0", // Ungu
      "#00BCD4", // Cyan
      "#FFEB3B", // Kuning
      "#795548", // Coklat
    ];

    return {
      labels: labels,
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
  // --- END CHART LOGIC ---

  return (
    <div className="min-h-screen xl:flex bg-gray-50 dark:bg-gray-950">
      <SidebarAdmin />
      <div className="flex-1 xl:ml-[256px]">
        <TopbarAdmin />

        <main className="p-6 space-y-8">
          <h2 className="text-2xl font-semibold text-gray-800 dark:text-white">
            🌱 Kelola Data Tanaman
          </h2>

          {/* LAYOUT GRID UNTUK FORM & CHART */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Kolom 1: 🧾 Form Tambah / Edit */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6 h-fit">
              <h3 className="text-xl font-medium mb-4 text-gray-800 dark:text-white">
                {isEditing ? "Edit Data Tanaman" : "Tambah Tanaman Baru"}
              </h3>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-gray-700 dark:text-gray-300">
                    Nama Tanaman
                  </label>
                  <input
                    type="text"
                    name="nama_tanaman"
                    value={form.nama_tanaman}
                    onChange={handleChange}
                    className="w-full rounded-md border border-gray-300 px-3 py-2 mt-1 dark:bg-gray-700 dark:text-white"
                    required
                  />
                </div>

                <div>
                  <label className="block text-gray-700 dark:text-gray-300">
                    Jenis
                  </label>
                  <input
                    type="text"
                    name="jenis"
                    value={form.jenis}
                    onChange={handleChange}
                    className="w-full rounded-md border border-gray-300 px-3 py-2 mt-1 dark:bg-gray-700 dark:text-white"
                    required
                  />
                </div>

                <div>
                  <label className="block text-gray-700 dark:text-gray-300">
                    Waktu Tanam
                  </label>
                  <input
                    type="date"
                    name="waktu_tanam"
                    value={form.waktu_tanam}
                    onChange={handleChange}
                    className="w-full rounded-md border border-gray-300 px-3 py-2 mt-1 dark:bg-gray-700 dark:text-white"
                  />
                </div>

                <div className="flex space-x-2">
                  <button
                    type="submit"
                    disabled={loading}
                    className="flex-1 bg-green-600 text-white px-5 py-2 rounded-lg hover:bg-green-700 disabled:opacity-50"
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
                Distribusi Jenis Tanaman
              </h3>
              <div className="w-full max-w-sm">
                {tanaman.length > 0 ? (
                  <Pie data={getChartData()} />
                ) : (
                  <p className="text-center text-gray-500 dark:text-gray-400">
                    Data kosong, silakan tambah tanaman.
                  </p>
                )}
              </div>
            </div>
          </div>
          {/* END LAYOUT GRID */}

          {/* 📋 Tabel Tanaman */}
          <div className="overflow-x-auto bg-white dark:bg-gray-800 rounded-lg shadow-md border border-gray-200 dark:border-gray-700">
            <table className="min-w-full border-collapse">
              <thead className="bg-green-100 dark:bg-gray-800 text-gray-800 dark:text-gray-200">
                <tr>
                  <th className="px-4 py-2 border">ID</th>
                  <th className="px-4 py-2 border">Nama Tanaman</th>
                  <th className="px-4 py-2 border">Jenis</th>
                  <th className="px-4 py-2 border">Waktu Tanam</th>
                  <th className="px-4 py-2 border text-center">Aksi</th>
                </tr>
              </thead>
              <tbody>
                {tanaman.map((t) => (
                  <tr
                    key={t.id_tanaman}
                    className="hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                  >
                    <td className="border px-4 py-2 text-center">
                      {t.id_tanaman}
                    </td>
                    <td className="border px-4 py-2">{t.nama_tanaman}</td>
                    <td className="border px-4 py-2">{t.jenis}</td>
                    {/* Format tanggal untuk tampilan, jika perlu */}
                    <td className="border px-4 py-2">
                      {t.waktu_tanam
                        ? new Date(t.waktu_tanam).toLocaleDateString("id-ID")
                        : "-"}
                    </td>
                    <td className="border px-4 py-2 text-center">
                      <button
                        onClick={() => handleEdit(t)}
                        className="bg-blue-500 text-white px-3 py-1 rounded mr-2 hover:bg-blue-600"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDelete(t.id_tanaman)}
                        className="bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600"
                      >
                        Hapus
                      </button>
                    </td>
                  </tr>
                ))}
                {tanaman.length === 0 && (
                  <tr>
                    <td
                      colSpan="5"
                      className="text-center py-4 text-gray-500 dark:text-gray-400"
                    >
                      Tidak ada data tanaman
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
