import React, { useState } from "react";
import { FaSearch } from "react-icons/fa";

const QUICK = ["AC Service", "Deep Clean", "Salon at Home", "Electrical"];

const SearchBar = ({ theme, onSearch }) => {
  const [query, setQuery] = useState("");
  const [focused, setFocused] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (onSearch) onSearch(query);
  };

  return (
    <div className="relative">
      <form onSubmit={handleSubmit} className={`relative flex items-center p-1 rounded-full border transition-all duration-300 ${theme === "light" ? "bg-gray-100 border-gray-300 hover:bg-gray-200" : "bg-gray-800 border-gray-700 hover:bg-gray-700"}`} >
        <input
          type="text"
          placeholder="Services..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => setFocused(true)}
          onBlur={() => setTimeout(() => setFocused(false), 150)}
          className={`px-2 py-1 ml-2 w-24 md:w-48 focus:outline-none text-sm transition-all duration-200 ${theme === "light" ? "bg-transparent text-gray-800" : "bg-transparent text-white"}`}
          aria-label="Search services"
        />
        <button type="submit" className={`ml-2 transition-colors duration-200 ${theme === "light" ? "text-gray-600 hover:text-[#2a59d1]" : "text-gray-300 hover:text-[#5ec8ff]"}`} aria-label="Search">
          <FaSearch size={16} />
        </button>
      </form>

      
      {focused && (
        <div className={`absolute mt-2 w-full rounded-md shadow-lg z-40 ${theme === "light" ? "bg-white" : "bg-gray-700"}`}>
          <div className="flex gap-2 p-2 flex-wrap">
            {QUICK.map((q) => (
              <button
                key={q}
                onClick={() => { setQuery(q); if (onSearch) onSearch(q); }}
                className={`text-xs px-3 py-1 rounded-full border ${theme === "light" ? "bg-gray-50 border-gray-200 text-gray-800 hover:bg-gray-100" : "bg-gray-800 border-gray-600 text-gray-200 hover:bg-gray-600"}`}
              >
                {q}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default SearchBar;
