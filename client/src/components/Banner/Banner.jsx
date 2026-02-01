import axios from "axios";
import React from "react";
import { useState } from "react";
import { useEffect } from "react";
import { Link } from 'react-router-dom';


function Banner() {

  const [products, setProducts] = useState([]);


  useEffect(() => {
    axios.get("http://localhost:5000/", {
      headers: {
        Authorization: `Bearer ${localStorage.getItem("token")}`

      }
    })
      .then(res => setProducts(res.data))
      .catch(err => console.error(err))
  }, [])

  return (
    <>
      {/* 🔹 Banner */}
      <section className="flex flex-col items-center justify-center text-center py-20 bg-[url('https://images.unsplash.com/photo-1511920170033-f8396924c348?auto=format&fit=crop&w=1400&q=80')] bg-cover bg-center text-white">
        <h1 className="text-4xl md:text-5xl font-bold mb-4 drop-shadow-lg">
          Welcome to Coffee Time
        </h1>
        <p className="text-lg mb-6">Start your. day with your favorite coffee!</p>
        <button
          onClick={() => alert("Explore our menu below 👇")}
          className="bg-yellow-500 hover:bg-yellow-600 text-black px-6 py-2 rounded-md font-semibold"
        >
          Explore Menu
        </button>
      </section>

      {/* 🔹 Recommended Menu */}
      <section className="flex-1 py-10 px-6 text-center">
        <h2 className="text-2xl font-semibold mb-6">☕ Recommended Menu</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
          {products.map((item, index) => (
            <Link to={`/products/${item.product_id}`} key={item.id}>
              <div className="bg-white rounded-xl shadow-md p-4 hover:scale-105 transition-transform duration-200">
                <img
                  src={`http://localhost:5000${item.image}`}
                  alt={item.name}
                  className="rounded-md mb-3"
                />
                <h3 className="font-semibold">{item.name}</h3>
                <p className="text-amber-700">{item.price} THB</p>
              </div>
            </Link>

          ))}
        </div>
      </section>
    </>
  );
}

export default Banner;
