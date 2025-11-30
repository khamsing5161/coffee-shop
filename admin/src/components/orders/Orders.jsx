import React, { useEffect, useState } from "react";
import axios from "axios";

function AdminOrdersPage() {
  const [orders, setOrders] = useState([]);

  // โหลดออเดอร์ทั้งหมด (รวม payment)
  const loadOrders = async () => {
    try {
      const res = await axios.get("http://localhost:5000/api/check_orders");
      setOrders(res.data);
    } catch (err) {
      console.error("Error loading orders:", err);
    }
  };

  useEffect(() => {
    loadOrders();
  }, []);

  // update status
  const updateStatus = async (orderId, newStatus) => {
    try {
      await axios.put(`http://localhost:5000/api/orders/status/${orderId}`, {
        status: newStatus,
      });

      // update UI
      setOrders((prev) =>
        prev.map((o) =>
          o.order_id === orderId ? { ...o, order_status: newStatus } : o
        )
      );

      alert("✔ Order status updated!");
    } catch (err) {
      console.error(err);
      alert("❌ Error updating status");
    }
  };

  return (
    <div className="p-8 bg-gray-100 min-h-screen" style={{ marginTop: "5rem", backgroundColor: "#FFF9E9" }}>
      <h1 className="text-3xl font-bold mb-6 text-amber-800">
        📦 Order Management
      </h1>

      <div className="bg-white overflow-hidden rounded-xl shadow-lg">
        <table className="w-full border-collapse">
          <thead className="bg-amber-200">
            <tr>
              <th className="p-3 border">Order ID</th>
              <th className="p-3 border">User</th>
              <th className="p-3 border">Total</th>
              <th className="p-3 border">Order Status</th>
              <th className="p-3 border">Payment Status</th>
              <th className="p-3 border">Slip</th>
              <th className="p-3 border">Actions</th>
            </tr>
          </thead>

          <tbody>
            {orders.map((o) => (
              <tr key={o.order_id} className="text-center border-b">
                <td className="p-3 border">{o.order_id}</td>
                <td className="p-3 border">{o.user_id}</td>
                <td className="p-3 border">{o.total_price} Kip</td>

                {/* ORDER STATUS */}
                <td className="p-3 border">
                  <span
                    className={`px-2 py-1 rounded ${
                      o.order_status === "pending"
                        ? "bg-yellow-300"
                        : o.order_status === "paid"
                        ? "bg-blue-300"
                        : o.order_status === "completed"
                        ? "bg-green-300"
                        : "bg-red-300"
                    }`}
                  >
                    {o.order_status}
                  </span>
                </td>

                {/* PAYMENT STATUS */}
                <td className="p-3 border">
                  {o.payment_status ? (
                    <span
                      className={`px-2 py-1 rounded ${
                        o.payment_status === "pending"
                          ? "bg-yellow-200"
                          : o.payment_status === "confirmed"
                          ? "bg-green-300"
                          : "bg-red-300"
                      }`}
                    >
                      {o.payment_status}
                    </span>
                  ) : (
                    <span className="text-gray-400">No Payment</span>
                  )}
                </td>

                {/* SLIP IMAGE */}
                <td className="p-3 border">
                  {o.slip_image ? (
                    <img
                      src={`http://localhost:5000${o.slip_image}`}
                      alt="slip"
                      className="w-16 rounded shadow"
                    />
                  ) : (
                    <span className="text-gray-400">None</span>
                  )}
                </td>

                {/* ACTION BUTTONS */}
                <td className="p-3 border flex gap-2 justify-center">
                  <button
                    onClick={() => updateStatus(o.order_id, "paid")}
                    className="bg-blue-500 text-white px-3 py-1 rounded-lg"
                  >
                    Mark Paid
                  </button>

                  <button
                    onClick={() => updateStatus(o.order_id, "Payment completed")}
                    className="bg-green-600 text-white px-3 py-1 rounded-lg"
                  >
                    Payment completed
                  </button>

                  <button
                    onClick={() => updateStatus(o.order_id, "cancelled")}
                    className="bg-red-600 text-white px-3 py-1 rounded-lg"
                  >
                    Cancel
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {orders.length === 0 && (
        <p className="text-center mt-6 text-gray-600">
          ไม่มีข้อมูลคำสั่งซื้อ
        </p>
      )}
    </div>
  );
}

export default AdminOrdersPage;
