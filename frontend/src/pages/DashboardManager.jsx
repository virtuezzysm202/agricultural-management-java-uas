import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import api from "../services/api";
import TopbarManager from "../components/TopbarManager";
import SidebarManager from "../components/SidebarManager";
import TableToolbar from "../components/TableToolbar";
import SimpleModal from "../components/SimpleModal";

export default function DashboardManager() {
  const navigate = useNavigate();
  
  // ======= STATE DATA =======
  const [harvests, setHarvests] = useState([]); // hasil_panen
  const [lahans, setLahans] = useState([]); // tanaman_lahan
  const [monitors, setMonitors] = useState([]); // monitoring
  const [purchases, setPurchases] = useState([]); // pembelian
  const [tanamans, setTanamans] = useState([]); // tanaman
  const [currentUser, setCurrentUser] = useState(null); // current logged-in user

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
  });

  // ======= FETCH FUNCTIONS =======
  const loadHarvests = async () => {
    setLoading((prev) => ({ ...prev, h: true }));
    try {
      const res = await api.get("/manager/hasil-panen");
      setHarvests(res.data.data || []);
    } catch (err) {
      console.error("Error loading harvests:", err);
      if (err.response?.status === 401 || err.response?.status === 403) {
        alert("Session expired or unauthorized. Please login again.");
        localStorage.removeItem("token");
        navigate("/");
      }
      setHarvests([]);
    } finally {
      setLoading((prev) => ({ ...prev, h: false }));
    }
  };

  const loadLahans = async () => {
    setLoading((prev) => ({ ...prev, l: true }));
    try {
      const res = await api.get("/manager/tanaman-lahan");
      setLahans(res.data.data || []);
    } catch (err) {
      console.error("Error loading tanaman lahan:", err);
      if (err.response?.status === 401 || err.response?.status === 403) {
        alert("Session expired or unauthorized. Please login again.");
        localStorage.removeItem("token");
        navigate("/");
      }
      setLahans([]);
    } finally {
      setLoading((prev) => ({ ...prev, l: false }));
    }
  };

  const loadMonitors = async () => {
    setLoading((prev) => ({ ...prev, m: true }));
    try {
      const res = await api.get("/manager/monitoring");
      setMonitors(res.data.data || []);
    } catch (err) {
      console.error("Error loading monitoring:", err);
      if (err.response?.status === 401 || err.response?.status === 403) {
        alert("Session expired or unauthorized. Please login again.");
        localStorage.removeItem("token");
        navigate("/");
      }
      setMonitors([]);
    } finally {
      setLoading((prev) => ({ ...prev, m: false }));
    }
  };

  const loadPurchases = async () => {
    setLoading((prev) => ({ ...prev, p: true }));
    try {
      const res = await api.get("/manager/pembelian");
      setPurchases(res.data.data || []);
    } catch (err) {
      console.error("Error loading pembelian:", err);
      if (err.response?.status === 401 || err.response?.status === 403) {
        alert("Session expired or unauthorized. Please login again.");
        localStorage.removeItem("token");
        navigate("/");
      }
      setPurchases([]);
    } finally {
      setLoading((prev) => ({ ...prev, p: false }));
    }
  };

  const loadTanamans = async () => {
    setLoading((prev) => ({ ...prev, t: true }));
    try {
      const res = await api.get("/manager/tanaman");
      setTanamans(res.data.data || []);
    } catch (err) {
      console.error("Error loading tanaman:", err);
      if (err.response?.status === 401 || err.response?.status === 403) {
        alert("Session expired or unauthorized. Please login again.");
        localStorage.removeItem("token");
        navigate("/");
      }
      setTanamans([]);
    } finally {
      setLoading((prev) => ({ ...prev, t: false }));
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
    
    // Fetch current user data from API to get id_user
    const fetchCurrentUser = async () => {
      try {
        const res = await api.get("/user/current");
        setCurrentUser(res.data);
        console.log("Current user from API:", res.data);
      } catch (err) {
        console.error("Failed to fetch current user:", err);
        // Fallback: try to decode token
        try {
          const payload = JSON.parse(atob(token.split('.')[1]));
          setCurrentUser(payload);
          console.log("Current user from token:", payload);
        } catch (decodeErr) {
          console.error("Failed to decode token:", decodeErr);
        }
      }
    };
    
    fetchCurrentUser();
    loadHarvests();
    loadLahans();
    loadMonitors();
    loadPurchases();
    loadTanamans();
  }, []);

  // ======= EDIT / DELETE HANDLERS =======
  const openEdit = async (type, item) => {
    setEditType(type);
    // Automatically set id_pengawas for harvest and lahan from current user
    if (type === "harvest" || type === "lahan") {
      if (currentUser && currentUser.id_user) {
        setCurrent({ ...item, id_pengawas: currentUser.id_user });
        setEditOpen(true);
      } else {
        // If currentUser not yet loaded, fetch from API
        try {
          const res = await api.get("/user/current");
          setCurrent({ ...item, id_pengawas: res.data.id_user });
          setEditOpen(true);
        } catch (err) {
          console.error("Failed to get current user in openEdit:", err);
          alert("Gagal mendapatkan data pengguna. Silakan refresh halaman.");
        }
      }
    } else {
      setCurrent(item);
      setEditOpen(true);
    }
  };

  const handleDelete = async (type, id) => {
    if (!confirm("Apakah Anda yakin ingin menghapus data ini?")) return;
    
    try {
      let endpoint = "";
      if (type === "harvest") endpoint = `/manager/hasil-panen/${id}`;
      else if (type === "lahan") endpoint = `/manager/tanaman-lahan/${id}`;
      else if (type === "monitor") endpoint = `/manager/monitoring/${id}`;
      else if (type === "purchase") endpoint = `/manager/pembelian/${id}`;

      await api.delete(endpoint);
      alert("Data berhasil dihapus");

      // Reload
      if (type === "harvest") loadHarvests();
      else if (type === "lahan") loadLahans();
      else if (type === "monitor") loadMonitors();
      else if (type === "purchase") loadPurchases();
    } catch (err) {
      console.error("Delete error:", err);
      if (err.response?.status === 401 || err.response?.status === 403) {
        alert("Session expired or unauthorized. Please login again.");
        localStorage.removeItem("token");
        navigate("/");
      } else {
        alert("Gagal menghapus data: " + (err.response?.data?.error || err.message));
      }
    }
  };

  const handleSave = async () => {
    try {
      if (editType === "harvest") {
        // Ensure id_pengawas is set before saving
        if (!current.id_pengawas || current.id_pengawas <= 0) {
          try {
            const userRes = await api.get("/user/current");
            current.id_pengawas = userRes.data.id_user;
          } catch (err) {
            console.error("Failed to get current user in handleSave:", err);
            alert("Gagal mendapatkan ID pengawas. Silakan login ulang.");
            return;
          }
        }
        
        if (current.id_hasil) {
          // Update
          await api.put(`/manager/hasil-panen/${current.id_hasil}`, current);
          alert("Hasil panen berhasil diupdate");
        } else {
          // Create
          await api.post("/manager/hasil-panen", current);
          alert("Hasil panen berhasil ditambahkan");
        }
        loadHarvests();
      } else if (editType === "lahan") {
        // Ensure id_pengawas is set before saving
        if (!current.id_pengawas || current.id_pengawas <= 0) {
          try {
            const userRes = await api.get("/user/current");
            current.id_pengawas = userRes.data.id_user;
          } catch (err) {
            console.error("Failed to get current user in handleSave:", err);
            alert("Gagal mendapatkan ID pengawas. Silakan login ulang.");
            return;
          }
        }
        
        if (current.id_tl) {
          alert("Update tanaman lahan belum tersedia");
        } else {
          // Create
          await api.post("/manager/tanaman-lahan", current);
          alert("Lahan tanaman berhasil ditambahkan");
        }
        loadLahans();
        loadTanamans(); // Refresh tanaman stock after creating lahan
      } else if (editType === "monitor") {
        if (current.id_monitor) {
          // Update
          await api.put(`/manager/monitoring/${current.id_monitor}`, current);
          alert("Monitoring berhasil diupdate");
        } else {
          // Create
          await api.post("/manager/monitoring", current);
          alert("Monitoring berhasil ditambahkan");
        }
        loadMonitors();
      } else if (editType === "purchase") {
        if (current.id_pembelian) {
          // Update
          await api.put(`/manager/pembelian/${current.id_pembelian}`, current);
          alert("Pembelian berhasil diupdate");
        }
        loadPurchases();
      }
      setEditOpen(false);
    } catch (err) {
      console.error("Save error:", err);
      if (err.response?.status === 401 || err.response?.status === 403) {
        alert("Session expired or unauthorized. Please login again.");
        localStorage.removeItem("token");
        navigate("/");
      } else {
        alert("Gagal menyimpan: " + (err.response?.data?.error || err.message));
      }
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/");
  };

  // ======= PERHITUNGAN STATS =======
  const totalLahan = lahans.filter((l) => currentUser && l.id_pengawas === currentUser.id_user).length;
  const jenisTanaman = tanamans.length;
  const totalPanenKg = harvests
    .filter((h) => currentUser && h.id_pengawas === currentUser.id_user)
    .reduce((sum, h) => sum + (h.kuantitas || 0), 0);
  const totalRevenue = purchases
    .filter((p) => currentUser && p.id_penjual === currentUser.id_user)
    .reduce((sum, p) => sum + (p.total_harga || 0), 0);

  // ======= RENDER =======
  return (
    <div className="min-h-screen xl:flex bg-gray-50 dark:bg-gray-950 text-gray-900 dark:text-gray-100 transition-colors">
      <SidebarManager />
      <div className="flex-1 xl:ml-[260px]">
        <TopbarManager />

        <main className="max-w-7xl mx-auto px-4 py-6 md:px-6 lg:px-8 lg:py-8 space-y-8">

        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white dark:bg-gray-900 border border-gray-200/80 dark:border-gray-800/80 p-5 rounded-xl shadow-sm">
            <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">
              Total Lahan
            </p>
            <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">
              {totalLahan}
            </p>
          </div>
          <div className="bg-white dark:bg-gray-900 border border-gray-200/80 dark:border-gray-800/80 p-5 rounded-xl shadow-sm">
            <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">
              Jenis Tanaman
            </p>
            <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">
              {jenisTanaman}
            </p>
          </div>
          <div className="bg-white dark:bg-gray-900 border border-gray-200/80 dark:border-gray-800/80 p-5 rounded-xl shadow-sm">
            <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">
              Total Panen (Kg)
            </p>
            <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">
              {totalPanenKg.toLocaleString("id-ID")}
            </p>
          </div>
          <div className="bg-white dark:bg-gray-900 border border-gray-200/80 dark:border-gray-800/80 p-5 rounded-xl shadow-sm">
            <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">
              Total Revenue
            </p>
            <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">
              Rp {totalRevenue.toLocaleString("id-ID")}
            </p>
          </div>
        </div>

        {/* Tables Section */}
        <style>{`
          /* Custom green scrollbar for table overflows */
          .custom-scrollbar::-webkit-scrollbar {
            height: 8px;
            background: #18181b;
          }
          .custom-scrollbar::-webkit-scrollbar-thumb {
            background: #22c55e;
            border-radius: 8px;
          }
          .custom-scrollbar {
            scrollbar-color: #22c55e #18181b;
            scrollbar-width: thin;
          }
        `}</style>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Hasil Panen Table */}
          <div className="bg-white dark:bg-gray-900 border border-gray-200/80 dark:border-gray-800/80 rounded-xl shadow-sm p-4 min-h-[22rem] min-w-[340px] max-w-full h-[420px] flex flex-col" style={{ borderTop: '4px solid #39FF14', width: '100%' }}>
            <TableToolbar title="Hasil Panen" onRefresh={loadHarvests} />
            <button
              onClick={() => openEdit("harvest", {
                id_tanaman: 0,
                id_lahan: 0,
                id_pengawas: 0, // Will be set by openEdit function
                kuantitas: 0,
                kualitas: "A",
                harga_satuan: 0,
                status: "Menunggu Validasi",
                tanggal_panen: new Date().toISOString().split("T")[0],
              })}
              className="mb-3 px-4 py-2 bg-green-600 text-white text-sm rounded-lg hover:bg-green-700 transition-colors"
            >
              + Tambah Hasil Panen
            </button>
            <div className="overflow-x-auto custom-scrollbar">
              <table className="w-full text-xs md:text-sm">
                <thead className="bg-gray-50 dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
                  <tr>
                    <th className="px-3 py-2 text-left">ID</th>
                    <th className="px-3 py-2 text-left">Tanaman</th>
                    <th className="px-3 py-2 text-left">Lahan</th>
                    <th className="px-3 py-2 text-left">Kuantitas</th>
                    <th className="px-3 py-2 text-left">Kualitas</th>
                    <th className="px-3 py-2 text-center">Status</th>
                    <th className="px-3 py-2 text-left">Aksi</th>
                  </tr>
                </thead>
                <tbody>
                  {loading.h ? (
                    <tr>
                      <td colSpan="7" className="px-3 py-4 text-center text-gray-500">
                        Loading...
                      </td>
                    </tr>
                  ) : harvests.length === 0 ? (
                    <tr>
                      <td colSpan="7" className="px-3 py-4 text-center text-gray-500">
                        Tidak ada data
                      </td>
                    </tr>
                  ) : (
                    harvests
                      .filter((h) => currentUser && h.id_pengawas === currentUser.id_user)
                      .slice(0, 5)
                      .map((h) => (
                        <tr
                          key={h.id_hasil}
                          className="border-b border-gray-100 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800/50"
                        >
                          <td className="px-3 py-2">{h.id_hasil}</td>
                          <td className="px-3 py-2">{h.id_tanaman}</td>
                          <td className="px-3 py-2">{h.id_lahan}</td>
                          <td className="px-3 py-2">{h.kuantitas} kg</td>
                          <td className="px-3 py-2">{h.kualitas}</td>
                          <td className="px-3 py-2 text-center">
                            <span
                              className={`px-2 py-1 rounded-full text-xs whitespace-nowrap max-w-[120px] overflow-hidden text-ellipsis ${
                                h.status === "Siap Dijual"
                                  ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
                                  : h.status === "Terjual"
                                  ? "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200"
                                  : "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200"
                              }`}
                              title={h.status}
                            >
                              {h.status}
                            </span>
                          </td>
                          <td className="px-3 py-2">
                            <div className="flex flex-row gap-2 justify-center">
                              <button
                                onClick={() => openEdit("harvest", h)}
                                className="text-blue-600 hover:text-blue-800"
                              >
                                Edit
                              </button>
                              <button
                                onClick={() => handleDelete("harvest", h.id_hasil)}
                                className="text-red-600 hover:text-red-800"
                              >
                                Delete
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))
                  )}
                </tbody>
              </table>
            </div>
            <div className="mt-3 text-center">
              <Link
                to="/dashboard/manager/hasil-panen"
                className="text-sm text-green-600 hover:text-green-700 font-medium"
              >
                Lihat Semua →
              </Link>
            </div>
          </div>

          {/* Lahan Tanaman Table */}
          <div className="bg-white dark:bg-gray-900 border border-gray-200/80 dark:border-gray-800/80 rounded-xl shadow-sm p-4 min-h-[22rem] min-w-[340px] max-w-full h-[420px] flex flex-col" style={{ borderTop: '4px solid #39FF14', width: '100%' }}>
            <TableToolbar title="Lahan Tanaman" onRefresh={loadLahans} />
            <button
              onClick={() => openEdit("lahan", {
                id_lahan: 0,
                id_tanaman: 0,
                id_pengawas: 0,
                jumlah_tanaman: 0,
                tanggal_tanam: new Date().toISOString().split("T")[0],
                status: "tumbuh",
              })}
              className="mb-3 px-4 py-2 bg-green-600 text-white text-sm rounded-lg hover:bg-green-700 transition-colors"
            >
              + Tambah Lahan Tanaman
            </button>
            <div className="overflow-x-auto custom-scrollbar">
              <div className="max-h-[36rem] overflow-y-auto rounded-md">
                <table className="w-full text-xs md:text-sm">
                <thead className="bg-gray-50 dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
                  <tr>
                    <th className="px-3 py-2 text-left">ID</th>
                    <th className="px-3 py-2 text-left">Lahan</th>
                    <th className="px-3 py-2 text-left">Tanaman</th>
                    <th className="px-3 py-2 text-left">Jumlah</th>
                    <th className="px-3 py-2 text-left">Tanggal Tanam</th>
                    <th className="px-3 py-2 text-left">Status</th>
                    <th className="px-3 py-2 text-left">Aksi</th>
                  </tr>
                </thead>
                <tbody>
                  {loading.l ? (
                    <tr>
                      <td colSpan="7" className="px-3 py-4 text-center text-gray-500">
                        Loading...
                      </td>
                    </tr>
                  ) : lahans.length === 0 ? (
                    <tr>
                      <td colSpan="7" className="px-3 py-4 text-center text-gray-500">
                        Tidak ada data
                      </td>
                    </tr>
                  ) : (
                    lahans
                      .filter((l) => currentUser && l.id_pengawas === currentUser.id_user)
                      .slice(0, 5)
                      .map((l) => (
                      <tr
                        key={l.id_tl}
                        className="border-b border-gray-100 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800/50"
                      >
                        <td className="px-3 py-2">{l.id_tl}</td>
                        <td className="px-3 py-2">{l.id_lahan}</td>
                        <td className="px-3 py-2">{l.id_tanaman}</td>
                        <td className="px-3 py-2">{l.jumlah_tanaman || 0} crops</td>
                        <td className="px-3 py-2">{l.tanggal_tanam}</td>
                        <td className="px-3 py-2">
                          <span className="px-2 py-1 rounded-full text-xs bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
                            {l.status}
                          </span>
                        </td>
                        <td className="px-3 py-2">
                          <button
                            onClick={() => handleDelete("lahan", l.id_tl)}
                            className="text-red-600 hover:text-red-800"
                          >
                            Delete
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
                </table>
              </div>
            </div>
            <div className="mt-3 text-center">
              <Link
                to="/dashboard/manager/tanaman-lahan"
                className="text-sm text-green-600 hover:text-green-700 font-medium"
              >
                Lihat Semua →
              </Link>
            </div>
          </div>

          {/* Monitoring Table */}
          <div className="bg-white dark:bg-gray-900 border border-gray-200/80 dark:border-gray-800/80 rounded-xl shadow-sm p-4 min-h-[22rem] min-w-[340px] max-w-full h-[420px] flex flex-col" style={{ borderTop: '4px solid #39FF14', width: '100%' }}>
            <TableToolbar title="Monitoring" onRefresh={loadMonitors} />
            <button
              onClick={() => openEdit("monitor", {
                id_lahan: 0,
                suhu: 0,
                kelembaban: 0,
                tanggal: new Date().toISOString().split("T")[0],
              })}
              className="mb-3 px-4 py-2 bg-green-600 text-white text-sm rounded-lg hover:bg-green-700 transition-colors"
            >
              + Tambah Monitoring
            </button>
            <div className="overflow-x-auto custom-scrollbar">
              <div className="max-h-[36rem] overflow-y-auto rounded-md">
                <table className="w-full text-xs md:text-sm">
                <thead className="bg-gray-50 dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
                  <tr>
                    <th className="px-3 py-2 text-left">ID</th>
                    <th className="px-3 py-2 text-left">Lahan</th>
                    <th className="px-3 py-2 text-left">Suhu (°C)</th>
                    <th className="px-3 py-2 text-left">Kelembaban (%)</th>
                    <th className="px-3 py-2 text-left">Tanggal</th>
                    <th className="px-3 py-2 text-left">Aksi</th>
                  </tr>
                </thead>
                <tbody>
                  {loading.m ? (
                    <tr>
                      <td colSpan="6" className="px-3 py-4 text-center text-gray-500">
                        Loading...
                      </td>
                    </tr>
                  ) : monitors.length === 0 ? (
                    <tr>
                      <td colSpan="6" className="px-3 py-4 text-center text-gray-500">
                        Tidak ada data
                      </td>
                    </tr>
                  ) : (
                    monitors.slice(0, 5).map((m) => (
                      <tr
                        key={m.id_monitor}
                        className="border-b border-gray-100 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800/50"
                      >
                        <td className="px-3 py-2">{m.id_monitor}</td>
                        <td className="px-3 py-2">{m.id_lahan}</td>
                        <td className="px-3 py-2">{m.suhu}</td>
                        <td className="px-3 py-2">{m.kelembaban}</td>
                        <td className="px-3 py-2">{m.tanggal}</td>
                        <td className="px-3 py-2">
                          <button
                            onClick={() => openEdit("monitor", m)}
                            className="text-blue-600 hover:text-blue-800 mr-2"
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => handleDelete("monitor", m.id_monitor)}
                            className="text-red-600 hover:text-red-800"
                          >
                            Delete
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
                </table>
              </div>
            </div>
            <div className="mt-3 text-center">
              <Link
                to="/dashboard/manager/monitoring"
                className="text-sm text-green-600 hover:text-green-700 font-medium"
              >
                Lihat Semua →
              </Link>
            </div>
          </div>

          {/* Tanaman Table */}
          <div className="bg-white dark:bg-gray-900 border border-gray-200/80 dark:border-gray-800/80 rounded-xl shadow-sm p-4 min-h-[22rem] min-w-[340px] max-w-full h-[420px] flex flex-col" style={{ borderTop: '4px solid #39FF14', width: '100%' }}>
            <TableToolbar title="Daftar Tanaman" onRefresh={loadTanamans} />
            <div className="overflow-x-auto custom-scrollbar">
              <div className="max-h-[36rem] overflow-y-auto rounded-md">
                <table className="w-full text-xs md:text-sm">
                <thead className="bg-gray-50 dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
                  <tr>
                    <th className="px-3 py-2 text-left">ID</th>
                    <th className="px-3 py-2 text-left">Nama Tanaman</th>
                    <th className="px-3 py-2 text-left">Jenis</th>
                    <th className="px-3 py-2 text-left">Jumlah</th>
                    <th className="px-3 py-2 text-left">Waktu Tanam</th>
                  </tr>
                </thead>
                <tbody>
                  {loading.t ? (
                    <tr>
                      <td colSpan="5" className="px-3 py-4 text-center text-gray-500">
                        Loading...
                      </td>
                    </tr>
                  ) : tanamans.length === 0 ? (
                    <tr>
                      <td colSpan="5" className="px-3 py-4 text-center text-gray-500">
                        Tidak ada data
                      </td>
                    </tr>
                  ) : (
                    tanamans.slice(0, 5).map((t) => (
                      <tr
                        key={t.id_tanaman}
                        className="border-b border-gray-100 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800/50"
                      >
                        <td className="px-3 py-2">{t.id_tanaman}</td>
                        <td className="px-3 py-2">{t.nama_tanaman}</td>
                        <td className="px-3 py-2">{t.jenis}</td>
                        <td className="px-3 py-2">{t.jumlah_tanaman || 0}</td>
                        <td className="px-3 py-2">
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
            </div>
            <div className="mt-3 text-center">
              <Link
                to="/dashboard/manager/daftar-tanaman"
                className="text-sm text-green-600 hover:text-green-700 font-medium"
              >
                Lihat Semua →
              </Link>
            </div>
          </div>

          {/* Pembelian Table */}
          <div className="bg-white dark:bg-gray-900 border border-gray-200/80 dark:border-gray-800/80 rounded-xl shadow-sm p-4 min-h-[22rem] min-w-[340px] max-w-full h-[420px] flex flex-col" style={{ borderTop: '4px solid #39FF14', width: '100%' }}>
            <TableToolbar title="Pembelian" onRefresh={loadPurchases} />
            <div className="overflow-x-auto custom-scrollbar">
              <div className="max-h-[36rem] overflow-y-auto rounded-md">
                <table className="w-full text-xs md:text-sm">
                <thead className="bg-gray-50 dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
                  <tr>
                    <th className="px-3 py-2 text-left">ID</th>
                    <th className="px-3 py-2 text-left">Pembeli</th>
                    <th className="px-3 py-2 text-left">Hasil</th>
                    <th className="px-3 py-2 text-left">Tanaman</th>
                    <th className="px-3 py-2 text-left">Jumlah</th>
                    <th className="px-3 py-2 text-left">Total Harga</th>
                    <th className="px-3 py-2 text-left">Status</th>
                    <th className="px-3 py-2 text-left">Tanggal</th>
                    <th className="px-3 py-2 text-left">Aksi</th>
                  </tr>
                </thead>
                <tbody>
                  {loading.p ? (
                    <tr>
                      <td colSpan="9" className="px-3 py-4 text-center text-gray-500">
                        Loading...
                      </td>
                    </tr>
                  ) : purchases.length === 0 ? (
                    <tr>
                      <td colSpan="9" className="px-3 py-4 text-center text-gray-500">
                        Tidak ada data
                      </td>
                    </tr>
                  ) : (
                    purchases
                      .filter((p) => currentUser && p.id_penjual === currentUser.id_user)
                      .slice(0, 5)
                      .map((p) => (
                        <tr
                          key={p.id_pembelian}
                          className="border-b border-gray-100 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800/50"
                        >
                          <td className="px-3 py-2">{p.id_pembelian}</td>
                          <td className="px-3 py-2">{p.id_pembeli}</td>
                          <td className="px-3 py-2">{p.id_hasil}</td>
                          <td className="px-3 py-2">{p.id_tanaman}</td>
                          <td className="px-3 py-2">{p.jumlah}</td>
                          <td className="px-3 py-2">
                            Rp {p.total_harga.toLocaleString("id-ID")}
                          </td>
                          <td className="px-3 py-2">
                            <span
                              className={`px-2 py-1 rounded-full text-xs ${
                                p.status === "Diterima"
                                  ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
                                  : "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200"
                              }`}
                            >
                              {p.status || "Diproses"}
                            </span>
                          </td>
                          <td className="px-3 py-2">{p.tanggal}</td>
                          <td className="px-3 py-2">
                            <div className="flex flex-row gap-2 justify-center">
                              <button
                                onClick={() => openEdit("purchase", p)}
                                className="text-blue-600 hover:text-blue-800"
                              >
                                Edit
                              </button>
                              <button
                                onClick={() => handleDelete("purchase", p.id_pembelian)}
                                className="text-red-600 hover:text-red-800"
                              >
                                Delete
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))
                  )}
                </tbody>
                </table>
              </div>
            </div>
            <div className="mt-3 text-center">
              <Link
                to="/dashboard/manager/pembelian"
                className="text-sm text-green-600 hover:text-green-700 font-medium"
              >
                Lihat Semua →
              </Link>
            </div>
          </div>
        </div>
      </main>

      {/* Edit/Add Modal */}
      <SimpleModal
        open={editOpen}
        onClose={() => setEditOpen(false)}
        title={
          editType === "harvest"
            ? current?.id_hasil
              ? "Edit Hasil Panen"
              : "Tambah Hasil Panen"
            : editType === "lahan"
            ? "Tambah Lahan Tanaman"
            : editType === "monitor"
            ? current?.id_monitor
              ? "Edit Monitoring"
              : "Tambah Monitoring"
            : current?.id_pembelian
            ? "Edit Pembelian"
            : "Pembelian"
        }
      >
        {current && (
          <div className="space-y-3">
            {editType === "harvest" && (
              <>
                <div>
                  <label className="block text-sm mb-1">ID Tanaman</label>
                  <input
                    type="number"
                    value={current.id_tanaman || 0}
                    onChange={(e) =>
                      setCurrent({ ...current, id_tanaman: +e.target.value })
                    }
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100"
                  />
                </div>
                <div>
                  <label className="block text-sm mb-1">ID Lahan</label>
                  <input
                    type="number"
                    value={current.id_lahan || 0}
                    onChange={(e) =>
                      setCurrent({ ...current, id_lahan: +e.target.value })
                    }
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100"
                  />
                </div>
                <div>
                  <label className="block text-sm mb-1">ID Pengawas (Auto)</label>
                  <input
                    type="text"
                    value={current.id_pengawas || "(Auto-filled from current user)"}
                    readOnly
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 cursor-not-allowed"
                    title="ID Pengawas otomatis dari user yang login"
                  />
                </div>
                <div>
                  <label className="block text-sm mb-1">Kuantitas (kg)</label>
                  <input
                    type="number"
                    value={current.kuantitas || 0}
                    onChange={(e) =>
                      setCurrent({ ...current, kuantitas: +e.target.value })
                    }
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100"
                  />
                </div>
                <div>
                  <label className="block text-sm mb-1">Kualitas</label>
                  <select
                    value={current.kualitas || "A"}
                    onChange={(e) =>
                      setCurrent({ ...current, kualitas: e.target.value })
                    }
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100"
                  >
                    <option value="A">A</option>
                    <option value="B">B</option>
                    <option value="C">C</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm mb-1">Harga Satuan</label>
                  <input
                    type="number"
                    value={current.harga_satuan || 0}
                    onChange={(e) =>
                      setCurrent({ ...current, harga_satuan: +e.target.value })
                    }
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100"
                  />
                </div>
                <div>
                  <label className="block text-sm mb-1">Status</label>
                  <select
                    value={current.status || "Menunggu Validasi"}
                    onChange={(e) =>
                      setCurrent({ ...current, status: e.target.value })
                    }
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100"
                  >
                    <option value="Menunggu Validasi">Menunggu Validasi</option>
                    <option value="Siap Dijual">Siap Dijual</option>
                    <option value="Terjual">Terjual</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm mb-1">Tanggal Panen</label>
                  <input
                    type="date"
                    value={current.tanggal_panen || ""}
                    onChange={(e) =>
                      setCurrent({ ...current, tanggal_panen: e.target.value })
                    }
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100"
                  />
                </div>
              </>
            )}

            {editType === "lahan" && (
              <>
                <div>
                  <label className="block text-sm mb-1">ID Lahan</label>
                  <input
                    type="number"
                    value={current.id_lahan || 0}
                    onChange={(e) =>
                      setCurrent({ ...current, id_lahan: +e.target.value })
                    }
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100"
                  />
                </div>
                <div>
                  <label className="block text-sm mb-1">ID Tanaman</label>
                  <input
                    type="number"
                    value={current.id_tanaman || 0}
                    onChange={(e) =>
                      setCurrent({ ...current, id_tanaman: +e.target.value })
                    }
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100"
                  />
                </div>
                <div>
                  <label className="block text-sm mb-1">ID Pengawas (Auto)</label>
                  <input
                    type="text"
                    value={current.id_pengawas || "(Auto-filled from current user)"}
                    readOnly
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 cursor-not-allowed"
                    title="ID Pengawas otomatis dari user yang login"
                  />
                </div>
                <div>
                  <label className="block text-sm mb-1">Jumlah Tanaman</label>
                  <input
                    type="number"
                    value={current.jumlah_tanaman || 0}
                    onChange={(e) =>
                      setCurrent({ ...current, jumlah_tanaman: +e.target.value })
                    }
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100"
                  />
                </div>
                <div>
                  <label className="block text-sm mb-1">Tanggal Tanam</label>
                  <input
                    type="date"
                    value={current.tanggal_tanam || ""}
                    onChange={(e) =>
                      setCurrent({ ...current, tanggal_tanam: e.target.value })
                    }
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100"
                  />
                </div>
                <div>
                  <label className="block text-sm mb-1">Status</label>
                  <select
                    value={current.status || "tumbuh"}
                    onChange={(e) =>
                      setCurrent({ ...current, status: e.target.value })
                    }
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100"
                  >
                    <option value="tumbuh">Tumbuh</option>
                    <option value="panen">Panen</option>
                    <option value="gagal">Gagal</option>
                  </select>
                </div>
              </>
            )}

            {editType === "monitor" && (
              <>
                <div>
                  <label className="block text-sm mb-1">ID Lahan</label>
                  <input
                    type="number"
                    value={current.id_lahan || 0}
                    onChange={(e) =>
                      setCurrent({ ...current, id_lahan: +e.target.value })
                    }
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100"
                  />
                </div>
                <div>
                  <label className="block text-sm mb-1">Suhu (°C)</label>
                  <input
                    type="number"
                    step="0.1"
                    value={current.suhu || 0}
                    onChange={(e) =>
                      setCurrent({ ...current, suhu: +e.target.value })
                    }
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100"
                  />
                </div>
                <div>
                  <label className="block text-sm mb-1">Kelembaban (%)</label>
                  <input
                    type="number"
                    step="0.1"
                    value={current.kelembaban || 0}
                    onChange={(e) =>
                      setCurrent({ ...current, kelembaban: +e.target.value })
                    }
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100"
                  />
                </div>
                <div>
                  <label className="block text-sm mb-1">Tanggal</label>
                  <input
                    type="date"
                    value={current.tanggal || ""}
                    onChange={(e) =>
                      setCurrent({ ...current, tanggal: e.target.value })
                    }
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100"
                  />
                </div>
              </>
            )}

            {editType === "purchase" && (
              <>
                <div>
                  <label className="block text-sm mb-1">Jumlah</label>
                  <input
                    type="number"
                    value={current.jumlah || 0}
                    onChange={(e) =>
                      setCurrent({ ...current, jumlah: +e.target.value })
                    }
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100"
                  />
                </div>
                <div>
                  <label className="block text-sm mb-1">Total Harga</label>
                  <input
                    type="number"
                    value={current.total_harga || 0}
                    onChange={(e) =>
                      setCurrent({ ...current, total_harga: +e.target.value })
                    }
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100"
                  />
                </div>
                <div>
                  <label className="block text-sm mb-1">Status</label>
                  <select
                    value={current.status || "Diproses"}
                    onChange={(e) =>
                      setCurrent({ ...current, status: e.target.value })
                    }
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100"
                  >
                    <option value="Diproses">Diproses</option>
                    <option value="Diterima">Diterima</option>
                  </select>
                </div>
              </>
            )}

            <div className="flex justify-end gap-2 mt-4">
              <button
                onClick={() => setEditOpen(false)}
                className="px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg text-sm hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
              >
                Batal
              </button>
              <button
                onClick={handleSave}
                className="px-4 py-2 bg-green-600 text-white rounded-lg text-sm hover:bg-green-700 transition-colors"
              >
                Simpan
              </button>
            </div>
          </div>
        )}
      </SimpleModal>
      </div>
    </div>
  );
}