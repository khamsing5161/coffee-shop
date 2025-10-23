import { useState } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import './App.css'
import Mainlayout from './layout/Mainlayout'

import { BrowserRouter, Routes, Route } from "react-router-dom";
import MenuPage from './layout/MenuPage'
import CartPage from './layout/CartPage'



function App() {
  const [count, setCount] = useState(0)

  return (
    
    <>
    
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Mainlayout />}></Route>
          <Route path="/menu" element={<MenuPage />}></Route>
          <Route path="/cart" element={<CartPage />}></Route>
          

        </Routes>
      </BrowserRouter>
    </>
    
  )
}

export default App
