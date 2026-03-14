import React, { useState, useRef, useEffect } from "react";
import { Link } from "react-router-dom";
import {
  FaMoon,
  FaSun,
  FaUser,
  FaBars,
  FaTimes,
  FaShoppingCart,
} from "react-icons/fa";
import SearchBar from "./searchTab";
import LocationSelector from "./Location";
const SERVICES = [
  { key: "ac", label: "AC Service", path: "/services/ac" },
  { key: "clean", label: "Deep Clean", path: "/services/clean" },
  { key: "salon", label: "Salon at Home", path: "/services/salon" },
  { key: "electrical", label: "Electrical", path: "/services/electrical" },
];

const Navbar = ({
  user,
  handleLogout,
  theme,
  toggleTheme,
  onInstantExpert,
}) => {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [servicesOpen, setServicesOpen] = useState(false);
  const [stickyBookingVisible, setStickyBookingVisible] = useState(false);
  const headerRef = useRef(null);
  const timeoutRef = useRef(null);

  const serviceHandleMouseEnter = () => {
    clearTimeout(timeoutRef.current);
    setServicesOpen(true);
  };
  const serviceHandleMouseLeave = () => {
    timeoutRef.current = setTimeout(() => setServicesOpen(false), 200);
  };
  useEffect(() => {
    const onScroll = () => {
      if (!headerRef.current) return;
      const rect = headerRef.current.getBoundingClientRect();
      setStickyBookingVisible(rect.bottom < 0);
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const handleMouseEnter = () => {
    clearTimeout(timeoutRef.current);
    setDropdownOpen(true);
  };

  const handleMouseLeave = () => {
    timeoutRef.current = setTimeout(() => setDropdownOpen(false), 200);
  };

  return (
    <>
      <nav
        ref={headerRef}
        className={`fixed top-0 left-0 right-0 z-50 transition-colors duration-200 ${
          theme === "light" ? "bg-white shadow-md" : "bg-gray-800 shadow-md"
        }`}
      >
        <div className="max-w-7xl mx-auto px-5 sm:px-9 lg:px-8">
          <div className="flex justify-between h-20 items-center">
            
            <div className="flex items-center gap-4">
              <Link to="/" className="flex items-center">
                <span className="flex items-center font-bold text-3xl">
                  <span
                    className={
                      theme === "light" ? "text-[#3bb4ff]" : "text-[#5ec8ff]"
                    }
                  >
                    MEND
                  </span>
                  <span
                    className={
                      theme === "light" ? "text-[#4ea4d9]" : "text-[#d0d2db]"
                    }
                  >
                    LY
                  </span>
                </span>
              </Link>

              
              <div
                className="hidden md:block relative"
                onMouseEnter={serviceHandleMouseEnter}
                onMouseLeave={serviceHandleMouseLeave}
              >
                <button
                  className={` px-3 py-2 rounded-md text-sm font-medium ${
                    theme === "light" ? "text-gray-700" : "text-gray-200"
                  }`}
                >
                  Services ▾
                </button>

                {servicesOpen && (
                  <div
                    className={`absolute top-full mt-2 w-64 rounded-md shadow-lg z-50 ${
                      theme === "light" ? "bg-white" : "bg-gray-700"
                    }`}
                  >
                    <div className="grid grid-cols-1 gap-0">
                      {SERVICES.map((s) => (
                        <Link
                          key={s.key}
                          to={s.path}
                          className={`block px-4 py-3 text-sm ${
                            theme === "light"
                              ? "text-gray-700 hover:bg-gray-100"
                              : "text-gray-200 hover:bg-gray-600"
                          }`}
                        >
                          {s.label}
                        </Link>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>

            
            <div className="flex-1 flex items-center gap-4 px-4">
              <LocationSelector
                theme={theme}
                locations={[
                  "Tilak Nagar, Kanpur",
                  "Delhi",
                  "Mumbai",
                  "Bangalore",
                ]}
                showETA={true}
              />

              <div className="flex-1">
                <SearchBar theme={theme} />
              </div>
            </div>

            
            <div className="flex items-center gap-3">
              <button
                onClick={toggleTheme}
                aria-label="Toggle theme"
                className={`p-3 rounded-full shadow-md border transition-all duration-300 ${
                  theme === "light"
                    ? "bg-gray-100 border-gray-300 hover:bg-gray-200"
                    : "bg-gray-800 border-gray-700 hover:bg-gray-700"
                }`}
              >
                {theme === "light" ? (
                  <FaMoon className="text-gray-800" />
                ) : (
                  <FaSun className="text-white" />
                )}
              </button>

              <button
                onClick={onInstantExpert}
                className="hidden md:inline-flex items-center px-3 py-2 rounded-md border text-sm font-medium hover:shadow-sm"
                aria-label="Instant Expert"
              >
                Instant Expert
              </button>

              {user ? (
                <div
                  className="relative hidden md:block"
                  onMouseEnter={handleMouseEnter}
                  onMouseLeave={handleMouseLeave}
                >
                  <button
                    onClick={() => setDropdownOpen((p) => !p)}
                    className={`p-3 rounded-full shadow-md border transition-all duration-300 ${
                      theme === "light"
                        ? "bg-gray-100 border-gray-300 hover:bg-gray-200"
                        : "bg-gray-800 border-gray-700 hover:bg-gray-700"
                    }`}
                    aria-haspopup="true"
                    aria-expanded={dropdownOpen}
                  >
                    <FaUser
                      className={
                        theme === "light" ? "text-gray-800" : "text-white"
                      }
                    />
                  </button>

                  {dropdownOpen && (
                    <div
                      className={`absolute right-0 mt-2 w-48 rounded-md shadow-lg z-50 ${
                        theme === "light" ? "bg-white" : "bg-gray-700"
                      } ring-1 ring-black ring-opacity-5`}
                    >
                      <div className="py-1">
                        {user.role === "user" && (
                          <Link
                            to="/dashboard/user"
                            className={`block px-4 py-2 text-sm ${
                              theme === "light"
                                ? "text-gray-700 hover:bg-gray-100"
                                : "text-gray-300 hover:bg-gray-600"
                            }`}
                            onClick={() => setDropdownOpen(false)}
                          >
                            User Dashboard
                          </Link>
                        )}
                        {user.role === "serviceCenter" && (
                          <Link
                            to="/dashboard/service"
                            className={`block px-4 py-2 text-sm ${
                              theme === "light"
                                ? "text-gray-700 hover:bg-gray-100"
                                : "text-gray-300 hover:bg-gray-600"
                            }`}
                            onClick={() => setDropdownOpen(false)}
                          >
                            Service Dashboard
                          </Link>
                        )}
                        {user.role === "admin" && (
                          <Link
                            to="/dashboard/admin"
                            className={`block px-4 py-2 text-sm ${
                              theme === "light"
                                ? "text-gray-700 hover:bg-gray-100"
                                : "text-gray-300 hover:bg-gray-600"
                            }`}
                            onClick={() => setDropdownOpen(false)}
                          >
                            Admin Dashboard
                          </Link>
                        )}
                        <button
                          onClick={() => {
                            handleLogout();
                            setDropdownOpen(false);
                          }}
                          className={`block w-full text-left px-4 py-2 text-sm ${
                            theme === "light"
                              ? "text-red-600 hover:bg-gray-100"
                              : "text-red-400 hover:bg-gray-600"
                          }`}
                        >
                          Logout
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <Link
                  to="/signup"
                  className="hidden md:block px-4 py-2 rounded-lg bg-blue-500 text-white font-medium hover:bg-blue-600"
                >
                  Signup
                </Link>
              )}

              
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className={`md:hidden p-3 rounded-full shadow-md border transition-all duration-300 ${
                  theme === "light"
                    ? "bg-gray-100 border-gray-300 hover:bg-gray-200"
                    : "bg-gray-800 border-gray-700 hover:bg-gray-700"
                }`}
              >
                {mobileMenuOpen ? (
                  <FaTimes
                    className={
                      theme === "light" ? "text-gray-800" : "text-white"
                    }
                  />
                ) : (
                  <FaBars
                    className={
                      theme === "light" ? "text-gray-800" : "text-white"
                    }
                  />
                )}
              </button>
            </div>
          </div>

          
          {mobileMenuOpen && (
            <div
              className={`md:hidden pb-4 ${
                theme === "light" ? "bg-white" : "bg-gray-800"
              }`}
            >
              <div className="flex flex-col space-y-2 px-4 py-2">
                {["Home", "About", "Contact"].map((text) => (
                  <Link
                    key={text}
                    to={text === "Home" ? "/" : `/${text.toLowerCase()}`}
                    className={`px-4 py-2 ${
                      theme === "light"
                        ? "text-gray-700 hover:bg-gray-100"
                        : "text-gray-300 hover:bg-gray-700"
                    }`}
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    {text}
                  </Link>
                ))}

                <div className="border-t pt-2">
                  <button
                    onClick={onInstantExpert}
                    className="w-full text-left px-4 py-2 rounded-md border"
                  >
                    Instant Expert
                  </button>
                </div>

                {user ? (
                  <>
                    <div
                      className={`px-4 py-2 text-sm border-t ${
                        theme === "light"
                          ? "text-gray-700 border-gray-200"
                          : "text-gray-300 border-gray-600"
                      }`}
                    >
                      {user.email}
                    </div>
                    <Link
                      to="/bookings"
                      className={`px-4 py-2 ${
                        theme === "light"
                          ? "text-gray-700 hover:bg-gray-100"
                          : "text-gray-300 hover:bg-gray-700"
                      }`}
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      Bookings
                    </Link>
                    <button
                      onClick={() => {
                        handleLogout();
                        setMobileMenuOpen(false);
                      }}
                      className={`px-4 py-2 ${
                        theme === "light"
                          ? "text-red-600 hover:bg-gray-100"
                          : "text-red-400 hover:bg-gray-700"
                      }`}
                    >
                      Logout
                    </button>
                  </>
                ) : (
                  <Link
                    to="/signup"
                    className="mx-4 mt-2 px-4 py-2 text-center rounded-lg bg-blue-500 text-white font-medium hover:bg-blue-600"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    Signup
                  </Link>
                )}
              </div>
            </div>
          )}
        </div>
      </nav>

      
      <div
        className={`fixed left-4 right-4 mx-auto max-w-4xl z-40 transition-transform duration-300 ${
          stickyBookingVisible
            ? "translate-y-0"
            : "translate-y-20 pointer-events-none"
        } bottom-6`}
      >
        <div className="bg-sky-50 border border-slate-100 p-3 rounded-lg shadow-md flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-white shadow rounded flex items-center justify-center">
              🔧
            </div>
            <div>
              <div className="text-sm font-medium">AC servicing — Basic</div>
              <div className="text-xs text-slate-600">
                Today • 2:00–3:00 PM • Est. ₹1,199
              </div>
            </div>
          </div>
          <div className="flex gap-2">
            <Link to="/booking/preview" className="px-4 py-2 border rounded">
              View
            </Link>
            <Link
              to="/checkout"
              className="px-4 py-2 bg-emerald-600 text-white rounded"
            >
              Confirm
            </Link>
          </div>
        </div>
      </div>
    </>
  );
};

export default Navbar;
