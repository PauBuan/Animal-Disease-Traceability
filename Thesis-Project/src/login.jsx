import React from "react";
import { useNavigate } from "react-router-dom";

const Login = () => {
  const navigate = useNavigate();

  const handleStakeholderLogin = (e) => {
    e.preventDefault();
    console.log("Stakeholder login attempted");
  };

  const handleAdminLogin = () => {
    navigate("/adminlogin");
  };

  return (
    <div className="min-h-screen flex items-start justify-center bg-white p-4">
      <div className="mt-24 bg-white p-8 rounded-2xl shadow-2xl w-full max-w-md border border-green-100">
        <h2 className="text-3xl font-bold text-[var(--green)] mb-6 text-center">
          Stakeholder Login
        </h2>

        <form onSubmit={handleStakeholderLogin} className="space-y-5">
          <div>
            <input
              type="text"
              placeholder="Enter your username"
              className="w-full p-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[var(--green)]"
              required
            />
          </div>

          <div>
            <input
              type="password"
              placeholder="Enter your password"
              className="w-full p-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[var(--green)]"
              required
            />
          </div>

          <button
            onClick={() => navigate('/transactions')}
            type="submit"
            className="w-full bg-[var(--green)] text-white py-3 rounded-xl hover:bg-[var(--light-green)] hover:text-[var(--green)] transition font-medium shadow-md"
          >
            Login
          </button>
        </form>

        <div className="flex items-center justify-center my-5">
          <div className="border-t border-gray-300 w-1/3"></div>
          <span className="mx-2 text-gray-500 text-sm">or</span>
          <div className="border-t border-gray-300 w-1/3"></div>
        </div>

        <button
          onClick={handleAdminLogin}
          className="w-full bg-gray-100 text-gray-700 py-3 rounded-xl hover:bg-gray-200 transition font-medium border border-gray-300"
        >
          Login as Admin
        </button>
      </div>
    </div>
  );
};

export default Login;
