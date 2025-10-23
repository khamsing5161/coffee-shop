import React, { useState } from "react";

function Menu() {
  const [search, setSearch] = useState("");

  const menuItems = [
    { name: "Espresso", price: "$3.50" },
    { name: "Cappuccino", price: "$4.00" },
    { name: "Latte", price: "$4.50" },
    { name: "Mocha", price: "$5.00" },
    { name: "Americano", price: "$3.00" },
    { name: "Macchiato", price: "$4.20" },
  ];

  const filteredMenu = menuItems.filter((item) =>
    item.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      

      {/* 🔹 Menu Header */}
      <section className="text-center py-10 bg-amber-50">
        <h1 className="text-4xl font-bold text-amber-900 mb-3">
          Our Coffee Menu
        </h1>
        <p className="text-gray-600 mb-6">
          Find your perfect cup of coffee below ☕
        </p>
        <input
          type="text"
          placeholder="Search coffee..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="border border-gray-300 rounded-md px-4 py-2 w-64 focus:outline-none focus:ring-2 focus:ring-amber-500"
        />
      </section>

      {/* 🔹 Menu List */}
      <section className="flex-1 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 px-8 pb-12">
        {filteredMenu.map((item, index) => (
          <div
            key={index}
            className="bg-white rounded-xl shadow-md p-4 hover:shadow-lg hover:scale-105 transition-transform duration-200 text-center"
          >
            <img
              src={`https://placehold.co/200x150?text=${item.name}`}
              alt={item.name}
              className="rounded-md mx-auto mb-3"
            />
            <h3 className="text-lg font-semibold text-amber-900">
              {item.name}
            </h3>
            <p className="text-amber-700">{item.price}</p>
          </div>
        ))}
      </section>

      {/* 🔹 Footer */}
      
    </div>
  );
}

export default Menu;
