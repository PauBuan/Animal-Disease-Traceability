import React from "react";
import { Link, Outlet, useNavigate, useLocation } from "react-router-dom";
import "../../assets/styles/App.css";

// Vet-Specific Icons
const HealthIcon = () => <span>💉</span>;
const AlertIcon = () => <span>📢</span>;
const DashboardIcon = () => <span>📊</span>;
const PermitIcon = () => <span>🚑</span>;
const LogoutIcon = () => <span>🚪</span>;

export default function VetLayout() {
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    localStorage.removeItem("user");
    navigate("/login");
  };

  const isActive = (path) => location.pathname === path;

  const linkBaseClasses =
    "flex items-center px-4 py-3 text-lg font-medium transition-all rounded-lg mx-3";
  const linkInactiveClasses =
    "text-[var(--white)] hover:bg-[var(--light-green)] hover:text-[var(--green)]";
  const linkActiveClasses =
    "bg-[var(--white)] text-[var(--green)] shadow-lg scale-105";

  return (
    <div className="flex h-screen bg-green-50">
      {/* Sidebar - Updated to Brand Green */}
      <aside className="w-64 bg-[var(--green)] text-[var(--white)] flex flex-col fixed h-full shadow-2xl z-20">
        <div className="p-6 text-center border-b border-green-700/50">
          <h1 className="text-xl font-extrabold tracking-tight uppercase">
            Vet Portal
          </h1>
          <p className="text-[10px] text-[var(--light-green)] font-bold tracking-widest mt-1">
            SANTA ROSA CITY
          </p>
        </div>

        <nav className="flex-grow mt-8 space-y-3">
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

          <Link
            to="/vet/transactions"
            className={`${linkBaseClasses} ${
              isActive("/vet/transactions")
                ? linkActiveClasses
                : linkInactiveClasses
            }`}
          >
            <AlertIcon />
            <span className="ml-3">Reports</span>
          </Link>

          <Link
            to="/vet/movement-permits"
            className={`${linkBaseClasses} ${
              isActive("/vet/movement-permits")
                ? linkActiveClasses
                : linkInactiveClasses
            }`}
          >
            <PermitIcon />
            <span className="ml-3">Movement Permits</span>
          </Link>
        </nav>

        {/* Logout Section */}
        <div className="p-4 border-t border-green-700/50">
          <button
            onClick={handleLogout}
            className="flex items-center w-full px-4 py-3 text-lg text-left text-red-100 hover:bg-red-600 hover:text-white transition-all rounded-lg font-bold"
          >
            <LogoutIcon />
            <span className="ml-3">Logout</span>
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col ml-64">
        <header className="bg-white shadow-md p-4 flex justify-between items-center z-10 sticky top-0 border-b border-green-100">
          <div className="flex items-center gap-2">
            <div className="w-2 h-8 bg-[var(--green)] rounded-full"></div>
            <h1 className="text-xl font-bold text-gray-800">
              City Veterinarian{" "}
              <span className="font-normal text-gray-400"></span>
            </h1>
          </div>
          <span className="px-4 py-1 bg-green-100 text-[var(--green)] rounded-full text-xs font-black uppercase tracking-tighter">
            Verified Access
          </span>
        </header>

        <main className="flex-grow p-8 overflow-auto bg-[url('https://www.transparenttextures.com/patterns/cubes.png')]">
          <div className="max-w-7xl mx-auto">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}
