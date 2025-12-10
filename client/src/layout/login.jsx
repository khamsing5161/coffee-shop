import React, { useEffect } from 'react'
import axios from 'axios'
import { Link, useNavigate } from 'react-router-dom'

function Login() {
    const [email, setEmail] = React.useState("")
    const [password, setPassword] = React.useState("")
    const navigate = useNavigate()

    // ถ้ามี token แล้วให้เด้งไป /home
    useEffect(() => {
        const token = localStorage.getItem("token")
        if (token) {
            navigate("/home")
        }
    }, [])

    const handleSubmit = async (e) => {
        e.preventDefault()

        try {
            const res = await axios.post("http://localhost:5000/login", {
                email,
                password
            })

            // Save token + role
            localStorage.setItem("token", res.data.token)
            localStorage.setItem("role", res.data.role)

            // Redirect by role (admin/customer)
            navigate("/home")

        } catch (err) {
            alert("Invalid email or password")
        }
    }

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-100">
            <form onSubmit={handleSubmit} className="bg-white p-6 rounded-xl shadow-md w-96">
                <h2 className="text-2xl font-bold text-center mb-4">Login</h2>

                <input 
                    type="email" 
                    placeholder="Email" 
                    className="w-full p-2 border rounded mb-3"
                    value={email} 
                    onChange={(e) => setEmail(e.target.value)} 
                />

                <input 
                    type="password" 
                    placeholder="Password" 
                    className="w-full p-2 border rounded mb-4"
                    value={password} 
                    onChange={(e) => setPassword(e.target.value)} 
                />

                <button className="w-full bg-blue-600 text-white p-2 rounded">
                    Login
                </button>

                <p className="text-center mt-3">
                    Don't have an account? <Link to="/register" className="text-blue-600">register</Link>
                </p>
            </form>
        </div>
    )
}

export default Login
