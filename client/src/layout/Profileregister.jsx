import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

function ProfileRegister() {
  const [form, setForm] = useState({
    phone: "",
    address: "",
    gender: "",
    birthdate: ""
  });
  const [image, setImage] = useState(null);
  const navigate = useNavigate();
  const token = localStorage.getItem("token");

  // เปลี่ยนค่า input
  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  // ส่งข้อมูลไป backend
  const handleSubmit = async (e) => {
    e.preventDefault();

    const formData = new FormData();
    formData.append("phone", form.phone);
    formData.append("address", form.address);
    formData.append("gender", form.gender);
    formData.append("birthdate", form.birthdate);
    if (image) formData.append("profile_image", image);

    try {
      await axios.post(
        "http://localhost:5000/api/register/user_profiles",
        formData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "multipart/form-data"
          }
        }
      );

      alert("✅ Profile created successfully");
      navigate("/home");
    } catch (err) {
      console.error(err);
      alert("❌ Create profile failed");
    }
  };

  return (
    <div className="min-h-screen bg-amber-50 flex items-center justify-center">
      <form
        onSubmit={handleSubmit}
        className="bg-white w-96 p-6 rounded-xl shadow-lg"
      >
        <h2 className="text-2xl font-bold text-center text-amber-800 mb-6">
          🧾 Complete Your Profile
        </h2>

        {/* รูปโปรไฟล์ */}
        <input
          type="file"
          accept="image/*"
          onChange={(e) => setImage(e.target.files[0])}
          className="w-full mb-4"
        />

        <input
          type="text"
          name="phone"
          placeholder="Phone number"
          value={form.phone}
          onChange={handleChange}
          required
          className="w-full p-2 border rounded-lg mb-3"
        />

        <textarea
          name="address"
          placeholder="Address"
          value={form.address}
          onChange={handleChange}
          required
          className="w-full p-2 border rounded-lg mb-3"
        />

        <select
          name="gender"
          value={form.gender}
          onChange={handleChange}
          required
          className="w-full p-2 border rounded-lg mb-3"
        >
          <option value="">Select gender</option>
          <option value="male">Male</option>
          <option value="female">Female</option>
          <option value="other">Other</option>
        </select>

        <input
          type="date"
          name="birthdate"
          value={form.birthdate}
          onChange={handleChange}
          required
          className="w-full p-2 border rounded-lg mb-4"
        />

        <button
          type="submit"
          className="w-full bg-amber-700 text-white py-2 rounded-lg hover:bg-amber-800"
        >
          Save Profile
        </button>
      </form>
    </div>
  );
}

export default ProfileRegister;
