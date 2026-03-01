import React, { useState } from "react";
import { Outlet, Link, useNavigate, useLocation } from "react-router-dom";
import "../../assets/styles/App.css";

export default function FarmerLayout() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const user = localStorage.getItem("fullName") || "Farmer";

  const handleLogout = () => {
    localStorage.clear();
    navigate("/login");
  };

  const isActive = (path) =>
    location.pathname.includes(path)
      ? "bg-[var(--white)] text-[var(--green)] shadow-lg scale-105"
      : "text-[var(--white)] hover:bg-[var(--light-green)] hover:text-[var(--green)]";

  return (
    <div className="flex flex-col lg:flex-row h-screen bg-green-50 overflow-hidden">
      
      {/* MOBILE HEADER (Only visible below LG) */}
      <header className="lg:hidden bg-[var(--green)] text-[var(--white)] px-6 py-4 flex justify-between items-center shadow-md z-50">
        <div>
          <h1 className="text-lg font-black tracking-tight uppercase">Farmer Portal</h1>
          <p className="text-[var(--light-green)] text-[8px] font-bold tracking-widest uppercase">Santa Rosa City</p>
        </div>

        {/* BURGER BUTTON - Matches Public Layout Animation */}
        <button 
          onClick={() => setIsMenuOpen(!isMenuOpen)}
          className="flex flex-col gap-1.5 focus:outline-none"
        >
          <div className={`w-7 h-1 bg-white transition-all duration-300 ${isMenuOpen ? 'rotate-45 translate-y-2.5' : ''}`}></div>
          <div className={`w-7 h-1 bg-white transition-all duration-300 ${isMenuOpen ? 'opacity-0' : ''}`}></div>
          <div className={`w-7 h-1 bg-white transition-all duration-300 ${isMenuOpen ? '-rotate-45 -translate-y-2.5' : ''}`}></div>
        </button>
      </header>

      {/* SIDEBAR / MOBILE MENU */}
      <aside className={`
        fixed lg:relative inset-x-0 top-0 
        lg:translate-y-0 lg:flex lg:w-64 
        bg-[var(--green)] text-[var(--white)] 
        flex flex-col shadow-2xl z-40 
        transition-all duration-500 ease-in-out
        ${isMenuOpen ? "translate-y-0 opacity-100" : "-translate-y-full opacity-0 lg:opacity-100"}
      `}>
        {/* Header - Desktop Only */}
        <div className="hidden lg:block p-8 border-b border-green-700/50">
          <h1 className="text-xl font-black tracking-tight uppercase">Farmer Portal</h1>
          <p className="text-[var(--light-green)] text-[10px] uppercase font-bold tracking-widest mt-1">
            SANTA ROSA CITY
          </p>
        </div>

        {/* Navigation Links */}
        <nav className="flex-1 p-6 lg:p-4 space-y-3 mt-16 lg:mt-0">
          <p className="px-4 text-[10px] font-bold text-green-300 uppercase tracking-widest mb-2 mt-4 opacity-70">
            Main Menu
          </p>

          <Link
            to="/farmer/livestock"
            onClick={() => setIsMenuOpen(false)}
            className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 font-bold text-sm uppercase tracking-wide ${isActive("livestock")}`}
          >
            <span className="text-xl">🐷</span> <span>My Livestock</span>
          </Link>

          <Link
            to="/farmer/logistics"
            onClick={() => setIsMenuOpen(false)}
            className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 font-bold text-sm uppercase tracking-wide ${isActive("logistics")}`}
          >
            <span className="text-xl">🚚</span> <span>Logistics</span>
          </Link>
        </nav>

        {/* User Profile & Logout Section */}
        <div className="p-6 border-t border-green-700/50 bg-black/10">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-full bg-[var(--white)] text-[var(--green)] flex items-center justify-center font-black shadow-md shrink-0">
              {user.charAt(0)}
            </div>
            <div className="overflow-hidden">
              <p className="text-sm font-bold truncate text-[var(--white)]">{user}</p>
              <p className="text-[10px] text-[var(--light-green)] uppercase tracking-wider font-bold">
                Verified Farmer
              </p>
            </div>
          </div>
          
          <button
            onClick={handleLogout}
            className="w-full flex items-center justify-center gap-2 bg-red-500 text-white py-2.5 rounded-lg hover:bg-red-600 transition-all text-xs font-bold uppercase tracking-wide shadow-lg shadow-red-900/20"
          >
            <span>🚪</span> Sign Out
          </button>
        </div>
      </aside>

      {/* OVERLAY for Mobile (closes menu when clicking background) */}
      {isMenuOpen && (
        <div 
          className="fixed inset-0 bg-black/40 backdrop-blur-sm z-30 lg:hidden"
          onClick={() => setIsMenuOpen(false)}
        />
      )}

      {/* CONTENT AREA */}
      <main className="flex-1 overflow-y-auto bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] pt-4 lg:pt-0">
        <div className="max-w-7xl mx-auto p-4 sm:p-8">
            <Outlet />
        </div>
      </main>
    </div>
  );
}