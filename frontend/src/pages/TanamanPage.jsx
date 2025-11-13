import React, { useEffect, useState } from "react";
import SidebarAdmin from "../components/SidebarAdmin";
import TopbarAdmin from "../components/TopbarAdmin";
import api from "../services/api";

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

  //  Load data tanaman dari backend
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

  //  Handle input form
  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  //  Submit tambah/update tanaman
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (isEditing) {
        await api.put(`/tanaman/${form.id_tanaman}`, form);
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
    } finally {
      setLoading(false);
    }
  };

  //  Edit data
  const handleEdit = (data) => {
    setForm(data);
    setIsEditing(true);
  };

  //  Hapus data
  const handleDelete = async (id) => {
    if (!window.confirm("Yakin ingin menghapus tanaman ini?")) return;
    try {
      await api.delete(`/tanaman/${id}`);
      fetchTanaman();
    } catch (err) {
      console.error("Gagal menghapus data:", err);
    }
  };

  return (
    <div className="min-h-screen xl:flex bg-gray-50 dark:bg-gray-950">
      {/* Sidebar */}
      <SidebarAdmin />

      {/* Konten utama */}
      <div className="flex-1 xl:ml-[256px]">
        <TopbarAdmin />

        <main className="p-6 space-y-8">
          <h2 className="text-2xl font-semibold text-gray-800 dark:text-white">
            🌱 Kelola Data Tanaman
          </h2>

          {/* 🧾 Form Tambah / Edit */}
          <form
            onSubmit={handleSubmit}
            className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6 space-y-4 max-w-lg"
          >
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

            <button
              type="submit"
              disabled={loading}
              className="bg-green-600 text-white px-5 py-2 rounded-lg hover:bg-green-700 disabled:opacity-50"
            >
              {isEditing ? "Simpan Perubahan" : "Tambah Tanaman"}
            </button>
          </form>

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
                    <td className="border px-4 py-2">{t.waktu_tanam}</td>
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
