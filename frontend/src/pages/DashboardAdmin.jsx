import React, { useEffect, useState } from "react";
import SidebarAdmin from "../components/SidebarAdmin";
import TopbarAdmin from "../components/TopbarAdmin";
import StatsCard from "../components/StatsCard";
import MonthlySalesChart from "../components/MonthlySalesChart";
import api from "../services/api";

// Toolbar kecil di atas tabel
function TableToolbar({ title, onRefresh }) {
  return (
    <div className="flex items-center justify-between mb-3">
      <h3 className="text-base md:text-lg font-semibold text-gray-800 dark:text-gray-100">
        {title}
      </h3>
      <button
        onClick={onRefresh}
        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-gray-300/70 bg-white/90 text-xs md:text-sm text-gray-700 shadow-sm hover:bg-gray-50 dark:bg-gray-900/80 dark:border-gray-700 dark:text-gray-200 dark:hover:bg-gray-800 transition-colors"
      >
        ⟳
        <span>Refresh</span>
      </button>
    </div>
  );
}

// Modal sederhana untuk edit data
function SimpleModal({ open, onClose, title, children }) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
      <div className="w-full max-w-2xl rounded-2xl bg-white dark:bg-gray-950 border border-gray-200/80 dark:border-gray-800/80 p-6 shadow-[0_20px_60px_rgba(15,23,42,0.75)]">
        <div className="flex items-center justify-between mb-4">
          <h4 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
            {title}
          </h4>
          <button
            onClick={onClose}
            className="text-sm text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
          >
            Close
          </button>
        </div>
        <div>{children}</div>
      </div>
    </div>
  );
}

export default function DashboardAdmin() {
  // ======= STATE DATA =======
  const [harvests, setHarvests] = useState([]); // hasil_panen
  const [lahans, setLahans] = useState([]); // tanaman_lahan
  const [monitors, setMonitors] = useState([]); // monitoring
  const [purchases, setPurchases] = useState([]); // pembelian
  const [tanamans, setTanamans] = useState([]); // tanaman
  const [managers, setManagers] = useState([]); // manajer

  // modal state
  const [editOpen, setEditOpen] = useState(false);
  const [editType, setEditType] = useState(null); // 'harvest'|'lahan'|'monitor'|'purchase'
  const [current, setCurrent] = useState(null);

  // loading per tabel
  const [loading, setLoading] = useState({
    h: false,
    l: false,
    m: false,
    p: false,
    t: false,
    ma: false,
  });

  // ======= DEMO DATA FALLBACK =======
  const demoHarvests = [
    {
      id_hasil: 1,
      id_tanaman: 1,
      id_lahan: 1,
      id_pengawas: 2,
      tanggal_panen: "2025-10-01",
      kuantitas: 150,
      kualitas: "A",
      harga_satuan: 2000,
      status: "Menunggu Validasi",
    },
    {
      id_hasil: 2,
      id_tanaman: 2,
      id_lahan: 1,
      id_pengawas: 3,
      tanggal_panen: "2025-10-05",
      kuantitas: 80,
      kualitas: "B",
      harga_satuan: 1800,
      status: "Siap Dijual",
    },
  ];

  const demoLahans = [
    {
      id_tl: 1,
      id_lahan: 1,
      id_tanaman: 1,
      tanggal_tanam: "2025-02-01",
      status: "tumbuh",
    },
    {
      id_tl: 2,
      id_lahan: 2,
      id_tanaman: 1,
      tanggal_tanam: "2025-01-15",
      status: "panen",
    },
  ];

  const demoMonitors = [
    {
      id_monitor: 1,
      id_lahan: 1,
      suhu: 28.5,
      kelembaban: 72.1,
      tanggal: "2025-11-01T08:30:00",
    },
    {
      id_monitor: 2,
      id_lahan: 2,
      suhu: 26.9,
      kelembaban: 68.4,
      tanggal: "2025-11-01T09:00:00",
    },
  ];

  const demoPurchases = [
    {
      id_pembelian: 1,
      id_pembeli: 10,
      id_hasil: 1,
      tanggal: "2025-11-09T10:00:00",
      jumlah: 20,
      total_harga: 40000,
    },
    {
      id_pembelian: 2,
      id_pembeli: 11,
      id_hasil: 2,
      tanggal: "2025-11-10T14:15:00",
      jumlah: 10,
      total_harga: 18000,
    },
  ];

  const demoTanamans = [
    { id_tanaman: 1, nama_tanaman: "Padi" },
    { id_tanaman: 2, nama_tanaman: "Jagung" },
  ];

  const demoManagers = [
    { id: 1, nama: "Andi", status: "aktif" },
    { id: 2, nama: "Budi", status: "aktif" },
  ];

  // ======= FETCH FUNCTIONS =======
  const loadHarvests = async () => {
    setLoading((s) => ({ ...s, h: true }));
    try {
      const res = await api.get("/hasil_panen").catch(() => ({ data: null }));
      setHarvests(res.data ?? demoHarvests);
    } catch (err) {
      console.error(err);
      setHarvests(demoHarvests);
    } finally {
      setLoading((s) => ({ ...s, h: false }));
    }
  };

  const loadLahans = async () => {
    setLoading((s) => ({ ...s, l: true }));
    try {
      const res = await api
        .get("/tanaman_lahan")
        .catch(() => ({ data: null }));
      setLahans(res.data ?? demoLahans);
    } catch (err) {
      console.error(err);
      setLahans(demoLahans);
    } finally {
      setLoading((s) => ({ ...s, l: false }));
    }
  };

  const loadMonitors = async () => {
    setLoading((s) => ({ ...s, m: true }));
    try {
      const res = await api.get("/monitoring").catch(() => ({ data: null }));
      setMonitors(res.data ?? demoMonitors);
    } catch (err) {
      console.error(err);
      setMonitors(demoMonitors);
    } finally {
      setLoading((s) => ({ ...s, m: false }));
    }
  };

  const loadPurchases = async () => {
    setLoading((s) => ({ ...s, p: true }));
    try {
      const res = await api.get("/pembelian").catch(() => ({ data: null }));
      setPurchases(res.data ?? demoPurchases);
    } catch (err) {
      console.error(err);
      setPurchases(demoPurchases);
    } finally {
      setLoading((s) => ({ ...s, p: false }));
    }
  };

  const loadTanamans = async () => {
    setLoading((s) => ({ ...s, t: true }));
    try {
      const res = await api.get("/tanaman").catch(() => ({ data: null }));
      setTanamans(res.data ?? demoTanamans);
    } catch (err) {
      console.error(err);
      setTanamans(demoTanamans);
    } finally {
      setLoading((s) => ({ ...s, t: false }));
    }
  };

  const loadManagers = async () => {
    setLoading((s) => ({ ...s, ma: true }));
    try {
      const res = await api.get("/manager").catch(() => ({ data: null }));
      setManagers(res.data ?? demoManagers);
    } catch (err) {
      console.error(err);
      setManagers(demoManagers);
    } finally {
      setLoading((s) => ({ ...s, ma: false }));
    }
  };

  // initial load
  useEffect(() => {
    loadHarvests();
    loadLahans();
    loadMonitors();
    loadPurchases();
    loadTanamans();
    loadManagers();
  }, []);

  // ======= EDIT / DELETE HANDLERS =======
  const openEdit = (type, item) => {
    setEditType(type);
    setCurrent({ ...item });
    setEditOpen(true);
  };

  const handleDelete = async (type, id) => {
    if (!window.confirm("Hapus data ini?")) return;
    try {
      const map = {
        harvest: "hasil_panen",
        lahan: "tanaman_lahan",
        monitor: "monitoring",
        purchase: "pembelian",
      };
      await api.delete(`/${map[type]}/${id}`).catch(() => null);
      if (type === "harvest") loadHarvests();
      if (type === "lahan") loadLahans();
      if (type === "monitor") loadMonitors();
      if (type === "purchase") loadPurchases();
    } catch (err) {
      console.error(err);
      alert("Gagal menghapus (cek backend)");
    }
  };

  const handleSave = async () => {
    try {
      const map = {
        harvest: "hasil_panen",
        lahan: "tanaman_lahan",
        monitor: "monitoring",
        purchase: "pembelian",
      };
      if (!editType || !current) return;

      const idField =
        editType === "harvest"
          ? "id_hasil"
          : editType === "lahan"
          ? "id_tl"
          : editType === "monitor"
          ? "id_monitor"
          : "id_pembelian";

      if (current[idField]) {
        await api
          .put(`/${map[editType]}/${current[idField]}`, current)
          .catch(() => null);
      } else {
        await api.post(`/${map[editType]}`, current).catch(() => null);
      }

      if (editType === "harvest") loadHarvests();
      if (editType === "lahan") loadLahans();
      if (editType === "monitor") loadMonitors();
      if (editType === "purchase") loadPurchases();

      setEditOpen(false);
    } catch (err) {
      console.error(err);
      alert("Gagal menyimpan (cek backend)");
    }
  };

  const toggleHarvestStatus = async (h) => {
    const newStatus =
      h.status === "Siap Dijual" ? "Menunggu Validasi" : "Siap Dijual";
    if (!window.confirm(`Ubah status menjadi '${newStatus}' ?`)) return;
    try {
      await api
        .put(`/hasil_panen/${h.id_hasil}`, { ...h, status: newStatus })
        .catch(() => null);
      loadHarvests();
    } catch (err) {
      console.error(err);
      alert("Gagal mengubah status");
    }
  };

  // ======= PERHITUNGAN STATS =======
  const totalLahan = lahans.length;
  const jenisTanaman = tanamans.length;
  const manajerAktif = managers.length;
  const totalPanenKg = harvests.reduce(
    (sum, h) => sum + (h.kuantitas || 0),
    0
  );

  const totalRevenue = purchases.reduce(
    (sum, p) => sum + (p.total_harga || 0),
    0
  );

  // ======= RENDER =======
  return (
    <div className="min-h-screen xl:flex bg-gray-50 dark:bg-gray-950 text-gray-900 dark:text-gray-100 transition-colors">
      <SidebarAdmin />
      <div className="flex-1 xl:ml-[256px]">
        <TopbarAdmin />

        <main className="max-w-7xl mx-auto px-4 py-6 md:px-6 lg:px-8 lg:py-8 space-y-8">
          {/* ======= STAT CARDS ======= */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <StatsCard
              title="Total Lahan"
              value={totalLahan}
              change="-"
              up={true}
              icon={<span>🏡</span>}
            />
            <StatsCard
              title="Jenis Tanaman"
              value={jenisTanaman}
              change="-"
              up={true}
              icon={<span>🌱</span>}
            />
            <StatsCard
              title="Manajer Aktif"
              value={manajerAktif}
              change="-"
              up={true}
              icon={<span>👨‍🌾</span>}
            />
            <StatsCard
              title="Total Panen (kg)"
              value={totalPanenKg}
              change="-"
              up={true}
              icon={<span>📦</span>}
            />
          </div>

          {/* ======= CHART + SUMMARY ======= */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2">
              {/* Chart pakai data purchases biar nggak double fetch */}
              <MonthlySalesChart data={purchases} fromBackend={false} />
            </div>
            <div>
              <div className="relative overflow-hidden rounded-2xl border border-gray-200/80 bg-white/95 dark:bg-gray-950/70 dark:border-gray-800/80 p-5 shadow-[0_18px_50px_rgba(15,23,42,0.65)]">
                <div className="pointer-events-none absolute inset-0 opacity-60">
                  <div className="absolute -top-16 right-0 h-32 w-32 rounded-full bg-emerald-500/15 blur-3xl" />
                  <div className="absolute -bottom-16 left-0 h-32 w-32 rounded-full bg-sky-500/10 blur-3xl" />
                </div>

                <div className="relative space-y-3">
                  <h3 className="font-semibold text-gray-900 dark:text-gray-50">
                    Summary Penjualan
                  </h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    Total recent orders:{" "}
                    <span className="font-semibold text-gray-800 dark:text-gray-100">
                      {purchases.length}
                    </span>
                  </p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    Total revenue:{" "}
                    <span className="font-semibold text-emerald-600 dark:text-emerald-400">
                      Rp {totalRevenue.toLocaleString("id-ID")}
                    </span>
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* ======= TABEL: HASIL PANEN ======= */}
          <section className="space-y-3">
            <TableToolbar title="Tabel Hasil Panen" onRefresh={loadHarvests} />
            <div className="overflow-auto bg-white/95 dark:bg-gray-950/80 rounded-2xl border border-gray-200/80 dark:border-gray-800/80 shadow-sm">
              <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-800 text-sm">
                <thead className="bg-gray-50/90 dark:bg-gray-900/80 sticky top-0 z-10">
                  <tr className="text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">
                    <th className="px-4 py-3 text-left">ID Hasil Panen</th>
                    <th className="px-4 py-3 text-left">ID Tanaman</th>
                    <th className="px-4 py-3 text-left">ID Lahan</th>
                    <th className="px-4 py-3 text-left">ID Pengawas</th>
                    <th className="px-4 py-3 text-left">Tanggal</th>
                    <th className="px-4 py-3 text-right">Kuantitas</th>
                    <th className="px-4 py-3 text-left">Kualitas</th>
                    <th className="px-4 py-3 text-right">Harga Satuan</th>
                    <th className="px-4 py-3 text-left">Status</th>
                    <th className="px-4 py-3 text-center">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 dark:divide-gray-800">
                  {(loading.h ? [] : harvests).map((h) => (
                    <tr
                      key={h.id_hasil}
                      className="hover:bg-gray-50 dark:hover:bg-gray-900/70 transition-colors"
                    >
                      <td className="px-4 py-3">{h.id_hasil}</td>
                      <td className="px-4 py-3">{h.id_tanaman}</td>
                      <td className="px-4 py-3">{h.id_lahan}</td>
                      <td className="px-4 py-3">{h.id_pengawas}</td>
                      <td className="px-4 py-3">{h.tanggal_panen}</td>
                      <td className="px-4 py-3 text-right">{h.kuantitas}</td>
                      <td className="px-4 py-3">{h.kualitas}</td>
                      <td className="px-4 py-3 text-right">
                        Rp {h.harga_satuan}
                      </td>
                      <td className="px-4 py-3">{h.status}</td>
                      <td className="px-4 py-3 text-center space-x-2">
                        <button
                          onClick={() => openEdit("harvest", h)}
                          className="text-xs px-3 py-1.5 rounded-full border bg-blue-50 text-blue-700 border-blue-200 hover:bg-blue-100 dark:bg-blue-500/15 dark:text-blue-300 dark:border-blue-400/40 dark:hover:bg-blue-500/25 transition-colors"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => toggleHarvestStatus(h)}
                          className="text-xs px-3 py-1.5 rounded-full border bg-green-50 text-green-700 border-green-200 hover:bg-green-100 dark:bg-green-500/15 dark:text-green-300 dark:border-green-400/40 dark:hover:bg-green-500/25 transition-colors"
                        >
                          Toggle Status
                        </button>
                        <button
                          onClick={() => handleDelete("harvest", h.id_hasil)}
                          className="text-xs px-3 py-1.5 rounded-full border bg-red-50 text-red-700 border-red-200 hover:bg-red-100 dark:bg-red-500/15 dark:text-red-300 dark:border-red-400/40 dark:hover:bg-red-500/25 transition-colors"
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))}
                  {!loading.h && harvests.length === 0 && (
                    <tr>
                      <td
                        colSpan={10}
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

          {/* ======= TABEL: TANAMAN LAHAN ======= */}
          <section className="space-y-3">
            <TableToolbar title="Tabel Tanaman Lahan" onRefresh={loadLahans} />
            <div className="overflow-auto bg-white/95 dark:bg-gray-950/80 rounded-2xl border border-gray-200/80 dark:border-gray-800/80 shadow-sm">
              <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-800 text-sm">
                <thead className="bg-gray-50/90 dark:bg-gray-900/80 sticky top-0 z-10">
                  <tr className="text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">
                    <th className="px-4 py-3 text-left">ID Tanaman Lahan</th>
                    <th className="px-4 py-3 text-left">ID Lahan</th>
                    <th className="px-4 py-3 text-left">ID Tanaman</th>
                    <th className="px-4 py-3 text-left">Tanggal</th>
                    <th className="px-4 py-3 text-left">Status</th>
                    <th className="px-4 py-3 text-center">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 dark:divide-gray-800">
                  {(loading.l ? [] : lahans).map((l) => (
                    <tr
                      key={l.id_tl}
                      className="hover:bg-gray-50 dark:hover:bg-gray-900/70 transition-colors"
                    >
                      <td className="px-4 py-3">{l.id_tl}</td>
                      <td className="px-4 py-3">{l.id_lahan}</td>
                      <td className="px-4 py-3">{l.id_tanaman}</td>
                      <td className="px-4 py-3">{l.tanggal_tanam}</td>
                      <td className="px-4 py-3">{l.status}</td>
                      <td className="px-4 py-3 text-center space-x-2">
                        <button
                          onClick={() => openEdit("lahan", l)}
                          className="text-xs px-3 py-1.5 rounded-full border bg-blue-50 text-blue-700 border-blue-200 hover:bg-blue-100 dark:bg-blue-500/15 dark:text-blue-300 dark:border-blue-400/40 dark:hover:bg-blue-500/25 transition-colors"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDelete("lahan", l.id_tl)}
                          className="text-xs px-3 py-1.5 rounded-full border bg-red-50 text-red-700 border-red-200 hover:bg-red-100 dark:bg-red-500/15 dark:text-red-300 dark:border-red-400/40 dark:hover:bg-red-500/25 transition-colors"
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))}
                  {!loading.l && lahans.length === 0 && (
                    <tr>
                      <td
                        colSpan={6}
                        className="px-4 py-4 text-center text-sm text-gray-500 dark:text-gray-400"
                      >
                        Tidak ada data tanaman lahan.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </section>

          {/* ======= TABEL: MONITORING ======= */}
          <section className="space-y-3">
            <TableToolbar title="Tabel Monitoring" onRefresh={loadMonitors} />
            <div className="overflow-auto bg-white/95 dark:bg-gray-950/80 rounded-2xl border border-gray-200/80 dark:border-gray-800/80 shadow-sm">
              <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-800 text-sm">
                <thead className="bg-gray-50/90 dark:bg-gray-900/80 sticky top-0 z-10">
                  <tr className="text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">
                    <th className="px-4 py-3 text-left">ID Monitor</th>
                    <th className="px-4 py-3 text-left">ID Lahan</th>
                    <th className="px-4 py-3 text-left">Suhu (°C)</th>
                    <th className="px-4 py-3 text-left">Kelembapan (%)</th>
                    <th className="px-4 py-3 text-left">Tanggal</th>
                    <th className="px-4 py-3 text-center">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 dark:divide-gray-800">
                  {(loading.m ? [] : monitors).map((mo) => (
                    <tr
                      key={mo.id_monitor}
                      className="hover:bg-gray-50 dark:hover:bg-gray-900/70 transition-colors"
                    >
                      <td className="px-4 py-3">{mo.id_monitor}</td>
                      <td className="px-4 py-3">{mo.id_lahan}</td>
                      <td className="px-4 py-3">{mo.suhu}</td>
                      <td className="px-4 py-3">{mo.kelembaban}</td>
                      <td className="px-4 py-3">{mo.tanggal}</td>
                      <td className="px-4 py-3 text-center space-x-2">
                        <button
                          onClick={() => openEdit("monitor", mo)}
                          className="text-xs px-3 py-1.5 rounded-full border bg-blue-50 text-blue-700 border-blue-200 hover:bg-blue-100 dark:bg-blue-500/15 dark:text-blue-300 dark:border-blue-400/40 dark:hover:bg-blue-500/25 transition-colors"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDelete("monitor", mo.id_monitor)}
                          className="text-xs px-3 py-1.5 rounded-full border bg-red-50 text-red-700 border-red-200 hover:bg-red-100 dark:bg-red-500/15 dark:text-red-300 dark:border-red-400/40 dark:hover:bg-red-500/25 transition-colors"
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))}
                  {!loading.m && monitors.length === 0 && (
                    <tr>
                      <td
                        colSpan={6}
                        className="px-4 py-4 text-center text-sm text-gray-500 dark:text-gray-400"
                      >
                        Tidak ada data monitoring.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </section>

          {/* ======= TABEL: PEMBELIAN ======= */}
          <section className="space-y-3 mb-16">
            <TableToolbar
              title="Tabel Pembelian (Recent Orders)"
              onRefresh={loadPurchases}
            />
            <div className="overflow-auto bg-white/95 dark:bg-gray-950/80 rounded-2xl border border-gray-200/80 dark:border-gray-800/80 shadow-sm">
              <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-800 text-sm">
                <thead className="bg-gray-50/90 dark:bg-gray-900/80 sticky top-0 z-10">
                  <tr className="text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">
                    <th className="px-4 py-3 text-left">ID Pembelian</th>
                    <th className="px-4 py-3 text-left">ID Pembeli</th>
                    <th className="px-4 py-3 text-left">ID Hasil</th>
                    <th className="px-4 py-3 text-left">Tanggal</th>
                    <th className="px-4 py-3 text-right">Jumlah</th>
                    <th className="px-4 py-3 text-right">Total Harga</th>
                    <th className="px-4 py-3 text-center">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 dark:divide-gray-800">
                  {(loading.p ? [] : purchases).map((p) => (
                    <tr
                      key={p.id_pembelian}
                      className="hover:bg-gray-50 dark:hover:bg-gray-900/70 transition-colors"
                    >
                      <td className="px-4 py-3">{p.id_pembelian}</td>
                      <td className="px-4 py-3">{p.id_pembeli}</td>
                      <td className="px-4 py-3">{p.id_hasil}</td>
                      <td className="px-4 py-3">{p.tanggal}</td>
                      <td className="px-4 py-3 text-right">{p.jumlah}</td>
                      <td className="px-4 py-3 text-right">
                        Rp {p.total_harga}
                      </td>
                      <td className="px-4 py-3 text-center space-x-2">
                        <button
                          onClick={() => openEdit("purchase", p)}
                          className="text-xs px-3 py-1.5 rounded-full border bg-blue-50 text-blue-700 border-blue-200 hover:bg-blue-100 dark:bg-blue-500/15 dark:text-blue-300 dark:border-blue-400/40 dark:hover:bg-blue-500/25 transition-colors"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() =>
                            handleDelete("purchase", p.id_pembelian)
                          }
                          className="text-xs px-3 py-1.5 rounded-full border bg-red-50 text-red-700 border-red-200 hover:bg-red-100 dark:bg-red-500/15 dark:text-red-300 dark:border-red-400/40 dark:hover:bg-red-500/25 transition-colors"
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))}
                  {!loading.p && purchases.length === 0 && (
                    <tr>
                      <td
                        colSpan={7}
                        className="px-4 py-4 text-center text-sm text-gray-500 dark:text-gray-400"
                      >
                        Tidak ada data pembelian.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </section>
        </main>
      </div>

      {/* EDIT MODAL */}
      <SimpleModal
        open={editOpen}
        onClose={() => setEditOpen(false)}
        title={`Edit ${editType ?? ""}`}
      >
        {current && (
          <div className="space-y-3 max-h-[60vh] overflow-auto pr-1">
            {Object.keys(current).map((k) => {
              if (k === "__meta") return null;
              return (
                <div key={k} className="flex items-center gap-3">
                  <label className="w-40 text-sm text-gray-600 dark:text-gray-300">
                    {k}
                  </label>
                  <input
                    className="flex-1 rounded-md border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 px-3 py-2 text-sm text-gray-900 dark:text-gray-100"
                    value={current[k] ?? ""}
                    onChange={(e) =>
                      setCurrent((c) => ({ ...c, [k]: e.target.value }))
                    }
                  />
                </div>
              );
            })}

            <div className="flex justify-end gap-3 mt-4">
              <button
                onClick={() => setEditOpen(false)}
                className="px-4 py-2 rounded-md border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 text-sm"
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                className="px-4 py-2 rounded-md bg-blue-600 text-white text-sm hover:bg-blue-700"
              >
                Save
              </button>
            </div>
          </div>
        )}
      </SimpleModal>
    </div>
  );
}
