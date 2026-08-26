import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ReportPage } from './features/report/pages/ReportPage';
import { AdminDashboardPage } from './features/admin/pages/AdminDashboardPage';
import { AdminReportsPage } from './features/admin/pages/AdminReportsPage';

export function App() {
  return (
    <Router>
      <Routes>
        {/* Halaman Pelapor (User) */}
        <Route path="/" element={<ReportPage />} />

        {/* Halaman Admin Dashboard */}
        <Route path="/admin" element={<AdminDashboardPage />} />
        <Route path="/admin/dashboard" element={<AdminDashboardPage />} />
        <Route path="/admin/reports" element={<AdminReportsPage />} />

        {/* Fallback */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
}

export default App;
