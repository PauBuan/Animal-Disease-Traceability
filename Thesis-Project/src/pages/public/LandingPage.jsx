import React from "react";
import { Link } from "react-router-dom";

/**
 * LandingPage Component
 */
export default function LandingPage() {
  return (
    <div className="w-full max-w-5xl">
      <h2 className="text-5xl font-extrabold text-[var(--green)] mb-6 leading-tight">
        Secure Animal Disease Tracking with Blockchain
      </h2>
      <p className="text-xl text-gray-700 mb-8 leading-relaxed">
        A website where you can explore an animal database, track livestock
        movements, and view statistics on food safety and disease trends.
        Designed specifically for Santa Rosa, Laguna, this platform provides
        real-time insights into local livestock health and supports farmers with
        actionable data. Enhance your understanding of regional food supply
        chains and contribute to a safer community with our comprehensive
        tracking tools.
      </p>
      <div className="flex flex-col sm:flex-row justify-center space-y-4 sm:space-y-0 sm:space-x-4">
        {/* Note: The route here must match the route defined in your new App.jsx */}
        <Link to="/dashboard">
          <button className="bg-[var(--green)] text-[var(--white)] px-8 py-3 rounded-xl shadow-lg hover:bg-[var(--light-green)] hover:text-[var(--green)] transition-all duration-300 font-semibold">
            See Dashboards
          </button>
        </Link>
      </div>
    </div>
  );
}
