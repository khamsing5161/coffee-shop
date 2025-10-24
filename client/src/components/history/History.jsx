import React, { useState, useEffect } from "react";

function History() {
  // ตัวอย่างข้อมูลออร์เดอร์จำลอง (mock data)
  const [orders, setOrders] = useState([]);

  useEffect(() => {
    // จำลองการโหลดข้อมูลจากฐานข้อมูล
    const mockOrders = [
      {
        id: "ORD001",
        date: "2025-10-18",
        total: 320,
        status: "Completed",
        slip: "https://placehold.co/80x80?text=Slip1",
      },
      {
        id: "ORD002",
        date: "2025-10-19",
        total: 190,
        status: "Pending",
        slip: "https://placehold.co/80x80?text=Slip2",
      },
      {
        id: "ORD003",
        date: "2025-10-20",
        total: 250,
        status: "Completed",
        slip: "https://placehold.co/80x80?text=Slip3",
      },
    ];
    setOrders(mockOrders);
  }, []);

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      

      {/* 🔹 Order History Section */}
      <section className="flex-1 px-6 py-10">
        <h1 className="text-3xl font-bold text-center text-amber-900 mb-4">
          📦 Order History
        </h1>
        <p className="text-center text-gray-600 mb-8">
          Here are your previous coffee orders.
        </p>

        <div className="overflow-x-auto max-w-5xl mx-auto">
          <table className="min-w-full bg-white shadow-md rounded-xl overflow-hidden">
            <thead className="bg-amber-800 text-white">
              <tr>
                <th className="py-3 px-4 text-left">Order ID</th>
                <th className="py-3 px-4 text-left">Date</th>
                <th className="py-3 px-4 text-left">Total (THB)</th>
                <th className="py-3 px-4 text-left">Status</th>
                <th className="py-3 px-4 text-left">Slip</th>
              </tr>
            </thead>
            <tbody>
              {orders.map((order) => (
                <tr
                  key={order.id}
                  className="border-b hover:bg-amber-50 transition"
                >
                  <td className="py-3 px-4 font-medium">{order.id}</td>
                  <td className="py-3 px-4">{order.date}</td>
                  <td className="py-3 px-4">{order.total}</td>
                  <td
                    className={`py-3 px-4 font-semibold ${
                      order.status === "Completed"
                        ? "text-green-600"
                        : "text-yellow-600"
                    }`}
                  >
                    {order.status}
                  </td>
                  <td className="py-3 px-4">
                    <img
                      src={order.slip}
                      alt="Slip"
                      className="w-16 h-16 object-cover rounded-lg shadow"
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
      
    </div>
  );
}

export default History;
