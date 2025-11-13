import React, { useEffect, useState } from "react";
import SidebarAdmin from "../components/SidebarAdmin";
import TopbarAdmin from "../components/TopbarAdmin";
import api from "../services/api";

export default function ManagerPage() {
  const [manajer, setManajer] = useState([]);
  const [form, setForm] = useState({
    id_user: null,
    username: "",
    nama: "",
    password: "", // Hanya diisi saat CREATE atau ganti password
    role: "manajer", // Default role
  });
  const [loading, setLoading] = useState(false);
  const [isEditing, setIsEditing] = useState(false);

  // Endpoint yang diubah
  const ENDPOINT = "/user/manajer";
  const USER_ENDPOINT = "/user"; // Endpoint umum untuk PUT/DELETE

  const fetchPengawas = async () => {
    try {
      // Mengambil hanya user dengan role 'pengawas'
      const res = await api.get(ENDPOINT);
      setManajer(res.data);
    } catch (err) {
      console.error("Gagal memuat data manajer:", err);
    }
  };

  useEffect(() => {
    fetchPengawas();
  }, []);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (isEditing) {
        // Update user (PUT)
        const dataToSubmit = {
          username: form.username,
          nama: form.nama,
          // Hanya kirim password jika diisi (ganti password)
          ...(form.password && { password: form.password }),
        };
        await api.put(`${USER_ENDPOINT}/${form.id_user}`, dataToSubmit);
      } else {
        const { username, password, role, nama } = form;
        await api.post(`${USER_ENDPOINT}/register`, {
          username,
          password,
          role,
          nama,
        });
      }
      fetchPengawas();
      // Reset form
      setForm({
        id_user: null,
        username: "",
        nama: "",
        password: "",
        role: "manajer",
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
    // Saat edit, jangan bawa password lama
    setForm({
      id_user: data.id_user,
      username: data.username,
      nama: data.nama,
      role: data.role,
      password: "", // Kosongkan, hanya diisi jika ingin ganti password
    });
    setIsEditing(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Yakin ingin menghapus user manajer ini?")) return;
    try {
      await api.delete(`${USER_ENDPOINT}/${id}`);
      fetchPengawas();
    } catch (err) {
      console.error("Gagal menghapus data:", err);
      alert("Gagal menghapus data. Pastikan tidak ada Lahan yang terhubung.");
    }
  };

  const handleCancelEdit = () => {
    setForm({
      id_user: null,
      username: "",
      nama: "",
      password: "",
      role: "manajer",
    });
    setIsEditing(false);
  };

  return (
    <div className="min-h-screen xl:flex bg-gray-50 dark:bg-gray-950">
      <SidebarAdmin />
      <div className="flex-1 xl:ml-[256px]">
        <TopbarAdmin />

        <main className="p-6 space-y-8">
          <h2 className="text-2xl font-semibold text-gray-800 dark:text-white">
            🧑‍💼 Kelola User Manajer
          </h2>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Kolom Form */}
            <div className="lg:col-span-1 bg-white dark:bg-gray-800 rounded-xl shadow-md p-6 h-fit">
              <h3 className="text-xl font-medium mb-4 text-gray-800 dark:text-white">
                {isEditing
                  ? `Edit Manajer ID ${form.id_user}`
                  : "Tambah Manajer Baru"}
              </h3>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-gray-700 dark:text-gray-300">
                    Nama Lengkap
                  </label>
                  <input
                    type="text"
                    name="nama"
                    value={form.nama}
                    onChange={handleChange}
                    className="w-full rounded-md border border-gray-300 px-3 py-2 mt-1 dark:bg-gray-700 dark:text-white"
                    required
                  />
                </div>
                <div>
                  <label className="block text-gray-700 dark:text-gray-300">
                    Username
                  </label>
                  <input
                    type="text"
                    name="username"
                    value={form.username}
                    onChange={handleChange}
                    className="w-full rounded-md border border-gray-300 px-3 py-2 mt-1 dark:bg-gray-700 dark:text-white"
                    required
                  />
                </div>
                <div>
                  <label className="block text-gray-700 dark:text-gray-300">
                    {isEditing
                      ? "Ganti Password (Kosongkan jika tidak)"
                      : "Password"}
                  </label>
                  <input
                    type="password"
                    name="password"
                    value={form.password}
                    onChange={handleChange}
                    className="w-full rounded-md border border-gray-300 px-3 py-2 mt-1 dark:bg-gray-700 dark:text-white"
                    required={!isEditing}
                  />
                </div>

                <div className="flex space-x-2">
                  <button
                    type="submit"
                    disabled={loading}
                    className="flex-1 bg-green-600 text-white px-5 py-2 rounded-lg hover:bg-green-700 disabled:opacity-50"
                  >
                    {isEditing ? "Simpan Perubahan" : "Tambah Pengawas"}
                  </button>
                  {isEditing && (
                    <button
                      type="button"
                      onClick={handleCancelEdit}
                      className="bg-gray-400 text-white px-5 py-2 rounded-lg hover:bg-gray-500"
                    >
                      Batal
                    </button>
                  )}
                </div>
              </form>
            </div>

            {/* Kolom Tabel */}
            <div className="lg:col-span-2 overflow-x-auto bg-white dark:bg-gray-800 rounded-lg shadow-md border border-gray-200 dark:border-gray-700">
              <table className="min-w-full border-collapse">
                <thead className="bg-green-100 dark:bg-gray-800 text-gray-800 dark:text-gray-200">
                  <tr>
                    <th className="px-4 py-2 border">ID User</th>
                    <th className="px-4 py-2 border">Nama</th>
                    <th className="px-4 py-2 border">Username</th>
                    <th className="px-4 py-2 border">Role</th>
                    <th className="px-4 py-2 border text-center">Aksi</th>
                  </tr>
                </thead>
                <tbody>
                  {manajer.map((p) => (
                    <tr
                      key={p.id_user}
                      className="hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                    >
                      <td className="border px-4 py-2 text-center">
                        {p.id_user}
                      </td>
                      <td className="border px-4 py-2">{p.nama}</td>
                      <td className="border px-4 py-2">{p.username}</td>
                      <td className="border px-4 py-2">{p.role}</td>
                      <td className="border px-4 py-2 text-center">
                        <button
                          onClick={() => handleEdit(p)}
                          className="bg-blue-500 text-white px-3 py-1 rounded mr-2 hover:bg-blue-600"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDelete(p.id_user)}
                          className="bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600"
                        >
                          Hapus
                        </button>
                      </td>
                    </tr>
                  ))}
                  {manajer.length === 0 && (
                    <tr>
                      <td
                        colSpan="5"
                        className="text-center py-4 text-gray-500 dark:text-gray-400"
                      >
                        Tidak ada data Manajer
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
