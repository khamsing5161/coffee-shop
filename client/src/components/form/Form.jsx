import React, { useState } from "react";
import axios from "axios";

function Form() {
  const [form, setForm] = useState({
    name: "",
    price: "",
    description: "",
  });
  const [file, setFile] = useState(null); // ✅ สำหรับเก็บไฟล์ภาพ
  const [response, setResponse] = useState(null);

  // เมื่อพิมพ์ในช่อง input
  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
  };

  // ส่งข้อมูลไป backend
  const handleSubmit = async (e) => {
    e.preventDefault();

    // ✅ สร้าง FormData เพื่อแนบไฟล์
    const formData = new FormData();
    formData.append("name", form.name);
    formData.append("price", form.price);
    formData.append("description", form.description);
    if (file) formData.append("image", file);

    try {
      const res = await axios.post("http://localhost:5000/api/products", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      setResponse(res.data.message);
      console.log(res.data);
    } catch (err) {
      console.error(err);
      setResponse("❌ ส่งข้อมูลไม่สำเร็จ");
    }
  };
  

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-amber-50">
      <form
        onSubmit={handleSubmit}
        className="bg-white p-6 rounded-xl shadow-md w-96"
      >
        <h2 className="text-2xl font-bold text-amber-800 mb-4 text-center">
          📤 Upload Coffee Product
        </h2>

        <label className="block mb-2 text-sm font-medium text-gray-700">
          Name:
        </label>
        <input
          type="text"
          name="name"
          value={form.name}
          onChange={handleChange}
          className="w-full border rounded-lg p-2 mb-4 focus:ring-2 focus:ring-amber-400"
          placeholder="Product name"
          required
        />

        <label className="block mb-2 text-sm font-medium text-gray-700">
          Price:
        </label>
        <input
          type="number"
          name="price"
          value={form.price}
          onChange={handleChange}
          className="w-full border rounded-lg p-2 mb-4 focus:ring-2 focus:ring-amber-400"
          placeholder="Price"
          required
        />

        <label className="block mb-2 text-sm font-medium text-gray-700">
          Description:
        </label>
        <textarea
          name="description"
          value={form.description}
          onChange={handleChange}
          className="w-full border rounded-lg p-2 mb-4 focus:ring-2 focus:ring-amber-400"
          placeholder="Enter description..."
          required
        />

        <label className="block mb-2 text-sm font-medium text-gray-700">
          Image:
        </label>
        <input
          type="file"
          accept="image/*"
          onChange={(e) => setFile(e.target.files[0])}
          className="w-full border rounded-lg p-2 mb-4 focus:ring-2 focus:ring-amber-400"
          required
        />

        <button
          type="submit"
          className="w-full bg-amber-700 text-white py-2 rounded-lg hover:bg-amber-800 transition"
        >
          Upload Product
        </button>
      </form>

      {response && (
        <p className="mt-4 text-center text-amber-800 font-semibold">
          {response}
        </p>
      )}
    </div>
  );
}

export default Form;
