import { useState } from 'react'
import './App.css'

import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

import Mainlayout from './layout/Mainlayout'
import Searchpage from './layout/Searchpage'
import MenuPage from './layout/MenuPage'
import CartPage from './layout/CartPage'
import Payment_Page from './layout/Payment_Page'
import Order_History from './layout/Order_History'
import FormSend from './layout/FormSend'
import Menu_item from './layout/Menu_item'
import Food_item from './components/food/Food_item'
import Login from './layout/Login'
import Register from './layout/Register';

// ✅ เพิ่มบรรทัดนี้
import { ProtectedRoute } from "./auth/ProtectedRoute";
import { AdminRoute } from "./auth/AdminRoute";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Navigate to="/login" />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />


        <Route
          path="/home"
          element={
            <ProtectedRoute>
              <Mainlayout />
            </ProtectedRoute>
          }
        />
        <Route
          path="/menu"
          element={
            <ProtectedRoute>
              <MenuPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/results"
          element={
            <ProtectedRoute>
              <Searchpage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/cart"
          element={
            <ProtectedRoute>
              <CartPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/payment"
          element={
            <ProtectedRoute>
              <Payment_Page />
            </ProtectedRoute>
          }
        />
        <Route
          path="/orders"
          element={
            <ProtectedRoute>
              <Order_History />
            </ProtectedRoute>
          }
        />
        <Route
          path="/form"
          element={
            <ProtectedRoute>
              <FormSend />
            </ProtectedRoute>
          }
        />
        <Route
          path="/item"
          element={
            <ProtectedRoute>
              <Menu_item />
            </ProtectedRoute>
          }
        />
        <Route
          path="/products/:id"
          element={
            <ProtectedRoute>
              <Food_item />
            </ProtectedRoute>
          }
        />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
