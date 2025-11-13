import { BrowserRouter, Routes, Route } from "react-router-dom";
import LoginPage from "./pages/LoginPage";
import DashboardAdmin from "./pages/DashboardAdmin";
import TanamanPage from "./pages/TanamanPage";
import LahanPage from "./pages/LahanPage";
import ManagerPage from "./pages/ManagerPage";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<LoginPage />} />
        <Route path="/dashboard/admin" element={<DashboardAdmin />} />
        <Route path="/dashboard/admin/tanaman" element={<TanamanPage />} />
        <Route path="/dashboard/admin/lahan" element={<LahanPage />} />
        <Route path="/dashboard/admin/manajer" element={<ManagerPage />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
