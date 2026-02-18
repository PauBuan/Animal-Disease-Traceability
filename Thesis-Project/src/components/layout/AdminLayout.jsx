import React from "react";
import { Link, Outlet, useNavigate, useLocation } from "react-router-dom";
import "../../assets/styles/App.css";

// Using placeholder icons. You can replace these with an icon library like react-icons.
const DashboardIcon = () => <span>📊</span>;
const ReportsIcon = () => <span>📄</span>;
const UsersIcon = () => <span>👥</span>;
const ExitIcon = () => <span>📤</span>;
const LogoutIcon = () => <span>🚪</span>;

/**
 * AdminLayout Component
 * This is the main wrapper for the secure admin area.
 * It provides a sidebar for navigation and a main content area for the specific admin pages.
 */
export default function AdminLayout() {
  const navigate = useNavigate();
  const location = useLocation(); // To highlight the active link

  const handleLogout = () => {
    // In a real app, you'd clear the auth token here
    console.log("Admin logged out");
    navigate("/adminlogin");
  };

  // Helper function to determine if a link is active
  const isActive = (path) => {
    return location.pathname === path;
  };

  const linkBaseClasses =
    "flex items-center px-4 py-3 text-lg font-medium transition-all rounded-lg mx-3";
  const linkInactiveClasses =
    "text-[var(--white)] hover:bg-[var(--light-green)] hover:text-[var(--green)]";
  const linkActiveClasses =
    "bg-[var(--white)] text-[var(--green)] shadow-inner";

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Sidebar */}
      <aside className="w-64 bg-[var(--green)] text-[var(--white)] flex flex-col fixed h-full shadow-xl">
        <div className="p-5 text-center text-2xl font-bold border-b-2 border-green-700">
          <h1 className="tracking-wide">Admin Panel</h1>
        </div>
        <nav className="flex-grow mt-5 space-y-2">
          <Link
            to="/admin/dashboard"
            className={`${linkBaseClasses} ${
              isActive("/admin/dashboard")
                ? linkActiveClasses
                : linkInactiveClasses
            }`}
          >
            <DashboardIcon />
            <span className="ml-3">Dashboard</span>
          </Link>
          <Link
            to="/admin/reports"
            className={`${linkBaseClasses} ${
              isActive("/admin/reports")
                ? linkActiveClasses
                : linkInactiveClasses
            }`}
          >
            <ReportsIcon />
            <span className="ml-3">Compliance Reports</span>
          </Link>
          <Link
            to="/admin/user-management"
            className={`${linkBaseClasses} ${
              isActive("/admin/user-management")
                ? linkActiveClasses
                : linkInactiveClasses
            }`}
          >
            <UsersIcon />
            <span className="ml-3">User Management</span>
          </Link>
          <Link
            to="/admin/animal-db"
            className={`${linkBaseClasses} ${
              isActive("/admin/animal-db")
                ? linkActiveClasses
                : linkInactiveClasses
            }`}
          >
            <span className="ml-1">🗂️</span>
            <span className="ml-3">Animal Database</span>
          </Link>
          <Link
            to="/admin/transactions"
            className={`${linkBaseClasses} ${
              isActive("/admin/transactions")
                ? linkActiveClasses
                : linkInactiveClasses
            }`}
          >
            <span className="ml-1">📝</span>
            <span className="ml-3">Transaction History</span>
          </Link>
          <Link
            to="/admin/exit-permits"
            className={`${linkBaseClasses} ${
              isActive("/admin/exit-permits")
                ? linkActiveClasses
                : linkInactiveClasses
            }`}
          >
            <ExitIcon />
            <span className="ml-3">Exit Verification</span>
          </Link>
          <Link
            to="/admin/alert"
            className={`${linkBaseClasses} ${
              isActive("/admin/alert") ? linkActiveClasses : linkInactiveClasses
            }`}
          >
            <span className="ml-1">🚨</span>
            <span className="ml-3">Send Alert</span>
          </Link>
        </nav>
        <div className="p-4 border-t-2 border-green-700">
          <button
            onClick={handleLogout}
            className="flex items-center w-full px-4 py-3 text-lg text-left text-red-200 hover:bg-red-600 hover:text-white transition-all rounded-lg font-medium"
          >
            <LogoutIcon />
            <span className="ml-3">Logout</span>
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col ml-64">
        {/* Top Bar (Optional - e.g., for user profile) */}
        <header className="bg-white shadow-md p-4 flex justify-between items-center z-10">
          <h1 className="text-2xl font-semibold text-gray-800">
            Welcome, Admin
          </h1>
          {/* You could add a user dropdown here */}
        </header>

        {/* Page Content */}
        {/* Outlet renders the matched child route (AdminDashboard, AdminReports, etc.) */}
        <main className="flex-grow p-6 overflow-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
