
import React, { useEffect, useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";

export default function SubmitRequest({ theme }) {
  const navigate = useNavigate();

  const [services, setServices] = useState([]);
  const [centres, setCentres] = useState([]);

  const [serviceId, setServiceId] = useState("");
  const [serviceCentreId, setServiceCentreId] = useState("");
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  const [notes, setNotes] = useState("");
  const [totalPrice, setTotalPrice] = useState("");

  const [error, setError] = useState("");
  const [successMsg, setSuccessMsg] = useState("");
  const [loading, setLoading] = useState(false);

  const cardBg = theme === "light" ? "bg-white" : "bg-gray-800";
  const textClass = theme === "light" ? "text-gray-800" : "text-white";
  const safeFetch = async (url, token) => {
    try {
      const res = await fetch(url, {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
      const text = await res.text();
      try {
        return {
          ok: res.ok,
          status: res.status,
          body: text ? JSON.parse(text) : null,
        };
      } catch {
        return { ok: res.ok, status: res.status, body: text };
      }
    } catch (err) {
      return { ok: false, status: 0, body: null, error: err.message };
    }
  };

  useEffect(() => {
    const token = localStorage.getItem("token");
    const base = "http://localhost:5000";

    (async () => {
      const servicesResp = await safeFetch(`${base}/api/services`, token);
      const centresResp = await safeFetch(`${base}/api/service-centres`, token);

      console.debug("SERVICES RAW =>", servicesResp);
      console.debug("CENTRES RAW =>", centresResp);
      let servicesList = [];
      if (servicesResp.ok) {
        if (Array.isArray(servicesResp.body)) servicesList = servicesResp.body;
        else if (servicesResp.body && typeof servicesResp.body === "object") {
          servicesList =
            servicesResp.body.services ||
            servicesResp.body.data ||
            servicesResp.body.items ||
            [];
        }
      } else {
        console.error(
          "Failed to load /api/services:",
          servicesResp.status,
          servicesResp.body || servicesResp.error
        );
      }
      let centresList = [];
      if (centresResp.ok) {
        if (Array.isArray(centresResp.body)) centresList = centresResp.body;
        else if (centresResp.body && typeof centresResp.body === "object") {
          centresList =
            centresResp.body.centres ||
            centresResp.body.serviceCentres ||
            centresResp.body.data ||
            centresResp.body.items ||
            [];
        }
      } else {
        console.warn(
          "/api/service-centres not found or error:",
          centresResp.status,
          centresResp.body || centresResp.error
        );
        const map = new Map();
        servicesList.forEach((svc) => {
          if (Array.isArray(svc.availableAt)) {
            svc.availableAt.forEach((c) => {
              if (c && (c._id || c.id)) {
                const id = String(c._id ?? c.id);
                if (!map.has(id)) {
                  map.set(id, {
                    _id: id,
                    name: c.name ?? c.centerName ?? "Centre",
                    address: c.address ?? "",
                  });
                }
              }
            });
          } else if (Array.isArray(svc.serviceCentres)) {
            svc.serviceCentres.forEach((c) => {
              if (c && (c._id || c.id)) {
                const id = String(c._id ?? c.id);
                if (!map.has(id)) {
                }
              }
            });
          }
        });
        centresList = Array.from(map.values());
      }

      setServices(servicesList || []);
      setCentres(centresList || []);
    })();
  }, []);
  const centreOptions = useMemo(() => {
    const svc = services.find(
      (svcItem) => String(svcItem._id ?? svcItem.id) === String(serviceId)
    );
    if (!svc) return centres || [];
    if (
      Array.isArray(svc.availableAt) &&
      svc.availableAt.length &&
      typeof svc.availableAt[0] === "object"
    ) {
      return svc.availableAt.map((c) => ({
        _id: String(c._id ?? c.id),
        name: c.name ?? c.centerName ?? "Centre",
        address: c.address ?? "",
      }));
    }
    let ids = [];
    if (Array.isArray(svc.availableAt) && svc.availableAt.length) {
      ids = svc.availableAt.map((a) =>
        a && (a._id ?? a.id) ? String(a._id ?? a.id) : String(a)
      );
    } else if (Array.isArray(svc.serviceCentres) && svc.serviceCentres.length) {
      ids = svc.serviceCentres.map((a) =>
        a && (a._id ?? a.id) ? String(a._id ?? a.id) : String(a)
      );
    }

    if (!ids || ids.length === 0) return centres || [];
    return (centres || []).filter((c) => ids.includes(String(c._id ?? c.id)));
  }, [services, centres, serviceId]);
  useEffect(() => {
    const svc = services.find(
      (svcItem) => String(svcItem._id ?? svcItem.id) === String(serviceId)
    );
    if (svc) {
      setTotalPrice(svc.price ?? svc.basePrice ?? "");
      if (!serviceCentreId) {
        if (centreOptions && centreOptions.length > 0) {
          setServiceCentreId(
            String(centreOptions[0]._id ?? centreOptions[0].id)
          );
        }
      } else {
        const found = centreOptions.some(
          (c) => String(c._id ?? c.id) === String(serviceCentreId)
        );
        if (!found && centreOptions.length > 0) {
          setServiceCentreId(
            String(centreOptions[0]._id ?? centreOptions[0].id)
          );
        }
      }
    } else {
      setTotalPrice("");
    }
  }, [serviceId, services, centreOptions, serviceCentreId]);

  const validate = () => {
    if (!serviceId) return "Please select a service.";
    if (!serviceCentreId) return "Please select a service centre.";
    if (!date) return "Please choose a date.";
    if (!time) return "Please choose a time.";
    if (!totalPrice || isNaN(Number(totalPrice)))
      return "Total price is required and must be a number.";
    return null;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccessMsg("");

    const v = validate();
    if (v) {
      setError(v);
      return;
    }

    setLoading(true);
    try {
      const token = localStorage.getItem("token");

      const res = await fetch("http://localhost:5000/api/bookings", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({
          service: serviceId,
          serviceCentre: serviceCentreId,
          date,
          time,
          totalPrice: Number(totalPrice),
          notes,
        }),
      });

      const data = await res.json().catch(() => ({}));
      if (!res.ok)
        throw new Error(data.message || `Server responded ${res.status}`);

      setSuccessMsg("Booking created successfully.");
      setTimeout(() => navigate("/track-requests"), 700);
    } catch (err) {
      setError(err.message || "Failed to create booking");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={`max-w-3xl mx-auto px-4 py-10 ${textClass}`}>
      <div className={`${cardBg} p-6 rounded shadow`}>
        <h2 className="text-2xl font-semibold mb-4">Book a Service</h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          
          <div>
            <label className="block text-sm font-medium mb-1">Service</label>
            <select
              value={serviceId || ""}
              onChange={(e) => {
                setServiceId(e.target.value);
                if (serviceCentreId) setServiceCentreId("");
              }}
              className="w-full p-2 rounded border"
            >
              <option value="">-- Select service --</option>
              {Array.isArray(services) && services.length > 0 ? (
                services.map((svc) => (
                  <option key={svc._id ?? svc.id} value={svc._id ?? svc.id}>
                    {svc.serviceName ?? svc.name ?? "Service"}
                    {svc.price ? ` - ₹${svc.price}` : ""}
                  </option>
                ))
              ) : (
                <option disabled>Loading services...</option>
              )}
            </select>
          </div>

          
          <div>
            <label className="block text-sm font-medium mb-1">
              Service Centre
            </label>
            <select
              value={serviceCentreId || ""}
              onChange={(e) => setServiceCentreId(e.target.value)}
              className="w-full p-2 rounded border"
            >
              <option value="">-- Select service centre --</option>

              {Array.isArray(centreOptions) && centreOptions.length > 0 ? (
                centreOptions.map((c) => (
                  <option key={c._id ?? c.id} value={c._id ?? c.id}>
                    {c.name} {c.address ? `- ${c.address}` : ""}
                  </option>
                ))
              ) : Array.isArray(centres) && centres.length > 0 ? (
                centres.map((c) => (
                  <option key={c._id ?? c.id} value={c._id ?? c.id}>
                    {c.name} {c.address ? `- ${c.address}` : ""}
                  </option>
                ))
              ) : (
                <option disabled>No centres available</option>
              )}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Date</label>
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full p-2 rounded border"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Time</label>
              <input
                type="time"
                value={time}
                onChange={(e) => setTime(e.target.value)}
                className="w-full p-2 rounded border"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">
              Total Price (₹)
            </label>
            <input
              value={totalPrice}
              onChange={(e) => setTotalPrice(e.target.value)}
              className="w-full p-2 rounded border"
              placeholder="Enter total price"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">
              Notes (optional)
            </label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full p-2 rounded border"
              rows={3}
              placeholder="Any extra details for the technician"
            />
          </div>

          {error && <div className="text-sm text-red-600">{error}</div>}
          {successMsg && (
            <div className="text-sm text-green-600">{successMsg}</div>
          )}

          <div className="flex items-center gap-3">
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2 rounded bg-blue-600 text-white hover:bg-blue-700 transition disabled:opacity-60"
            >
              {loading ? "Booking..." : "Book Now"}
            </button>

            <button
              type="button"
              onClick={() => navigate("/track-requests")}
              className="px-3 py-2 rounded border"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
