import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
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

// Modal sederhana untuk pembelian
function PurchaseModal({ open, onClose, onSubmit, availableHarvests }) {
  const [form, setForm] = useState({
    id_pembeli: "",
    id_hasil: "",
    jumlah: "",
    total_harga: "",
    tanggal: new Date().toISOString().split("T")[0],
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(form);
    setForm({
      id_pembeli: "",
      id_hasil: "",
      jumlah: "",
      total_harga: "",
      tanggal: new Date().toISOString().split("T")[0],
    });
  };

  const handleHarvestChange = (e) => {
    const selectedId = parseInt(e.target.value);
    const selectedHarvest = availableHarvests.find(h => h.id_hasil === selectedId);
    
    if (selectedHarvest && form.jumlah) {
      const total = parseFloat(form.jumlah) * parseFloat(selectedHarvest.harga_satuan);
      setForm({
        ...form,
        id_hasil: selectedId,
        total_harga: total.toFixed(2),
      });
    } else {
      setForm({ ...form, id_hasil: selectedId });
    }
  };

  const handleQuantityChange = (e) => {
    const qty = parseFloat(e.target.value) || 0;
    const selectedHarvest = availableHarvests.find(h => h.id_hasil === parseInt(form.id_hasil));
    
    if (selectedHarvest) {
      const total = qty * parseFloat(selectedHarvest.harga_satuan);
      setForm({
        ...form,
        jumlah: e.target.value,
        total_harga: total.toFixed(2),
      });
    } else {
      setForm({ ...form, jumlah: e.target.value });
    }
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
      <div className="w-full max-w-2xl rounded-2xl bg-white dark:bg-gray-950 border border-gray-200/80 dark:border-gray-800/80 p-6 shadow-[0_20px_60px_rgba(15,23,42,0.75)]">
        <div className="flex items-center justify-between mb-4">
          <h4 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
            Buat Pembelian Baru
          </h4>
          <button
            onClick={onClose}
            className="text-sm text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
          >
            Close
          </button>
        </div>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">
              ID Pembeli
            </label>
            <input
              type="number"
              value={form.id_pembeli}
              onChange={(e) => setForm({ ...form, id_pembeli: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100"
              required
              placeholder="Masukkan ID Pembeli Anda"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">
              Hasil Panen
            </label>
            <select
              value={form.id_hasil}
              onChange={handleHarvestChange}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100"
              required
            >
              <option value="">Pilih Hasil Panen</option>
              {availableHarvests.map((h) => (
                <option key={h.id_hasil} value={h.id_hasil}>
                  ID {h.id_hasil} - Tanaman {h.id_tanaman} - {h.kuantitas}kg tersedia - Rp {h.harga_satuan?.toLocaleString("id-ID")}/kg - Kualitas {h.kualitas}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">
              Jumlah (kg)
            </label>
            <input
              type="number"
              step="0.01"
              value={form.jumlah}
              onChange={handleQuantityChange}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100"
              required
              placeholder="0.00"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">
              Total Harga
            </label>
            <input
              type="number"
              step="0.01"
              value={form.total_harga}
              onChange={(e) => setForm({ ...form, total_harga: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100"
              required
              placeholder="0.00"
              readOnly
            />
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              Total dihitung otomatis berdasarkan jumlah × harga satuan
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">
              Tanggal Pembelian
            </label>
            <input
              type="date"
              value={form.tanggal}
              onChange={(e) => setForm({ ...form, tanggal: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100"
              required
            />
          </div>

          <div className="flex justify-end gap-2 mt-6">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg text-sm hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
            >
              Batal
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm hover:bg-blue-700 transition-colors"
            >
              Buat Pembelian
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function DashboardBuyer() {
  const navigate = useNavigate();
  
  // ======= STATE DATA =======
  const [purchases, setPurchases] = useState([]); // pembelian user ini
  const [availableHarvests, setAvailableHarvests] = useState([]); // hasil panen yang bisa dibeli
  const [purchaseModalOpen, setPurchaseModalOpen] = useState(false);

  // loading state
  const [loading, setLoading] = useState({
    p: false,
    h: false,
  });

  // ======= FETCH FUNCTIONS =======
  const loadPurchases = async () => {
    setLoading((prev) => ({ ...prev, p: true }));
    try {
      const res = await api.get("/pembeli/pembelian");
      console.log("Purchases response:", res.data);
      setPurchases(res.data.data || res.data || []);
    } catch (err) {
      console.error("Error loading purchases:", err);
      if (err.response?.status === 401 || err.response?.status === 403) {
        console.warn("Unauthorized access to purchases");
      }
      setPurchases([]);
    } finally {
      setLoading((prev) => ({ ...prev, p: false }));
    }
  };

  const loadAvailableHarvests = async () => {
    setLoading((prev) => ({ ...prev, h: true }));
    try {
      const res = await api.get("/pembeli/hasil-panen");
      console.log("Hasil panen response:", res.data);
      
      // Get data from response
      const harvests = res.data.data || res.data || [];
      
      // Filter only available harvests (status "Siap Dijual")
      const available = harvests.filter(h => h.status === "Siap Dijual");
      setAvailableHarvests(available);
    } catch (err) {
      console.error("Error loading available harvests:", err);
      console.warn("Could not load harvests, setting empty array");
      setAvailableHarvests([]);
    } finally {
      setLoading((prev) => ({ ...prev, h: false }));
    }
  };

  // Check authentication on mount
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      alert("Please login first");
      navigate("/");
      return;
    }
    
    // Load data sequentially to avoid race conditions
    const loadData = async () => {
      await loadAvailableHarvests();
      await loadPurchases();
    };
    
    loadData();
  }, []);

  // ======= HANDLERS =======
  const handleCreatePurchase = async (formData) => {
    try {
      const purchaseData = {
        id_pembeli: parseInt(formData.id_pembeli),
        id_hasil: parseInt(formData.id_hasil),
        jumlah: parseFloat(formData.jumlah),
        total_harga: parseFloat(formData.total_harga),
        tanggal: formData.tanggal,
      };

      console.log("Creating purchase:", purchaseData);
      const response = await api.post("/pembeli", purchaseData);
      console.log("Purchase response:", response.data);
      
      alert("Pembelian berhasil dibuat!");
      setPurchaseModalOpen(false);
      
      // Reload data
      await loadPurchases();
      await loadAvailableHarvests();
    } catch (err) {
      console.error("Create purchase error:", err);
      if (err.response?.status === 401 || err.response?.status === 403) {
        alert("Session expired or unauthorized. Please login again.");
        localStorage.removeItem("token");
        navigate("/");
      } else {
        alert("Gagal membuat pembelian: " + (err.response?.data?.error || err.message));
      }
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/");
  };

  // ======= PERHITUNGAN STATS =======
  const totalPurchases = purchases.length;
  const totalSpent = purchases.reduce((sum, p) => sum + (parseFloat(p.total_harga) || 0), 0);
  const totalKgPurchased = purchases.reduce((sum, p) => sum + (parseFloat(p.jumlah) || 0), 0);
  const availableProducts = availableHarvests.length;

  // ======= RENDER =======
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-cyan-50 dark:from-gray-950 dark:via-gray-900 dark:to-gray-950 text-gray-900 dark:text-gray-100">
      {/* Header */}
      <header className="sticky top-0 z-40 border-b border-gray-200/70 dark:border-gray-800/70 bg-white/80 dark:bg-gray-950/80 backdrop-blur-lg px-4 py-3 shadow-sm">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-400 to-cyan-600 flex items-center justify-center text-white font-bold text-sm shadow-md">
              B
            </div>
            <div>
              <h1 className="text-lg md:text-xl font-bold text-gray-900 dark:text-gray-100">
                Buyer Dashboard
              </h1>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Kelola Pembelian Hasil Panen
              </p>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="px-4 py-2 bg-red-600 text-white text-sm rounded-lg hover:bg-red-700 transition-colors"
          >
            Logout
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto p-4 md:p-6 space-y-6">
        {/* Quick Action Button - Flat and Longer */}
        <div className="w-full">
          <button
            onClick={() => setPurchaseModalOpen(true)}
            className="w-full flex items-center justify-center gap-3 px-6 py-4 bg-blue-600 dark:bg-blue-700 text-white text-sm font-semibold rounded-lg shadow-sm hover:bg-blue-700 dark:hover:bg-blue-800 transition-colors"
          >
            <span className="text-xl">🛒</span>
            <span>Buat Pembelian Baru</span>
          </button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white dark:bg-gray-900 border border-gray-200/80 dark:border-gray-800/80 p-5 rounded-xl shadow-sm">
            <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">
              Total Pembelian
            </p>
            <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">
              {totalPurchases}
            </p>
          </div>
          <div className="bg-white dark:bg-gray-900 border border-gray-200/80 dark:border-gray-800/80 p-5 rounded-xl shadow-sm">
            <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">
              Total Pengeluaran
            </p>
            <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">
              Rp {totalSpent.toLocaleString("id-ID")}
            </p>
          </div>
          <div className="bg-white dark:bg-gray-900 border border-gray-200/80 dark:border-gray-800/80 p-5 rounded-xl shadow-sm">
            <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">
              Total Kg Dibeli
            </p>
            <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">
              {totalKgPurchased.toLocaleString("id-ID")}
            </p>
          </div>
          <div className="bg-white dark:bg-gray-900 border border-gray-200/80 dark:border-gray-800/80 p-5 rounded-xl shadow-sm">
            <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">
              Produk Tersedia
            </p>
            <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">
              {availableProducts}
            </p>
          </div>
        </div>

        {/* Tables Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* My Purchases Table */}
          <div className="bg-white dark:bg-gray-900 border border-gray-200/80 dark:border-gray-800/80 rounded-xl shadow-sm p-4">
            <TableToolbar title="Riwayat Pembelian Saya" onRefresh={loadPurchases} />
            <div className="overflow-x-auto">
              <table className="w-full text-xs md:text-sm">
                <thead className="bg-gray-50 dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
                  <tr>
                    <th className="px-3 py-2 text-left">ID</th>
                    <th className="px-3 py-2 text-left">ID Hasil</th>
                    <th className="px-3 py-2 text-left">Jumlah (kg)</th>
                    <th className="px-3 py-2 text-left">Total Harga</th>
                    <th className="px-3 py-2 text-left">Tanggal</th>
                  </tr>
                </thead>
                <tbody>
                  {loading.p ? (
                    <tr>
                      <td colSpan="5" className="px-3 py-4 text-center text-gray-500">
                        Loading...
                      </td>
                    </tr>
                  ) : purchases.length === 0 ? (
                    <tr>
                      <td colSpan="5" className="px-3 py-4 text-center text-gray-500">
                        Belum ada pembelian
                      </td>
                    </tr>
                  ) : (
                    purchases.map((p) => (
                      <tr
                        key={p.id_pembelian}
                        className="border-b border-gray-100 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800/50"
                      >
                        <td className="px-3 py-2">{p.id_pembelian}</td>
                        <td className="px-3 py-2">{p.id_hasil}</td>
                        <td className="px-3 py-2">{p.jumlah} kg</td>
                        <td className="px-3 py-2">
                          Rp {parseFloat(p.total_harga)?.toLocaleString("id-ID") || 0}
                        </td>
                        <td className="px-3 py-2">
                          {p.tanggal
                            ? new Date(p.tanggal).toLocaleDateString("id-ID", {
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
          </div>

          {/* Available Harvests Table */}
          <div className="bg-white dark:bg-gray-900 border border-gray-200/80 dark:border-gray-800/80 rounded-xl shadow-sm p-4">
            <TableToolbar title="Hasil Panen Tersedia" onRefresh={loadAvailableHarvests} />
            <div className="overflow-x-auto">
              <table className="w-full text-xs md:text-sm">
                <thead className="bg-gray-50 dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
                  <tr>
                    <th className="px-3 py-2 text-left">ID</th>
                    <th className="px-3 py-2 text-left">Tanaman</th>
                    <th className="px-3 py-2 text-left">Stok (kg)</th>
                    <th className="px-3 py-2 text-left">Kualitas</th>
                    <th className="px-3 py-2 text-left">Harga/kg</th>
                    <th className="px-3 py-2 text-left">Tanggal Panen</th>
                  </tr>
                </thead>
                <tbody>
                  {loading.h ? (
                    <tr>
                      <td colSpan="6" className="px-3 py-4 text-center text-gray-500">
                        Loading...
                      </td>
                    </tr>
                  ) : availableHarvests.length === 0 ? (
                    <tr>
                      <td colSpan="6" className="px-3 py-4 text-center text-gray-500">
                        Tidak ada hasil panen tersedia
                      </td>
                    </tr>
                  ) : (
                    availableHarvests.map((h) => (
                      <tr
                        key={h.id_hasil}
                        className="border-b border-gray-100 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800/50"
                      >
                        <td className="px-3 py-2">{h.id_hasil}</td>
                        <td className="px-3 py-2">{h.id_tanaman}</td>
                        <td className="px-3 py-2">{h.kuantitas} kg</td>
                        <td className="px-3 py-2">
                          <span
                            className={`px-2 py-1 rounded-full text-xs ${
                              h.kualitas === "A"
                                ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
                                : h.kualitas === "B"
                                ? "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200"
                                : "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200"
                            }`}
                          >
                            {h.kualitas}
                          </span>
                        </td>
                        <td className="px-3 py-2">
                          Rp {parseFloat(h.harga_satuan)?.toLocaleString("id-ID") || 0}
                        </td>
                        <td className="px-3 py-2">
                          {h.tanggal_panen
                            ? new Date(h.tanggal_panen).toLocaleDateString("id-ID", {
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
          </div>
        </div>

        {/* Additional Info Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-gradient-to-br from-blue-50 to-cyan-50 dark:from-blue-950/20 dark:to-cyan-950/20 border border-blue-200/50 dark:border-blue-800/50 rounded-xl p-6 shadow-sm">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-3 flex items-center gap-2">
              <span className="text-2xl">📊</span>
              Statistik Pembelian
            </h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-400">Rata-rata per Transaksi:</span>
                <span className="font-semibold text-gray-900 dark:text-gray-100">
                  Rp {totalPurchases > 0 ? (totalSpent / totalPurchases).toLocaleString("id-ID", { maximumFractionDigits: 0 }) : 0}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-400">Rata-rata Kg per Transaksi:</span>
                <span className="font-semibold text-gray-900 dark:text-gray-100">
                  {totalPurchases > 0 ? (totalKgPurchased / totalPurchases).toFixed(2) : 0} kg
                </span>
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-950/20 dark:to-emerald-950/20 border border-green-200/50 dark:border-green-800/50 rounded-xl p-6 shadow-sm">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-3 flex items-center gap-2">
              <span className="text-2xl">💡</span>
              Tips Pembelian
            </h3>
            <ul className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
              <li className="flex items-start gap-2">
                <span className="text-green-600 dark:text-green-400">✓</span>
                <span>Pilih produk dengan kualitas A untuk hasil terbaik</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-green-600 dark:text-green-400">✓</span>
                <span>Periksa tanggal panen untuk kesegaran produk</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-green-600 dark:text-green-400">✓</span>
                <span>Hubungi manajer untuk pemesanan dalam jumlah besar</span>
              </li>
            </ul>
          </div>
        </div>
      </main>

      {/* Purchase Modal */}
      <PurchaseModal
        open={purchaseModalOpen}
        onClose={() => setPurchaseModalOpen(false)}
        onSubmit={handleCreatePurchase}
        availableHarvests={availableHarvests}
      />
    </div>
  );
}