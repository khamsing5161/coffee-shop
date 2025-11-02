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
        p.name,
        p.price,
        p.image

    FROM products AS p
    WHERE main = TRUE
    `
  db.query(query, (err, results) => {  // ไม่ต้อง [user_id] ถ้า SQL ไม่มี ?
    if (err) {
      console.error("Database error:", err);
      return res.status(500).json({ error: "Database error" });
    }
    res.json(results);
  });
})

app.get('/menus', (req,res) => {
  const query = `
    SELECT 
        p.product_id,
        p.name,
        p.price,
        p.image
    FROM products AS p
  `
  db.query(query, (err, results) => {
    if (err) {
      console.error("Database error:", err);
      return res.status(500).json({ error: "Database error"});
    }
    res.json(results)
  })
})

app.get('/results', (req, res) => {
  const { search_query } = req.query;

  if (!search_query) {
    return res.status(400).json({ error: "Missing search_query" });
  }

  const keywords = search_query.trim().split(/\s+/); // แยกคำด้วยช่องว่าง
  const conditions = keywords.map(() => `p.name LIKE ?`).join(" AND");
  const values = keywords.map(k => `%${k}%`);

  const query = `
    SELECT
      p.product_id,
      p.name,
      p.price,
      p.image,
      p.description
    FROM products AS p
    WHERE ${conditions}
  `;

  db.query(query, values, (err, results) => {
    if (err) {
      console.error("Database error:", err);
      return res.status(500).json({ error: "Database error" });
    }

    res.json(results);
  });
});

app.get('/cart', (req, res) => {
  const userId = req.query.user_id; // หรือจาก req.session.user_id / req.user.id

  const query = `
    SELECT 
        p.product_id,
        p.name,
        p.price,
        oi.qty

    FROM products AS p
    JOIN order_items AS oi ON p.product_id = oi.product_id
    JOIN orders AS o ON oi.order_id = o.order_id
    WHERE o.status = 'pending'

    `

  db.query(query, [userId], (err, results) => {
    if (err) {
      console.error("Database error:", err);
      return res.status(500).json({ error: "Database error" });
    }
    res.json(results);
  });
});


app.delete('/cart/:id', (req, res) => {
  const product_id = req.params.id;

  const deleteQuery = `
    DELETE oi
    FROM order_items AS oi
    JOIN orders AS o ON oi.order_id = o.order_id
    WHERE oi.product_id = ? AND o.status = 'pending'
  `;

  db.query(deleteQuery, [product_id], (err, result) => {
    if (err) {
      console.error('Database error:', err);
      return res.status(500).json({ error: 'Database error' });
    }
    res.json({ message: 'Item removed from cart' });
  });
});
app.post('/cart_input', (req, res) => {
  const { product_id, qty, price } = req.body;

  const query = `
    INSERT INTO order_items (order_id, product_id, qty, price)
    VALUES (?, ?, ?, ?)
  `;

  const order_id = 1; // สมมุติว่าเป็นตะกร้าของผู้ใช้ที่ยังไม่ชำระเงิน

  db.query(query, [order_id, product_id, qty, price], (err, result) => {
    if (err) {
      console.error("Database error:", err);
      return res.status(500).json({ error: "Database error" });
    }
    res.json({ message: "Item added to cart" });
  });
});



app.get('/products/:id', (req, res) => {
  const product_id = req.params.id;

  const query = `
    SELECT
      p.product_id,
      p.name,
      p.price,
      p.description,
      p.image
    FROM products AS p
    WHERE p.product_id = ?
  `;

  db.query(query, [product_id], (err, results) => {
    if (err) {
      console.error('Database error:', err);
      return res.status(500).json({ error: 'Database error' });
    }

    if (results.length === 0) {
      return res.status(404).json({ error: 'Product not found' });
    }

    res.json(results[0]);
  });
});



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
