import React from "react";
import Footer from "../components/Footer";

export default function About({ theme }) {
  const bgColor = theme === "light" ? "bg-gray-50" : "bg-gray-900";
  const textColor = theme === "light" ? "text-gray-600" : "text-gray-300";
  const headingColor = theme === "light" ? "text-gray-800" : "text-white";
  const cardBg = theme === "light" ? "bg-white" : "bg-gray-800";

  return (
    <div className={`flex flex-col min-h-screen ${bgColor}`}>
      <div className="max-w-7xl mx-auto px-4 py-16">
        <h1 className={`text-4xl font-bold mb-6 text-center ${headingColor}`}>
          About Mendly
        </h1>
        <p className={`text-lg mb-6 text-center ${textColor}`}>
          Mendly is a neighborhood service management platform that connects
          users with local service centers efficiently. Our mission is to
          simplify service requests, enhance transparency, and provide a
          seamless experience for both users and service providers.
        </p>

        <div className="grid md:grid-cols-3 gap-8 mt-10">
          <div
            className={`${cardBg} p-6 rounded shadow hover:shadow-lg transition text-center`}
          >
            <h3 className={`text-xl font-semibold mb-2 ${headingColor}`}>
              User-Friendly
            </h3>
            <p className={`${textColor} text-sm`}>
              Intuitive dashboards for both users and service centers.
            </p>
          </div>
          <div
            className={`${cardBg} p-6 rounded shadow hover:shadow-lg transition text-center`}
          >
            <h3 className={`text-xl font-semibold mb-2 ${headingColor}`}>
              Reliable Services
            </h3>
            <p className={`${textColor} text-sm`}>
              Connect with verified local service centers in your neighborhood.
            </p>
          </div>
          <div
            className={`${cardBg} p-6 rounded shadow hover:shadow-lg transition text-center`}
          >
            <h3 className={`text-xl font-semibold mb-2 ${headingColor}`}>
              Fast & Transparent
            </h3>
            <p className={`${textColor} text-sm`}>
              Track requests, get updates, and complete services efficiently.
            </p>
          </div>
        </div>
      </div>

      <Footer theme={theme} />
    </div>
  );
}
