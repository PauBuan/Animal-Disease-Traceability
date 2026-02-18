import { Outlet, Link, useNavigate, useLocation } from "react-router-dom";

export default function FarmerLayout() {
  const navigate = useNavigate();
  const location = useLocation();
  const user = localStorage.getItem("fullName") || "Farmer";

  const handleLogout = () => {
    localStorage.clear();
    navigate("/login");
  };

  const isActive = (path) =>
    location.pathname.includes(path)
      ? "bg-emerald-800 text-white shadow-lg"
      : "hover:bg-emerald-800/50 text-emerald-100";

  return (
    <div className="flex h-screen bg-slate-50">
      {/* SIDEBAR */}
      <aside className="w-64 bg-emerald-900 text-white flex flex-col shadow-2xl z-20">
        <div className="p-8 border-b border-emerald-800">
          <h1 className="text-xl font-black tracking-tight">Farmer Portal</h1>
          <p className="text-emerald-400 text-xs uppercase font-bold mt-1">
            Traceability System
          </p>
        </div>

        <nav className="flex-1 p-4 space-y-2">
          <p className="px-4 text-[10px] font-bold text-emerald-500 uppercase tracking-widest mb-2 mt-4">
            Menu
          </p>

          <Link
            to="/farmer/livestock"
            className={`block px-4 py-3 rounded-xl transition-all flex items-center gap-3 font-bold ${isActive("livestock")}`}
          >
            <span>🐷</span> <span>My Livestock</span>
          </Link>

          <Link
            to="/farmer/logistics"
            className={`block px-4 py-3 rounded-xl transition-all flex items-center gap-3 font-bold ${isActive("logistics")}`}
          >
            <span>🚚</span> <span>Logistics</span>
          </Link>
        </nav>

        <div className="p-6 border-t border-emerald-800 bg-emerald-950/30">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-full bg-emerald-500 text-white flex items-center justify-center font-black shadow-md border-2 border-emerald-400">
              {user.charAt(0)}
            </div>
            <div className="overflow-hidden">
              <p className="text-sm font-bold truncate">{user}</p>
              <p className="text-[10px] text-emerald-400 uppercase tracking-wider">
                Verified User
              </p>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="w-full bg-red-500/10 text-red-200 border border-red-500/20 py-2 rounded-lg hover:bg-red-600 hover:text-white transition text-xs font-bold uppercase tracking-wide"
          >
            Sign Out
          </button>
        </div>
      </aside>

      {/* CONTENT AREA */}
      <main className="flex-1 overflow-y-auto">
        <Outlet />
      </main>
    </div>
  );
}
