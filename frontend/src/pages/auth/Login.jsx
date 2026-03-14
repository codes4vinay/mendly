import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import jwtDecode from "jwt-decode";

export default function Login({ setUser, theme }) {
  const [form, setForm] = useState({ email: "", password: "" });
  const navigate = useNavigate();

  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post(
        "http://localhost:5000/api/auth/login",
        form,
        { headers: { "Content-Type": "application/json" } }
      );

      localStorage.setItem("token", res.data.token);

      const decoded = jwtDecode(res.data.token);

      const loggedInUser = { email: decoded.email, role: decoded.role };
      setUser(loggedInUser);
      localStorage.setItem("mendlyUser", JSON.stringify(loggedInUser));

      if (decoded.role === "admin") navigate("/dashboard/admin");
      else if (decoded.role === "serviceCenter") navigate("/dashboard/service");
      else navigate("/");
    } catch (err) {
      console.error("Login error:", err.response?.data || err.message);
      alert(err.response?.data?.message || "Error");
    }
  };

  return (
    <div
      className={`flex items-center justify-center min-h-screen ${
        theme === "light"
          ? "bg-gray-100 text-gray-800"
          : "bg-gray-900 text-white"
      }`}
    >
      <form
        onSubmit={handleSubmit}
        className={`p-6 rounded shadow-md w-80 ${
          theme === "light" ? "bg-white" : "bg-gray-800"
        }`}
      >
        <h2 className="text-2xl mb-4">Login</h2>
        <input
          name="email"
          placeholder="Email"
          onChange={handleChange}
          className="border p-2 w-full mb-2 rounded"
        />
        <input
          type="password"
          name="password"
          placeholder="Password"
          onChange={handleChange}
          className="border p-2 w-full mb-2 rounded"
        />
        <button className="bg-green-500 text-white px-4 py-2 w-full rounded hover:bg-green-600 transition">
          Login
        </button>
      </form>
    </div>
  );
}
