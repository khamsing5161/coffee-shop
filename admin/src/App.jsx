import { BrowserRouter, Routes, Route } from "react-router-dom";
import './App.css';
import Navbar from "./components/Nav/Navbar";
import Dashboard from "./layout/dashboard/Dashboard";
import ManageProducts from "./layout/manage_products/Manage_products";
import OrdersPage from "./layout/ordersPage/OrdersPage";
import SalesReport from "./layout/sales_report/Sales_report";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Dashboard />} /> 
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/manage-products" element={<ManageProducts />} />
        <Route path="/manage-orders" element={<OrdersPage />} />
        <Route path="/sales-report" element={<SalesReport />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;