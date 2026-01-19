import React, { useState, useEffect } from "react";
import axios from "axios";

function Payment() {
  const [orders, setOrders] = useState([]);
  const [slip, setSlip] = useState(null);
  const [slipFile, setSlipFile] = useState(null);
  const [points, setPoints] = useState(0);
  const [usePoints, setUsePoints] = useState(0);
  const [discount, setDiscount] = useState(0);
  const [finalTotal, setFinalTotal] = useState(0);

  const token = localStorage.getItem("token");
  const orderId = orders.length > 0 ? orders[0].order_id : null;

  /* ================= โหลดโปรไฟล์ (คะแนน) ================= */
  useEffect(() => {
    axios
      .get("http://localhost:5000/api/profile", {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((res) => setPoints(res.data.points || 0))
      .catch((err) => console.error(err));
  }, [token]);

  /* ================= โหลด Order Summary ================= */
  const loadOrderSummary = async () => {
    try {
      const res = await axios.get("http://localhost:5000/api/Order_Summary", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setOrders(res.data.items || []);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    loadOrderSummary();
    const interval = setInterval(loadOrderSummary, 1000); // โหลดใหม่ทุก 1 วิ
    return () => clearInterval(interval);
  }, []);

  /* ================= รวมราคา ================= */
  const totalAmount = orders.reduce(
    (sum, item) => sum + item.price * item.qty,
    0
  );

  useEffect(() => {
    setFinalTotal(totalAmount);
  }, [totalAmount]);

  /* ================= ใช้แต้ม ================= */
  const redeemPoints = async () => {
    if (!orderId || usePoints <= 0) {
      alert("❌ กรุณาใส่จำนวนแต้ม");
      return;
    }

    if (usePoints > points) {
      alert("❌ แต้มไม่พอ");
      return;
    }

    try {
      const res = await axios.post(
        "http://localhost:5000/api/redeem-points",
        { order_id: orderId, points_used: Number(usePoints) },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setDiscount(res.data.discount);
      setFinalTotal(res.data.total_after_discount);
      alert(`🎉 ลดราคา ${res.data.discount} THB`);
    } catch (err) {
      console.error(err);
      alert("❌ ใช้แต้มไม่สำเร็จ");
    }
  };

  /* ================= อัปโหลดสลิป ================= */
  const handleSlipUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      setSlipFile(file);
      setSlip(URL.createObjectURL(file));
    }
  };

  /* ================= ยืนยันการชำระเงิน ================= */
  const handlePaymentSubmit = async (e) => {
    e.preventDefault();
    if (!slipFile || !orderId) {
      alert("⚠️ กรุณาอัปโหลดสลิป");
      return;
    }

    const formData = new FormData();
    formData.append("order_id", orderId);
    formData.append("slip_image", slipFile);

    try {
      const res = await axios.post(
        "http://localhost:5000/api/slip_upload",
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
            Authorization: `Bearer ${token}`,
          },
        }
      );

      alert(res.data.message);
    } catch (err) {
      console.error(err);
      alert("❌ Upload failed");
    }
  };

  /* ================= Render ================= */
  return (
    <div className="min-h-screen bg-gray-50 px-6 py-10">
      <h1 className="text-3xl font-bold text-center text-amber-900 mb-6">
        💳 Payment Confirmation
      </h1>

      <div className="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto">
        {/* Order Summary */}
        <div className="bg-white p-6 rounded-xl shadow">
          <h2 className="text-xl font-semibold mb-4">🧾 Order Summary</h2>

          <ul className="divide-y">
            {orders.map((item) => (
              <li key={item.product_id} className="flex justify-between py-2">
                <span>
                  {item.product_name} x {item.qty}
                </span>
                <span>{item.price * item.qty} THB</span>
              </li>
            ))}
          </ul>

          <p className="mt-4">Subtotal: {totalAmount} THB</p>

          {discount > 0 ? (
            <>
              <p className="text-green-600">Discount: -{discount} THB</p>
              <p className="text-xl font-bold text-red-600">
                ต้องชำระจริง: {finalTotal} THB
              </p>
            </>
          ) : (
            <p className="text-xl font-bold text-amber-700">
              Total: {totalAmount} THB
            </p>
          )}
        </div>

        {/* Payment */}
        <div className="bg-white p-6 rounded-xl shadow">
          <h2 className="text-xl font-semibold mb-4">🏦 Payment</h2>

          <form onSubmit={handlePaymentSubmit} className="space-y-4">
            <input
              type="file"
              accept="image/*"
              onChange={handleSlipUpload}
              required
            />

            <div className="border p-4 rounded">
              <p>⭐ คะแนนของคุณ: {points}</p>

              <input
                type="number"
                min="0"
                max={points}
                value={usePoints}
                onChange={(e) => setUsePoints(Number(e.target.value))}
                className="border p-2 rounded w-full my-2"
                placeholder="ใส่จำนวนแต้ม"
              />

              <button
                type="button"
                onClick={redeemPoints}
                disabled={points === 0}
                className={`w-full py-2 rounded text-white ${
                  points === 0 ? "bg-gray-400" : "bg-amber-600"
                }`}
              >
                ใช้แต้มแลกส่วนลด
              </button>
            </div>

            {slip && (
              <img
                src={slip}
                alt="Slip"
                className="w-40 mx-auto rounded shadow"
              />
            )}

            <button
              type="submit"
              className="w-full bg-amber-700 text-white py-2 rounded"
            >
              ✅ Confirm Payment
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

export default Payment;
