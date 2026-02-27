import React, { useState, useEffect, useMemo } from "react";
import { fetchUsers, registerUser } from "../../config/api";
import { useNavigate } from "react-router-dom";

export default function AdminUserManagement() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);

  // --- Table Controls State ---
  const [searchQuery, setSearchQuery] = useState("");
  const [filterRole, setFilterRole] = useState("All");

  // --- 1. FETCH DATA ON LOAD ---
  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    try {
      const data = await fetchUsers();
      setUsers(data);
    } catch (error) {
      console.error("Failed to load users:", error);
    } finally {
      setLoading(false);
    }
  };

  // --- HELPER: MASK EMAIL FOR PRIVACY ---
  const maskEmail = (email) => {
    if (!email) return "N/A";
    const [namePart, domain] = email.split("@");
    if (!domain) return email; // Failsafe if it's not a real email
    if (namePart.length <= 2) return `${namePart[0]}***@${domain}`;
    return `${namePart[0]}${"*".repeat(namePart.length - 2)}${namePart[namePart.length - 1]}@${domain}`;
  };

  // --- FILTERING LOGIC ---
  const processedUsers = useMemo(() => {
    return users.filter((user) => {
      const query = searchQuery.toLowerCase();
      const matchesSearch =
        (user.firstName || "").toLowerCase().includes(query) ||
        (user.lastName || "").toLowerCase().includes(query) ||
        (user.email || "").toLowerCase().includes(query);

      const matchesRole = filterRole === "All" || user.role === filterRole;

      return matchesSearch && matchesRole;
    });
  }, [users, searchQuery, filterRole]);

  return (
    <div className="p-6 md:p-10 bg-slate-50 min-h-screen w-full font-sans">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-black text-slate-800 tracking-tight">
            Stakeholder Management
          </h1>
          <p className="text-slate-500 font-medium mt-1">
            Manage users, permissions, and network access.
          </p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="bg-[var(--green)] text-white px-6 py-3 rounded-xl hover:bg-emerald-700 transition font-bold shadow-md shadow-emerald-200 flex items-center gap-2 active:scale-95"
        >
          <span>+</span> Add New User
        </button>
      </div>

      {/* User Table Container */}
      <div className="bg-white rounded-[2.5rem] shadow-xl border border-slate-100 overflow-hidden flex flex-col">
        {/* DATA TOOLBAR */}
        <div className="p-6 border-b border-slate-100 bg-slate-50/50 flex flex-col lg:flex-row justify-between gap-4 items-center">
          {/* SEARCH */}
          <div className="relative w-full lg:w-96">
            <span className="absolute left-4 top-3 text-slate-400">🔍</span>
            <input
              type="text"
              placeholder="Search by name or email..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-11 pr-4 py-3 bg-white border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-[var(--green)] font-medium text-sm shadow-sm transition-all"
            />
          </div>

          {/* FILTERS */}
          <div className="flex gap-3 w-full lg:w-auto">
            <select
              value={filterRole}
              onChange={(e) => setFilterRole(e.target.value)}
              className="flex-1 lg:w-56 bg-white border border-slate-200 text-slate-700 py-3 px-4 rounded-xl outline-none focus:ring-2 focus:ring-[var(--green)] font-medium text-sm shadow-sm cursor-pointer"
            >
              <option value="All">All Roles</option>
              <option value="Farmer">Farmers</option>
              <option value="Veterinarian">Veterinarians</option>
              <option value="Regulator">Regulators</option>
            </select>
          </div>
        </div>

        {/* TABLE CONTENT */}
        {loading ? (
          <div className="p-16 flex flex-col items-center justify-center">
            <div className="w-10 h-10 border-4 border-emerald-500/20 border-t-emerald-500 rounded-full animate-spin mb-4"></div>
            <p className="text-slate-400 font-medium">
              Loading network stakeholders...
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead className="bg-slate-50 border-b border-slate-200">
                <tr className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                  <th className="py-5 px-6 pl-8">Account Details</th>
                  <th className="py-5 px-6">Role / Access</th>
                  <th className="py-5 px-6">Location</th>
                  <th className="py-5 px-6">Created By</th>
                  <th className="py-5 px-6">Joined Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-sm">
                {processedUsers.length === 0 ? (
                  <tr>
                    <td colSpan="5" className="p-16 text-center">
                      <div className="text-4xl mb-3 opacity-30">👥</div>
                      <p className="text-slate-500 font-bold text-lg">
                        No users found
                      </p>
                      <p className="text-slate-400 text-sm mt-1">
                        Try adjusting your search or filters.
                      </p>
                    </td>
                  </tr>
                ) : (
                  processedUsers.map((user) => (
                    <tr
                      key={user._id}
                      className="hover:bg-slate-50/60 transition-colors group"
                    >
                      <td className="py-4 px-6 pl-8">
                        <div className="font-bold text-slate-800 text-base">
                          {user.firstName} {user.lastName}
                        </div>
                        <div
                          className="text-xs text-slate-500 font-mono mt-0.5"
                          title="Email is masked for privacy"
                        >
                          {maskEmail(user.email)}
                        </div>
                      </td>
                      <td className="py-4 px-6">
                        <span
                          className={`px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest border
                          ${
                            user.role === "Farmer"
                              ? "bg-amber-50 text-amber-700 border-amber-200"
                              : user.role === "Veterinarian"
                                ? "bg-blue-50 text-blue-700 border-blue-200"
                                : "bg-purple-50 text-purple-700 border-purple-200"
                          }`}
                        >
                          {user.role}
                        </span>
                      </td>
                      <td className="py-4 px-6 font-medium text-slate-600">
                        {user.barangay}
                      </td>

                      <td className="py-4 px-6">
                        <span className="text-xs font-medium text-slate-500 bg-slate-100 px-3 py-1 rounded-full">
                          {user.createdBy || "Self-Registered"}
                        </span>
                      </td>

                      <td className="py-4 px-6 text-slate-400 font-medium text-xs">
                        {new Date(user.createdAt).toLocaleDateString(
                          undefined,
                          { year: "numeric", month: "short", day: "numeric" },
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* --- THE MODAL (POP-UP FORM) --- */}
      {showModal && (
        <AddUserModal
          onClose={() => setShowModal(false)}
          onSuccess={() => {
            setShowModal(false);
            loadUsers(); // Refresh table after adding
          }}
        />
      )}
    </div>
  );
}

// --- SUB-COMPONENT: THE MODAL FORM ---
function AddUserModal({ onClose, onSuccess }) {
  const storedUser = localStorage.getItem("user");
  let adminName = "Admin";

  if (storedUser) {
    try {
      const u = JSON.parse(storedUser);
      const profile = u.user || u;
      if (profile.firstName) {
        adminName = `Admin: ${profile.firstName} ${profile.lastName}`;
      }
    } catch (e) {
      console.error("Error parsing user from local storage", e);
    }
  }

  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    contactNumber: "",
    password: "",
    confirmPassword: "",
    role: "Farmer",
    barangay: "Aplaya",
    farmName: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const barangays = [
    "Aplaya",
    "Balibago",
    "Caingin",
    "Dila",
    "Dita",
    "Don Jose",
    "Ibaba",
    "Kanluran",
    "Labas",
    "Macabling",
    "Malitlit",
    "Malusak",
    "Market Area",
    "Pooc",
    "Pulong Santa Cruz",
    "Santo Domingo",
    "Sinalhan",
    "Tagapo",
  ];

  const handleChange = (e) =>
    setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match");
      setLoading(false);
      return;
    }

    try {
      const orgMap = {
        Farmer: "FarmerOrg",
        Veterinarian: "VetOrg",
        Regulator: "RegulatorOrg",
      };

      const payload = {
        username: formData.email,
        org: orgMap[formData.role] || "FarmerOrg",
        firstName: formData.firstName,
        lastName: formData.lastName,
        email: formData.email,
        contactNumber: formData.contactNumber,
        password: formData.password,
        role: formData.role,
        barangay: formData.barangay,
        farmName: formData.farmName,
        createdBy: adminName,
      };

      await registerUser(payload);
      alert(`Success! Account created for ${formData.firstName}.`);
      onSuccess();
    } catch (err) {
      setError(err.message || "Failed to register.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-50 animate-in fade-in zoom-in duration-200 p-4">
      <div className="bg-white rounded-[2rem] shadow-2xl w-full max-w-lg overflow-hidden flex flex-col max-h-[90vh]">
        {/* Modal Header */}
        <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50 sticky top-0 z-10">
          <h2 className="text-xl font-black text-slate-800">
            Register New Stakeholder
          </h2>
          <button
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-full bg-white border border-slate-200 text-slate-400 hover:text-red-500 hover:border-red-100 hover:bg-red-50 transition-colors font-bold"
          >
            ✕
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-8 overflow-y-auto">
          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-100 text-red-600 rounded-xl text-sm font-medium flex items-center gap-2">
              <span>⚠️</span> {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="flex gap-4">
              <div className="w-1/2">
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">
                  First Name
                </label>
                <input
                  type="text"
                  name="firstName"
                  required
                  className="w-full p-3 border-2 border-slate-100 rounded-xl outline-none focus:border-[var(--green)] font-medium transition-colors"
                  onChange={handleChange}
                />
              </div>
              <div className="w-1/2">
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">
                  Last Name
                </label>
                <input
                  type="text"
                  name="lastName"
                  required
                  className="w-full p-3 border-2 border-slate-100 rounded-xl outline-none focus:border-[var(--green)] font-medium transition-colors"
                  onChange={handleChange}
                />
              </div>
            </div>

            <div>
              <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">
                Email Address
              </label>
              <input
                type="email"
                name="email"
                required
                className="w-full p-3 border-2 border-slate-100 rounded-xl outline-none focus:border-[var(--green)] font-medium transition-colors"
                onChange={handleChange}
              />
            </div>

            <div>
              <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">
                Contact Number
              </label>
              <input
                type="text"
                name="contactNumber"
                placeholder="e.g. 09123456789"
                maxLength="11"
                required
                className="w-full p-3 border-2 border-slate-100 rounded-xl outline-none focus:border-[var(--green)] font-medium transition-colors"
                onChange={handleChange}
              />
            </div>

            <div className="flex gap-4">
              <div className="w-1/2">
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">
                  Network Role
                </label>
                <select
                  name="role"
                  className="w-full p-3 border-2 border-slate-100 rounded-xl outline-none focus:border-[var(--green)] font-bold text-slate-700 transition-colors"
                  onChange={handleChange}
                  value={formData.role}
                >
                  <option value="Farmer">Farmer</option>
                  <option value="Veterinarian">Veterinarian</option>
                  <option value="Regulator">Regulator</option>
                </select>
              </div>
              <div className="w-1/2">
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">
                  Barangay
                </label>
                <select
                  name="barangay"
                  className="w-full p-3 border-2 border-slate-100 rounded-xl outline-none focus:border-[var(--green)] font-bold text-slate-700 transition-colors"
                  onChange={handleChange}
                  value={formData.barangay}
                >
                  {barangays.map((b) => (
                    <option key={b} value={b}>
                      {b}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {formData.role === "Farmer" && (
              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">
                  Farm Name
                </label>
                <input
                  type="text"
                  name="farmName"
                  required
                  className="w-full p-3 border-2 border-emerald-100 bg-emerald-50/30 rounded-xl outline-none focus:border-[var(--green)] font-medium transition-colors"
                  onChange={handleChange}
                />
              </div>
            )}

            <div className="flex gap-4 pt-2 border-t border-slate-100">
              <div className="w-1/2">
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">
                  Password
                </label>
                <input
                  type="password"
                  name="password"
                  required
                  className="w-full p-3 border-2 border-slate-100 rounded-xl outline-none focus:border-[var(--green)] font-medium transition-colors"
                  onChange={handleChange}
                />
              </div>
              <div className="w-1/2">
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">
                  Confirm Password
                </label>
                <input
                  type="password"
                  name="confirmPassword"
                  required
                  className="w-full p-3 border-2 border-slate-100 rounded-xl outline-none focus:border-[var(--green)] font-medium transition-colors"
                  onChange={handleChange}
                />
              </div>
            </div>

            <div className="pt-6">
              <button
                type="submit"
                disabled={loading}
                className="w-full py-4 bg-[var(--green)] text-white font-black uppercase tracking-widest rounded-xl hover:bg-emerald-700 shadow-lg shadow-emerald-200 disabled:opacity-50 transition-all active:scale-[0.98]"
              >
                {loading ? "Registering on Blockchain..." : "Create Account"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
