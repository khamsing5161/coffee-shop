import express from "express";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { db } from "../db.js"; // assume you export db connection from db.js

const router = express.Router();
const JWT_SECRET = process.env.JWT_SECRET;

// Register (customer only)
router.post("/register", async (req, res) => {
    const { name, email, password } = req.body;
    if (!name || !email || !password) 
        return res.status(400).json({ message: "Missing fields" });

    const hashed = await bcrypt.hash(password, 10);
    const sql = "INSERT INTO users (name,email,password,role) VALUES (?,?,?, 'customer')";
    db.query(sql, [name, email, hashed], (err, result) => {
        if(err) return res.status(500).json({ message: err.message });
        res.status(201).json({ message: "User registered" });
    });
});

// Login
router.post("/login", (req, res) => {
    const { email, password } = req.body;
    const sql = "SELECT * FROM users WHERE email = ?";
    db.query(sql, [email], async (err, result) => {
        if(err) return res.status(500).json({ message: err.message });
        if(result.length === 0) return res.status(400).json({ message: "Email not found" });

        const user = result[0];
        const isValid = await bcrypt.compare(password, user.password);
        if(!isValid) return res.status(400).json({ message: "Incorrect password" });

        const token = jwt.sign(
            { user_id: user.user_id, role: user.role }, 
            JWT_SECRET, 
            { expiresIn: "1d" }
        );

        res.json({ token, role: user.role });
    });
});

export default router;
