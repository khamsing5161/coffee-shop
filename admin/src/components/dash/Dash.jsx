import React, { useEffect, useState } from "react";
import axios from "axios";
import './Dash.css';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Tooltip,
  Legend,
} from "chart.js";

ChartJS.register(CategoryScale, LinearScale, BarElement, Tooltip, Legend);

function Dashboard() {
  const [stats, setStats] = useState({
    products: 0,
    orders: 0,
    customers: 0,
    revenue: 0,
  });
  const [products, setProducts] = useState([]);

  const [recentOrders, setRecentOrders] = useState([]);
  const [totalSales, setTotalSales] = useState({
    total_sales: 0,
    total_orders: 0,
  });
  const [totalOrder, setTotalOrder] = useState(0);
  const [totalOrderPaid, setTotalOrderPaid] = useState(0);
  const [totalOrdercompleted, setTotalOrdercompleted] = useState(0);


  useEffect(() => {
    const fetchTotalOrder = async () => {
      try {
        const res = await axios.get("http://localhost:5000/api/reports/total_in_progress");
        setTotalOrder(res.data.total_in_progress);
        // ตรวจสอบว่า key ตรงกับ API จริง
      } catch (error) {
        console.error("Error fetching total orders:", error);
      }
    };

    fetchTotalOrder();
  }, []);
  
  
  useEffect(() => {
    const fetchTotalOrderPaid = async () => {
      try {
        const res = await axios.get("http://localhost:5000/api/reports/Waiting_for_payment");
        setTotalOrderPaid(res.data.total_waiting_for_payment);
        // ตรวจสอบว่า key ตรงกับ API จริง
      } catch (error) {
        console.error("Error fetching total orders:", error);
      }
    };

    fetchTotalOrderPaid();
  }, []);
  
  useEffect(() => {
    const fetchTotalOrdercompleted = async () => {
      try {
        const res = await axios.get("http://localhost:5000/api/reports/Payment_completed");
        setTotalOrdercompleted(res.data.total_Payment_completed);

      } catch (error) {
        console.error("Error fetching total orders:", error);
      }
    }
      fetchTotalOrdercompleted()
  }, []);


  useEffect(() => {
    fetchDashboard();
  }, []);
  const loadData = async () => {
    try {
      const res = await axios.get("http://localhost:5000/api/report/top-products");
      setProducts(res.data);
    } catch (err) {
      console.error("Error loading:", err);
    }
  };
  useEffect(() => {
    loadData();
  }, []);


  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await axios.get("http://localhost:5000/api/reports/total-sales");
        setTotalSales(res.data);
      } catch (error) {
        console.error(error);
      }
    };
    fetchData();
  }, []);




  const fetchDashboard = async () => {
    try {
      const res = await axios.get("http://localhost:5000/api/admin/dashboard");
      setStats(res.data.stats);
      setRecentOrders(res.data.recentOrders);
    } catch (error) {
      console.error(error);
    }
  };

  

  return (
    <div className="Dash_board" style={{ padding: "20px", marginTop: "5rem" }}>
      <h1 style={{ fontSize: "32px", marginBottom: "20px" }}>Admin Dashboard</h1>

      {/* STAT CARDS */}
      <div className="top-cards">
        <div className="card">
          <div className="icon">$</div>
          <h3>ຍອດຂາຍລວມ</h3>
          <p className="big">{totalSales.total_sales} KIP</p>
          <p className="small">ມື້ນີ້ {totalSales.total_orders} order</p>
        </div>
        {/* ...other cards */}

        <div className="card">
          <div className="icon">⏲️</div>
          <h3>ກຳລັງດຳເນີນການ</h3>
          <p className="big">{totalOrder}</p>
          <p className="small">orders status pending</p>
        </div>

        <div className="card">
          <div className="icon">🧾</div>
          <h3>ກຳລັງລໍຖ້າ</h3>
          <p className="big">{totalOrderPaid}</p>
          <p className="small">ອາເຍັນທີ່ລໍຖ້າດຳເນີນ</p>
        </div>
        <div className="card">
          <div className="icon">✔️</div>
          <h3>ສຳເລັດແລ້ວ</h3>
          <p className="big">{totalOrdercompleted}</p>
          <p className="small">ອາເຍັນທີ່ສຳເລັດແລ້ວ</p>
        </div>
      </div>

      <div className="popular">
        <div className="box left">
          <h2>ສິນຄ້າຂາຍດີ Top 5</h2>
          {products.map((product, index) => (
            <div className="item" key={product.id}>
              <div className="num">{index + 1}</div>
              <div className="info">
                <p>{product.name}</p>
                <div className="bar">
                  <span style={{ width: `${product.percent}%` }}></span>
                </div>
                <small>{product.price} kip — {product.quantity} ອາເຍັນ</small>
              </div>
            </div>
          ))}
        </div>

        <div className="box right">
          <h2>ລາຍການລ່າສຸດ</h2>

          {recentOrders.map((order) => (
            <div className="order" key={order.order_id}>
              <div>
                <strong>{order.order_id}</strong>
                <p className="time">{order.date}</p>
              </div>
              <span 
              className={`badge ${
                order.status === "pending"
                ? "bg-yellow-300"
                : order.status === "paid"
                ? "bg-blue-300"
                : order.status === "completed"
                ? "bg-green-300"
                : "bg-red-300"
              }`}
              >
                {order.status}
              </span>
              <div className="price">{order.total_price} kip</div>
            </div>
          ))}

        </div>

      </div>




    </div>
  );


}

export default Dashboard;