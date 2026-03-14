import React, { useState } from "react";
import axios from "axios";

export default function AddServiceForm({ theme, onClose, onServiceAdded }) {
  const [formData, setFormData] = useState({
    serviceName: "",
    price: "",
    photos: [],
    videos: [],
    availableAt: "",
    contact: "",
    mostBooked: false
  });

  const [photoFiles, setPhotoFiles] = useState([]);
  const [videoFiles, setVideoFiles] = useState([]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === "checkbox" ? checked : value
    });
  };

  const handleFileChange = (e, type) => {
    const files = Array.from(e.target.files);
    if (type === "photos") {
      setPhotoFiles(files);
    } else if (type === "videos") {
      setVideoFiles(files);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const submitData = new FormData();
    submitData.append("serviceName", formData.serviceName);
    submitData.append("price", formData.price);
    submitData.append("availableAt", formData.availableAt);
    submitData.append("contact", formData.contact);
    submitData.append("mostBooked", formData.mostBooked);
    photoFiles.forEach((file, index) => {
      submitData.append(`photos`, file);
    });
    videoFiles.forEach((file, index) => {
      submitData.append(`videos`, file);
    });

    try {
      const token = localStorage.getItem("token");
      await axios.post("http://localhost:5000/api/services", submitData, {
        headers: {
          "Content-Type": "multipart/form-data",
          Authorization: `Bearer ${token}`
        }
      });
      alert("Service added successfully!");
      if (onServiceAdded) {
        onServiceAdded();
      } else {
        onClose();
      }
    } catch (error) {
      console.error("Error adding service:", error);
      alert("Error adding service. Please try again.");
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div
        className={`p-6 rounded-lg shadow-lg w-full max-w-2xl max-h-[90vh] overflow-y-auto ${
          theme === "light" ? "bg-white text-gray-800" : "bg-gray-800 text-white"
        }`}
      >
        <h2 className="text-2xl font-bold mb-4">Add New Service</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Service Name</label>
            <input
              type="text"
              name="serviceName"
              value={formData.serviceName}
              onChange={handleChange}
              required
              className={`w-full p-2 border rounded ${
                theme === "light"
                  ? "bg-white border-gray-300"
                  : "bg-gray-700 border-gray-600"
              }`}
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Price</label>
            <input
              type="number"
              name="price"
              value={formData.price}
              onChange={handleChange}
              required
              className={`w-full p-2 border rounded ${
                theme === "light"
                  ? "bg-white border-gray-300"
                  : "bg-gray-700 border-gray-600"
              }`}
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Contact</label>
            <input
              type="text"
              name="contact"
              value={formData.contact}
              onChange={handleChange}
              required
              className={`w-full p-2 border rounded ${
                theme === "light"
                  ? "bg-white border-gray-300"
                  : "bg-gray-700 border-gray-600"
              }`}
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Available At (Address)</label>
            <input
              type="text"
              name="availableAt"
              value={formData.availableAt}
              onChange={handleChange}
              placeholder="Enter service centre address"
              required
              className={`w-full p-2 border rounded ${
                theme === "light"
                  ? "bg-white border-gray-300"
                  : "bg-gray-700 border-gray-600"
              }`}
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Photos (Optional)</label>
            <input
              type="file"
              multiple
              accept="image/*"
              onChange={(e) => handleFileChange(e, "photos")}
              className={`w-full p-2 border rounded ${
                theme === "light"
                  ? "bg-white border-gray-300"
                  : "bg-gray-700 border-gray-600"
              }`}
            />
            {photoFiles.length > 0 && (
              <div className="mt-2 text-sm text-gray-600">
                {photoFiles.length} photo(s) selected
              </div>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Videos (Optional)</label>
            <input
              type="file"
              multiple
              accept="video/*"
              onChange={(e) => handleFileChange(e, "videos")}
              className={`w-full p-2 border rounded ${
                theme === "light"
                  ? "bg-white border-gray-300"
                  : "bg-gray-700 border-gray-600"
              }`}
            />
            {videoFiles.length > 0 && (
              <div className="mt-2 text-sm text-gray-600">
                {videoFiles.length} video(s) selected
              </div>
            )}
          </div>

          <div className="flex items-center">
            <input
              type="checkbox"
              name="mostBooked"
              checked={formData.mostBooked}
              onChange={handleChange}
              className="mr-2"
            />
            <label className="text-sm font-medium">Mark as Most Booked</label>
          </div>

          <div className="flex justify-end space-x-4">
            <button
              type="button"
              onClick={onClose}
              className={`px-4 py-2 rounded transition ${
                theme === "light"
                  ? "bg-gray-300 text-gray-800 hover:bg-gray-400"
                  : "bg-gray-600 text-white hover:bg-gray-500"
              }`}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 transition"
            >
              Add Service
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
