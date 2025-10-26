const express = require("express")
const PORT = process.env.PORT || 5000
const dotenv = require('dotenv')
const mysql = require('mysql2')
const bodyParser = require('body-parser')
const cors = require('cors')
const axios = require('axios')
const multer = require("multer");
const path = require("path");

const app = express();
// ✅ Middleware
app.use(bodyParser.json());
app.use(cors());              // อนุญาตให้ frontend เรียก backend ได้
app.use(express.json());      // อ่านข้อมูล JSON จาก body ได้
app.use(express.urlencoded({ extended: true }));
app.use("/uploads", express.static(path.join(__dirname, "uploads")));


dotenv.config()



// 🧱 ตั้งค่า multer สำหรับอัปโหลดไฟล์
// ตั้งค่าการเก็บไฟล์
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.join(__dirname, "uploads")); // ✅ ใช้ path.join เพื่อให้แน่ใจว่า path ถูกต้อง
  },
  filename: (req, file, cb) => {
    const uniqueName = Date.now() + "-" + file.originalname;
    cb(null, uniqueName);
  },
});

const upload = multer({ storage });
// ตั้งค่าการเก็บไฟล์

// เชื่อมต่อ MySQL
const db = mysql.createConnection({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  port: process.env.DB_PORT
})

db.connect((err) => {
  if (err) {
    console.log('database connection error' + err)
  } else {
    console.log('database connected running')
  }
})

app.get('/', (req, res) => {
  const query = `
    SELECT 
        p.product_id,
        p.product_id,
        p.name,
        p.price,
        p.image

    FROM products AS p
    `
  db.query(query, (err, results) => {  // ไม่ต้อง [user_id] ถ้า SQL ไม่มี ?
    if (err) {
      console.error("Database error:", err);
      return res.status(500).json({ error: "Database error" });
    }
    res.json(results);
  });
})

// 2. POST route
app.post("/api/products", upload.single("image"), (req, res) => {
  const { name, price, description } = req.body;
  const image = req.file ? `/uploads/${req.file.filename}` : "";

  // 3. SQL INSERT
  const sql = "INSERT INTO products (name, price, description, image) VALUES (?, ?, ?, ?)";
  db.query(sql, [name, price, description, image], (err, result) => {
    if (err) {
      console.error(err);
      return res.status(500).json({ message: "❌ Error saving product" });
    }

    res.json({
      message: "✅ Product uploaded successfully!",
      data: { id: result.insertId, name, price, description, image },
    });
  });
});


app.listen(PORT, () => {
  console.log(`✅ Server running at http://localhost:${PORT}`);
})
