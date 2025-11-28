import React, { useEffect, useState, useMemo } from "react";
import SidebarAdmin from "../components/SidebarAdmin";
import TopbarAdmin from "../components/TopbarAdmin";
import api from "../services/api";

// Konstanta untuk batasan paginasi
const ITEMS_PER_PAGE = 5;

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
  const [error, setError] = useState({}); // State untuk error validasi form per field
  const [alertMessage, setAlertMessage] = useState(null); // State baru untuk pesan notifikasi umum

  // State untuk Pencarian dan Paginasi
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);

  const ENDPOINT = "/user/manajer";
  const USER_ENDPOINT = "/user";

  // --- Fungsi Validasi Form ---
  const validateForm = () => {
    let errors = {};
    let isValid = true;

    if (!form.nama.trim()) {
      errors.nama = "Nama Lengkap wajib diisi.";
      isValid = false;
    }
    if (!form.username.trim()) {
      errors.username = "Username wajib diisi.";
      isValid = false;
    } else if (form.username.trim().length < 3) {
      errors.username = "Username minimal 3 karakter.";
      isValid = false;
    }
    // Password wajib diisi hanya saat mode Tambah (isEditing=false)
    if (!isEditing && !form.password) {
      errors.password = "Password wajib diisi untuk akun baru.";
      isValid = false;
    } else if (form.password && form.password.length < 6) {
      errors.password = "Password minimal 6 karakter.";
      isValid = false;
    }

    setError(errors);
    return isValid;
  };
  // -----------------------------

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
      setAlertMessage(
        "Gagal memuat data manajer. Cek konsol untuk detail error."
      );
    }
  };

  useEffect(() => {
    fetchPengawas();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm({ ...form, [name]: value });
    // Hapus error saat input diubah
    setError({ ...error, [name]: "" });
    setAlertMessage(null); // Clear general alert on input change
  };

  const resetForm = () => {
    setForm({
      id_user: null,
      username: "",
      nama: "",
      password: "",
      role: "manajer",
    });
    setIsEditing(false);
    setError({});
    setAlertMessage(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      setAlertMessage(
        "Ada data yang belum diisi atau tidak valid. Silakan periksa kembali."
      );
      return;
    }

    setLoading(true);
    setAlertMessage(null); // Reset pesan alert sebelum submit
    setError({}); // Reset error field

    try {
      if (isEditing) {
        // Mode Edit
        const dataToSubmit = {
          username: form.username,
          nama: form.nama,
          // Tambahkan password hanya jika diisi (opsional saat edit)
          ...(form.password && { password: form.password }),
        };
        await api.put(`${USER_ENDPOINT}/${form.id_user}`, dataToSubmit);
        setAlertMessage("Manajer berhasil diperbarui!");
      } else {
        // Mode Tambah Baru
        const { username, password, role, nama } = form;
        await api.post(`${USER_ENDPOINT}/register`, {
          username,
          password,
          role,
          nama,
        });
        setAlertMessage("Manajer baru berhasil ditambahkan!");
      }
      fetchPengawas();
      resetForm();
    } catch (err) {
      console.error(
        "Gagal menyimpan data:",
        err.response ? err.response.data : err.message
      );

      const resData = err.response?.data;
      const apiErrorMsg = resData?.message || err.message;
      const statusCode = err.response?.status;

      // Logika khusus untuk error duplikat username (biasanya 409 Conflict atau 400 Bad Request)
      // Asumsi: API mengembalikan pesan yang jelas tentang duplikasi username
      if (statusCode === 400 || statusCode === 409) {
        // Coba mendeteksi pesan spesifik duplikasi username (tergantung respons backend Anda)
        if (apiErrorMsg.toLowerCase().includes("username")) {
          setError({ ...error, username: apiErrorMsg });
          setAlertMessage(
            `Gagal menambahkan manajer. username sudah digunakan.`
          );
        } else {
          setAlertMessage(
            `Gagal menyimpan data. Pesan: username sudah digunakan`
          );
        }
      } else {
        // Pesan error umum/lainnya (misalnya 500 Internal Server Error)
        setAlertMessage(
          `Gagal menyimpan data. Pesan: ${apiErrorMsg} atau username sudah digunakan`
        );
      }
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
      password: "", // Selalu kosongkan password saat mulai edit
    });
    setIsEditing(true);
    setError({}); // Reset error saat mulai mengedit
    setAlertMessage(null); // Reset alert
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Yakin ingin menghapus user manajer ini?")) return;
    try {
      await api.delete(`${USER_ENDPOINT}/${id}`);
      fetchPengawas();
      setAlertMessage("Manajer berhasil dihapus.");
    } catch (err) {
      console.error(
        "Gagal menghapus data:",
        err.response ? err.response.data : err.message
      );
      const apiErrorMsg = err.response?.data?.message || err.message;
      setAlertMessage(
        `Gagal menghapus data. Pesan: ${apiErrorMsg}. Pastikan tidak ada Lahan yang terhubung.`
      );
    }
  };

  const handleCancelEdit = () => {
    resetForm();
  };

  // --- Logika Pencarian dan Paginasi ---
  const filteredManajer = useMemo(() => {
    if (!searchTerm) {
      return manajer;
    }
    const lowerCaseSearchTerm = searchTerm.toLowerCase();
    return manajer.filter(
      (m) =>
        m.nama.toLowerCase().includes(lowerCaseSearchTerm) ||
        m.username.toLowerCase().includes(lowerCaseSearchTerm) ||
        String(m.id_user).includes(lowerCaseSearchTerm)
    );
  }, [manajer, searchTerm]);

  const totalPages = Math.ceil(filteredManajer.length / ITEMS_PER_PAGE);

  const paginatedManajer = useMemo(() => {
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    return filteredManajer.slice(startIndex, startIndex + ITEMS_PER_PAGE);
  }, [filteredManajer, currentPage]);

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
    setCurrentPage(1); // Reset ke halaman 1 saat melakukan pencarian baru
  };

  const goToPage = (page) => {
    if (page > 0 && page <= totalPages) {
      setCurrentPage(page);
    }
  };
  // ----------------------------------------

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

          <hr className="border-gray-200 dark:border-gray-800" />

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

                {/* --- Pesan Alert/Notifikasi --- */}
                {alertMessage && (
                  <div
                    className={`p-3 rounded-xl text-sm font-medium ${
                      alertMessage.includes("berhasil")
                        ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300"
                        : "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300"
                    }`}
                  >
                    {alertMessage}
                  </div>
                )}
                {/* ------------------------------- */}

                <form onSubmit={handleSubmit} className="space-y-4">
                  {/* Nama Lengkap */}
                  <div>
                    <label className="block text-sm font-medium text-gray-600 dark:text-gray-300 mb-1">
                      Nama Lengkap
                    </label>
                    <input
                      type="text"
                      name="nama"
                      value={form.nama}
                      onChange={handleChange}
                      className={`w-full rounded-xl border ${
                        error.nama
                          ? "border-red-400 focus:ring-red-100"
                          : "border-gray-200 focus:border-emerald-400 focus:ring-emerald-100"
                      } bg-gray-50 px-3 py-2.5 text-sm text-gray-900 placeholder:text-gray-400 dark:bg-gray-900 dark:border-gray-700 dark:text-gray-100 dark:placeholder-gray-500 transition-colors`}
                      required
                    />
                    {error.nama && (
                      <p className="text-xs text-red-500 mt-1">{error.nama}</p>
                    )}
                  </div>

                  {/* Username */}
                  <div>
                    <label className="block text-sm font-medium text-gray-600 dark:text-gray-300 mb-1">
                      Username
                    </label>
                    <input
                      type="text"
                      name="username"
                      value={form.username}
                      onChange={handleChange}
                      className={`w-full rounded-xl border ${
                        error.username // Menampilkan error spesifik dari backend (duplikat username)
                          ? "border-red-400 focus:ring-red-100"
                          : "border-gray-200 focus:border-emerald-400 focus:ring-emerald-100"
                      } bg-gray-50 px-3 py-2.5 text-sm text-gray-900 placeholder:text-gray-400 dark:bg-gray-900 dark:border-gray-700 dark:text-gray-100 dark:placeholder-gray-500 transition-colors`}
                      required
                    />
                    {error.username && (
                      <p className="text-xs text-red-500 mt-1">
                        {error.username}
                      </p>
                    )}
                  </div>

                  {/* Password */}
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
                      className={`w-full rounded-xl border ${
                        error.password
                          ? "border-red-400 focus:ring-red-100"
                          : "border-gray-200 focus:border-emerald-400 focus:ring-emerald-100"
                      } bg-gray-50 px-3 py-2.5 text-sm text-gray-900 placeholder:text-gray-400 dark:bg-gray-900 dark:border-gray-700 dark:text-gray-100 dark:placeholder-gray-500 transition-colors`}
                      required={!isEditing}
                      placeholder={
                        isEditing ? "Kosongkan jika tidak ingin diubah" : ""
                      }
                    />
                    {error.password && (
                      <p className="text-xs text-red-500 mt-1">
                        {error.password}
                      </p>
                    )}
                  </div>

                  <div className="flex gap-2 pt-2">
                    <button
                      type="submit"
                      disabled={loading}
                      className="flex-1 inline-flex items-center justify-center rounded-xl bg-emerald-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-emerald-700 disabled:opacity-60 transition-colors"
                    >
                      {loading ? (
                        <>
                          <svg
                            className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                            xmlns="http://www.w3.org/2000/svg"
                            fill="none"
                            viewBox="0 0 24 24"
                          >
                            <circle
                              className="opacity-25"
                              cx="12"
                              cy="12"
                              r="10"
                              stroke="currentColor"
                              strokeWidth="4"
                            ></circle>
                            <path
                              className="opacity-75"
                              fill="currentColor"
                              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                            ></path>
                          </svg>
                          Memproses...
                        </>
                      ) : isEditing ? (
                        "Simpan Perubahan"
                      ) : (
                        "Tambah Pengawas"
                      )}
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

            {/* TABLE CONTAINER */}
            <div className="lg:col-span-2 space-y-4">
              {/* Search Input */}
              <div className="flex justify-end">
                <input
                  type="text"
                  value={searchTerm}
                  onChange={handleSearchChange}
                  placeholder="Cari (Nama/Username/ID)..."
                  className="w-full max-w-xs rounded-xl border border-gray-200 bg-white px-4 py-2 text-sm text-gray-900 placeholder:text-gray-400 focus:border-emerald-400 focus:ring-2 focus:ring-emerald-100 dark:bg-gray-900 dark:border-gray-700 dark:text-gray-100 dark:placeholder-gray-500 transition-colors"
                />
              </div>

              <div className="overflow-auto bg-white/95 dark:bg-gray-950/80 rounded-2xl border border-gray-200/80 dark:border-gray-800/80 shadow-sm">
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
                    {paginatedManajer.map((p) => (
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
                    {paginatedManajer.length === 0 && (
                      <tr>
                        <td
                          colSpan="5"
                          className="px-4 py-4 text-center text-sm text-gray-500 dark:text-gray-400"
                        >
                          {searchTerm
                            ? "Tidak ada manajer yang cocok dengan pencarian."
                            : "Tidak ada data Manajer."}
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>

              {/* Pagination Controls */}
              {filteredManajer.length > ITEMS_PER_PAGE && (
                <div className="flex justify-between items-center px-4 py-3 sm:px-6 bg-white/95 dark:bg-gray-950/80 rounded-2xl border border-gray-200/80 dark:border-gray-800/80 shadow-sm">
                  <div className="text-sm text-gray-700 dark:text-gray-400">
                    Menampilkan {(currentPage - 1) * ITEMS_PER_PAGE + 1} sampai{" "}
                    {Math.min(
                      currentPage * ITEMS_PER_PAGE,
                      filteredManajer.length
                    )}{" "}
                    dari {filteredManajer.length} hasil{" "}
                    {searchTerm && `(Total: ${manajer.length} data)`}
                  </div>
                  <nav
                    className="isolate inline-flex -space-x-px rounded-md shadow-sm"
                    aria-label="Pagination"
                  >
                    <button
                      onClick={() => goToPage(currentPage - 1)}
                      disabled={currentPage === 1}
                      className="relative inline-flex items-center rounded-l-md border border-gray-300 bg-white px-2 py-2 text-sm font-medium text-gray-500 hover:bg-gray-50 focus:z-20 disabled:opacity-50 dark:bg-gray-800 dark:border-gray-700 dark:text-gray-400 dark:hover:bg-gray-700"
                    >
                      <span className="sr-only">Previous</span>
                      {/* Heroicon: chevron-left */}
                      <svg
                        className="h-5 w-5"
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 20 20"
                        fill="currentColor"
                        aria-hidden="true"
                      >
                        <path
                          fillRule="evenodd"
                          d="M12.79 5.23a.75.75 0 01-.02 1.06L9.46 10l3.31 3.71a.75.75 0 11-1.08 1.02l-3.75-4.25a.75.75 0 010-1.02l3.75-4.25a.75.75 0 011.08 0z"
                          clipRule="evenodd"
                        />
                      </svg>
                    </button>

                    {/* Tampilkan halaman aktif dan sekitar */}
                    {Array.from({ length: totalPages }, (_, i) => i + 1).map(
                      (page) =>
                        // Tampilkan hanya 2 halaman sebelum dan 2 halaman sesudah, atau halaman pertama/terakhir
                        (page === 1 ||
                          page === totalPages ||
                          (page >= currentPage - 1 &&
                            page <= currentPage + 1)) && (
                          <button
                            key={page}
                            onClick={() => goToPage(page)}
                            aria-current={
                              page === currentPage ? "page" : undefined
                            }
                            className={`relative z-10 inline-flex items-center px-4 py-2 text-sm font-semibold focus:z-20 
                                              ${
                                                page === currentPage
                                                  ? "bg-emerald-600 text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-600"
                                                  : "bg-white border border-gray-300 text-gray-900 hover:bg-gray-50 dark:bg-gray-800 dark:border-gray-700 dark:text-gray-100 dark:hover:bg-gray-700"
                                              }`}
                          >
                            {page}
                          </button>
                        )
                    )}

                    <button
                      onClick={() => goToPage(currentPage + 1)}
                      disabled={currentPage === totalPages || totalPages === 0}
                      className="relative inline-flex items-center rounded-r-md border border-gray-300 bg-white px-2 py-2 text-sm font-medium text-gray-500 hover:bg-gray-50 focus:z-20 disabled:opacity-50 dark:bg-gray-800 dark:border-gray-700 dark:text-gray-400 dark:hover:bg-gray-700"
                    >
                      <span className="sr-only">Next</span>
                      {/* Heroicon: chevron-right */}
                      <svg
                        className="h-5 w-5"
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 20 20"
                        fill="currentColor"
                        aria-hidden="true"
                      >
                        <path
                          fillRule="evenodd"
                          d="M7.21 14.77a.75.75 0 01.02-1.06L10.54 10 7.23 6.29a.75.75 0 111.08-1.02l3.75 4.25a.75.75 0 010 1.02l-3.75 4.25a.75.75 0 01-1.08 0z"
                          clipRule="evenodd"
                        />
                      </svg>
                    </button>
                  </nav>
                </div>
              )}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
