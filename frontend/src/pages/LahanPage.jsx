import React, { useEffect, useState, useMemo } from "react";
import SidebarAdmin from "../components/SidebarAdmin";
import TopbarAdmin from "../components/TopbarAdmin";
import api from "../services/api";

import { Pie } from "react-chartjs-2";
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from "chart.js";

ChartJS.register(ArcElement, Tooltip, Legend);

// Konstanta untuk batasan paginasi
const ITEMS_PER_PAGE = 5;

export default function LahanPage() {
  const [lahan, setLahan] = useState([]);
  const [manajerList, setManajerList] = useState([]);
  const [form, setForm] = useState({
    id_lahan: null,
    nama_lahan: "",
    luas: "", // Gunakan string untuk kemudahan input form
    lokasi: "",
    id_pengawas: "", // Gunakan string untuk kemudahan input select form
  });
  const [loading, setLoading] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [error, setError] = useState({}); // State untuk error validasi form

  // State untuk Pencarian dan Paginasi
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);

  const fetchLahan = async () => {
    try {
      const res = await api.get("/lahan");
      setLahan(res.data);
    } catch (err) {
      console.error("Gagal memuat data lahan:", err);
      alert("Gagal memuat data lahan. Cek konsol untuk detail error.");
    }
  };

  const fetchPengawas = async () => {
    try {
      // Pastikan API endpoint untuk mengambil manajer/pengawas sudah benar
      const res = await api.get("/user/manajer");
      setManajerList(res.data);
    } catch (err) {
      console.error("Gagal memuat data pengawas:", err);
      alert("Gagal memuat data pengawas. Cek konsol untuk detail error.");
    }
  };

  useEffect(() => {
    fetchLahan();
    fetchPengawas();
  }, []);

  // --- Fungsi Validasi Form ---
  const validateForm = () => {
    let errors = {};
    let isValid = true;

    if (!form.nama_lahan.trim()) {
      errors.nama_lahan = "Nama Lahan wajib diisi.";
      isValid = false;
    }
    if (form.luas === "" || form.luas === null) {
      errors.luas = "Luas (Ha) wajib diisi.";
      isValid = false;
    } else if (Number(form.luas) <= 0) {
      errors.luas = "Luas harus lebih dari 0.";
      isValid = false;
    } else if (isNaN(Number(form.luas))) {
      errors.luas = "Luas harus berupa angka yang valid.";
      isValid = false;
    }
    if (!form.lokasi.trim()) {
      errors.lokasi = "Lokasi wajib diisi.";
      isValid = false;
    }
    if (!form.id_pengawas) {
      errors.id_pengawas = "Pengawas wajib dipilih.";
      isValid = false;
    }

    setError(errors);
    return isValid;
  };
  // -----------------------------

  const handleChange = (e) => {
    const { name, value, type } = e.target;
    // Mengubah nilai menjadi float hanya jika type adalah number dan value bukan string kosong,
    // namun kita simpan sebagai string di state agar input terkontrol dengan baik.
    const newValue = value;
    setForm({ ...form, [name]: newValue });
    // Hapus error saat input diubah
    setError({ ...error, [name]: "" });
  };

  const resetForm = () => {
    setForm({
      id_lahan: null,
      nama_lahan: "",
      luas: "",
      lokasi: "",
      id_pengawas: "",
    });
    setIsEditing(false);
    setError({}); // Reset error juga
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      alert(
        "Ada data yang belum diisi atau tidak valid. Silakan periksa kembali."
      );
      return;
    }

    setLoading(true);
    try {
      const dataToSubmit = {
        ...form,
        // Konversi luas ke number/float sebelum dikirim ke API
        luas: parseFloat(form.luas),
        // Konversi id_pengawas ke number/integer karena biasanya foreign key
        id_pengawas: Number(form.id_pengawas),
      };

      if (isEditing) {
        delete dataToSubmit.id_lahan;
        await api.put(`/lahan/${form.id_lahan}`, dataToSubmit);
      } else {
        delete dataToSubmit.id_lahan; // Pastikan id_lahan tidak dikirim saat POST
        await api.post("/lahan", dataToSubmit);
      }
      fetchLahan();
      resetForm();
    } catch (err) {
      console.error(
        "Gagal menyimpan data:",
        err.response ? err.response.data : err.message
      );
      alert(
        `Gagal menyimpan data. Cek konsol untuk detail error. Pesan: ${
          err.response?.data?.message || err.message
        }`
      );
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (data) => {
    setForm({
      ...data,
      // Pastikan luas dan id_pengawas diubah ke string agar cocok dengan input form
      luas: String(data.luas),
      id_pengawas: String(data.id_pengawas),
    });
    setIsEditing(true);
    setError({}); // Reset error saat mulai mengedit
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Yakin ingin menghapus lahan ini?")) return;
    try {
      await api.delete(`/lahan/${id}`);
      fetchLahan();
    } catch (err) {
      console.error(
        "Gagal menghapus data:",
        err.response ? err.response.data : err.message
      );
      alert(
        `Gagal menghapus data. Cek konsol untuk detail error. Pesan: ${
          err.response?.data?.message || err.message
        }`
      );
    }
  };

  // --- Logika Pencarian dan Paginasi ---
  const getPengawasName = (id_pengawas) => {
    const pengawas = manajerList.find((p) => p.id_user === id_pengawas);
    return pengawas ? pengawas.nama : "Tidak Diketahui";
  };

  const filteredLahan = useMemo(() => {
    if (!searchTerm) {
      return lahan;
    }
    const lowerCaseSearchTerm = searchTerm.toLowerCase();
    return lahan.filter(
      (l) =>
        l.nama_lahan.toLowerCase().includes(lowerCaseSearchTerm) ||
        l.lokasi.toLowerCase().includes(lowerCaseSearchTerm) ||
        String(l.id_lahan).includes(lowerCaseSearchTerm) ||
        getPengawasName(l.id_pengawas)
          .toLowerCase()
          .includes(lowerCaseSearchTerm)
    );
  }, [lahan, searchTerm, manajerList]); // Dependensi manajerList ditambahkan untuk pencarian nama pengawas

  const totalPages = Math.ceil(filteredLahan.length / ITEMS_PER_PAGE);

  const paginatedLahan = useMemo(() => {
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    return filteredLahan.slice(startIndex, startIndex + ITEMS_PER_PAGE);
  }, [filteredLahan, currentPage]);

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

  const getChartData = () => {
    const luasByPengawas = lahan.reduce((acc, l) => {
      const nama = getPengawasName(l.id_pengawas);
      const luas = l.luas || 0;
      acc[nama] = (acc[nama] || 0) + luas;
      return acc;
    }, {});

    const labels = Object.keys(luasByPengawas);
    const dataLuas = Object.values(luasByPengawas);

    const backgroundColors = [
      "#0ea5e9",
      "#22c55e",
      "#f59e0b",
      "#ef4444",
      "#a855f7",
      "#06b6d4",
      "#f97316",
      "#64748b",
    ];

    return {
      labels,
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

  return (
    <div className="min-h-screen xl:flex bg-gray-50 dark:bg-gray-950 text-gray-900 dark:text-gray-100 transition-colors">
      <SidebarAdmin />
      <div className="flex-1 xl:ml-[260px]">
        <TopbarAdmin />

        <main className="max-w-7xl mx-auto px-4 py-6 md:px-6 lg:px-8 lg:py-8 space-y-8">
          {/* HEADER */}
          <div>
            <h2 className="text-2xl font-semibold text-gray-900 dark:text-gray-50 flex items-center gap-2">
              <span>🏞️</span> Kelola Data Lahan
            </h2>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
              Atur informasi lahan dan pengawas yang bertanggung jawab.
            </p>
          </div>

          <hr className="border-gray-200 dark:border-gray-800" />

          {/* FORM + CHART */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* FORM CARD */}
            <div className="relative overflow-hidden rounded-2xl border border-gray-200/80 bg-white/95 dark:bg-gray-950/80 dark:border-gray-800/80 shadow-[0_18px_45px_rgba(15,23,42,0.6)]">
              <div className="absolute inset-x-0 top-0 h-0.5 bg-gradient-to-r from-emerald-400/80 via-lime-300/80 to-sky-400/80" />
              <div className="pointer-events-none absolute inset-0 opacity-40">
                <div className="absolute -top-16 right-0 h-32 w-32 rounded-full bg-emerald-500/15 blur-3xl" />
                <div className="absolute -bottom-16 left-0 h-32 w-32 rounded-full bg-lime-400/10 blur-3xl" />
              </div>

              <div className="relative p-6 space-y-5">
                <div>
                  <h3 className="text-base md:text-lg font-semibold text-gray-900 dark:text-gray-50">
                    {isEditing ? "Edit Data Lahan" : "Tambah Lahan Baru"}
                  </h3>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                    Lengkapi detail lahan dan pilih pengawas yang bertanggung
                    jawab.
                  </p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                  {/* Nama Lahan */}
                  <div>
                    <label className="block text-sm font-medium text-gray-600 dark:text-gray-300 mb-1">
                      Nama Lahan
                    </label>
                    <input
                      type="text"
                      name="nama_lahan"
                      value={form.nama_lahan}
                      onChange={handleChange}
                      className={`w-full rounded-xl border ${
                        error.nama_lahan
                          ? "border-red-400 focus:ring-red-100"
                          : "border-gray-200 focus:border-emerald-400 focus:ring-emerald-100"
                      } bg-gray-50 px-3 py-2.5 text-sm text-gray-900 placeholder:text-gray-400 dark:bg-gray-900 dark:border-gray-700 dark:text-gray-100 dark:placeholder-gray-500 transition-colors`}
                      required
                      placeholder="Contoh: Lahan A1, Lahan Utara..."
                    />
                    {error.nama_lahan && (
                      <p className="text-xs text-red-500 mt-1">
                        {error.nama_lahan}
                      </p>
                    )}
                  </div>

                  {/* Luas */}
                  <div>
                    <label className="block text-sm font-medium text-gray-600 dark:text-gray-300 mb-1">
                      Luas (Ha)
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      name="luas"
                      value={form.luas}
                      onChange={handleChange}
                      className={`w-full rounded-xl border ${
                        error.luas
                          ? "border-red-400 focus:ring-red-100"
                          : "border-gray-200 focus:border-emerald-400 focus:ring-emerald-100"
                      } bg-gray-50 px-3 py-2.5 text-sm text-gray-900 dark:bg-gray-900 dark:border-gray-700 dark:text-gray-100 transition-colors`}
                      required
                      min="0"
                      placeholder="Contoh: 5.50"
                    />
                    {error.luas && (
                      <p className="text-xs text-red-500 mt-1">{error.luas}</p>
                    )}
                  </div>

                  {/* Lokasi */}
                  <div>
                    <label className="block text-sm font-medium text-gray-600 dark:text-gray-300 mb-1">
                      Lokasi
                    </label>
                    <input
                      type="text"
                      name="lokasi"
                      value={form.lokasi}
                      onChange={handleChange}
                      className={`w-full rounded-xl border ${
                        error.lokasi
                          ? "border-red-400 focus:ring-red-100"
                          : "border-gray-200 focus:border-emerald-400 focus:ring-emerald-100"
                      } bg-gray-50 px-3 py-2.5 text-sm text-gray-900 placeholder:text-gray-400 dark:bg-gray-900 dark:border-gray-700 dark:text-gray-100 dark:placeholder-gray-500 transition-colors`}
                      required
                      placeholder="Contoh: Desa Cibodas, Blok 3..."
                    />
                    {error.lokasi && (
                      <p className="text-xs text-red-500 mt-1">
                        {error.lokasi}
                      </p>
                    )}
                  </div>

                  {/* Pengawas */}
                  <div>
                    <label className="block text-sm font-medium text-gray-600 dark:text-gray-300 mb-1">
                      Pengawas
                    </label>
                    <select
                      name="id_pengawas"
                      value={form.id_pengawas}
                      onChange={handleChange}
                      className={`w-full rounded-xl border ${
                        error.id_pengawas
                          ? "border-red-400 focus:ring-red-100"
                          : "border-gray-200 focus:border-emerald-400 focus:ring-emerald-100"
                      } bg-gray-50 px-3 py-2.5 text-sm text-gray-900 dark:bg-gray-900 dark:border-gray-700 dark:text-gray-100 transition-colors`}
                      required
                    >
                      <option value="">Pilih Pengawas</option>
                      {manajerList.map((p) => (
                        <option key={p.id_user} value={p.id_user}>
                          {p.nama}
                        </option>
                      ))}
                    </select>
                    {error.id_pengawas && (
                      <p className="text-xs text-red-500 mt-1">
                        {error.id_pengawas}
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
                        "Tambah Lahan"
                      )}
                    </button>
                    {isEditing && (
                      <button
                        type="button"
                        onClick={resetForm}
                        className="rounded-xl border border-gray-300 bg-white px-4 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50 dark:bg-gray-900 dark:border-gray-700 dark:text-gray-200 dark:hover:bg-gray-800"
                      >
                        Batal
                      </button>
                    )}
                  </div>
                </form>
              </div>
            </div>

            {/* CHART CARD */}
            <div className="relative overflow-hidden rounded-2xl border border-gray-200/80 bg-white/95 dark:bg-gray-950/80 dark:border-gray-800/80 shadow-[0_18px_45px_rgba(15,23,42,0.6)] flex flex-col items-center">
              <div className="absolute inset-x-0 top-0 h-0.5 bg-gradient-to-r from-sky-400/80 via-emerald-300/80 to-lime-400/80" />
              <div className="pointer-events-none absolute inset-0 opacity-40">
                <div className="absolute -top-16 left-0 h-32 w-32 rounded-full bg-sky-500/15 blur-3xl" />
                <div className="absolute -bottom-20 right-0 h-36 w-36 rounded-full bg-emerald-500/10 blur-3xl" />
              </div>

              <div className="relative w-full p-6 flex flex-col items-center">
                <h3 className="text-base md:text-lg font-semibold text-gray-900 dark:text-gray-50 mb-2 text-center">
                  Distribusi Luas Lahan Berdasarkan Pengawas
                </h3>
                <p className="text-xs text-gray-500 dark:text-gray-400 mb-6 text-center">
                  Menampilkan total luas (Ha) yang dikelola oleh masing-masing
                  pengawas.
                </p>
                <div className="w-full max-w-xs mx-auto">
                  {lahan.length > 0 ? (
                    <Pie data={getChartData()} />
                  ) : (
                    <p className="text-center text-sm text-gray-500 dark:text-gray-400">
                      Data lahan kosong, silakan tambah lahan terlebih dahulu.
                    </p>
                  )}
                </div>
              </div>
            </div>
          </div>

          <hr className="border-gray-200 dark:border-gray-800" />

          {/* TABEL LAHAN */}
          <section className="space-y-3 mb-10">
            <h3 className="text-base md:text-lg font-semibold text-gray-900 dark:text-gray-50">
              Tabel Data Lahan
            </h3>

            {/* Search Input */}
            <div className="flex justify-end mb-4">
              <input
                type="text"
                value={searchTerm}
                onChange={handleSearchChange}
                placeholder="Cari (Nama/Lokasi/Pengawas)..."
                className="w-full max-w-xs rounded-xl border border-gray-200 bg-white px-4 py-2 text-sm text-gray-900 placeholder:text-gray-400 focus:border-emerald-400 focus:ring-2 focus:ring-emerald-100 dark:bg-gray-900 dark:border-gray-700 dark:text-gray-100 dark:placeholder-gray-500 transition-colors"
              />
            </div>

            <div className="overflow-auto bg-white/95 dark:bg-gray-950/80 rounded-2xl border border-gray-200/80 dark:border-gray-800/80 shadow-sm">
              <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-800 text-sm">
                <thead className="bg-gray-50/90 dark:bg-gray-900/80 sticky top-0 z-10">
                  <tr className="text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">
                    <th className="px-4 py-3 text-left">ID</th>
                    <th className="px-4 py-3 text-left">Nama Lahan</th>
                    <th className="px-4 py-3 text-left">Luas (Ha)</th>
                    <th className="px-4 py-3 text-left">Lokasi</th>
                    <th className="px-4 py-3 text-left">Pengawas</th>
                    <th className="px-4 py-3 text-center">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 dark:divide-gray-800">
                  {paginatedLahan.map((l) => {
                    const namaPengawas = getPengawasName(l.id_pengawas);

                    return (
                      <tr
                        key={l.id_lahan}
                        className="hover:bg-gray-50 dark:hover:bg-gray-900/70 transition-colors"
                      >
                        <td className="px-4 py-3 text-sm text-center">
                          {l.id_lahan}
                        </td>
                        <td className="px-4 py-3 text-sm">{l.nama_lahan}</td>
                        <td className="px-4 py-3 text-sm">{l.luas}</td>
                        <td className="px-4 py-3 text-sm">{l.lokasi}</td>
                        <td className="px-4 py-3 text-sm">{namaPengawas}</td>
                        <td className="px-4 py-3 text-center space-x-2">
                          <button
                            onClick={() => handleEdit(l)}
                            className="text-xs px-3 py-1.5 rounded-full border bg-blue-50 text-blue-700 border-blue-200 hover:bg-blue-100 dark:bg-blue-500/15 dark:text-blue-300 dark:border-blue-400/40 dark:hover:bg-blue-500/25 transition-colors"
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => handleDelete(l.id_lahan)}
                            className="text-xs px-3 py-1.5 rounded-full border bg-red-50 text-red-700 border-red-200 hover:bg-red-100 dark:bg-red-500/15 dark:text-red-300 dark:border-red-400/40 dark:hover:bg-red-500/25 transition-colors"
                          >
                            Hapus
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                  {paginatedLahan.length === 0 && (
                    <tr>
                      <td
                        colSpan="6"
                        className="px-4 py-4 text-center text-sm text-gray-500 dark:text-gray-400"
                      >
                        {searchTerm
                          ? "Tidak ada lahan yang cocok dengan pencarian."
                          : "Tidak ada data lahan."}
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {/* Pagination Controls */}
            {filteredLahan.length > ITEMS_PER_PAGE && (
              <div className="flex justify-between items-center px-4 py-3 sm:px-6">
                <div className="text-sm text-gray-700 dark:text-gray-400">
                  Menampilkan {(currentPage - 1) * ITEMS_PER_PAGE + 1} sampai{" "}
                  {Math.min(currentPage * ITEMS_PER_PAGE, filteredLahan.length)}{" "}
                  dari {filteredLahan.length} hasil{" "}
                  {searchTerm && `(Total: ${lahan.length} data)`}
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
          </section>
        </main>
      </div>
    </div>
  );
}
