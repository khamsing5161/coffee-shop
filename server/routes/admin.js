import express from "express";
import { verifyToken, isAdmin } from "../middleware/auth.js";
import { db } from "../db.js";

const router = express.Router();

// Example admin route
router.get("/dashboard", verifyToken, isAdmin, (req, res) => {
    res.json({ message: "Welcome admin dashboard" });
});

// Example: manage products
router.get("/products", verifyToken, isAdmin, (req, res) => {
    db.query("SELECT * FROM products", (err, result) => {
        if(err) return res.status(500).json(err);
        res.json(result);
    });
});

export default router;
