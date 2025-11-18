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
    password: "",
    role: "manajer",
  });
  const [loading, setLoading] = useState(false);
  const [isEditing, setIsEditing] = useState(false);

  const ENDPOINT = "/user/manajer";
  const USER_ENDPOINT = "/user";

  const formatRole = (role) => {
    if (!role) return "-";
    const map = {
      admin: "Admin",
      manajer: "Manajer",
      pembeli: "Pembeli",
    };
    const key = String(role).toLowerCase();
    return map[key] || role.charAt(0).toUpperCase() + role.slice(1);
  };

  const fetchPengawas = async () => {
    try {
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
        const dataToSubmit = {
          username: form.username,
          nama: form.nama,
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
    setForm({
      id_user: data.id_user,
      username: data.username,
      nama: data.nama,
      role: data.role,
      password: "",
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
    <div className="min-h-screen xl:flex bg-gray-50 dark:bg-gray-950 text-gray-900 dark:text-gray-100 transition-colors">
      <SidebarAdmin />
      <div className="flex-1 xl:ml-[260px]">
        <TopbarAdmin />

        <main className="max-w-7xl mx-auto px-4 py-6 md:px-6 lg:px-8 lg:py-8 space-y-8">
          {/* HEADER */}
          <div>
            <h2 className="text-2xl font-semibold text-gray-900 dark:text-gray-50 flex items-center gap-2">
              <span>🧑‍💼</span> Kelola User Manajer
            </h2>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
              Tambahkan atau kelola akun manajer yang bertugas mengawasi lahan.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* FORM CARD */}
            <div className="lg:col-span-1 relative overflow-hidden rounded-2xl border border-gray-200/80 bg-white/95 dark:bg-gray-950/80 dark:border-gray-800/80 shadow-[0_18px_45px_rgba(15,23,42,0.6)]">
              <div className="absolute inset-x-0 top-0 h-0.5 bg-gradient-to-r from-emerald-400/80 via-lime-300/80 to-sky-400/80" />
              <div className="pointer-events-none absolute inset-0 opacity-40">
                <div className="absolute -top-16 right-0 h-32 w-32 rounded-full bg-emerald-500/15 blur-3xl" />
                <div className="absolute -bottom-16 left-0 h-32 w-32 rounded-full bg-lime-400/10 blur-3xl" />
              </div>

              <div className="relative p-6 space-y-5">
                <div>
                  <h3 className="text-base md:text-lg font-semibold text-gray-900 dark:text-gray-50">
                    {isEditing
                      ? `Edit Manajer ID ${form.id_user}`
                      : "Tambah Manajer Baru"}
                  </h3>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                    Nama, username, dan password digunakan untuk login manajer.
                  </p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-600 dark:text-gray-300 mb-1">
                      Nama Lengkap
                    </label>
                    <input
                      type="text"
                      name="nama"
                      value={form.nama}
                      onChange={handleChange}
                      className="w-full rounded-xl border border-gray-200 bg-gray-50 px-3 py-2.5 text-sm text-gray-900 placeholder:text-gray-400 focus:border-emerald-400 focus:ring-2 focus:ring-emerald-100 dark:bg-gray-900 dark:border-gray-700 dark:text-gray-100 dark:placeholder-gray-500"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-600 dark:text-gray-300 mb-1">
                      Username
                    </label>
                    <input
                      type="text"
                      name="username"
                      value={form.username}
                      onChange={handleChange}
                      className="w-full rounded-xl border border-gray-200 bg-gray-50 px-3 py-2.5 text-sm text-gray-900 placeholder:text-gray-400 focus:border-emerald-400 focus:ring-2 focus:ring-emerald-100 dark:bg-gray-900 dark:border-gray-700 dark:text-gray-100 dark:placeholder-gray-500"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-600 dark:text-gray-300 mb-1">
                      {isEditing
                        ? "Ganti Password (opsional)"
                        : "Password Akun"}
                    </label>
                    <input
                      type="password"
                      name="password"
                      value={form.password}
                      onChange={handleChange}
                      className="w-full rounded-xl border border-gray-200 bg-gray-50 px-3 py-2.5 text-sm text-gray-900 placeholder:text-gray-400 focus:border-emerald-400 focus:ring-2 focus:ring-emerald-100 dark:bg-gray-900 dark:border-gray-700 dark:text-gray-100 dark:placeholder-gray-500"
                      required={!isEditing}
                    />
                  </div>

                  <div className="flex gap-2 pt-2">
                    <button
                      type="submit"
                      disabled={loading}
                      className="flex-1 inline-flex items-center justify-center rounded-xl bg-emerald-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-emerald-700 disabled:opacity-60 transition-colors"
                    >
                      {isEditing ? "Simpan Perubahan" : "Tambah Pengawas"}
                    </button>
                    {isEditing && (
                      <button
                        type="button"
                        onClick={handleCancelEdit}
                        className="rounded-xl border border-gray-300 bg-white px-4 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50 dark:bg-gray-900 dark:border-gray-700 dark:text-gray-200 dark:hover:bg-gray-800"
                      >
                        Batal
                      </button>
                    )}
                  </div>
                </form>
              </div>
            </div>

            {/* TABLE CARD */}
            <div className="lg:col-span-2 overflow-auto bg-white/95 dark:bg-gray-950/80 rounded-2xl border border-gray-200/80 dark:border-gray-800/80 shadow-sm">
              <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-800 text-sm">
                <thead className="bg-gray-50/90 dark:bg-gray-900/80 sticky top-0 z-10">
                  <tr className="text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">
                    <th className="px-4 py-3 text-left">ID User</th>
                    <th className="px-4 py-3 text-left">Nama</th>
                    <th className="px-4 py-3 text-left">Username</th>
                    <th className="px-4 py-3 text-left">Role</th>
                    <th className="px-4 py-3 text-center">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 dark:divide-gray-800">
                  {manajer.map((p) => (
                    <tr
                      key={p.id_user}
                      className="hover:bg-gray-50 dark:hover:bg-gray-900/70 transition-colors"
                    >
                      <td className="px-4 py-3 text-sm text-center">
                        {p.id_user}
                      </td>
                      <td className="px-4 py-3 text-sm">{p.nama}</td>
                      <td className="px-4 py-3 text-sm">{p.username}</td>
                      <td className="px-4 py-3 text-sm">
                        {formatRole(p.role)}
                      </td>
                      <td className="px-4 py-3 text-center space-x-2">
                        <button
                          onClick={() => handleEdit(p)}
                          className="text-xs px-3 py-1.5 rounded-full border bg-blue-50 text-blue-700 border-blue-200 hover:bg-blue-100 dark:bg-blue-500/15 dark:text-blue-300 dark:border-blue-400/40 dark:hover:bg-blue-500/25 transition-colors"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDelete(p.id_user)}
                          className="text-xs px-3 py-1.5 rounded-full border bg-red-50 text-red-700 border-red-200 hover:bg-red-100 dark:bg-red-500/15 dark:text-red-300 dark:border-red-400/40 dark:hover:bg-red-500/25 transition-colors"
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
                        className="px-4 py-4 text-center text-sm text-gray-500 dark:text-gray-400"
                      >
                        Tidak ada data Manajer.
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

