import React, { useEffect, useState, useMemo } from "react";
import SidebarAdmin from "../components/SidebarAdmin";
import TopbarAdmin from "../components/TopbarAdmin";
import api from "../services/api";

// --- START CHART IMPORTS ---
import { Pie } from "react-chartjs-2";
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from "chart.js";

ChartJS.register(ArcElement, Tooltip, Legend);
// --- END CHART IMPORTS ---

// Konstanta untuk batasan paginasi
const ITEMS_PER_PAGE = 5;

export default function TanamanPage() {
  const [tanaman, setTanaman] = useState([]);
  const [form, setForm] = useState({
    id_tanaman: null,
    nama_tanaman: "",
    jenis: "",
    waktu_tanam: "",
    jumlah_tanaman: "",
  });
  const [loading, setLoading] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [error, setError] = useState({}); // State untuk error validasi form

  // State untuk Pencarian dan Paginasi
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);

  const fetchTanaman = async () => {
    try {
      const res = await api.get("/tanaman");
      setTanaman(res.data);
    } catch (err) {
      console.error("Gagal memuat data tanaman:", err);
      alert("Gagal memuat data tanaman. Cek konsol untuk detail error.");
    }
  };

  useEffect(() => {
    fetchTanaman();
  }, []);

  // --- Fungsi Validasi Form ---
  const validateForm = () => {
    let errors = {};
    let isValid = true;

    if (!form.nama_tanaman.trim()) {
      errors.nama_tanaman = "Nama Tanaman wajib diisi.";
      isValid = false;
    }
    if (!form.jenis.trim()) {
      errors.jenis = "Jenis wajib diisi.";
      isValid = false;
    }
    if (!form.waktu_tanam) {
      errors.waktu_tanam = "Waktu Tanam wajib diisi.";
      isValid = false;
    } else {
      // Tambahan validasi: memastikan tanggal adalah tanggal yang valid
      const date = new Date(form.waktu_tanam);
      if (isNaN(date.getTime())) {
        errors.waktu_tanam = "Format Waktu Tanam tidak valid.";
        isValid = false;
      }
    }
    if (form.jumlah_tanaman === "" || form.jumlah_tanaman === null) {
      errors.jumlah_tanaman = "Jumlah Tanaman wajib diisi.";
      isValid = false;
    } else if (Number(form.jumlah_tanaman) < 0) {
      errors.jumlah_tanaman = "Jumlah Tanaman tidak boleh negatif.";
      isValid = false;
    }

    setError(errors);
    return isValid;
  };
  // -----------------------------

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    // Hapus error saat input diubah
    setError({ ...error, [e.target.name]: "" });
  };

  const resetForm = () => {
    setForm({
      id_tanaman: null,
      nama_tanaman: "",
      jenis: "",
      waktu_tanam: "",
      jumlah_tanaman: "",
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
      const dataToSubmit = { ...form };
      // Pastikan jumlah_tanaman dikirim sebagai angka
      dataToSubmit.jumlah_tanaman = Number(dataToSubmit.jumlah_tanaman);

      if (isEditing) {
        delete dataToSubmit.id_tanaman;
        await api.put(`/tanaman/${form.id_tanaman}`, dataToSubmit);
      } else {
        // Hapus id_tanaman saat post, karena mungkin ada dari state awal
        delete dataToSubmit.id_tanaman;
        await api.post("/tanaman", dataToSubmit);
      }
      fetchTanaman();
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
    const formattedDate = data.waktu_tanam
      ? new Date(data.waktu_tanam).toISOString().split("T")[0]
      : "";

    setForm({
      ...data,
      waktu_tanam: formattedDate,
      jumlah_tanaman: String(data.jumlah_tanaman), // Pastikan jumlah_tanaman berupa string untuk input type="number"
    });
    setIsEditing(true);
    setError({}); // Reset error saat mulai mengedit
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Yakin ingin menghapus tanaman ini?")) return;
    try {
      await api.delete(`/tanaman/${id}`);
      fetchTanaman();
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

  const getChartData = () => {
    const jenisCount = tanaman.reduce((acc, t) => {
      const jenis = t.jenis || "Tidak Diketahui";
      acc[jenis] = (acc[jenis] || 0) + 1;
      return acc;
    }, {});

    const labels = Object.keys(jenisCount);
    const dataCounts = Object.values(jenisCount);

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
          label: "Jumlah Tanaman",
          data: dataCounts,
          backgroundColor: backgroundColors.slice(0, labels.length),
          borderColor: backgroundColors.slice(0, labels.length),
          borderWidth: 1,
        },
      ],
    };
  };

  // --- Logika Pencarian dan Paginasi ---
  const filteredTanaman = useMemo(() => {
    if (!searchTerm) {
      return tanaman;
    }
    const lowerCaseSearchTerm = searchTerm.toLowerCase();
    return tanaman.filter(
      (t) =>
        t.nama_tanaman.toLowerCase().includes(lowerCaseSearchTerm) ||
        t.jenis.toLowerCase().includes(lowerCaseSearchTerm) ||
        String(t.id_tanaman).includes(lowerCaseSearchTerm)
    );
  }, [tanaman, searchTerm]);

  const totalPages = Math.ceil(filteredTanaman.length / ITEMS_PER_PAGE);

  const paginatedTanaman = useMemo(() => {
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    return filteredTanaman.slice(startIndex, startIndex + ITEMS_PER_PAGE);
  }, [filteredTanaman, currentPage]);

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
              <span>🌱</span> Kelola Data Tanaman
            </h2>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
              Tambahkan, ubah, dan pantau seluruh jenis tanaman yang terdaftar.
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
                    {isEditing ? "Edit Data Tanaman" : "Tambah Tanaman Baru"}
                  </h3>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                    Isi informasi dasar tanaman untuk kebutuhan pendataan.
                  </p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                  {/* Nama Tanaman */}
                  <div>
                    <label className="block text-sm font-medium text-gray-600 dark:text-gray-300 mb-1">
                      Nama Tanaman
                    </label>
                    <input
                      type="text"
                      name="nama_tanaman"
                      value={form.nama_tanaman}
                      onChange={handleChange}
                      className={`w-full rounded-xl border ${
                        error.nama_tanaman
                          ? "border-red-400 focus:ring-red-100"
                          : "border-gray-200 focus:border-emerald-400 focus:ring-emerald-100"
                      } bg-gray-50 px-3 py-2.5 text-sm text-gray-900 placeholder:text-gray-400 dark:bg-gray-900 dark:border-gray-700 dark:text-gray-100 dark:placeholder-gray-500 transition-colors`}
                      required
                      placeholder="Contoh: Padi, Jagung, Brokoli..."
                    />
                    {error.nama_tanaman && (
                      <p className="text-xs text-red-500 mt-1">
                        {error.nama_tanaman}
                      </p>
                    )}
                  </div>

                  {/* Jenis */}
                  <div>
                    <label className="block text-sm font-medium text-gray-600 dark:text-gray-300 mb-1">
                      Jenis
                    </label>
                    <input
                      type="text"
                      name="jenis"
                      value={form.jenis}
                      onChange={handleChange}
                      className={`w-full rounded-xl border ${
                        error.jenis
                          ? "border-red-400 focus:ring-red-100"
                          : "border-gray-200 focus:border-emerald-400 focus:ring-emerald-100"
                      } bg-gray-50 px-3 py-2.5 text-sm text-gray-900 placeholder:text-gray-400 dark:bg-gray-900 dark:border-gray-700 dark:text-gray-100 dark:placeholder-gray-500 transition-colors`}
                      required
                      placeholder="Contoh: Sayuran, Umbi Akar, Bunga..."
                    />
                    {error.jenis && (
                      <p className="text-xs text-red-500 mt-1">{error.jenis}</p>
                    )}
                  </div>

                  {/* Waktu Tanam */}
                  <div>
                    <label className="block text-sm font-medium text-gray-600 dark:text-gray-300 mb-1">
                      Waktu Tanam
                    </label>
                    <input
                      type="date"
                      name="waktu_tanam"
                      value={form.waktu_tanam}
                      onChange={handleChange}
                      className={`w-full rounded-xl border ${
                        error.waktu_tanam
                          ? "border-red-400 focus:ring-red-100"
                          : "border-gray-200 focus:border-emerald-400 focus:ring-emerald-100"
                      } bg-gray-50 px-3 py-2.5 text-sm text-gray-900 dark:bg-gray-900 dark:border-gray-700 dark:text-gray-100 transition-colors`}
                      required
                    />
                    {error.waktu_tanam && (
                      <p className="text-xs text-red-500 mt-1">
                        {error.waktu_tanam}
                      </p>
                    )}
                  </div>

                  {/* Jumlah Tanaman */}
                  <div>
                    <label className="block text-sm font-medium text-gray-600 dark:text-gray-300 mb-1">
                      Jumlah Tanaman
                    </label>
                    <input
                      type="number"
                      name="jumlah_tanaman"
                      value={form.jumlah_tanaman}
                      onChange={handleChange}
                      className={`w-full rounded-xl border ${
                        error.jumlah_tanaman
                          ? "border-red-400 focus:ring-red-100"
                          : "border-gray-200 focus:border-emerald-400 focus:ring-emerald-100"
                      } bg-gray-50 px-3 py-2.5 text-sm text-gray-900 placeholder:text-gray-400 dark:bg-gray-900 dark:border-gray-700 dark:text-gray-100 dark:placeholder-gray-500 transition-colors`}
                      placeholder="Jumlah stok tanaman"
                      min="0"
                    />
                    {error.jumlah_tanaman && (
                      <p className="text-xs text-red-500 mt-1">
                        {error.jumlah_tanaman}
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
                        "Tambah Tanaman"
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
                <h3 className="text-base md:text-lg font-semibold text-gray-900 dark:text-gray-50 mb-2">
                  Distribusi Jenis Tanaman
                </h3>
                <p className="text-xs text-gray-500 dark:text-gray-400 mb-6 text-center">
                  Ringkasan komposisi tanaman berdasarkan kategori jenis.
                </p>
                <div className="w-full max-w-xs mx-auto">
                  {tanaman.length > 0 ? (
                    <Pie data={getChartData()} />
                  ) : (
                    <p className="text-center text-sm text-gray-500 dark:text-gray-400">
                      Data masih kosong, silakan tambah tanaman terlebih dahulu.
                    </p>
                  )}
                </div>
              </div>
            </div>
          </div>

          <hr className="border-gray-200 dark:border-gray-800" />

          {/* TABEL TANAMAN */}
          <section className="space-y-3 mb-10">
            <h3 className="text-base md:text-lg font-semibold text-gray-900 dark:text-gray-50">
              Tabel Data Tanaman
            </h3>

            {/* Search Input */}
            <div className="flex justify-end mb-4">
              <input
                type="text"
                value={searchTerm}
                onChange={handleSearchChange}
                placeholder="Cari (Nama/Jenis/ID)..."
                className="w-full max-w-xs rounded-xl border border-gray-200 bg-white px-4 py-2 text-sm text-gray-900 placeholder:text-gray-400 focus:border-emerald-400 focus:ring-2 focus:ring-emerald-100 dark:bg-gray-900 dark:border-gray-700 dark:text-gray-100 dark:placeholder-gray-500 transition-colors"
              />
            </div>

            <div className="overflow-auto bg-white/95 dark:bg-gray-950/80 rounded-2xl border border-gray-200/80 dark:border-gray-800/80 shadow-sm">
              <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-800 text-sm">
                <thead className="bg-gray-50/90 dark:bg-gray-900/80 sticky top-0 z-10">
                  <tr className="text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">
                    <th className="px-4 py-3 text-left">ID</th>
                    <th className="px-4 py-3 text-left">Nama Tanaman</th>
                    <th className="px-4 py-3 text-left">Jenis</th>
                    <th className="px-4 py-3 text-left">Jumlah</th>
                    <th className="px-4 py-3 text-left">Waktu Tanam</th>
                    <th className="px-4 py-3 text-center">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 dark:divide-gray-800">
                  {paginatedTanaman.map((t) => (
                    <tr
                      key={t.id_tanaman}
                      className="hover:bg-gray-50 dark:hover:bg-gray-900/70 transition-colors"
                    >
                      <td className="px-4 py-3 text-sm">{t.id_tanaman}</td>
                      <td className="px-4 py-3 text-sm">{t.nama_tanaman}</td>
                      <td className="px-4 py-3 text-sm">{t.jenis}</td>
                      <td className="px-4 py-3 text-sm">
                        {t.jumlah_tanaman || 0}
                      </td>
                      <td className="px-4 py-3 text-sm">
                        {t.waktu_tanam
                          ? new Date(t.waktu_tanam).toLocaleDateString("id-ID")
                          : "-"}
                      </td>
                      <td className="px-4 py-3 text-center space-x-2">
                        <button
                          onClick={() => handleEdit(t)}
                          className="text-xs px-3 py-1.5 rounded-full border bg-blue-50 text-blue-700 border-blue-200 hover:bg-blue-100 dark:bg-blue-500/15 dark:text-blue-300 dark:border-blue-400/40 dark:hover:bg-blue-500/25 transition-colors"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDelete(t.id_tanaman)}
                          className="text-xs px-3 py-1.5 rounded-full border bg-red-50 text-red-700 border-red-200 hover:bg-red-100 dark:bg-red-500/15 dark:text-red-300 dark:border-red-400/40 dark:hover:bg-red-500/25 transition-colors"
                        >
                          Hapus
                        </button>
                      </td>
                    </tr>
                  ))}
                  {paginatedTanaman.length === 0 && (
                    <tr>
                      <td
                        colSpan="6"
                        className="px-4 py-4 text-center text-sm text-gray-500 dark:text-gray-400"
                      >
                        {searchTerm
                          ? "Tidak ada tanaman yang cocok dengan pencarian."
                          : "Tidak ada data tanaman."}
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {/* Pagination Controls */}
            {filteredTanaman.length > ITEMS_PER_PAGE && (
              <div className="flex justify-between items-center px-4 py-3 sm:px-6">
                <div className="text-sm text-gray-700 dark:text-gray-400">
                  Menampilkan {(currentPage - 1) * ITEMS_PER_PAGE + 1} sampai{" "}
                  {Math.min(
                    currentPage * ITEMS_PER_PAGE,
                    filteredTanaman.length
                  )}{" "}
                  dari {filteredTanaman.length} hasil{" "}
                  {searchTerm && `(Total: ${tanaman.length} data)`}
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
