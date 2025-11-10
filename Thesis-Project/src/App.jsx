import {
  BrowserRouter as Router,
  Route,
  Routes,
  Link,
  Outlet, // Import Outlet to render nested routes
} from "react-router-dom";

// --- Public Page Imports ---
import Dashboard from "./Dashboard";
import Login from "./login";
import AnimalMovement from "./AnimalMovement";
import TransactionsPage from "./TransactionsPage";

// --- Admin Page Imports ---
import AdminLogin from "./AdminLogin";
import AdminLayout from "./AdminLayout";
import AdminDashboard from "./AdminDashboard";
import AdminReports from "./AdminReports";
import AdminUserManagement from "./AdminUserManagement";

/**
 * PublicLayout Component
 * Wraps all public-facing pages with the main header and footer.
 */
function PublicLayout() {
  return (
    <div className="flex flex-col min-h-screen">
      {/* HEADER */}
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

      {/* MAIN CONTENT - Renders the specific page */}
      <main className="flex-grow flex items-center justify-center bg-gradient-to-br from-green-50 to-[var(--white)] pt-28 pb-12 px-4 sm:px-6 lg:px-12 text-center">
        {/* Outlet renders the matched child route (e.g., HomePage, Dashboard, TransactionsPage) */}
        <Outlet />
      </main>

      {/* FOOTER */}
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
 * HomePage Component
 */
function HomePage() {
  return (
    <div className="w-full max-w-5xl">
      <h2 className="text-5xl font-extrabold text-[var(--green)] mb-6 leading-tight">
        Secure Animal Disease Tracking with Blockchain
      </h2>
      <p className="text-xl text-gray-700 mb-8 leading-relaxed">
        A website where you can explore an animal database, track livestock
        movements, and view statistics on food safety and disease trends.
        Designed specifically for Santa Rosa, Laguna, this platform provides
        real-time insights into local livestock health and supports farmers with
        actionable data. Enhance your understanding of regional food supply
        chains and contribute to a safer community with our comprehensive
        tracking tools.
      </p>
      <div className="flex flex-col sm:flex-row justify-center space-y-4 sm:space-y-0 sm:space-x-4">
        <Link to="/dashboard">
          <button className="bg-[var(--green)] text-[var(--white)] px-8 py-3 rounded-xl shadow-lg hover:bg-[var(--light-green)] hover:text-[var(--green)] transition-all duration-300 font-semibold">
            See Dashboards
          </button>
        </Link>
      </div>
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
        {/* All routes within <PublicLayout> will have the main header/footer */}
        <Route path="/" element={<PublicLayout />}>
          <Route index element={<HomePage />} />
          <Route path="dashboard" element={<Dashboard />} />
          <Route path="animal-movement" element={<AnimalMovement />} />
          <Route path="login" element={<Login />} />
          <Route path="TransactionsPage" element={<TransactionsPage />} />
        </Route>

        {/* 2. Admin Login Route */}
        <Route path="/adminlogin" element={<AdminLogin />} />

        {/* 3. Secure Admin Routes */}
        <Route path="/admin" element={<AdminLayout />}>
          <Route path="dashboard" element={<AdminDashboard />} />
          <Route path="reports" element={<AdminReports />} />
          <Route path="user-management" element={<AdminUserManagement />} />
        </Route>
      </Routes>
    </Router>
  );
}
