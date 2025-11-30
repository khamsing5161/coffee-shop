import React, { useState, useEffect } from "react";
import axios from "axios";

function Payment() {
  const [orders, setOrders] = useState([]);
  const user_id = 4; // หรือดึงจาก context/localStorage

  // สำหรับเก็บรูปสลิป
  const [slip, setSlip] = useState(null);
  const [slipFile, setSlipFile] = useState(null);

  // โหลดข้อมูล Order Summary
  useEffect(() => {
    axios
      .get(`http://localhost:5000/api/Order_Summary?user_id=${user_id}`)
      .then((res) => setOrders(res.data.items || []))
      .catch((err) => console.error("Load cart error:", err));
  }, [user_id]);

  // คำนวณราคารวมทั้งหมด ✅
  const totalAmount = orders.reduce(
    (sum, item) => sum + item.price * item.qty,
    0
  );

  // เมื่ออัปโหลดสลิป
  const handleSlipUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      setSlipFile(file); // เก็บไฟล์จริง
      setSlip(URL.createObjectURL(file)); // preview
    }
  };

  // กดยืนยันการชำระเงิน
  const handlePaymentSubmit = async (e) => {
    e.preventDefault();
    if (!slipFile) {
      alert("⚠️ Please upload your payment slip!");
      return;
    }

    const formData = new FormData();
    formData.append("order_id", orders[0]?.order_id); // ใช้ order_id จาก order summary
    formData.append("slip_image", slipFile);

    try {
      const res = await axios.post("http://localhost:5000/api/slip_upload", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      alert(res.data.message);
    } catch (err) {
      console.error("Upload error:", err);
      alert("❌ Upload failed!");
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      {/* 🔹 Payment Section */}
      <section className="flex-1 px-6 py-10">
        <h1 className="text-3xl font-bold text-center text-amber-900 mb-4">
          💳 Payment Confirmation
        </h1>
        <p className="text-center text-gray-600 mb-8">
          Please review your order and complete your payment below.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-5xl mx-auto">
          {/* 🔸 Order Summary */}
          <div className="bg-white shadow-md rounded-xl p-6">
            <h2 className="text-xl font-semibold mb-4 text-amber-900">
              🧾 Order Summary
            </h2>
            <ul className="divide-y">
              {orders.map((item) => (
                <li
                  key={item.product_id}
                  className="flex justify-between py-2 text-gray-700"
                >
                  <span>
                    {item.product_name} x {item.qty}
                  </span>
                  <span>{item.price * item.qty} THB</span>
                </li>
              ))}
            </ul>
            <h3 className="mt-4 text-lg font-bold text-amber-700">
              Total: {totalAmount} THB
            </h3>
          </div>

          {/* 🔸 Payment Details */}
          <div className="bg-white shadow-md rounded-xl p-6">
            <h2 className="text-xl font-semibold mb-4 text-amber-900">
              🏦 Payment Information
            </h2>
            <p>Account Name: <strong>Coffee Time Co.</strong></p>
            <p>Bank: <strong>Bangkok Bank</strong></p>
            <p>Account Number: <strong>123-456-7890</strong></p>
            <p className="mt-3">Or scan QR code:</p>
            <img
              src="https://placehold.co/150x150?text=QR+Code"
              alt="QR Code"
              className="my-3 rounded-md shadow-md mx-auto"
            />

            <form
              onSubmit={handlePaymentSubmit}
              className="flex flex-col gap-4 mt-4"
            >
              <label className="font-medium text-gray-700">
                Upload Payment Slip:
              </label>
              <input
                type="file"
                accept="image/*"
                onChange={handleSlipUpload}
                className="border border-gray-300 rounded-md p-2"
                required
              />
              {slip && (
                <img
                  src={slip}
                  alt="Slip Preview"
                  className="w-40 mx-auto rounded-lg shadow"
                />
              )}
              <button
                type="submit"
                className="bg-amber-700 hover:bg-amber-800 text-white py-2 rounded-md font-semibold"
              >
                ✅ Confirm Payment
              </button>
            </form>
          </div>
        </div>
      </section>
    </div>
  );
}

export default Payment;