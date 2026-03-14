import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import Footer from "../../components/Footer";
import AddServiceForm from "./AddServiceForm";

export default function ServiceDashboard({ theme }) {
  const navigate = useNavigate();
  const [showAddService, setShowAddService] = useState(false);
  const [services, setServices] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [loadingServices, setLoadingServices] = useState(true);
  const [loadingBookings, setLoadingBookings] = useState(true);
  const [updatingId, setUpdatingId] = useState(null);

  const base = "http://localhost:5000";

  // TODO: REPLACE WITH REAL SERVICE CENTRE ID FROM DATABASE
  const centreId = "68f1c739a68888ec0ffa9665";

  const bgClass = theme === "light" ? "bg-gray-50" : "bg-gray-900";
  const textClass = theme === "light" ? "text-gray-800" : "text-white";
  const cardBg = theme === "light" ? "bg-white" : "bg-gray-800";

  useEffect(() => {
    fetchServices();
    fetchCentreBookings();
  }, []);

  // ------------ Fetch Services -------------
  const fetchServices = async () => {
    try {
      setLoadingServices(true);
      const token = localStorage.getItem("token");

      const res = await axios.get(`${base}/api/services`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      setServices(res.data);
    } catch (err) {
      console.error("Error fetching services:", err);
      setServices([]);
    } finally {
      setLoadingServices(false);
    }
  };

  // ------------ Fetch Centre Bookings -------------
  const fetchCentreBookings = async () => {
    try {
      setLoadingBookings(true);
      const token = localStorage.getItem("token");

      const res = await axios.get(
        `${base}/api/bookings/centre?centreId=${centreId}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      setBookings(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      console.error("Error fetching centre bookings:", err);
      setBookings([]);
    } finally {
      setLoadingBookings(false);
    }
  };

  // ------------ Update Booking Status -------------
  const updateBookingStatus = async (id, status) => {
    try {
      setUpdatingId(id);
      const token = localStorage.getItem("token");

      await axios.put(
        `${base}/api/bookings/${id}/status`,
        { status },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      fetchCentreBookings();
    } catch (err) {
      console.error("Status update failed:", err);
      alert("Not allowed or server error.");
    } finally {
      setUpdatingId(null);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/login");
  };

  return (
    <div className={`min-h-screen flex flex-col p-6 ${bgClass} ${textClass}`}>
      <div className="flex-grow">
        <div className="flex justify-between mb-6">
          <h1 className="text-3xl font-bold">Service Dashboard</h1>
          <div className="flex gap-2">
            <button
              onClick={() => setShowAddService(true)}
              className="px-3 py-1 rounded bg-green-600 text-white"
            >
              Add Service
            </button>
            <button
              onClick={handleLogout}
              className="px-3 py-1 rounded bg-red-500 text-white"
            >
              Logout
            </button>
          </div>
        </div>

        {/* ----------- BOOKINGS ----------- */}
        <h2 className="text-xl font-semibold mb-2">Incoming Bookings</h2>

        {loadingBookings ? (
          <div className={`${cardBg} p-4 rounded`}>Loading bookings...</div>
        ) : bookings.length === 0 ? (
          <div className={`${cardBg} p-4 rounded`}>No bookings yet.</div>
        ) : (
          <div className="space-y-4">
            {bookings.map((b) => (
              <div key={b._id} className={`${cardBg} p-4 rounded shadow`}>
                <div className="flex justify-between">
                  <div>
                    <div className="text-lg font-semibold">
                      {b.service?.serviceName}
                    </div>
                    <div className="text-sm text-gray-400">
                      User: {b.user?.email}
                    </div>
                    {b.notes && (
                      <div className="mt-1 text-sm">Notes: {b.notes}</div>
                    )}
                  </div>

                  <div className="text-right">
                    <div>Status: {b.status}</div>
                    <div>₹{b.totalPrice}</div>
                    <div>
                      {new Date(b.date).toLocaleDateString()} • {b.time}
                    </div>
                  </div>
                </div>

                <div className="mt-3 flex gap-2">
                  {b.status === "pending" && (
                    <button
                      onClick={() => updateBookingStatus(b._id, "confirmed")}
                      className="px-3 py-1 bg-green-600 text-white rounded"
                      disabled={updatingId === b._id}
                    >
                      Confirm
                    </button>
                  )}

                  {b.status !== "completed" && (
                    <button
                      onClick={() => updateBookingStatus(b._id, "completed")}
                      className="px-3 py-1 bg-blue-600 text-white rounded"
                      disabled={updatingId === b._id}
                    >
                      Mark Completed
                    </button>
                  )}

                  {b.status !== "cancelled" && (
                    <button
                      onClick={() => updateBookingStatus(b._id, "cancelled")}
                      className="px-3 py-1 bg-red-600 text-white rounded"
                      disabled={updatingId === b._id}
                    >
                      Cancel
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* ----------- SERVICES ----------- */}
        <h2 className="mt-10 text-xl font-semibold mb-2">Your Services</h2>

        {loadingServices ? (
          <div className={`${cardBg} p-4 rounded`}>Loading services...</div>
        ) : services.length === 0 ? (
          <div className={`${cardBg} p-4 rounded`}>No services found.</div>
        ) : (
          <div className="grid md:grid-cols-2 gap-4">
            {services.map((s) => (
              <div key={s._id} className={`${cardBg} p-4 rounded shadow`}>
                <div className="font-bold">{s.serviceName}</div>
                <div>₹{s.price}</div>
              </div>
            ))}
          </div>
        )}
      </div>

      {showAddService && (
        <AddServiceForm
          theme={theme}
          onClose={() => setShowAddService(false)}
          onServiceAdded={fetchServices}
        />
      )}

      <Footer theme={theme} />
    </div>
  );
}
