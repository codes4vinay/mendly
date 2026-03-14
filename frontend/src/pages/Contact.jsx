import React, { useState } from "react";
import Footer from "../components/Footer";

export default function Contact({ theme }) {
  const [form, setForm] = useState({ name: "", email: "", message: "" });

  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = (e) => {
    e.preventDefault();
    alert("Message sent! (This is just a demo)");
    setForm({ name: "", email: "", message: "" });
  };

  return (
    <div
      className={`flex flex-col min-h-screen ${
        theme === "light"
          ? "bg-gray-50 text-gray-800"
          : "bg-gray-900 text-white"
      }`}
    >
      <div className="max-w-3xl mx-auto px-4 py-16">
        <h1
          className={`text-4xl font-bold mb-6 text-center ${
            theme === "light" ? "text-gray-800" : "text-white"
          }`}
        >
          Contact Us
        </h1>
        <p
          className={`text-lg mb-6 text-center ${
            theme === "light" ? "text-gray-600" : "text-gray-300"
          }`}
        >
          Have questions or feedback? Send us a message and we’ll get back to
          you.
        </p>

        <form
          onSubmit={handleSubmit}
          className={`p-6 rounded shadow-md ${
            theme === "light" ? "bg-white" : "bg-gray-800"
          }`}
        >
          <input
            type="text"
            name="name"
            placeholder="Your Name"
            value={form.name}
            onChange={handleChange}
            className="border p-2 w-full mb-4 rounded"
            required
          />
          <input
            type="email"
            name="email"
            placeholder="Your Email"
            value={form.email}
            onChange={handleChange}
            className="border p-2 w-full mb-4 rounded"
            required
          />
          <textarea
            name="message"
            placeholder="Your Message"
            value={form.message}
            onChange={handleChange}
            className="border p-2 w-full mb-4 rounded h-32"
            required
          />
          <button className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 w-full">
            Send Message
          </button>
        </form>
      </div>
      <Footer theme={theme} />
    </div>
  );
}
