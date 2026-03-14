import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import Footer from "../components/Footer";
import { FaUser, FaTools, FaCheckCircle, FaMapMarkerAlt, FaClock, FaStar } from "react-icons/fa";

export default function Home({ user, theme }) {
  const navigate = useNavigate();
  const [serviceCenters, setServiceCenters] = useState([]);
  const [loading, setLoading] = useState(true);

  const bgLight = "bg-gray-50 text-gray-800";
  const bgDark = "bg-gray-900 text-white";
  const cardLight = "bg-white text-gray-800";
  const cardDark = "bg-gray-800 text-white";
  useEffect(() => {
    fetchServiceCenters();
  }, []);

  const fetchServiceCenters = async () => {
    try {
      const response = await axios.get("http://localhost:5000/api/admin/centres");
      setServiceCenters(response.data.slice(0, 6));
    } catch (error) {
      console.error("Error fetching service centers:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={`flex flex-col min-h-screen ${theme === "light" ? bgLight : bgDark}`}>
      
      
      <div className={`${theme === "light" ? "bg-white" : "bg-gray-800"} shadow-md`}>
        <div className="max-w-7xl mx-auto px-4 py-28 md:py-32 flex flex-col md:flex-row items-center min-h-[710px]">

          
          <div className="md:w-1/2 text-center md:text-left space-y-6">
            <h1
              className={`text-4xl flex flex-row gap-3 rem md:text-6xl font-bold tracking-tight ${theme === "light" ? "text-gray-900" : "text-white"
                }`}
            >
              Welcome to <span className="flex flex-row" style={{ color: "#3bb4ff" }}> <p>Mend</p>
                <p className="font-medium tracking-tight" style={{ color: "#4ea4d9" }} >ly</p>
              </span>
            </h1>

            <p
              className={`text-lg md:text-xl leading-relaxed max-w-lg ${theme === "light" ? "text-gray-600" : "text-gray-300"
                }`}
            >
              <div className="flex flex-row font-medium mb-4 space-x-2">
                <span className={`${theme === "light" ? "text-gray-700" : "text-gray-300"}`}>Fix. Manage.</span>
                <span className={`${theme === "light" ? "text-gray-700" : "text-gray-300"}`}>Relax.</span>
              </div>

              Life’s too short for service delays — get trusted local experts to handle it all, faster than ever.
            </p>

            <div className="flex justify-center md:justify-start space-x-4 pt-4">
              {user ? (
                <button
                  onClick={() =>
                    navigate(user.role === "serviceCenter" ? "/dashboard/service" : "/dashboard/user")
                  }
                  style={{ backgroundColor: "#3bb4ff" }}
                  className="text-white px-8 py-3 text-lg rounded-lg hover:opacity-90 transition shadow-lg"
                >
                  Go to Dashboard
                </button>
              ) : (
                <>
                  <button
                    onClick={() => navigate("/signup")}
                    style={{ backgroundColor: "#3bb4ff" }}
                    className="text-white px-8 py-3 text-lg rounded-lg hover:opacity-90 transition shadow-lg"
                  >
                    Sign Up
                  </button>
                  <button
                    onClick={() => navigate("/login")}
                    className={`border border-gray-400 px-8 py-3 text-lg rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition shadow-lg ${theme === 'light' ? 'text-gray-800' : 'text-gray-200'
                      }`}

                  >
                    Login
                  </button>
                </>
              )}
            </div>
          </div>

          
          <div className="md:w-1/2 mt-12 md:mt-0">
            <img
              src="https://images.unsplash.com/photo-1604754742629-3e5728249d73?q=80&w=1170&auto=format&fit=crop"
              alt="Hero illustration"
              className="rounded-2xl shadow-2xl w-full object-cover transition-transform duration-500 hover:scale-[1.02]"
            />
          </div>
        </div>
      </div>


      {user?.role === "user" && (
        <>
          
          <div className="max-w-7xl mx-auto px-4 py-16">
            <h2
              className={`text-3xl font-bold text-center mb-10 ${theme === "light" ? "text-gray-800" : "text-white"
                }`}
            >
              Services Available
            </h2>
            <div className="grid md:grid-cols-3 gap-8">
              {[
                { name: "Mobile Repair", img: "https://static.vecteezy.com/system/resources/thumbnails/047/595/235/small/technician-repairing-smartphone-electronic-components-on-worktable-technology-repair-photo.jpg" },
                { name: "AC Repair", img: "https://t4.ftcdn.net/jpg/03/54/22/51/360_F_354225155_YG8B736pYeEAzQd5UgC1QcUsqkNJAs4Y.jpg" },
                { name: "Fridge Repair", img: "https://t4.ftcdn.net/jpg/03/30/61/59/360_F_330615955_AdnnZtL9HBXhIFrbQexD4z2961diIORI.jpg" },
                { name: "Washing Machine Repair", img: "https://t3.ftcdn.net/jpg/01/98/65/94/360_F_198659488_BT7evs4AEwey5wqrllvQTZYGezk4YaCZ.jpg" },
                { name: "Electrician", img: "https://thumbs.dreamstime.com/b/young-electrical-engineer-protective-workware-repairing-connecting-wires-using-screw-driver-workplace-young-247556897.jpg" },
                { name: "Plumber", img: "https://t3.ftcdn.net/jpg/00/27/61/68/360_F_27616800_mP42aLqY152iln3kHDTiAvlMrDoYU606.jpg" },
              ].map((service, idx) => (
                <div
                  key={idx}
                  className={`p-4 rounded shadow hover:shadow-lg transition ${theme === "light" ? cardLight : cardDark
                    }`}
                >
                  <img
                    src={service.img}
                    alt={service.name}
                    className="rounded mb-4 w-full h-40 object-cover"
                  />
                  <h3 className="text-lg font-semibold mb-2 text-center">
                    {service.name}
                  </h3>
                </div>
              ))}
            </div>
          </div>

          
          <div
            className={`${theme === "light" ? "bg-gray-100" : "bg-gray-900"
              } py-16`}
          >
            <div className="max-w-7xl mx-auto px-4">
              <h2
                className={`text-3xl font-bold text-center mb-10 ${theme === "light" ? "text-gray-800" : "text-white"
                  }`}
              >
                Service Centers Near You
              </h2>

              {loading ? (
                <div className="text-center py-10">
                  <p
                    className={
                      theme === "light" ? "text-gray-600" : "text-gray-300"
                    }
                  >
                    Loading service centers...
                  </p>
                </div>
              ) : serviceCenters.length === 0 ? (
                <div className="text-center py-10">
                  <p
                    className={
                      theme === "light" ? "text-gray-600" : "text-gray-300"
                    }
                  >
                    No service centers available at the moment.
                  </p>
                </div>
              ) : (
                <div className="grid md:grid-cols-3 gap-8">
                  {serviceCenters.map((center) => (
                    <div
                      key={center._id}
                      className={`p-6 rounded-lg shadow hover:shadow-xl transition ${theme === "light" ? cardLight : cardDark
                        }`}
                    >
                      
                      <div className="mb-4">
                        {center.photos && center.photos.length > 0 ? (
                          <img
                            src={
                              center.photos[0].startsWith("http")
                                ? center.photos[0]
                                : `http://localhost:5000${center.photos[0]}`
                            }
                            alt={center.name}
                            className="rounded w-full h-40 object-cover"
                            onError={(e) => {
                              e.target.src =
                                "https://images.unsplash.com/photo-1581092918056-0c4c3acd3789?w=400&h=300&fit=crop";
                            }}
                          />
                        ) : (
                          <div className="rounded w-full h-40 bg-gradient-to-r from-blue-400 to-blue-600 flex items-center justify-center">
                            <FaTools className="text-white text-5xl" />
                          </div>
                        )}
                      </div>

                      
                      <h3 className="text-xl font-bold mb-2">{center.name}</h3>

                      
                      {center.starRating > 0 && (
                        <div className="flex items-center mb-2">
                          <FaStar className="text-yellow-500 mr-1" />
                          <span className="text-sm font-semibold">
                            {center.starRating.toFixed(1)}
                          </span>
                          <span className="text-sm ml-1 opacity-70">
                            ({center.rating} reviews)
                          </span>
                        </div>
                      )}

                      
                      <div className="flex items-start mb-2">
                        <FaMapMarkerAlt className="text-red-500 mt-1 mr-2 flex-shrink-0" />
                        <p className="text-sm opacity-80">{center.address}</p>
                      </div>

                      
                      <div className="flex items-center mb-3">
                        <FaClock className="text-green-500 mr-2" />
                        <p className="text-sm opacity-80">
                          {center.openingTime} - {center.closingTime}
                        </p>
                      </div>

                      
                      {center.mainServices && center.mainServices.length > 0 && (
                        <div className="mb-4">
                          <div className="flex flex-wrap gap-2">
                            {center.mainServices.slice(0, 3).map((service, idx) => (
                              <span
                                key={idx}
                                className="text-xs px-2 py-1 bg-blue-100 text-blue-800 rounded-full"
                              >
                                {service}
                              </span>
                            ))}
                            {center.mainServices.length > 3 && (
                              <span className="text-xs px-2 py-1 bg-gray-200 text-gray-600 rounded-full">
                                +{center.mainServices.length - 3} more
                              </span>
                            )}
                          </div>
                        </div>
                      )}

                      
                      <div className="flex justify-between gap-2">
                        <button
                          style={{ backgroundColor: "#3bb4ff" }}
                          className="flex-1 px-3 py-2 bg-blue-600 text-white text-sm rounded hover:bg-blue-700 transition"
                        >
                          Book Now
                        </button>
                        <button className="flex-1 px-3 py-2 bg-gray-600 text-white text-sm rounded hover:bg-gray-700 transition">
                          View Details
                        </button>
                      </div>

                      
                      <div className="mt-3 pt-3 border-t border-gray-200">
                        <p className="text-xs opacity-70">
                          Contact: {center.contact}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              
              {!loading && serviceCenters.length > 0 && (
                <div className="text-center mt-8">
                  <button
                    style={{ backgroundColor: "#2a59d1" }}
                    className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-semibold"
                  >
                    View All Service Centers
                  </button>
                </div>
              )}
            </div>
          </div>
        </>
      )}


      
      <div className={`${theme === "light" ? "bg-gray-100" : "bg-gray-900"} py-16`}>
        <div className="max-w-7xl mx-auto px-4 text-center">
          <h2 className={`text-3xl font-bold mb-10 ${theme === "light" ? "text-gray-800" : "text-white"}`}>
            How Mendly Works
          </h2>
          <div className="grid md:grid-cols-3 gap-8">
            <div className={`p-6 rounded shadow hover:shadow-lg transition ${theme === "light" ? cardLight : cardDark}`}>
              <FaCheckCircle className="text-4xl mx-auto mb-4 text-blue-600" />
              <h3 className="font-semibold mb-2">Sign Up / Login</h3>
              <p className="text-sm">
                Create your account to access services or manage requests.
              </p>
            </div>
            <div className={`p-6 rounded shadow hover:shadow-lg transition ${theme === "light" ? cardLight : cardDark}`}>
              <FaUser className="text-4xl mx-auto mb-4 text-green-600" />
              <h3 className="font-semibold mb-2">Choose Services</h3>
              <p className="text-sm">
                Users select the services they need and submit requests to service centers.
              </p>
            </div>
            <div className={`p-6 rounded shadow hover:shadow-lg transition ${theme === "light" ? cardLight : cardDark}`}>
              <FaTools className="text-4xl mx-auto mb-4 text-red-600" />
              <h3 className="font-semibold mb-2">Track & Manage</h3>
              <p className="text-sm">
                Keep track of all requests and updates easily from your dashboard.
              </p>
            </div>
          </div>
        </div>
      </div>

      
      <div className="max-w-7xl mx-auto px-4 py-16 text-center">
        <h2 className={`text-3xl font-bold mb-10 ${theme === "light" ? "text-gray-800" : "text-white"}`}>
          Our Impact
        </h2>
        <div className="grid md:grid-cols-3 gap-8">
          <div className={`p-6 rounded shadow hover:shadow-lg transition ${theme === "light" ? cardLight : cardDark}`}>
            <h3 style={{ color: '#3bb4ff' }}
              className="text-4xl font-bold  mb-2">1.2K+</h3>
            <p className={theme === "light" ? "text-gray-600" : "text-gray-300"}>Registered Users</p>
          </div>
          <div className={`p-6 rounded shadow hover:shadow-lg transition ${theme === "light" ? cardLight : cardDark}`}>
            <h3 className="text-4xl font-bold text-green-600 mb-2">{serviceCenters.length > 0 ? serviceCenters.length : '300'}+</h3>
            <p className={theme === "light" ? "text-gray-600" : "text-gray-300"}>Service Centers</p>
          </div>
          <div className={`p-6 rounded shadow hover:shadow-lg transition ${theme === "light" ? cardLight : cardDark}`}>
            <h3 className="text-4xl font-bold text-red-600 mb-2">5K+</h3>
            <p className={theme === "light" ? "text-gray-600" : "text-gray-300"}>Requests Completed</p>
          </div>
        </div>
      </div>

      
      <Footer theme={theme} />
    </div>
  );
}