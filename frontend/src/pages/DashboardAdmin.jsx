import React, { useEffect, useState } from "react";
import SidebarAdmin from "../components/SidebarAdmin";
import TopbarAdmin from "../components/TopbarAdmin";
import StatsCard from "../components/StatsCard";
import MonthlySalesChart from "../components/MonthlySalesChart";
import api from "../services/api"; // axios instance (see snippet below if belum ada)

/*
  DashboardAdmin:
  - Menampilkan statistik ringkas
  - Menampilkan grafik monthly sales (komponen MonthlySalesChart)
  - Tabel: hasil_panen, lahan, monitoring, pembelian
  - Edit & Delete sederhana via modal dan konfirmasi
  - Refresh setiap tabel
*/

function TableToolbar({ title, onRefresh }) {
  return (
    <div className="flex items-center justify-between mb-3">
      <h3 className="text-lg font-semibold">{title}</h3>
      <div className="flex items-center gap-2">
        <button
          onClick={onRefresh}
          className="px-3 py-1 rounded-md border bg-white text-sm shadow-sm hover:bg-gray-50"
        >
          Refresh
        </button>
      </div>
    </div>
  );
}

function SimpleModal({ open, onClose, title, children }) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="w-full max-w-2xl rounded-lg bg-white p-6 shadow-lg">
        <div className="flex items-center justify-between mb-4">
          <h4 className="text-lg font-semibold">{title}</h4>
          <button onClick={onClose} className="text-gray-500">
            Close
          </button>
        </div>
        <div>{children}</div>
      </div>
    </div>
  );
}

export default function DashboardAdmin() {
  // data states
  const [stats, setStats] = useState({
    totalLahan: 0,
    jenisTanaman: 0,
    manajerAktif: 0,
    totalPanenKg: 0,
  });

  const [harvests, setHarvests] = useState([]); // hasil_panen
  const [lahans, setLahans] = useState([]);
  const [monitors, setMonitors] = useState([]);
  const [purchases, setPurchases] = useState([]);

  // modal state
  const [editOpen, setEditOpen] = useState(false);
  const [editType, setEditType] = useState(null); // 'harvest'|'lahan'|'monitor'|'purchase'
  const [current, setCurrent] = useState(null);

  // loading
  const [loading, setLoading] = useState({
    h: false,
    l: false,
    m: false,
    p: false,
  });

  // fetch funcs
  const loadStats = async () => {
    try {
      // Example: replace with real endpoint /api/dashboard or compute from queries
      const res = await api.get("/dashboard/summary").catch(() => null);
      if (res && res.data) setStats(res.data);
      // fallback simple compute after loading harvests etc (done in useEffect)
    } catch (err) {
      console.error("loadStats", err);
    }
  };

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
      const res = await api.get("/lahan").catch(() => ({ data: null }));
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

  useEffect(() => {
    // initial load
    loadHarvests();
    loadLahans();
    loadMonitors();
    loadPurchases();
    loadStats();
  }, []);

  // EDIT handlers
  const openEdit = (type, item) => {
    setEditType(type);
    setCurrent({ ...item });
    setEditOpen(true);
  };

  const handleDelete = async (type, id) => {
    if (!confirm("Hapus data ini?")) return;
    try {
      // map type to endpoint
      const map = {
        harvest: "hasil_panen",
        lahan: "lahan",
        monitor: "monitoring",
        purchase: "pembelian",
      };
      await api.delete(`/${map[type]}/${id}`).catch(() => null);
      // refresh
      if (type === "harvest") loadHarvests();
      if (type === "lahan") loadLahans();
      if (type === "monitor") loadMonitors();
      if (type === "purchase") loadPurchases();
    } catch (err) {
      console.error(err);
      alert("Gagal menghapus (jika backend belum tersedia, hapus demo manual)");
    }
  };

  const handleSave = async () => {
    // save current according to editType
    try {
      const map = {
        harvest: "hasil_panen",
        lahan: "lahan",
        monitor: "monitoring",
        purchase: "pembelian",
      };
      if (!editType || !current) return;
      // if current has id -> PUT else POST
      const idField =
        editType === "harvest"
          ? "id_hasil"
          : editType === "lahan"
          ? "id_lahan"
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
      // refresh
      if (editType === "harvest") loadHarvests();
      if (editType === "lahan") loadLahans();
      if (editType === "monitor") loadMonitors();
      if (editType === "purchase") loadPurchases();
      setEditOpen(false);
    } catch (err) {
      console.error(err);
      alert("Gagal menyimpan (cek koneksi backend)");
    }
  };

  // small helper to toggle status for harvest -> 'Siap Dijual' or others
  const toggleHarvestStatus = async (h) => {
    const newStatus =
      h.status === "Siap Dijual" ? "Menunggu Validasi" : "Siap Dijual";
    if (!confirm(`Ubah status menjadi '${newStatus}' ?`)) return;
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

  // demo fallback data (dipakai bila backend tidak tersedia)
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
      id_lahan: 1,
      nama_lahan: "Lahan A",
      luas: 2.5,
      lokasi: "Desa X",
      id_pengawas: 2,
    },
    {
      id_lahan: 2,
      nama_lahan: "Lahan B",
      luas: 1.2,
      lokasi: "Desa Y",
      id_pengawas: 3,
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

  return (
    <div className="min-h-screen xl:flex bg-gray-50">
      <SidebarAdmin />
      <div className="flex-1 xl:ml-[256px]">
        <TopbarAdmin />

        <main className="p-6">
          {/* Stats row */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
            <StatsCard
              title="Total Lahan"
              value={lahans.length}
              change="-"
              up={true}
              icon={<span>🏡</span>}
            />
            <StatsCard
              title="Jenis Tanaman"
              value={stats.jenisTanaman || "—"}
              change="-"
              up={true}
              icon={<span>🌱</span>}
            />
            <StatsCard
              title="Manajer Aktif"
              value={stats.manajerAktif || "—"}
              change="-"
              up={true}
              icon={<span>👨‍🌾</span>}
            />
            <StatsCard
              title="Total Panen (kg)"
              value={
                stats.totalPanenKg ||
                harvests.reduce((s, h) => s + (h.kuantitas || 0), 0)
              }
              change="-"
              up={true}
              icon={<span>📦</span>}
            />
          </div>

          {/* Charts + Left col */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
            <div className="lg:col-span-2">
              <MonthlySalesChart />
            </div>
            <div>
              {/* MonthlyTargetCard could go here if needed */}
              <div className="rounded-2xl border border-gray-200 bg-white p-4">
                <h3 className="font-semibold mb-2">Summary Penjualan</h3>
                <p className="text-sm text-gray-500">
                  Total recent orders: {purchases.length}
                </p>
                <p className="text-sm text-gray-500">
                  Total revenue: Rp{" "}
                  {purchases.reduce((s, p) => s + (p.total_harga || 0), 0)}
                </p>
              </div>
            </div>
          </div>

          {/* Tables: Hasil Panen */}
          <section className="mb-8">
            <TableToolbar title="Tabel Hasil Panen" onRefresh={loadHarvests} />
            <div className="overflow-auto bg-white rounded-lg border">
              <table className="min-w-full divide-y">
                <thead className="bg-gray-50 sticky top-0">
                  <tr>
                    <th className="px-4 py-2 text-left text-sm">ID</th>
                    <th className="px-4 py-2 text-left text-sm">ID Tanaman</th>
                    <th className="px-4 py-2 text-left text-sm">ID Lahan</th>
                    <th className="px-4 py-2 text-left text-sm">ID Pengawas</th>
                    <th className="px-4 py-2 text-left text-sm">Tanggal</th>
                    <th className="px-4 py-2 text-right text-sm">Kuantitas</th>
                    <th className="px-4 py-2 text-left text-sm">Kualitas</th>
                    <th className="px-4 py-2 text-right text-sm">
                      Harga Satuan
                    </th>
                    <th className="px-4 py-2 text-left text-sm">Status</th>
                    <th className="px-4 py-2 text-center text-sm">Aksi</th>
                  </tr>
                </thead>
                <tbody>
                  {(loading.h ? [] : harvests).map((h) => (
                    <tr key={h.id_hasil} className="border-b last:border-b-0">
                      <td className="px-4 py-3 text-sm">{h.id_hasil}</td>
                      <td className="px-4 py-3 text-sm">{h.id_tanaman}</td>
                      <td className="px-4 py-3 text-sm">{h.id_lahan}</td>
                      <td className="px-4 py-3 text-sm">{h.id_pengawas}</td>
                      <td className="px-4 py-3 text-sm">{h.tanggal_panen}</td>
                      <td className="px-4 py-3 text-sm text-right">
                        {h.kuantitas}
                      </td>
                      <td className="px-4 py-3 text-sm">{h.kualitas}</td>
                      <td className="px-4 py-3 text-sm text-right">
                        Rp {h.harga_satuan}
                      </td>
                      <td className="px-4 py-3 text-sm">{h.status}</td>
                      <td className="px-4 py-3 text-center space-x-2">
                        <button
                          onClick={() => openEdit("harvest", h)}
                          className="text-sm px-2 py-1 bg-blue-50 text-blue-700 rounded"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => toggleHarvestStatus(h)}
                          className="text-sm px-2 py-1 bg-green-50 text-green-700 rounded"
                        >
                          Toggle Status
                        </button>
                        <button
                          onClick={() => handleDelete("harvest", h.id_hasil)}
                          className="text-sm px-2 py-1 bg-red-50 text-red-700 rounded"
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>

          {/* Tables: Lahan */}
          <section className="mb-8">
            <TableToolbar title="Tabel Lahan" onRefresh={loadLahans} />
            <div className="overflow-auto bg-white rounded-lg border">
              <table className="min-w-full divide-y">
                <thead className="bg-gray-50 sticky top-0">
                  <tr>
                    <th className="px-4 py-2 text-left text-sm">ID</th>
                    <th className="px-4 py-2 text-left text-sm">Nama Lahan</th>
                    <th className="px-4 py-2 text-left text-sm">Luas (ha)</th>
                    <th className="px-4 py-2 text-left text-sm">Lokasi</th>
                    <th className="px-4 py-2 text-left text-sm">ID Pengawas</th>
                    <th className="px-4 py-2 text-center text-sm">Aksi</th>
                  </tr>
                </thead>
                <tbody>
                  {(loading.l ? [] : lahans).map((l) => (
                    <tr key={l.id_lahan} className="border-b last:border-b-0">
                      <td className="px-4 py-3 text-sm">{l.id_lahan}</td>
                      <td className="px-4 py-3 text-sm">{l.nama_lahan}</td>
                      <td className="px-4 py-3 text-sm">{l.luas}</td>
                      <td className="px-4 py-3 text-sm">{l.lokasi}</td>
                      <td className="px-4 py-3 text-sm">{l.id_pengawas}</td>
                      <td className="px-4 py-3 text-center space-x-2">
                        <button
                          onClick={() => openEdit("lahan", l)}
                          className="text-sm px-2 py-1 bg-blue-50 text-blue-700 rounded"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDelete("lahan", l.id_lahan)}
                          className="text-sm px-2 py-1 bg-red-50 text-red-700 rounded"
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>

          {/* Tables: Monitoring */}
          <section className="mb-8">
            <TableToolbar title="Tabel Monitoring" onRefresh={loadMonitors} />
            <div className="overflow-auto bg-white rounded-lg border">
              <table className="min-w-full divide-y">
                <thead className="bg-gray-50 sticky top-0">
                  <tr>
                    <th className="px-4 py-2 text-left text-sm">ID Monitor</th>
                    <th className="px-4 py-2 text-left text-sm">ID Lahan</th>
                    <th className="px-4 py-2 text-left text-sm">Suhu (°C)</th>
                    <th className="px-4 py-2 text-left text-sm">
                      Kelembapan (%)
                    </th>
                    <th className="px-4 py-2 text-left text-sm">Tanggal</th>
                    <th className="px-4 py-2 text-center text-sm">Aksi</th>
                  </tr>
                </thead>
                <tbody>
                  {(loading.m ? [] : monitors).map((mo) => (
                    <tr
                      key={mo.id_monitor}
                      className="border-b last:border-b-0"
                    >
                      <td className="px-4 py-3 text-sm">{mo.id_monitor}</td>
                      <td className="px-4 py-3 text-sm">{mo.id_lahan}</td>
                      <td className="px-4 py-3 text-sm">{mo.suhu}</td>
                      <td className="px-4 py-3 text-sm">{mo.kelembaban}</td>
                      <td className="px-4 py-3 text-sm">{mo.tanggal}</td>
                      <td className="px-4 py-3 text-center space-x-2">
                        <button
                          onClick={() => openEdit("monitor", mo)}
                          className="text-sm px-2 py-1 bg-blue-50 text-blue-700 rounded"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDelete("monitor", mo.id_monitor)}
                          className="text-sm px-2 py-1 bg-red-50 text-red-700 rounded"
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>

          {/* Tables: Pembelian */}
          <section className="mb-16">
            <TableToolbar
              title="Tabel Pembelian (Recent Orders)"
              onRefresh={loadPurchases}
            />
            <div className="overflow-auto bg-white rounded-lg border">
              <table className="min-w-full divide-y">
                <thead className="bg-gray-50 sticky top-0">
                  <tr>
                    <th className="px-4 py-2 text-left text-sm">
                      ID Pembelian
                    </th>
                    <th className="px-4 py-2 text-left text-sm">ID Pembeli</th>
                    <th className="px-4 py-2 text-left text-sm">ID Hasil</th>
                    <th className="px-4 py-2 text-left text-sm">Tanggal</th>
                    <th className="px-4 py-2 text-right text-sm">Jumlah</th>
                    <th className="px-4 py-2 text-right text-sm">
                      Total Harga
                    </th>
                    <th className="px-4 py-2 text-center text-sm">Aksi</th>
                  </tr>
                </thead>
                <tbody>
                  {(loading.p ? [] : purchases).map((p) => (
                    <tr
                      key={p.id_pembelian}
                      className="border-b last:border-b-0"
                    >
                      <td className="px-4 py-3 text-sm">{p.id_pembelian}</td>
                      <td className="px-4 py-3 text-sm">{p.id_pembeli}</td>
                      <td className="px-4 py-3 text-sm">{p.id_hasil}</td>
                      <td className="px-4 py-3 text-sm">{p.tanggal}</td>
                      <td className="px-4 py-3 text-sm text-right">
                        {p.jumlah}
                      </td>
                      <td className="px-4 py-3 text-sm text-right">
                        Rp {p.total_harga}
                      </td>
                      <td className="px-4 py-3 text-center">
                        <button
                          onClick={() => openEdit("purchase", p)}
                          className="text-sm px-2 py-1 bg-blue-50 text-blue-700 rounded"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() =>
                            handleDelete("purchase", p.id_pembelian)
                          }
                          className="text-sm px-2 py-1 bg-red-50 text-red-700 rounded"
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))}
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
          <div className="space-y-3">
            {Object.keys(current).map((k) => {
              // skip internal or readonly keys if you want (example)
              if (k === "__meta") return null;
              return (
                <div key={k} className="flex items-center gap-3">
                  <label className="w-40 text-sm text-gray-600">{k}</label>
                  <input
                    className="flex-1 rounded border px-3 py-2"
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
                className="px-4 py-2 rounded border"
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                className="px-4 py-2 rounded bg-blue-600 text-white"
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
