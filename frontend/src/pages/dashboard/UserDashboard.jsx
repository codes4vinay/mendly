import React from "react";
import { useNavigate } from "react-router-dom";
import Footer from "../../components/Footer";
import { FaClipboardList, FaTools, FaUserCircle } from "react-icons/fa";

export default function UserDashboard({ theme }) {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/login");
  };

  const goSubmit = () => navigate("/submit-request");
  const goTrack = () => navigate("/track-requests");
  const goProfile = () => navigate("/dashboard/user");

  const bgClass = theme === "light" ? "bg-gray-50" : "bg-gray-900";
  const textClass = theme === "light" ? "text-gray-800" : "text-white";
  const cardBg = theme === "light" ? "bg-white" : "bg-gray-800";
  const cardText = theme === "light" ? "text-gray-600" : "text-gray-200";

  return (
    <div className={`flex flex-col min-h-screen ${bgClass} ${textClass}`}>
      <div className="max-w-7xl mx-auto px-4 py-10">
        
        <div className="flex justify-between items-center mb-8">
          <h1 className={`text-3xl font-bold ${textClass}`}>User Dashboard</h1>
          <div className="flex items-center gap-3">
            <span className={`${cardText} text-sm`}>Welcome</span>
            <button
              onClick={handleLogout}
              className="px-3 py-1 rounded bg-red-500 text-white hover:bg-red-600"
            >
              Logout
            </button>
          </div>
        </div>

        <p className={`${cardText} mb-8`}>
          Welcome! Here you can submit new service requests, track your
          requests, and update your profile.
        </p>

        <div className="grid md:grid-cols-3 gap-6 mb-10">
          <div
            className={`${cardBg} p-6 rounded shadow hover:shadow-lg transition text-center`}
          >
            <FaClipboardList className="text-4xl mx-auto mb-4 text-blue-600" />
            <h3 className="text-xl font-semibold mb-2">Submit Request</h3>
            <p className={`text-sm ${cardText}`}>
              Create a new service request to your local service center.
            </p>
            <button
              onClick={goSubmit}
              className="mt-4 bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition"
            >
              Submit
            </button>
          </div>

          <div
            className={`${cardBg} p-6 rounded shadow hover:shadow-lg transition text-center`}
          >
            <FaTools className="text-4xl mx-auto mb-4 text-green-600" />
            <h3 className="text-xl font-semibold mb-2">Track Requests</h3>
            <p className={`text-sm ${cardText}`}>
              Check the status of your active and past requests.
            </p>
            <button
              onClick={goTrack}
              className="mt-4 bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 transition"
            >
              Track
            </button>
          </div>

          <div
            className={`${cardBg} p-6 rounded shadow hover:shadow-lg transition text-center`}
          >
            <FaUserCircle className="text-4xl mx-auto mb-4 text-yellow-600" />
            <h3 className="text-xl font-semibold mb-2">Profile</h3>
            <p className={`text-sm ${cardText}`}>
              Update your profile and contact information.
            </p>
            <button
              onClick={goProfile}
              className="mt-4 bg-yellow-600 text-white px-4 py-2 rounded hover:bg-yellow-700 transition"
            >
              Update
            </button>
          </div>
        </div>

        
        <div className={`${cardBg} p-6 rounded shadow overflow-x-auto`}>
          <h2 className={`text-2xl font-semibold mb-4 ${textClass}`}>
            My Requests
          </h2>
          <table className={`min-w-full ${cardBg}`}>
            <thead>
              <tr>
                <th className="py-2 px-4 border-b text-left">ID</th>
                <th className="py-2 px-4 border-b text-left">Service</th>
                <th className="py-2 px-4 border-b text-left">Status</th>
                <th className="py-2 px-4 border-b text-left">Date</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td className="py-2 px-4 border-b">001</td>
                <td className="py-2 px-4 border-b">Plumbing</td>
                <td className="py-2 px-4 border-b text-green-600">Completed</td>
                <td className="py-2 px-4 border-b">2025-09-11</td>
              </tr>
              <tr>
                <td className="py-2 px-4 border-b">002</td>
                <td className="py-2 px-4 border-b">Electrical</td>
                <td className="py-2 px-4 border-b text-yellow-600">Pending</td>
                <td className="py-2 px-4 border-b">2025-09-12</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <Footer theme={theme} />
    </div>
  );
}
