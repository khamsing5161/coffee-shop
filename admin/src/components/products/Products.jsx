import React, { useEffect, useState } from "react";
import axios from "axios";
import './Products.css'

function AdminProductPage() {
    const [products, setProducts] = useState([]);

    // โหลดสินค้าเมื่อเปิดหน้า
    useEffect(() => {
        axios.get("http://localhost:5000/api/manage_products")
            .then(res => setProducts(res.data))
            .catch(err => console.error(err));
    }, []);


    // ฟังก์ชันลบสินค้า
    const deleteProduct = async (id) => {
        if (!confirm("ต้องการลบสินค้าจริงหรือไม่?")) return;

        try {
            await axios.delete(`http://localhost:5000/api/products/${id}`);
            setProducts(products.filter(item => item.product_id !== id));
        } catch (err) {
            console.error(err);
        }
    };
    function openModal() {
        document.getElementById('modalOverlay').style.display = 'block';
        document.getElementById('modalBox').style.display = 'block';
    }

    function closeModal() {
        document.getElementById('modalOverlay').style.display = 'none';
        document.getElementById('modalBox').style.display = 'none';
    }
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
        <section className='products' style={{ marginTop: "5rem", backgroundColor: "#FFF9E9" }}>
            <div class="header-bar">
                <h1>ຈັດການສິນຄ້າ</h1>
                <button class="add-btn" onClick={openModal}>＋ ເພີ່ມສິນຄ້າໃໝ່

                </button>
            </div>

            <div className="product-grid">

                {/* <!-- Product Card --> */}

                {products.map((p) => (
                    <div className="product-card" key={p.product_id}>
                        <img src={`http://localhost:5000${p.image}`} className="product-img" />
                        <h3>{p.name}</h3>
                        <p className="price">{p.price}</p>

                        <div className="actions">
                            <button className="edit"><span>✏️</span> ແກ້ໄຂ</button>
                            <button className="delete" onClick={() => deleteProduct(p.product_id)}>
                                <span>🗑️</span> ລົບ
                            </button>
                        </div>
                    </div>
                ))}

                {/* <!-- Add more products the same structure... --> */}

            </div>
            <div className="product-grid">

                {/* Product Card */}
                <div className="product-card">
                    <img src="https://i.imgur.com/y5kXAFG.png" className="product-img" />
                    <h3>Americano</h3>
                    <p className="price">32.000 Kip</p>

                    <div className="actions">
                        <button className="edit"><span>✏️</span> ແກ້ໄຂ</button>
                        <button className="delete"><span>🗑️</span> ລົບ</button>
                    </div>
                </div>



                {/* Modal Overlay */}
                <div id="modalOverlay" class="modal-overlay" onClick={openModal}></div>
                {/* Modal Box */}
                <div id="modalBox" className="modal-box">





                    <form
                        onSubmit={handleSubmit}
                    // className="bg-white p-6 rounded-xl shadow-md w-96"
                    >
                        <div class="modal-header">
                            <h2 className="text-2xl font-bold text-amber-800 mb-4 text-center">
                                📤 Upload Coffee Product
                            </h2>
                            <span class="close-btn" onClick={closeModal}>✕</span>
                        </div>


                        <label >
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

                        <label >
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

                        <label >
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

                        <label >
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
            </div>

        </section>
    );
}

export default AdminProductPage;
