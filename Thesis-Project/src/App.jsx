import {
  BrowserRouter as Router,
  Route,
  Routes,
  Link,
  Outlet,
} from "react-router-dom";

// --- CSS Import Update ---
import "./assets/styles/App.css";

// --- Public Page Imports (Updated Paths) ---
import PublicDashboard from "./pages/public/PublicDashboard";
import Login from "./pages/auth/Login";
import MovementMap from "./pages/public/MovementMap";
import PublicLedger from "./pages/public/PublicLedger";
import Table from "./components/common/Table";
import OutbreakStats from "./components/charts/OutbreakStats";
import SummaryReport from "./components/charts/SummaryReport";
import LandingPage from "./pages/public/LandingPage";
import Register from "./pages/auth/Register";

// --- Admin Page Imports (Updated Paths) ---
import AdminLogin from "./pages/auth/AdminLogin";
import AdminLayout from "./components/layout/AdminLayout";
import AdminOverview from "./pages/admin/AdminOverview";
import Reports from "./pages/admin/Reports";
import UserManagement from "./pages/admin/UserManagement";
import LivestockDatabase from "./pages/admin/LivestockDatabase";
import TransactionLogs from "./pages/admin/TransactionLogs";
import AlertSystem from "./pages/admin/AlertSystem";

import VetLayout from "./components/layout/VetLayout";
import VetOverview from "./pages/vet/VetOverview";
import VetTransactionLogs from "./pages/vet/VetTransactionLogs";


/**
 * PublicLayout Component
 * (Keep this logic inside App.jsx or move to src/components/layout/PublicLayout.jsx later)
 */
function PublicLayout() {
  return (
    <div className="flex flex-col min-h-screen">
      <header className="bg-[var(--green)] text-[var(--white)] w-full shadow-lg fixed top-0 left-0 z-50">
        <div className="w-full px-6 lg:px-12 py-4 flex justify-between items-center">
          <h1 className="text-3xl font-bold tracking-wide">
            Animal Disease Traceability
          </h1>
          <nav className="flex space-x-6 text-lg">
            <Link
              to="/"
              className="hover:text-[var(--light-green)] transition-all duration-200"
            >
              Home
            </Link>
            <Link
              to="/dashboard"
              className="hover:text-[var(--light-green)] transition-all duration-200"
            >
              Dashboards
            </Link>
            <Link
              to="/login"
              className="hover:text-[var(--light-green)] transition-all duration-200"
            >
              Login
            </Link>
          </nav>
        </div>
      </header>
      <main className="flex-grow flex items-center justify-center bg-gradient-to-br from-green-50 to-[var(--white)] pt-28 pb-12 px-4 sm:px-6 lg:px-12 text-center">
        <Outlet />
      </main>
      <footer className="bg-[var(--green)] text-[var(--white)] text-center py-6 w-full mt-auto">
        <p className="text-sm">
          &copy; 2025 Santa Rosa City Laguna Animal Disease Traceability. All
          rights reserved.
        </p>
      </footer>
    </div>
  );
}

/**
 * Main App Component
 */
export default function App() {
  return (
    <Router>
      <Routes>
        {/* 1. Public Routes */}
        <Route path="/" element={<PublicLayout />}>
          <Route index element={<LandingPage />} />
          <Route path="dashboard" element={<PublicDashboard />} />
          <Route path="animal-movement" element={<MovementMap />} />
          <Route path="login" element={<Login />} />
          <Route path="register" element={<Register />} />
          <Route path="TransactionsPage" element={<PublicLedger />} />

          {/* Note: In a real app, 'Table' and 'Stats' usually aren't full pages, 
              but we keep them here to preserve your current flow. */}
          <Route path="health-table" element={<Table />} />
          <Route path="outbreak-stats" element={<OutbreakStats />} />
          <Route path="summary-report" element={<SummaryReport />} />
        </Route>

        {/* 2. Admin Login Route */}
        <Route path="/adminlogin" element={<AdminLogin />} />

        {/* --- VETERINARIAN ROUTES (R2) --- */}
        <Route path="/vet" element={<VetLayout />}>
          <Route path="dashboard" element={<VetOverview />} />
          {/* You can add placeholder components for these later */}
          <Route
            path="health-records"
            element={
              <div className="text-center mt-10">
                Health Records Module (Coming Soon)
              </div>
            }
          />
          <Route
            path="transactions"
            element={<VetTransactionLogs />}
          />
          
          <Route
            path="disease-reporting"
            element={
              <div className="text-center mt-10">
                Disease Alert System (Coming Soon)
              </div>
            }
          />
        </Route>

        {/* 3. Secure Admin Routes */}
        <Route path="/admin" element={<AdminLayout />}>
          <Route path="dashboard" element={<AdminOverview />} />
          <Route path="reports" element={<Reports />} />
          <Route path="user-management" element={<UserManagement />} />
          <Route path="animal-db" element={<LivestockDatabase />} />
          <Route path="transactions" element={<TransactionLogs />} />
          <Route path="alert" element={<AlertSystem />} />
        </Route>
      </Routes>
    </Router>
  );
}
