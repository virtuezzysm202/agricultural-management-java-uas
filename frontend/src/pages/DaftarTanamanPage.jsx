import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";
import SidebarManager from "../components/SidebarManager";
import TopbarManager from "../components/TopbarManager";

export default function DaftarTanamanPage() {
  const navigate = useNavigate();
  const [tanamans, setTanamans] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      alert("Please login first");
      navigate("/");
      return;
    }
    const fetchTanamans = async () => {
      setLoading(true);
      try {
        const res = await api.get("/manager/tanaman");
        setTanamans(res.data.data || []);
      } catch (err) {
        console.error("Gagal memuat data tanaman:", err);
        setTanamans([]);
      } finally {
        setLoading(false);
      }
    };
    fetchTanamans();
  }, [navigate]);

  const filteredTanamans = tanamans.filter((t) => {
    if (!searchQuery) return true;
    const query = searchQuery.toLowerCase();
    return (
      String(t.id_tanaman).includes(query) ||
      (t.nama_tanaman && t.nama_tanaman.toLowerCase().includes(query)) ||
      (t.jenis && t.jenis.toLowerCase().includes(query))
    );
  });

  return (
    <div className="min-h-screen xl:flex bg-gray-50 dark:bg-gray-950 text-gray-900 dark:text-gray-100 transition-colors">
      <SidebarManager />
      <div className="flex-1 xl:ml-[260px]">
        <TopbarManager />
        <main className="max-w-7xl mx-auto px-4 py-6 md:px-6 lg:px-8 lg:py-8 space-y-8">
          <div>
            <h2 className="text-2xl font-semibold text-gray-900 dark:text-gray-50 flex items-center gap-2">
              <span>🌱</span> Daftar Tanaman
            </h2>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
              Lihat semua jenis tanaman yang tersedia.
            </p>
          </div>
          <section className="space-y-3 mb-10">
            <div className="flex items-center justify-between">
              <h3 className="text-base md:text-lg font-semibold text-gray-900 dark:text-gray-50">
                Tabel Daftar Tanaman
              </h3>
              <div className="relative">
                <input
                  type="text"
                  placeholder="Cari tanaman..."
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
                    <th className="px-4 py-3 text-left">Nama Tanaman</th>
                    <th className="px-4 py-3 text-left">Jenis</th>
                    <th className="px-4 py-3 text-left">Jumlah</th>
                    <th className="px-4 py-3 text-left">Waktu Tanam</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 dark:divide-gray-800">
                  {loading ? (
                    <tr>
                      <td colSpan="5" className="px-4 py-4 text-center text-gray-500 dark:text-gray-400">
                        Loading...
                      </td>
                    </tr>
                  ) : filteredTanamans.length === 0 ? (
                    <tr>
                      <td colSpan="5" className="px-4 py-4 text-center text-gray-500 dark:text-gray-400">
                        Tidak ada data tanaman.
                      </td>
                    </tr>
                  ) : (
                    filteredTanamans.map((t) => (
                      <tr key={t.id_tanaman}>
                        <td className="px-4 py-3 text-sm">{t.id_tanaman}</td>
                        <td className="px-4 py-3 text-sm capitalize">{t.nama_tanaman}</td>
                        <td className="px-4 py-3 text-sm">{t.jenis}</td>
                        <td className="px-4 py-3 text-sm">{t.jumlah_tanaman || 0}</td>
                        <td className="px-4 py-3 text-sm">
                          {t.waktu_tanam
                            ? new Date(t.waktu_tanam).toLocaleDateString("id-ID", {
                                day: "2-digit",
                                month: "short",
                                year: "numeric",
                              })
                            : "-"}
                        </td>
                      </tr>
                    ))
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
