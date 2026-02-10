import React, { useState, useEffect } from "react";
import { fetchUsers, registerUser } from "../../config/api";
import { useNavigate } from "react-router-dom";

export default function AdminUserManagement() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);

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

  return (
    <div className="container mx-auto p-4">
      {/* Header Section */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">
            Stakeholder Management
          </h1>
          <p className="text-gray-600 mt-1">
            Manage users and permissions for the Hyperledger Fabric network.
          </p>
        </div>
        <button
          onClick={() => setShowModal(true)} // Opens the Modal
          className="bg-[var(--green)] text-white px-5 py-2 rounded-xl hover:bg-[var(--light-green)] hover:text-[var(--green)] transition font-medium shadow-md flex items-center gap-2"
        >
          <span>+</span> Add New User
        </button>
      </div>

      {/* User Table */}
      <div className="bg-white p-6 rounded-2xl shadow-lg overflow-hidden">
        {loading ? (
          <div className="text-center py-10 text-gray-500">
            Loading users...
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b-2 border-gray-200 text-gray-600 uppercase text-sm">
                  <th className="py-3 px-4">Name</th>
                  <th className="py-3 px-4">Role</th>
                  <th className="py-3 px-4">Organization</th>
                  <th className="py-3 px-4">Created By</th> {/* NEW COLUMN */}
                  <th className="py-3 px-4">Joined</th>
                </tr>
              </thead>
              <tbody>
                {users.length === 0 ? (
                  <tr>
                    <td colSpan="5" className="text-center py-6 text-gray-500">
                      No users found.
                    </td>
                  </tr>
                ) : (
                  users.map((user) => (
                    <tr
                      key={user._id}
                      className="border-b border-gray-100 hover:bg-gray-50 transition"
                    >
                      <td className="py-3 px-4">
                        <div className="font-medium text-gray-900">
                          {user.firstName} {user.lastName}
                        </div>
                        <div className="text-xs text-gray-500">
                          {user.email}
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <span
                          className={`px-3 py-1 rounded-full text-xs font-semibold
                          ${
                            user.role === "Farmer"
                              ? "bg-yellow-100 text-yellow-800"
                              : user.role === "Veterinarian"
                                ? "bg-blue-100 text-blue-800"
                                : "bg-purple-100 text-purple-800"
                          }`}
                        >
                          {user.role}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-sm text-gray-600">
                        {user.barangay}
                      </td>

                      {/* NEW: Created By Logic */}
                      <td className="py-3 px-4 text-sm">
                        <span className="text-gray-500 italic">
                          {user.createdBy || "Self-Registered"}
                        </span>
                      </td>

                      <td className="py-3 px-4 text-sm text-gray-500">
                        {new Date(user.createdAt).toLocaleDateString()}
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
// This contains the exact logic from Register.jsx but adapted for a pop-up
function AddUserModal({ onClose, onSuccess }) {
  // Get current Admin info from localStorage to tag the creator
  const storedUser = localStorage.getItem("user");
  let adminName = "Admin";

  if (storedUser) {
    try {
      const u = JSON.parse(storedUser);
      // Check if data is nested inside 'user' property or flat
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
        createdBy: adminName, // <--- SENDING THE TAG HERE
      };

      await registerUser(payload);
      alert(`Success! Account created for ${formData.firstName}.`);
      onSuccess(); // Close modal and refresh table
    } catch (err) {
      setError(err.message || "Failed to register.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 animate-fade-in">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg p-8 relative max-h-[90vh] overflow-y-auto">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 text-xl font-bold"
        >
          ×
        </button>

        <h2 className="text-2xl font-bold text-[var(--green)] mb-6">
          Register New User
        </h2>

        {error && (
          <div className="mb-4 p-3 bg-red-100 text-red-700 rounded text-sm">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-3">
          <div className="flex gap-3">
            <input
              type="text"
              name="firstName"
              placeholder="First Name"
              required
              className="w-1/2 p-2 border border-gray-300 rounded"
              onChange={handleChange}
            />
            <input
              type="text"
              name="lastName"
              placeholder="Last Name"
              required
              className="w-1/2 p-2 border border-gray-300 rounded"
              onChange={handleChange}
            />
          </div>
          <input
            type="email"
            name="email"
            placeholder="Email (Username)"
            required
            className="w-full p-2 border border-gray-300 rounded"
            onChange={handleChange}
          />
          <input
            type="text"
            name="contactNumber"
            placeholder="Contact Number (11 digits)"
            maxLength="11"
            required
            className="w-full p-2 border border-gray-300 rounded"
            onChange={handleChange}
          />

          <div className="flex gap-3">
            <div className="w-1/2">
              <label className="text-xs text-gray-500 ml-1">Role</label>
              <select
                name="role"
                className="w-full p-2 border border-gray-300 rounded"
                onChange={handleChange}
                value={formData.role}
              >
                <option value="Farmer">Farmer</option>
                <option value="Veterinarian">Veterinarian</option>
                <option value="Regulator">Regulator</option>
              </select>
            </div>
            <div className="w-1/2">
              <label className="text-xs text-gray-500 ml-1">Barangay</label>
              <select
                name="barangay"
                className="w-full p-2 border border-gray-300 rounded"
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
            <input
              type="text"
              name="farmName"
              placeholder="Farm Name"
              required
              className="w-full p-2 border border-gray-300 rounded bg-green-50"
              onChange={handleChange}
            />
          )}

          <div className="flex gap-3">
            <input
              type="password"
              name="password"
              placeholder="Password"
              required
              className="w-1/2 p-2 border border-gray-300 rounded"
              onChange={handleChange}
            />
            <input
              type="password"
              name="confirmPassword"
              placeholder="Confirm"
              required
              className="w-1/2 p-2 border border-gray-300 rounded"
              onChange={handleChange}
            />
          </div>

          <div className="pt-4 flex justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-2 bg-[var(--green)] text-white font-bold rounded hover:bg-[var(--dark-green)] disabled:opacity-50"
            >
              {loading ? "Creating..." : "Create Account"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
