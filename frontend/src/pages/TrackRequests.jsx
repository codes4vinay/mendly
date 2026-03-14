import React, { useEffect, useState } from "react";
import api from "../utils/api";

export default function TrackRequests({ theme }) {
  const [bookings, setBookings] = useState([]);

  useEffect(() => {
    api
      .get("/api/bookings/user")
      .then((res) => {
        const data = Array.isArray(res.data)
          ? res.data
          : res.data.bookings || [];
        setBookings(data);
      })
      .catch((err) => console.error(err));
  }, []);

  return (
    <div
      className={`min-h-screen p-6 ${
        theme === "light" ? "bg-gray-50" : "bg-gray-900 text-white"
      }`}
    >
      <h1 className="text-3xl font-bold mb-6">My Requests</h1>

      {bookings.length === 0 && <p>No bookings found.</p>}

      <div className="space-y-4">
        {bookings.map((b) => (
          <div key={b._id} className="p-4 bg-white rounded shadow">
            <h2 className="text-xl font-semibold">{b.service?.serviceName}</h2>
            <p>Date: {new Date(b.date).toLocaleDateString()}</p>
            <p>Time: {b.time}</p>
            <p>Status: {b.status}</p>
            <p>Price: ₹{b.totalPrice}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
