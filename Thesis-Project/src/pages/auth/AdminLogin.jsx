import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { loginUser } from "../../config/api";

const AdminLogin = () => {
  const navigate = useNavigate();

  // State for inputs and UI feedback
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleAdminLogin = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      // 1. Call the Blockchain API
      const response = await loginUser(username, password);

      if (response.success) {
        // 2. SECURITY CHECK: Strictly enforce RegulatorMSP
        // This prevents Farmers or Vets from accessing the Admin Panel
        if (response.mspId === "RegulatorMSP") {
          console.log("Admin Login Successful");
          navigate("/admin/dashboard");
        } else {
          setError(
            "Access Denied: Account exists, but is not an Administrator."
          );
        }
      }
    } catch (err) {
      console.error("Admin Login Error:", err);
      setError(err.message || "Login failed. Check your username.");
    } finally {
      setLoading(false);
    }
  };

  const handleBack = () => {
    navigate("/");
  };

  return (
    <div className="flex flex-col min-h-screen">
      {/* ==================== HEADER ==================== */}
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

          {/* Error Message Display */}
          {error && (
            <div className="mb-4 text-center text-red-500 text-sm font-semibold bg-red-50 p-2 rounded border border-red-200">
              {error}
            </div>
          )}

          <form onSubmit={handleAdminLogin} className="space-y-5">
            <div>
              <input
                type="text"
                placeholder="Enter your admin username"
                className="w-full p-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[var(--green)]"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
              />
            </div>

            <div>
              <input
                type="password"
                placeholder="Enter your password"
                className="w-full p-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[var(--green)]"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>

            {/* Login Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-[var(--green)] text-white py-3 rounded-xl hover:bg-[var(--light-green)] hover:text-[var(--green)] transition font-medium shadow-md disabled:opacity-50"
            >
              {loading ? "Verifying Access..." : "Login as Admin"}
            </button>
          </form>

          {/* BACK BUTTON – BELOW LOGIN */}
          <button
            onClick={handleBack}
            className="w-full mt-4 bg-gray-600 text-white py-3 rounded-xl hover:bg-gray-700 transition font-medium shadow-md"
          >
            Back to Home
          </button>
        </div>
      </main>

      {/* ==================== FOOTER ==================== */}
      <footer className="bg-[var(--green)] text-[var(--white)] text-center py-6 w-full mt-auto">
        <p className="text-sm">
          © 2025 Santa Rosa City Laguna Animal Disease Traceability. All rights
          reserved.
        </p>
      </footer>
    </div>
  );
};

export default AdminLogin;
