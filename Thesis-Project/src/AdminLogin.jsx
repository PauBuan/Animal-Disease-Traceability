import React from "react";
import { useNavigate } from "react-router-dom";

/**
 * AdminLogin Component
 * This is the login page specifically for the Admin/Regulatory Personnel.
 * On successful login, it navigates to the new /admin/dashboard.
 */
const AdminLogin = () => {
  const navigate = useNavigate();

  const handleAdminLogin = (e) => {
    e.preventDefault();
    // --- Prototype simulation ---
    // In a real app, you would send credentials to the server,
    // get a token, and store it.
    console.log("Admin login attempted");

    // Simulate a successful login and redirect to the admin dashboard
    navigate("/admin/dashboard");
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 to-[var(--white)] p-4">
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
              defaultValue="admin_cvo" // Added for easy testing
              required
            />
          </div>

          <div>
            <input
              type="password"
              placeholder="Enter your password"
              className="w-full p-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[var(--green)]"
              defaultValue="adminpass" // Added for easy testing
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
    </div>
  );
};

export default AdminLogin;
