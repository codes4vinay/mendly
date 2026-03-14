import { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import React from "react";

export default function Signup({ theme }) {
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    role: "user",
  });
  const navigate = useNavigate();

  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.post("http://localhost:5000/api/auth/register", form);
      navigate("/login");
    } catch (err) {
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
        <h2 className="text-2xl mb-4">Signup</h2>
        <input
          name="name"
          placeholder="Name"
          value={form.name}
          onChange={handleChange}
          className="border p-2 w-full mb-2 rounded"
        />
        <input
          name="email"
          placeholder="Email"
          value={form.email}
          onChange={handleChange}
          className="border p-2 w-full mb-2 rounded"
        />
        <input
          type="password"
          name="password"
          placeholder="Password"
          value={form.password}
          onChange={handleChange}
          className="border p-2 w-full mb-2 rounded"
        />
        <select
          name="role"
          value={form.role}
          onChange={handleChange}
          className="border p-2 w-full mb-2 rounded"
        >
          <option value="user">User</option>
          <option value="serviceCenter">Service Center</option>
        </select>
        <button
          type="submit"
          className={`w-full px-4 py-2 rounded transition ${
            theme === "light"
              ? "bg-blue-500 text-white hover:bg-blue-600"
              : "bg-blue-600 text-white hover:bg-blue-700"
          }`}
        >
          Signup
        </button>
      </form>
    </div>
  );
}
