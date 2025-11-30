import React from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import './Food.css';
import Navbar from '../Nav/Navbar';

function Food_item() {
  const { id } = useParams(); // ดึง id จาก URL
  const [item, setItem] = React.useState(null);

  React.useEffect(() => {
    axios.get(`http://localhost:5000/products/${id}`)
      .then(res => setItem(res.data))
      .catch(err => console.error(err));
  }, [id]);
  const addToCart = () => {
  if (!item) return; // ป้องกัน error ถ้า item ยังไม่ถูกโหลด

  const user_id = 4; // หรือดึงจาก context / localStorage

  axios.post("http://localhost:5000/cart_input", {
    user_id: 4,
    product_id: item.product_id,
    qty: 1,
    price: item.price
  })
    .then(res => {
      alert(res.data.message + " 🛒");
    })
    .catch(err => console.error("Add to cart error:", err));
};



  if (!item) {
    return <p className="text-center mt-10 text-gray-500">Loading...</p>;
  }

  return (
    <>
      <Navbar />
      <section className="flex-1 px-8 py-10">
        <h1 className="text-3xl font-bold text-center text-amber-900 mb-8">
          Your Cart 🛒
        </h1>


        <div className="max-w-3xl mx-auto bg-white shadow-md rounded-xl p-6">
          <div className="container">
            <div className="img_food">
              <img src={`http://localhost:5000${item.image}`} alt={item.name} />
            </div>
            <div className="title">
              <h3 className="font-semibold">{item.name}</h3>
              <p className="text-amber-700">{item.price} THB</p>
              <p className="text-gray-600">{item.description}</p>
            </div>
            <div>
              <button
                onClick={addToCart}
                className="bg-amber-700 hover:bg-amber-800 text-white px-6 py-2 rounded-md font-semibold"
              >
                ส่งไปยังตะกร้า 🛒
              </button>

            </div>
          </div>
        </div>
      </section>
    </>

  );
}

export default Food_item;