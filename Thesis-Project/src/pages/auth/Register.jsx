import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import "../../assets/styles/index.css";

import { registerUser } from "../../config/api";

export default function Register() {
  const navigate = useNavigate();

  // State for form fields
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    confirmPassword: "",
    role: "Farmer", // Default selection
    barangay: "Aplaya", // Default selection (first in list)
    farmName: "",
  });

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  // Exact list of Barangays in Santa Rosa City
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

  // Specific Roles
  const roles = [
    { value: "Farmer", label: "Livestock Farmer (Producer)" },
    { value: "Veterinarian", label: "Veterinarian" },
    { value: "Regulator", label: "Regulator / Admin" },
  ];

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const validatePassword = (pwd) => {
    // Regex: Minimum 8 characters, at least one letter and one number
    const simpleRegex = /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d@$!%*?&]{8,}$/;
    return simpleRegex.test(pwd);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    // 1. Password Match Validation
    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match");
      setLoading(false);
      return;
    }

    // 2. Password Strength Validation (Using the simplified helper)
    if (!validatePassword(formData.password)) {
      setError(
        "Password must be at least 8 characters long and include at least 1 letter and 1 number."
      );
      setLoading(false);
      return;
    }

    // 3. API CALL PREPARATION
    try {
      // Map the Role to the Org Name
      const orgMap = {
        Farmer: "FarmerOrg",
        Veterinarian: "VetOrg",
        Regulator: "RegulatorOrg",
      };
      const targetOrg = orgMap[formData.role] || "FarmerOrg";

      // Create the Full Payload Object ---
      const payload = {
        username: formData.email, // Blockchain Identity
        org: targetOrg, // Target Organization

        // Data for MongoDB Profile
        firstName: formData.firstName,
        lastName: formData.lastName,
        email: formData.email,
        password: formData.password,
        role: formData.role,
        barangay: formData.barangay,
        farmName: formData.farmName,
      };

      console.log(`Registering User: ${payload.email} (${targetOrg})`);

      // API CALL: Pass the object, not individual strings ---
      await registerUser(payload);

      alert(
        `Registration successful! Account created for ${formData.firstName}.`
      );

      navigate("/login");
    } catch (err) {
      console.error("Registration Error:", err);
      setError(
        err.message ||
          err.error ||
          "Failed to register. Check server connection."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <div className="w-full max-w-md p-8 bg-white rounded-2xl shadow-xl my-8">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-[var(--green)]">
            Create Account
          </h1>
          <p className="text-gray-500 mt-2">Join the Traceability Network</p>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-lg text-sm text-center">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Name Fields */}
          <div className="flex gap-4">
            <input
              type="text"
              name="firstName"
              placeholder="First Name"
              required
              className="w-1/2 p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--light-green)]"
              onChange={handleChange}
            />
            <input
              type="text"
              name="lastName"
              placeholder="Last Name"
              required
              className="w-1/2 p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--light-green)]"
              onChange={handleChange}
            />
          </div>

          {/* Contact Info */}
          <input
            type="email"
            name="email"
            placeholder="Email Address"
            required
            className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--light-green)]"
            onChange={handleChange}
          />

          {/* Role & Location Selection */}
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Select Role
              </label>
              <select
                name="role"
                className="w-full p-3 border border-gray-300 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-[var(--light-green)]"
                onChange={handleChange}
                value={formData.role}
              >
                {roles.map((role) => (
                  <option key={role.value} value={role.value}>
                    {role.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Barangay (Location)
              </label>
              <select
                name="barangay"
                className="w-full p-3 border border-gray-300 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-[var(--light-green)]"
                onChange={handleChange}
                value={formData.barangay}
              >
                {barangays.map((bgy) => (
                  <option key={bgy} value={bgy}>
                    {bgy}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Conditional Field: Farm Name (Only for Farmers) */}
          {formData.role === "Farmer" && (
            <div className="animate-fade-in-down">
              <input
                type="text"
                name="farmName"
                placeholder="Farm Name (e.g., Happy Paws Piggery)"
                required
                className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--light-green)] bg-green-50"
                onChange={handleChange}
              />
              <p className="text-xs text-gray-500 mt-1 ml-1">
                * Required for Livestock Registration
              </p>
            </div>
          )}

          {/* Password Fields */}
          <div className="space-y-4">
            <input
              type="password"
              name="password"
              placeholder="Password"
              required
              className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--light-green)]"
              onChange={handleChange}
            />
            <input
              type="password"
              name="confirmPassword"
              placeholder="Confirm Password"
              required
              className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--light-green)]"
              onChange={handleChange}
            />
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-[var(--green)] text-white font-bold rounded-lg hover:bg-[var(--dark-green)] transition-colors duration-300 shadow-md disabled:opacity-50 mt-4"
          >
            {loading ? "Registering..." : "Create Account"}
          </button>
        </form>

        {/* Link back to Login */}
        <div className="mt-6 text-center text-sm text-gray-600">
          Already have an account?{" "}
          <Link
            to="/login"
            className="text-[var(--green)] font-bold hover:underline"
          >
            Login here
          </Link>
        </div>
      </div>
    </div>
  );
}
