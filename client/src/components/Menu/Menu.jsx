import React, { useState, useEffect } from "react";
import axios from "axios";
import { Link } from "react-router-dom";
import SearchBox from "../searctbox/SearchBox";

function Menu() {
  const [Menu, setMenu] = useState([]);

  useEffect(() => {
    axios.get("http://localhost:5000/menus",{
      headers:{
        Authorization: `Bearer ${localStorage.getItem("token")}`
      }
    })
      .then(res => setMenu(res.data))
      .catch(err => console.error(err));
  }, []);

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      {/* 🔹 Menu Header */}
      <SearchBox />

      {/* 🔹 Menu List */}
      <section className="flex-1 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 px-8 pb-12">
        {Menu.map((item) => (
          <Link to={`/products/${item.product_id}`} key={item.product_id}>
            <div className="bg-white rounded-xl shadow-md p-4 hover:shadow-lg hover:scale-105 transition-transform duration-200 text-center">
              <img
                src={`http://localhost:5000${item.image}`}
                alt={item.name}
                className="rounded-md mx-auto mb-3"
              />
              <h3 className="text-lg font-semibold text-amber-900">{item.name}</h3>
              <p className="text-amber-700">{item.price} THB</p>
            </div>
          </Link>
        ))}
      </section>
    </div>
  );
}

export default Menu;