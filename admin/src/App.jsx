import { BrowserRouter, Routes, Route } from "react-router-dom";
import './App.css';
import Navbar from "./components/Nav/Navbar";
import Dashboard from "./layout/dashboard/Dashboard";
import ManageProducts from "./layout/manage_products/Manage_products";
import OrdersPage from "./layout/ordersPage/OrdersPage";
import SalesReport from "./layout/sales_report/Sales_report";
import Login from "./layout/login/Login";
import { ProtectedRoute } from "./auth/ProtectedRoute";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Login />} /> 
        <Route path="/login" element={<Login />} /> 


        <Route path="/dashboard" element={<ProtectedRoute> <Dashboard /></ProtectedRoute>} />
        <Route path="/manage-products" element={<ProtectedRoute><ManageProducts /></ProtectedRoute>} />
        <Route path="/manage-orders" element={<ProtectedRoute><OrdersPage /></ProtectedRoute>} />
        <Route path="/sales-report" element={<ProtectedRoute><SalesReport /></ProtectedRoute>} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;