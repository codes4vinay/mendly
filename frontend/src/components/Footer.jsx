import React from "react";
import {
  FaFacebookF,
  FaTwitter,
  FaLinkedinIn,
  FaInstagram,
} from "react-icons/fa";

export default function Footer({ theme }) {
  const bgColor = theme === "light" ? "bg-white" : "bg-gray-900";
  const textColor = theme === "light" ? "text-gray-600" : "text-gray-300";
  const headingColor = theme === "light" ? "text-gray-800" : "text-white";
  const borderColor =
    theme === "light" ? "border-t" : "border-t border-gray-700";

  return (
    <footer className={`${bgColor} ${borderColor} mt-auto`}>
      <div className="max-w-7xl mx-auto px-4 py-10 grid md:grid-cols-4 gap-8">
        
        <div>
          <h2 className={`text-2xl font-bold mb-2 ${headingColor}`}>Mendly</h2>
          <p className={`${textColor}`}>
            Your neighborhood service management app. Connect with services,
            track requests, and manage your dashboard easily.
          </p>
          <div className={`flex space-x-3 mt-4 ${textColor}`}>
            <a href="#" className="hover:text-blue-600">
              <FaFacebookF />
            </a>
            <a href="#" className="hover:text-blue-400">
              <FaTwitter />
            </a>
            <a href="#" className="hover:text-blue-700">
              <FaLinkedinIn />
            </a>
            <a href="#" className="hover:text-pink-500">
              <FaInstagram />
            </a>
          </div>
        </div>

        
        <div>
          <h3 className={`text-xl font-semibold mb-2 ${headingColor}`}>
            Quick Links
          </h3>
          <ul className={`space-y-1 ${textColor}`}>
            <li>
              <a href="/" className="hover:text-blue-600 transition">
                Home
              </a>
            </li>
            <li>
              <a href="/about" className="hover:text-blue-600 transition">
                About
              </a>
            </li>
            <li>
              <a href="/contact" className="hover:text-blue-600 transition">
                Contact
              </a>
            </li>
            <li>
              <a href="/signup" className="hover:text-blue-600 transition">
                Sign Up
              </a>
            </li>
          </ul>
        </div>

        
        <div>
          <h3 className={`text-xl font-semibold mb-2 ${headingColor}`}>
            Service Centre
          </h3>
          <ul className={`space-y-1 ${textColor}`}>
            <li>
              <a href="/login" className="hover:text-blue-600 transition">
                Service Centre Login
              </a>
            </li>
          </ul>
        </div>

        
        <div>
          <h3 className={`text-xl font-semibold mb-2 ${headingColor}`}>
            Contact
          </h3>
          <p className={`${textColor}`}>Email: mendly.co@gmail.com</p>
          <p className={`${textColor}`}>Phone: +91 8299694472</p>
          <p className={`${textColor}`}>
            IIIT UNA,Vill Saloh ,UNA ,HIMACHAL PRADESH
          </p>
        </div>
      </div>

      
      <div className={`mt-6 pt-4 text-center text-sm ${textColor}`}>
        &copy; {new Date().getFullYear()} Mendly. All rights reserved.
      </div>
    </footer>
  );
}
