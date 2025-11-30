import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";
import TopbarBuyer from "../components/TopbarBuyer";
import SidebarBuyer from "../components/SidebarBuyer";
import TableToolbar from "../components/TableToolbar";

// Modal sederhana untuk pembelian
function PurchaseModal({ open, onClose, onSubmit, availableHarvests, currentUser }) {
  const [form, setForm] = useState({
    id_hasil: "",
    id_penjual: "",
    jumlah: "",
    total_harga: "",
    tanggal: new Date().toISOString().split("T")[0],
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(form);
    setForm({
      id_hasil: "",
      id_penjual: "",
      jumlah: "",
      total_harga: "",
      tanggal: new Date().toISOString().split("T")[0],
    });
  };

  const handleHarvestChange = (e) => {
    const selectedId = parseInt(e.target.value);
    const selectedHarvest = availableHarvests.find(h => h.id_hasil === selectedId);
    
    if (selectedHarvest) {
      const total = form.jumlah ? parseFloat(form.jumlah) * parseFloat(selectedHarvest.harga_satuan) : 0;
      setForm({
        ...form,
        id_hasil: selectedId,
        id_penjual: selectedHarvest.id_pengawas || "",
        total_harga: total > 0 ? total.toFixed(2) : "",
      });
    } else {
      setForm({ ...form, id_hasil: selectedId, id_penjual: "" });
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
              value={currentUser?.id_user || ""}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-gray-100"
              readOnly
              placeholder="ID Pembeli (Auto)"
            />
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              ID Anda terisi otomatis
            </p>
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
              ID Penjual (Manager)
            </label>
            <input
              type="number"
              value={form.id_penjual}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-gray-100"
              readOnly
              placeholder="Pilih hasil panen terlebih dahulu"
            />
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              Terisi otomatis dari hasil panen yang dipilih
            </p>
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
  const [purchases, setPurchases] = useState([]);
  const [availableHarvests, setAvailableHarvests] = useState([]);
  const [purchaseModalOpen, setPurchaseModalOpen] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState({ p: false, h: false });
  // UI state for tab: 'pembelian' or 'hasilpanen'
  const [activeTab, setActiveTab] = useState("pembelian");
  // Search state
  const [searchPembelian, setSearchPembelian] = useState("");
  const [searchPanen, setSearchPanen] = useState("");
  const handleSidebarTab = (tab) => setActiveTab(tab);



  // ======= FETCH FUNCTIONS =======
  const loadPurchases = async () => {
    setLoading((prev) => ({ ...prev, p: true }));
    try {
      const res = await api.get("/pembeli/pembelian");
      setPurchases(res.data.data || res.data || []);
    } catch {
      setPurchases([]);
    } finally {
      setLoading((prev) => ({ ...prev, p: false }));
    }
  };
  const loadAvailableHarvests = async () => {
    setLoading((prev) => ({ ...prev, h: true }));
    try {
      const res = await api.get("/pembeli/hasil-panen");
      setAvailableHarvests(res.data.data || res.data || []);
    } catch {
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
    const fetchCurrentUser = async () => {
      try {
        const res = await api.get("/user/current");
        setCurrentUser(res.data);
      } catch {
        setCurrentUser(null);
      }
    };
    const loadData = async () => {
      await fetchCurrentUser();
      await loadAvailableHarvests();
      await loadPurchases();
    };
    loadData();
  }, [navigate]);

  // ======= HANDLERS =======
  const handleCreatePurchase = async (formData) => {
    try {
      if (!currentUser || !currentUser.id_user) {
        alert("User information not available. Please refresh the page.");
        return;
      }
      if (!formData.id_penjual) {
        alert("ID Penjual tidak tersedia. Pastikan Anda telah memilih hasil panen.");
        return;
      }
      const purchaseData = {
        id_pembeli: currentUser.id_user,
        id_penjual: parseInt(formData.id_penjual),
        id_hasil: parseInt(formData.id_hasil),
        id_tanaman: availableHarvests.find(h => h.id_hasil === parseInt(formData.id_hasil))?.id_tanaman || 0,
        jumlah: parseFloat(formData.jumlah),
        total_harga: parseFloat(formData.total_harga),
        tanggal: new Date(formData.tanggal).toISOString(),
        status: "Diproses",
      };
      await api.post("/pembeli", purchaseData);
      alert("Pembelian berhasil dibuat!");
      setPurchaseModalOpen(false);
      await loadPurchases();
      await loadAvailableHarvests();
    } catch (err) {
      if (err.response?.status === 401 || err.response?.status === 403) {
        alert("Session expired or unauthorized. Please login again.");
        localStorage.removeItem("token");
        navigate("/");
      } else {
        alert("Gagal membuat pembelian: " + (err.response?.data?.error || err.message));
      }
    }
  };

  // ======= FILTERED DATA BY CURRENT BUYER =======
  const buyerPurchases = purchases.filter(
    (p) => currentUser && p.id_pembeli === currentUser.id_user
  );

  // ======= PERHITUNGAN STATS =======
  const totalPurchases = buyerPurchases.length;
  const totalSpent = buyerPurchases.reduce((sum, p) => sum + (parseFloat(p.total_harga) || 0), 0);
  const totalKgPurchased = buyerPurchases.reduce((sum, p) => sum + (parseFloat(p.jumlah) || 0), 0);
  const availableProducts = availableHarvests.length;

  // ======= FILTERED DATA =======
  const filteredPurchases = buyerPurchases.filter((p) => {
    if (!searchPembelian) return true;
    const q = searchPembelian.toLowerCase();
    return (
      String(p.id_pembelian).includes(q) ||
      String(p.id_hasil).includes(q) ||
      String(p.id_penjual).includes(q) ||
      (p.status || "").toLowerCase().includes(q) ||
      (p.tanggal && new Date(p.tanggal).toLocaleDateString("id-ID").includes(q))
    );
  });
  const filteredHarvests = availableHarvests.filter((h) => {
    if (!searchPanen) return true;
    const q = searchPanen.toLowerCase();
    return (
      String(h.id_hasil).includes(q) ||
      String(h.id_tanaman).toLowerCase().includes(q) ||
      String(h.id_pengawas).includes(q) ||
      (h.kualitas || "").toLowerCase().includes(q) ||
      (h.status || "").toLowerCase().includes(q) ||
      (h.tanggal_panen && new Date(h.tanggal_panen).toLocaleDateString("id-ID").includes(q))
    );
  });

  // ======= RENDER =======
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-cyan-50 dark:from-gray-950 dark:via-gray-900 dark:to-gray-950 text-gray-900 dark:text-gray-100">
      <SidebarBuyer onTabChange={handleSidebarTab} activeTab={activeTab}/>
      <TopbarBuyer />
      <main className="ml-[260px] p-4 md:p-6 space-y-6">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white dark:bg-gray-900 border border-gray-200/80 dark:border-gray-800/80 p-5 rounded-xl shadow-sm">
            <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Total Pembelian</p>
            <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">{totalPurchases}</p>
          </div>
          <div className="bg-white dark:bg-gray-900 border border-gray-200/80 dark:border-gray-800/80 p-5 rounded-xl shadow-sm">
            <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Total Pengeluaran</p>
            <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">Rp {totalSpent.toLocaleString("id-ID")}</p>
          </div>
          <div className="bg-white dark:bg-gray-900 border border-gray-200/80 dark:border-gray-800/80 p-5 rounded-xl shadow-sm">
            <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Total Kg Dibeli</p>
            <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">{totalKgPurchased.toLocaleString("id-ID")}</p>
          </div>
          <div className="bg-white dark:bg-gray-900 border border-gray-200/80 dark:border-gray-800/80 p-5 rounded-xl shadow-sm">
            <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Produk Tersedia</p>
            <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">{availableProducts}</p>
          </div>
        </div>

        {/* Tabs for section navigation */}
        <div className="flex items-center gap-2 mt-2 mb-4">
          <button
            className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${activeTab === "pembelian" ? "bg-blue-600 text-white" : "bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-blue-100 dark:hover:bg-blue-900"}`}
            onClick={() => setActiveTab("pembelian")}
          >
            Pembelian
          </button>
          <button
            className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${activeTab === "hasilpanen" ? "bg-blue-600 text-white" : "bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-blue-100 dark:hover:bg-blue-900"}`}
            onClick={() => setActiveTab("hasilpanen")}
          >
            Hasil Panen
          </button>
          {/* Buat Pembelian Baru button - small and right-aligned */}
          {activeTab === "pembelian" && (
            <button
              onClick={() => setPurchaseModalOpen(true)}
              className="ml-auto flex items-center gap-2 px-3 py-1.5 bg-blue-500 hover:bg-blue-600 text-white text-xs font-semibold rounded-md shadow-sm transition-colors"
            >
              <span className="text-base">🛒</span>
              Buat Pembelian Baru
            </button>
          )}
        </div>

        {/* Section content */}
        <div className="bg-white dark:bg-gray-900 border border-gray-200/80 dark:border-gray-800/80 rounded-xl shadow-sm p-4">
          {/* Search bar */}
          {activeTab === "pembelian" ? (
            <>
              <div className="flex items-center mb-3 gap-2">
                <input
                  type="text"
                  value={searchPembelian}
                  onChange={e => setSearchPembelian(e.target.value)}
                  placeholder="Cari pembelian (ID, hasil, penjual, status, tanggal...)"
                  className="w-full max-w-xs px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-md bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-gray-100 text-sm"
                />
                <button
                  onClick={loadPurchases}
                  className="ml-2 px-3 py-2 text-xs rounded-md bg-gray-100 dark:bg-gray-800 border border-gray-300 dark:border-gray-700 hover:bg-blue-100 dark:hover:bg-blue-900 text-gray-700 dark:text-gray-300"
                >Refresh</button>
              </div>
              <div className="overflow-x-auto max-h-[36rem] rounded-md">
                <table className="w-full text-xs md:text-sm">
                  <thead className="bg-gray-50 dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
                    <tr>
                      <th className="px-3 py-2 text-left">ID</th>
                      <th className="px-3 py-2 text-left">Hasil Panen</th>
                      <th className="px-3 py-2 text-left">Penjual</th>
                      <th className="px-3 py-2 text-left">Jumlah (kg)</th>
                      <th className="px-3 py-2 text-left">Total Harga</th>
                      <th className="px-3 py-2 text-left">Status</th>
                      <th className="px-3 py-2 text-left">Tanggal</th>
                    </tr>
                  </thead>
                  <tbody>
                    {loading.p ? (
                      <tr>
                        <td colSpan="7" className="px-3 py-4 text-center text-gray-500">Loading...</td>
                      </tr>
                    ) : filteredPurchases.length === 0 ? (
                      <tr>
                        <td colSpan="7" className="px-3 py-4 text-center text-gray-500">Belum ada pembelian</td>
                      </tr>
                    ) : (
                      filteredPurchases.map((p) => (
                        <tr key={p.id_pembelian} className="border-b border-gray-100 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800/50">
                          <td className="px-3 py-2">{p.id_pembelian}</td>
                          <td className="px-3 py-2">{p.id_hasil}</td>
                          <td className="px-3 py-2">{p.id_penjual || "-"}</td>
                          <td className="px-3 py-2">{p.jumlah} kg</td>
                          <td className="px-3 py-2">Rp {parseFloat(p.total_harga)?.toLocaleString("id-ID") || 0}</td>
                          <td className="px-3 py-2">
                            <span className={`px-2 py-1 rounded-full text-xs ${p.status === "Diterima" ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200" : "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200"}`}>{p.status || "Diproses"}</span>
                          </td>
                          <td className="px-3 py-2">{p.tanggal ? new Date(p.tanggal).toLocaleDateString("id-ID", { day: "2-digit", month: "short", year: "numeric" }) : "-"}</td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </>
          ) : (
            <>
              <div className="flex items-center mb-3 gap-2">
                <input
                  type="text"
                  value={searchPanen}
                  onChange={e => setSearchPanen(e.target.value)}
                  placeholder="Cari hasil panen (ID, tanaman, kualitas, status, tanggal...)"
                  className="w-full max-w-xs px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-md bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-gray-100 text-sm"
                />
                <button
                  onClick={loadAvailableHarvests}
                  className="ml-2 px-3 py-2 text-xs rounded-md bg-gray-100 dark:bg-gray-800 border border-gray-300 dark:border-gray-700 hover:bg-blue-100 dark:hover:bg-blue-900 text-gray-700 dark:text-gray-300"
                >Refresh</button>
              </div>
              <div className="overflow-x-auto max-h-[36rem] rounded-md">
                <table className="w-full text-xs md:text-sm">
                  <thead className="bg-gray-50 dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
                    <tr>
                      <th className="px-3 py-2 text-left">ID</th>
                      <th className="px-3 py-2 text-left">Tanaman</th>
                      <th className="px-3 py-2 text-left">Manager</th>
                      <th className="px-3 py-2 text-left">Stok (kg)</th>
                      <th className="px-3 py-2 text-left">Kualitas</th>
                      <th className="px-3 py-2 text-left">Harga/kg</th>
                      <th className="px-3 py-2 text-left">Status</th>
                      <th className="px-3 py-2 text-left">Tanggal Panen</th>
                    </tr>
                  </thead>
                  <tbody>
                    {loading.h ? (
                      <tr>
                        <td colSpan="8" className="px-3 py-4 text-center text-gray-500">Loading...</td>
                      </tr>
                    ) : filteredHarvests.length === 0 ? (
                      <tr>
                        <td colSpan="8" className="px-3 py-4 text-center text-gray-500">Tidak ada hasil panen tersedia</td>
                      </tr>
                    ) : (
                      filteredHarvests.map((h) => (
                        <tr key={h.id_hasil} className="border-b border-gray-100 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800/50">
                          <td className="px-3 py-2">{h.id_hasil}</td>
                          <td className="px-3 py-2">{h.id_tanaman}</td>
                          <td className="px-3 py-2">{h.id_pengawas || "-"}</td>
                          <td className="px-3 py-2">{h.kuantitas} kg</td>
                          <td className="px-3 py-2">
                            <span className={`px-2 py-1 rounded-full text-xs ${h.kualitas === "A" ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200" : h.kualitas === "B" ? "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200" : "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200"}`}>{h.kualitas}</span>
                          </td>
                          <td className="px-3 py-2">Rp {parseFloat(h.harga_satuan)?.toLocaleString("id-ID") || 0}</td>
                          <td className="px-3 py-2">
                            <span className={`px-2 py-1 rounded-full text-xs ${h.status === "Siap Dijual" ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200" : h.status === "Terjual" ? "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200" : "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200"}`}>{h.status || "Menunggu Validasi"}</span>
                          </td>
                          <td className="px-3 py-2">{h.tanggal_panen ? new Date(h.tanggal_panen).toLocaleDateString("id-ID", { day: "2-digit", month: "short", year: "numeric" }) : "-"}</td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </>
          )}
        </div>

        {/* Additional Info Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
          <div className="bg-gradient-to-br from-blue-50 to-cyan-50 dark:from-blue-950/20 dark:to-cyan-950/20 border border-blue-200/50 dark:border-blue-800/50 rounded-xl p-6 shadow-sm">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-3 flex items-center gap-2">
              <span className="text-2xl">📊</span>
              Statistik Pembelian
            </h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-400">Rata-rata per Transaksi:</span>
                <span className="font-semibold text-gray-900 dark:text-gray-100">Rp {totalPurchases > 0 ? (totalSpent / totalPurchases).toLocaleString("id-ID", { maximumFractionDigits: 0 }) : 0}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-400">Rata-rata Kg per Transaksi:</span>
                <span className="font-semibold text-gray-900 dark:text-gray-100">{totalPurchases > 0 ? (totalKgPurchased / totalPurchases).toFixed(2) : 0} kg</span>
              </div>
            </div>
          </div>
          <div className="bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-950/20 dark:to-emerald-950/20 border border-green-200/50 dark:border-green-800/50 rounded-xl p-6 shadow-sm">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-3 flex items-center gap-2">
              <span className="text-2xl">💡</span>
              Tips Pembelian
            </h3>
            <ul className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
              <li className="flex items-start gap-2"><span className="text-green-600 dark:text-green-400">✓</span><span>Pilih produk dengan kualitas A untuk hasil terbaik</span></li>
              <li className="flex items-start gap-2"><span className="text-green-600 dark:text-green-400">✓</span><span>Periksa tanggal panen untuk kesegaran produk</span></li>
              <li className="flex items-start gap-2"><span className="text-green-600 dark:text-green-400">✓</span><span>Hubungi manajer untuk pemesanan dalam jumlah besar</span></li>
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
        currentUser={currentUser}
      />
    </div>
  );
}