import React, { useState } from "react";

function CartPage() {
  const [cartItems, setCartItems] = useState([
    { id: 1, name: "Espresso", price: 90, qty: 1 },
    { id: 2, name: "Cappuccino", price: 120, qty: 2 },
    { id: 3, name: "Latte", price: 110, qty: 1 },
  ]);

  // คำนวณราคารวมทั้งหมด
  const totalPrice = cartItems.reduce(
    (sum, item) => sum + item.price * item.qty,
    0
  );

  // ลบสินค้าออกจากตะกร้า
  const removeItem = (id) => {
    setCartItems(cartItems.filter((item) => item.id !== id));
  };

  // ปรับจำนวนสินค้า
  const updateQty = (id, change) => {
    setCartItems((prev) =>
      prev.map((item) =>
        item.id === id
          ? { ...item, qty: Math.max(1, item.qty + change) }
          : item
      )
    );
  };

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      
      

      {/* 🔹 Cart Section */}
      <section className="flex-1 px-8 py-10">
        <h1 className="text-3xl font-bold text-center text-amber-900 mb-8">
          Your Cart 🛒
        </h1>

        <div className="max-w-3xl mx-auto bg-white shadow-md rounded-xl p-6">
          {cartItems.length === 0 ? (
            <p className="text-center text-gray-500">Your cart is empty ☕</p>
          ) : (
            <div className="space-y-4">
              {cartItems.map((item) => (
                <div
                  key={item.id}
                  className="flex justify-between items-center border-b pb-4"
                >
                  <div>
                    <h3 className="text-lg font-semibold text-amber-900">
                      {item.name}
                    </h3>
                    <p className="text-gray-500">{item.price} THB</p>
                  </div>

                  <div className="flex items-center space-x-3">
                    <button
                      onClick={() => updateQty(item.id, -1)}
                      className="bg-gray-200 px-3 rounded"
                    >
                      -
                    </button>
                    <span>{item.qty}</span>
                    <button
                      onClick={() => updateQty(item.id, 1)}
                      className="bg-gray-200 px-3 rounded"
                    >
                      +
                    </button>
                    <button
                      onClick={() => removeItem(item.id)}
                      className="text-red-500 hover:underline ml-3"
                    >
                      Remove
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* 🔹 Cart Summary */}
        <div className="text-center mt-8">
          <h2 className="text-2xl font-semibold">
            Total: <span className="text-amber-700">{totalPrice}</span> THB
          </h2>
          <button
            onClick={() => alert("Proceeding to checkout 💳")}
            className="mt-4 bg-amber-700 hover:bg-amber-800 text-white px-6 py-2 rounded-md font-semibold"
          >
            Proceed to Checkout 💳
          </button>
        </div>
      </section>

      
    </div>
  );
}

export default CartPage;
