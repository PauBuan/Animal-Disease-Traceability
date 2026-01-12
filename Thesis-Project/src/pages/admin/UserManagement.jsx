import React from "react";

/**
 * AdminUserManagement Component
 * This is the "System and Network Management" module.
 * Allows the admin to manage stakeholders in the permissioned blockchain.
 */
export default function AdminUserManagement() {
  const users = [
    {
      id: "u1",
      name: "Dr. Alena Gomez",
      role: "Veterinarian",
      org: "Santa Rosa CVO",
      status: "Active",
    },
    {
      id: "u2",
      name: "Juan Dela Cruz",
      role: "Farmer/Producer",
      org: "Brgy. Dila Farm",
      status: "Active",
    },
    {
      id: "u3",
      name: "Maria Santos",
      role: "Farmer/Producer",
      org: "Brgy. Pooc Farm",
      status: "Active",
    },
    {
      id: "u4",
      name: "Regina Vasquez",
      role: "Admin/Regulatory",
      org: "Santa Rosa CVO",
      status: "Active",
    },
    {
      id: "u5",
      name: "Pending Farmer",
      role: "Farmer/Producer",
      org: "Brgy. Macabling",
      status: "Pending",
    },
  ];

  return (
    <div className="container mx-auto p-4">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-800">
          Stakeholder Management
        </h1>
        <button className="bg-[var(--green)] text-white px-5 py-2 rounded-xl hover:bg-[var(--light-green)] hover:text-[var(--green)] transition font-medium shadow-md">
          + Add New User
        </button>
      </div>
      <p className="text-lg text-gray-600 mb-8">
        Manage users and permissions for the Hyperledger Fabric network.
      </p>

      {/* User Table */}
      <div className="bg-white p-6 rounded-2xl shadow-lg">
        <table className="w-full text-left">
          <thead>
            <tr className="border-b-2 border-gray-200">
              <th className="py-2 px-3">Name</th>
              <th className="py-2 px-3">Role</th>
              <th className="py-2 px-3">Organization</th>
              <th className="py-2 px-3">Status</th>
              <th className="py-2 px-3">Actions</th>
            </tr>
          </thead>
          <tbody>
            {users.map((user) => (
              <tr
                key={user.id}
                className="border-b border-gray-100 hover:bg-gray-50"
              >
                <td className="py-3 px-3 font-medium">{user.name}</td>
                <td className="py-3 px-3">{user.role}</td>
                <td className="py-3 px-3">{user.org}</td>
                <td className="py-3 px-3">
                  <span
                    className={`px-3 py-1 rounded-full text-sm ${
                      user.status === "Active"
                        ? "bg-green-100 text-green-800"
                        : "bg-yellow-100 text-yellow-800"
                    }`}
                  >
                    {user.status}
                  </span>
                </td>
                <td className="py-3 px-3">
                  <button className="text-blue-600 hover:underline mr-3">
                    Edit
                  </button>
                  <button className="text-red-600 hover:underline">
                    Revoke
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
