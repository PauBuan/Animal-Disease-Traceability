import { Outlet, Link, useNavigate, useLocation } from "react-router-dom";
import "../../assets/styles/App.css";

export default function FarmerLayout() {
  const navigate = useNavigate();
  const location = useLocation();
  const user = localStorage.getItem("fullName") || "Farmer";

  const handleLogout = () => {
    localStorage.clear();
    navigate("/login");
  };

  // Using the same active logic style as the Vet layout
  const isActive = (path) =>
    location.pathname.includes(path)
      ? "bg-[var(--white)] text-[var(--green)] shadow-lg scale-105"
      : "text-[var(--white)] hover:bg-[var(--light-green)] hover:text-[var(--green)]";

  return (
    <div className="flex h-screen bg-green-50">
      {/* SIDEBAR - Using Brand Green */}
      <aside className="w-64 bg-[var(--green)] text-[var(--white)] flex flex-col shadow-2xl z-20">
        <div className="p-8 border-b border-green-700/50">
          <h1 className="text-xl font-black tracking-tight uppercase">Farmer Portal</h1>
          <p className="text-[var(--light-green)] text-[10px] uppercase font-bold tracking-widest mt-1">
            SANTA ROSA CITY
          </p>
        </div>

        <nav className="flex-1 p-4 space-y-3">
          <p className="px-4 text-[10px] font-bold text-green-300 uppercase tracking-widest mb-2 mt-4 opacity-70">
            Main Menu
          </p>

          <Link
            to="/farmer/livestock"
            className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 font-bold ${isActive("livestock")}`}
          >
            <span className="text-xl">🐷</span> <span>My Livestock</span>
          </Link>

          <Link
            to="/farmer/logistics"
            className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 font-bold ${isActive("logistics")}`}
          >
            <span className="text-xl">🚚</span> <span>Logistics</span>
          </Link>
        </nav>

        {/* User Profile & Logout Section */}
        <div className="p-6 border-t border-green-700/50 bg-black/10">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-full bg-[var(--white)] text-[var(--green)] flex items-center justify-center font-black shadow-md">
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

      {/* CONTENT AREA */}
      <main className="flex-1 overflow-y-auto bg-[url('https://www.transparenttextures.com/patterns/cubes.png')]">
        <div className="max-w-7xl mx-auto p-8">
            <Outlet />
        </div>
      </main>
    </div>
  );
}