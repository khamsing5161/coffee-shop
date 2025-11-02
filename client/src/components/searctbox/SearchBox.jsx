import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'

function SearchBox() {
  const [query , setQuery] = useState("")
  const navigate = useNavigate()
  const handleSearch = (e) => {
    e.preventDefault(); // ป้องกันการรีเฟรชหน้า
    navigate("/results", { state: { query } });
  };
  return (
    <>
      <section className="text-center py-10 bg-amber-50">
        
        <h1 className="text-4xl font-bold text-amber-900 mb-3">
          Our Coffee Menu
        </h1>
        <p className="text-gray-600 mb-6">
          Find your perfect cup of coffee below ☕
        </p>
        <form className="center">
          <input
          type="text"
          placeholder="Search coffee..."
          value={query}
          onChange={(e) => 
            setQuery(e.target.value)
          }
          className="border border-gray-300 rounded-md px-4 py-2 w-64 focus:outline-none focus:ring-2 focus:ring-amber-500"
          />
          <button className="search_btn " onClick={handleSearch}>Q</button>
        </form>
      </section>
    
    </>
  )
}

export default SearchBox