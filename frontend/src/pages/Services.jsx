import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

export default function Services({ theme }) {
    const navigate = useNavigate();
    const [services, setServices] = useState([]);

    useEffect(() => {
        fetch("http://localhost:5000/api/services")
            .then(res => res.json())
            .then(data => setServices(Array.isArray(data) ? data : data.services || []))
            .catch(err => console.error(err));
    }, []);

    return (
        <div className={`min-h-screen p-6 ${theme === "light" ? "bg-gray-50" : "bg-gray-900 text-white"}`}>
            <h1 className="text-3xl font-bold mb-6">Available Services</h1>

            <div className="grid md:grid-cols-3 gap-6">
                {services.map(s => (
                    <div key={s._id} className="p-4 bg-white rounded shadow">
                        <h2 className="text-xl font-semibold">{s.serviceName}</h2>
                        <p className="text-gray-600">₹{s.price}</p>
                        <p className="text-sm text-gray-500 mt-1">{s.contact}</p>

                        <button
                            className="mt-4 bg-blue-600 text-white px-4 py-2 rounded"
                            onClick={() =>
                                navigate(`/submit-request?serviceId=${s._id}`)
                            }
                        >
                            Book Service
                        </button>
                    </div>
                ))}
            </div>
        </div>
    );
}
