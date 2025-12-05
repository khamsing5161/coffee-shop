import express from "express";
import { verifyToken, isCustomer } from "../middleware/auth.js";

const router = express.Router();

// Example customer route
router.get("/home", verifyToken, isCustomer, (req, res) => {
    res.json({ message: "Welcome customer home page" });
});

export default router;
