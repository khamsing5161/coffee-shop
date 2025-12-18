import React, { useState, useEffect } from "react";
import axios from "axios";

function History() {
  const [orders, setOrders] = useState([]);

  useEffect(() => {
    const token = localStorage.getItem("token");

    axios
      .get("http://localhost:5000/api/order_history", {
        headers: {
          Authorization: `Bearer ${token}`
        }
      })
      .then((res) => setOrders(res.data || []))
      .catch((err) =>
        console.error("Load order history error:", err)
      );
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 px-6 py-10">
      <h1 className="text-3xl font-bold text-center text-amber-900 mb-4">
        📦 Order History
      </h1>
      <p className="text-center text-gray-600 mb-8">
        Here are your previous coffee orders.
      </p>

      <div className="overflow-x-auto max-w-6xl mx-auto">
        <table className="min-w-full bg-white shadow-md rounded-xl overflow-hidden">
          <thead className="bg-amber-800 text-white">
            <tr>
              <th className="py-3 px-4 text-left">Order ID</th>
              <th className="py-3 px-4 text-left">Date</th>
              <th className="py-3 px-4 text-left">Total</th>
              <th className="py-3 px-4 text-left">Discount</th>
              <th className="py-3 px-4 text-left">Final Total</th>
              <th className="py-3 px-4 text-left">Status</th>
              <th className="py-3 px-4 text-left">Slip</th>
            </tr>
          </thead>

          <tbody>
            {orders.length === 0 && (
              <tr>
                <td colSpan="7" className="text-center py-6 text-gray-500">
                  No orders found
                </td>
              </tr>
            )}

            {orders.map((order) => (
              <tr
                key={order.order_id}
                className="border-b hover:bg-amber-50 transition"
              >
                <td className="py-3 px-4 font-medium">
                  #{order.order_id}
                </td>

                <td className="py-3 px-4">
                  {new Date(order.date).toLocaleString()}
                </td>

                <td className="py-3 px-4">
                  {order.total_price} THB
                </td>

                <td className="py-3 px-4 text-green-600">
                  -{order.discount_amount || 0} THB
                </td>

                <td className="py-3 px-4 font-semibold text-amber-700">
                  {(order.total_after_discount ??
                    order.total_price)}{" "}
                  THB
                </td>

                <td
                  className={`py-3 px-4 font-semibold ${
                    order.status === "paid" ||
                    order.status === "Payment completed"
                      ? "text-green-600"
                      : "text-yellow-600"
                  }`}
                >
                  {order.status}
                </td>

                <td className="py-3 px-4">
                  {order.slip_image ? (
                    <img
                      src={`http://localhost:5000${order.slip_image}`}
                      alt="Slip"
                      className="w-16 h-16 object-cover rounded-lg shadow"
                    />
                  ) : (
                    <span className="text-gray-400">No slip</span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default History;
