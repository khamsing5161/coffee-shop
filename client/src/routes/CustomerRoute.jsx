import React from "react"
import { Navigate } from "react-router-dom"

function CustomerRoute({ children }) {
    const token = localStorage.getItem("token")
    const role = localStorage.getItem("role")

    if (!token) return <Navigate to="/login" />
    if (role !== "customer") return <Navigate to="/login" />

    return children
}

export default CustomerRoute
