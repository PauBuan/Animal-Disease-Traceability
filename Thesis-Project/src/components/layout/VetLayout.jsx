import React from "react";
import { Link, Outlet, useNavigate, useLocation } from "react-router-dom";
import "../../assets/styles/App.css";

// Vet-Specific Icons (Placeholders)
const HealthIcon = () => <span>💉</span>;
const AlertIcon = () => <span>📢</span>;
const DashboardIcon = () => <span>📊</span>;
const LogoutIcon = () => <span>🚪</span>;

export default function VetLayout() {
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    navigate("/login");
  };

  const isActive = (path) => location.pathname === path;

  const linkBaseClasses =
    "flex items-center px-4 py-3 text-lg font-medium transition-all rounded-lg mx-3";
  const linkInactiveClasses =
    "text-[var(--white)] hover:bg-[var(--light-green)] hover:text-[var(--green)]";
  const linkActiveClasses =
    "bg-[var(--white)] text-[var(--green)] shadow-inner";

  return (
    <div className="flex h-screen bg-green-50">
      {/* Sidebar - Distinct Color for Vets (Teal-Green instead of Standard Green?) */}
      <aside className="w-64 bg-teal-700 text-[var(--white)] flex flex-col fixed h-full shadow-xl z-20">
        <div className="p-5 text-center text-xl font-bold border-b-2 border-teal-800">
          <h1>Veterinary Access</h1>
        </div>

        <nav className="flex-grow mt-5 space-y-2">
          <Link
            to="/vet/dashboard"
            className={`${linkBaseClasses} ${
              isActive("/vet/dashboard")
                ? linkActiveClasses
                : linkInactiveClasses
            }`}
          >
            <DashboardIcon />
            <span className="ml-3">Overview</span>
          </Link>

          {/* Thesis Module: Animal Identity & Health Record  */}
          <Link
            to="/vet/health-records"
            className={`${linkBaseClasses} ${
              isActive("/vet/health-records")
                ? linkActiveClasses
                : linkInactiveClasses
            }`}
          >
            <HealthIcon />
            <span className="ml-3">Health Records</span>
          </Link>

          {/* Thesis Module: Disease Alert System  */}
          <Link
            to="/vet/disease-reporting"
            className={`${linkBaseClasses} ${
              isActive("/vet/disease-reporting")
                ? linkActiveClasses
                : linkInactiveClasses
            }`}
          >
            <AlertIcon />
            <span className="ml-3">Report Outbreak</span>
          </Link>
        </nav>

        <div className="p-4 border-t-2 border-teal-800 bg-teal-700">
          <button
            onClick={handleLogout}
            className="flex items-center w-full px-4 py-3 text-lg text-left text-red-200 hover:bg-red-500 hover:text-white transition-all rounded-lg font-medium"
          >
            <LogoutIcon />
            <span className="ml-3">Logout</span>
          </button>
        </div>
      </aside>

      <div className="flex-1 flex flex-col ml-64">
        <header className="bg-white shadow-sm p-4 flex justify-between items-center z-10 sticky top-0">
          <h1 className="text-xl font-semibold text-gray-800">
            Dr. Santos (City Vet)
          </h1>
          <span className="px-3 py-1 bg-teal-100 text-teal-800 rounded-full text-sm font-bold">
            Authorized
          </span>
        </header>
        <main className="flex-grow p-6 overflow-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
