import React, { useState, useRef, useEffect } from "react";
import { FaMapMarkerAlt, FaChevronDown } from "react-icons/fa";

const LocationSelector = ({ theme, locations = [], showETA = false, onSelect }) => {
  const [selected, setSelected] = useState(locations[0] || "Select Location");
  const [open, setOpen] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);
  const getETAFor = (loc) => {
    const base = loc.length % 30;
    return `${15 + base}m`;
  };

  const handleSelect = (location) => {
    setSelected(location);
    setOpen(false);
    if (onSelect) onSelect(location);
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setOpen(!open)}
        className={`flex items-center gap-2 p-2 rounded-full border text-sm font-medium transition-all duration-300 ${theme === "light" ? "bg-gray-100 border-gray-300 text-gray-700 hover:bg-gray-200" : "bg-gray-800 border-gray-700 text-gray-200 hover:bg-gray-700"}`}
        aria-haspopup="listbox"
        aria-expanded={open}
      >
        <FaMapMarkerAlt className={theme === "light" ? "text-[#2a59d1]" : "text-[#5ec8ff]"} />
        <span className="truncate max-w-[120px]">{selected}</span>
        {showETA && <span className="ml-2 text-xs bg-sky-50 text-sky-700 px-2 py-1 rounded">{`Pros • ${getETAFor(selected)}`}</span>}
        <FaChevronDown className={`transition-transform duration-200 ${open ? "rotate-180" : "rotate-0"}`} />
      </button>

      {open && (
        <div className={`absolute mt-2 w-56 rounded-md shadow-lg z-50 border ${theme === "light" ? "bg-white border-gray-200" : "bg-gray-700 border-gray-600"}`} role="listbox">
          {locations.map((loc, idx) => (
            <div
              key={idx}
              onClick={() => handleSelect(loc)}
              className={`px-4 py-2 cursor-pointer transition-colors duration-200 flex justify-between items-center ${theme === "light" ? "hover:bg-gray-100 text-gray-700" : "hover:bg-gray-600 text-gray-200"}`}
              role="option"
              aria-selected={selected === loc}
            >
              <span>{loc}</span>
              {showETA && <span className="text-xs text-slate-400">{getETAFor(loc)}</span>}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default LocationSelector;
