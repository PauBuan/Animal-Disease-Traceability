// AdminLogin.jsx
import React from "react";
import { useNavigate } from "react-router-dom";

const AdminLogin = () => {
  const navigate = useNavigate();

  const handleAdminLogin = (e) => {
    e.preventDefault();
    console.log("Admin login attempted");
    // Simulate successful login
    navigate("/admin/dashboard");
  };

  return (
    <div className="flex flex-col min-h-screen">
      {/* ==================== HEADER (copied from PublicLayout) ==================== */}
      <header className="bg-[var(--green)] text-[var(--white)] w-full shadow-lg fixed top-0 left-0 z-50">
        <div className="w-full px-6 lg:px-12 py-4 flex justify-between items-center">
          <h1 className="text-3xl font-bold tracking-wide">
            Animal Disease Traceability
          </h1>
          <nav className="flex space-x-6 text-lg">
            <a
              href="/"
              className="hover:text-[var(--light-green)] transition-all duration-200"
            >
              Home
            </a>
            <a
              href="/dashboard"
              className="hover:text-[var(--light-green)] transition-all duration-200"
            >
              Dashboards
            </a>
            <a
              href="/login"
              className="hover:text-[var(--light-green)] transition-all duration-200"
            >
              Login
            </a>
          </nav>
        </div>
      </header>

      {/* ==================== MAIN CONTENT ==================== */}
      <main className="flex-grow flex items-center justify-center bg-gradient-to-br from-green-50 to-[var(--white)] pt-28 pb-12 px-4 sm:px-6 lg:px-12">
        <div className="bg-white p-8 rounded-2xl shadow-2xl w-full max-w-md border border-green-100">
          <h2 className="text-3xl font-bold text-[var(--green)] mb-6 text-center">
            Admin Login
          </h2>

          <form onSubmit={handleAdminLogin} className="space-y-5">
            <div>
              <input
                type="text"
                placeholder="Enter your admin username"
                className="w-full p-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[var(--green)]"
                defaultValue="admin_cvo"
                required
              />
            </div>

            <div>
              <input
                type="password"
                placeholder="Enter your password"
                className="w-full p-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[var(--green)]"
                defaultValue="adminpass"
                required
              />
            </div>

            <button
              type="submit"
              className="w-full bg-[var(--green)] text-white py-3 rounded-xl hover:bg-[var(--light-green)] hover:text-[var(--green)] transition font-medium shadow-md"
            >
              Login as Admin
            </button>
          </form>
        </div>
      </main>

      {/* ==================== FOOTER (copied from PublicLayout) ==================== */}
      <footer className="bg-[var(--green)] text-[var(--white)] text-center py-6 w-full mt-auto">
        <p className="text-sm">
          © 2025 Santa Rosa City Laguna Animal Disease Traceability. All
          rights reserved.
        </p>
      </footer>
    </div>
  );
};

export default AdminLogin;