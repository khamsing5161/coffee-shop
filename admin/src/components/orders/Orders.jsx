import React, { useEffect, useState } from "react";
import axios from "axios";

function AdminOrdersPage() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [updating, setUpdating] = useState(null);
  
  const token = localStorage.getItem("token");

  // โหลดออเดอร์ทั้งหมด
  const loadOrders = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const res = await axios.get(
        "http://localhost:5000/api/check_orders",
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      
      setOrders(res.data);
    } catch (err) {
      console.error("Error loading orders:", err);
      setError(err.response?.data?.error || "Failed to load orders");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadOrders();
  }, []);

  // Update payment status
  const updateStatus = async (orderId, newStatus) => {
    try {
      setUpdating(orderId);
      
      const res = await axios.put(
        `http://localhost:5000/api/update_payment_status/${orderId}`,
        { status: newStatus },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      // Update UI with complete data
      setOrders((prev) =>
        prev.map((o) => {
          if (o.order_id === orderId) {
            return {
              ...o,
              payment_status: newStatus,
              // Update order_status to 'paid' when payment is confirmed
              order_status: newStatus === 'confirmed' ? 'paid' : o.order_status
            };
          }
          return o;
        })
      );

      // Show success message with points info
      if (newStatus === 'confirmed' && res.data.points_earned) {
        alert(`✅ Payment confirmed!\n🎉 Points earned: ${res.data.points_earned}\n💰 New balance: ${res.data.new_balance}`);
      } else {
        alert(`✅ Payment status updated to: ${newStatus}`);
      }
      
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.error || "❌ Error updating status");
    } finally {
      setUpdating(null);
    }
  };

  // Format currency
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('lo-LA').format(amount);
  };

  // Loading state
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen" style={{ backgroundColor: "#FFF9E9" }}>
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-amber-600 mx-auto mb-4"></div>
          <p className="text-amber-800 text-lg">Loading orders...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen" style={{ backgroundColor: "#FFF9E9" }}>
        <div className="bg-red-100 border border-red-400 text-red-700 px-6 py-4 rounded-lg max-w-md">
          <p className="font-bold mb-2">❌ Error</p>
          <p>{error}</p>
          <button 
            onClick={loadOrders}
            className="mt-4 bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div
      className="p-8 min-h-screen"
      style={{ marginTop: "5rem", backgroundColor: "#FFF9E9" }}
    >
      {/* Header with Refresh Button */}
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-amber-800">
          📦 Order Management
        </h1>
        <button
          onClick={loadOrders}
          className="bg-amber-600 text-white px-4 py-2 rounded-lg hover:bg-amber-700 flex items-center gap-2 transition-colors"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
          Refresh
        </button>
      </div>

      {/* Empty State */}
      {orders.length === 0 ? (
        <div className="bg-white rounded-xl shadow-lg p-12 text-center">
          <div className="text-6xl mb-4">📭</div>
          <p className="text-gray-600 text-lg">ไม่มีข้อมูลคำสั่งซื้อ</p>
        </div>
      ) : (
        /* Orders Table */
        <div className="bg-white overflow-x-auto rounded-xl shadow-lg">
          <table className="w-full border-collapse">
            <thead className="bg-amber-200">
              <tr>
                <th className="p-3 border text-left">Order ID</th>
                <th className="p-3 border text-left">User ID</th>
                <th className="p-3 border text-right">Total Price</th>
                <th className="p-3 border text-center">Order Status</th>
                <th className="p-3 border text-center">Payment Status</th>
                <th className="p-3 border text-center">Payment Slip</th>
                <th className="p-3 border text-center">Actions</th>
              </tr>
            </thead>

            <tbody>
              {orders.map((o) => (
                <tr key={o.order_id} className="border-b hover:bg-amber-50 transition-colors">
                  {/* Order ID */}
                  <td className="p-3 border font-mono text-sm">#{o.order_id}</td>
                  
                  {/* User ID */}
                  <td className="p-3 border">
                    <span className="bg-gray-100 px-2 py-1 rounded text-sm">
                      User {o.user_id}
                    </span>
                  </td>
                  
                  {/* Total Price */}
                  <td className="p-3 border text-right font-semibold">
                    {formatCurrency(o.total_price)} ₭
                  </td>

                  {/* ORDER STATUS */}
                  <td className="p-3 border text-center">
                    <span
                      className={`px-3 py-1 rounded-full font-semibold text-sm inline-block ${
                        o.order_status === "pending"
                          ? "bg-yellow-200 text-yellow-800"
                          : o.order_status === "paid"
                          ? "bg-green-200 text-green-800"
                          : o.order_status === "cancelled"
                          ? "bg-red-200 text-red-800"
                          : "bg-blue-200 text-blue-800"
                      }`}
                    >
                      {o.order_status}
                    </span>
                  </td>

                  {/* PAYMENT STATUS */}
                  <td className="p-3 border text-center">
                    <span
                      className={`px-3 py-1 rounded-full font-semibold text-sm inline-block ${
                        o.payment_status === "confirmed"
                          ? "bg-green-200 text-green-800"
                          : o.payment_status === "rejected"
                          ? "bg-red-200 text-red-800"
                          : "bg-yellow-200 text-yellow-800"
                      }`}
                    >
                      {o.payment_status || "pending"}
                    </span>
                  </td>

                  {/* PAYMENT SLIP */}
                  <td className="p-3 border text-center">
                    {o.slip_image ? (
                      <a
                        href={`http://localhost:5000${o.slip_image}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-block"
                      >
                        <img
                          src={`http://localhost:5000${o.slip_image}`}
                          alt="payment slip"
                          className="w-20 h-20 object-cover rounded-lg shadow-md hover:scale-110 transition-transform cursor-pointer mx-auto"
                        />
                      </a>
                    ) : (
                      <span className="text-gray-400 text-sm">No slip</span>
                    )}
                  </td>

                  {/* ACTIONS */}
                  <td className="p-3 border">
                    <div className="flex gap-2 justify-center flex-wrap">
                      <button
                        onClick={() => updateStatus(o.order_id, "pending")}
                        disabled={updating === o.order_id}
                        className="bg-yellow-500 hover:bg-yellow-600 text-white px-3 py-1.5 rounded text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                      >
                        {updating === o.order_id ? "⏳" : "⏸️"} Pending
                      </button>

                      <button
                        onClick={() => updateStatus(o.order_id, "confirmed")}
                        disabled={updating === o.order_id}
                        className="bg-green-600 hover:bg-green-700 text-white px-3 py-1.5 rounded text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                      >
                        {updating === o.order_id ? "⏳" : "✅"} Confirm
                      </button>

                      <button
                        onClick={() => updateStatus(o.order_id, "rejected")}
                        disabled={updating === o.order_id}
                        className="bg-red-600 hover:bg-red-700 text-white px-3 py-1.5 rounded text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                      >
                        {updating === o.order_id ? "⏳" : "❌"} Reject
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Footer Stats */}
      <div className="mt-4 text-center text-gray-600 text-sm">
        Total orders: <span className="font-bold text-amber-800">{orders.length}</span>
      </div>
    </div>
  );
}

export default AdminOrdersPage;