import { BrowserRouter, Routes, Route } from "react-router-dom";
import LoginPage from "./pages/LoginPage";
import DashboardAdmin from "./pages/DashboardAdmin";
import TanamanPage from "./pages/TanamanPage";
import LahanPage from "./pages/LahanPage";
import ManagerPage from "./pages/ManagerPage";
import DashboardManager from "./pages/DashboardManager";
import TanamanLahanPage from "./pages/TanamanLahanPage";
import HasilPanenPage from "./pages/HasilPanenPage";
import MonitoringPage from "./pages/MonitoringPage";
import PembelianPage from "./pages/PembelianPage";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<LoginPage />} />
        <Route path="/dashboard/admin" element={<DashboardAdmin />} />
        <Route path="/dashboard/admin/tanaman" element={<TanamanPage />} />
        <Route path="/dashboard/admin/lahan" element={<LahanPage />} />
        <Route path="/dashboard/admin/manajer" element={<ManagerPage />} />
        <Route path="/dashboard/manager" element={<DashboardManager />} />
        <Route path="/dashboard/manager/tanaman-lahan" element={<TanamanLahanPage />} />
        <Route path="/dashboard/manager/hasil-panen" element={<HasilPanenPage />} />
        <Route path="/dashboard/manager/monitoring" element={<MonitoringPage />} />
        <Route path="/dashboard/manager/pembelian" element={<PembelianPage />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
