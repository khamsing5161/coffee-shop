import React from 'react'
import Products from '../../components/products/Products'
import Navbar from '../../components/Nav/Navbar'
import './Manage_products.css'

function Manage_products() {
  return (
    <section className='products'>
        <Navbar />
        <Products />
    </section>
  )
}

export default Manage_products