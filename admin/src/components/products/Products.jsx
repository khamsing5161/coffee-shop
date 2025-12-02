import React, { useEffect, useState } from "react";
import axios from "axios";
import "./Products.css";

function AdminProductPage() {
  const [products, setProducts] = useState([]);
  const [editMode, setEditMode] = useState(false);
  const [editId, setEditId] = useState(null);
  const [form, setForm] = useState({ name: "", price: "", description: "" });
  const [file, setFile] = useState(null);
  const [response, setResponse] = useState("");

  // โหลดสินค้า
  useEffect(() => {
    loadProducts();
  }, []);

  const loadProducts = () => {
    axios
      .get("http://localhost:5000/api/manage_products")
      .then((res) => setProducts(res.data))
      .catch((err) => console.error(err));
  };

  // เปิด modal เพิ่มสินค้า
  const openModal = () => {
    setEditMode(false);
    setForm({ name: "", price: "", description: "" });
    setFile(null);
    document.getElementById("modalOverlay").style.display = "block";
    document.getElementById("modalBox").style.display = "block";
  };

  // เปิด modal แก้สินค้า
  const openEditModal = (product) => {
    setEditMode(true);
    setEditId(product.product_id);

    setForm({
      name: product.name,
      price: product.price,
      description: product.description,
    });

    setFile(null);

    document.getElementById("modalOverlay").style.display = "block";
    document.getElementById("modalBox").style.display = "block";
  };

  // ปิด modal
  const closeModal = () => {
    setEditMode(false);
    setEditId(null);
    setResponse("");
    setForm({ name: "", price: "", description: "" });
    setFile(null);

    document.getElementById("modalOverlay").style.display = "none";
    document.getElementById("modalBox").style.display = "none";
  };

  // input handler
  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  // ลบสินค้า
  const deleteProduct = async (id) => {
    if (!window.confirm("ต้องการลบสินค้าจริงหรือไม่?")) return;
    try {
      await axios.delete(`http://localhost:5000/api/products/${id}`);
      setProducts(products.filter((p) => p.product_id !== id));
    } catch (err) {
      console.error(err);
    }
  };

  // submit form
  const handleSubmit = async (e) => {
    e.preventDefault();

    const formData = new FormData();
    formData.append("name", form.name);
    formData.append("price", form.price);
    formData.append("description", form.description);
    if (file) formData.append("image", file);

    try {
      let res;
      if (editMode) {
        // UPDATE product
        res = await axios.put(
          `http://localhost:5000/api/products/update/${editId}`,
          formData,
          { headers: { "Content-Type": "multipart/form-data" } }
        );

        // อัปเดต state
        loadProducts();
      } else {
        // ADD product
        res = await axios.post(
          "http://localhost:5000/api/products",
          formData,
          { headers: { "Content-Type": "multipart/form-data" } }
        );
        loadProducts();
      }

      setResponse(res.data.message);
      closeModal();
    } catch (err) {
      console.error(err);
      setResponse("❌ การบันทึกข้อมูลล้มเหลว");
    }
  };

  return (
    <section className="products" style={{ marginTop: "5rem", backgroundColor: "#FFF9E9" }}>
      <div className="header-bar">
        <h1>ຈັດການສິນຄ້າ</h1>

        <button className="add-btn" onClick={openModal}>
          ＋ ເພີ່ມສິນຄ້າໃໝ່
        </button>
      </div>

      <div className="product-grid">
        {products.map((p) => (
          <div className="product-card" key={p.product_id}>
            <img src={`http://localhost:5000${p.image}`} className="product-img" />

            <h3>{p.name}</h3>
            <p className="price">{p.price}</p>

            <div className="actions">
              <button className="edit" onClick={() => openEditModal(p)}>
                ✏️ ແກ້ໄຂ
              </button>
              <button className="delete" onClick={() => deleteProduct(p.product_id)}>
                🗑️ ລົບ
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Modal */}
      <div id="modalOverlay" className="modal-overlay"></div>

      <div id="modalBox" className="modal-box">
        <form onSubmit={handleSubmit}>
          <div className="modal-header">
            <h2 className="text-2xl font-bold text-amber-800 mb-4 text-center">
              {editMode ? "✏️ Edit Product" : "📤 Upload Coffee Product"}
            </h2>
            <span className="close-btn" onClick={closeModal}>
              ✕
            </span>
          </div>

          <label>Name:</label>
          <input
            type="text"
            name="name"
            value={form.name}
            onChange={handleChange}
            className="w-full border rounded-lg p-2 mb-4"
            required
          />

          <label>Price:</label>
          <input
            type="number"
            name="price"
            value={form.price}
            onChange={handleChange}
            className="w-full border rounded-lg p-2 mb-4"
            required
          />

          <label>Description:</label>
          <textarea
            name="description"
            value={form.description}
            onChange={handleChange}
            className="w-full border rounded-lg p-2 mb-4"
            required
          />

          <label>Image:</label>
          <input
            type="file"
            accept="image/*"
            onChange={(e) => setFile(e.target.files[0])}
            className="w-full border rounded-lg p-2 mb-4"
            required={!editMode} // ✔ Edit Mode ไม่ต้องอัปโหลดรูปใหม่ก็ได้
          />

          <button type="submit" className="w-full bg-amber-700 text-white py-2 rounded-lg">
            {editMode ? "Update Product" : "Upload Product"}
          </button>

          {response && <p className="text-center mt-3">{response}</p>}
        </form>
      </div>
    </section>
  );
}

export default AdminProductPage;
