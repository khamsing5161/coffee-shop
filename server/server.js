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

// api go home
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
// end api home


// api go nemu
app.get('/menus', (req, res) => {
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
      return res.status(500).json({ error: "Database error" });
    }
    res.json(results)
  })
})
// end api menu

// api go food

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

// end api food



// search query 
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
// end search


// api cart

app.get('/cart', (req, res) => {
  const userId = req.query.user_id; // เช่น /cart?user_id=1

  const query = `
    SELECT 
    p.product_id,
    p.name AS product_name,
    p.price,
    oi.qty,
    (oi.qty * p.price) AS item_total,
    o.total_price,
    o.order_id
  FROM orders AS o
  JOIN order_items AS oi ON o.order_id = oi.order_id
  JOIN products AS p ON oi.product_id = p.product_id
  WHERE o.user_id = ? AND o.status = 'pending';
  `;

  db.query(query, [userId], (err, results) => {
    if (err) {
      console.error("Database error:", err);
      return res.status(500).json({ error: "Database error" });
    }

    // คำนวณ total
    const total_price = results.reduce((sum, item) => sum + item.item_total, 0);

    res.json({
      user_id: parseInt(userId),
      items: results,
      total_price
    });
  });
});

// delete product
app.delete('/cart/:id', (req, res) => {
  const product_id = req.params.id;
  const user_id = req.query.user_id; // เช่น /cart/2?user_id=1

  const deleteQuery = `
    DELETE oi
    FROM order_items AS oi
    JOIN orders AS o ON oi.order_id = o.order_id
    WHERE oi.product_id = ? AND o.status = 'pending' AND o.user_id = ?
  `;

  db.query(deleteQuery, [product_id, user_id], (err, result) => {
    if (err) {
      console.error('Database error:', err);
      return res.status(500).json({ error: 'Database error' });
    }
    res.json({ message: 'Item removed from cart' });
  });
});

// import product
app.post('/cart_input', (req, res) => {
  const { user_id, product_id, qty, price } = req.body;

  // 1. หา order ที่ยัง pending ของ user
  const findOrderQuery = `
    SELECT order_id 
    FROM orders 
    WHERE user_id = ? AND status = 'pending' 
    LIMIT 1
  `;

  db.query(findOrderQuery, [user_id], (err, rows) => {
    if (err) return res.status(500).json({ error: "Database error" });

    let order_id;

    if (rows.length > 0) {
      // มี order pending อยู่แล้ว
      order_id = rows[0].order_id;
      insertItem(order_id);
    } else {
      // ไม่มี → สร้าง order ใหม่
      const createOrderQuery = `
        INSERT INTO orders (user_id, status, total_price, date)
        VALUES (?, 'pending', 0, NOW())
      `;
      db.query(createOrderQuery, [user_id], (err2, result) => {
        if (err2) return res.status(500).json({ error: "Database error" });
        order_id = result.insertId;
        insertItem(order_id);
      });
    }

    // ฟังก์ชัน insert สินค้า
    function insertItem(order_id) {
      const insertQuery = `
      INSERT INTO order_items (order_id, product_id, qty, price)
      VALUES (?, ?, ?, ?)
    `;
      db.query(insertQuery, [order_id, product_id, qty, price], (err3) => {
        if (err3) return res.status(500).json({ error: "Database error" });

        // อัปเดตราคารวมใหม่
        const updateTotalQuery = `
        UPDATE orders
        SET total_price = (
          SELECT SUM(oi.qty * oi.price)
          FROM order_items AS oi
          WHERE oi.order_id = ?
        )
        WHERE order_id = ?
      `;
        db.query(updateTotalQuery, [order_id, order_id], (err4) => {
          if (err4) return res.status(500).json({ error: "Database error" });
          res.json({ message: "Item added to cart", order_id });
        });
      });
    }
  });
});
app.put('/cart_update', (req, res) => {
  const { order_id } = req.body;

  const updateOrderQuery = `
    UPDATE orders
    SET status = 'paid'
    WHERE order_id = ?
    `;
  db.query(updateOrderQuery, [order_id], (err) => {
    if (err) {
      console.error("Database error:", err);
      return res.status(500).json({ error: "Database error" });
    }
    res.json({ message: "Order status updated to paid" });
  });
});

// end cart

app.post('/orders', (req, res) => {
  const { user_id, items } = req.body;

  if (!user_id || !items || items.length === 0) {
    return res.status(400).json({ error: "Missing user_id or items" });
  }

  // 1. สร้าง order ใหม่
  const createOrderQuery = `
    INSERT INTO orders (user_id, date, total_price, status)
    VALUES (?, NOW(), 0, 'pending')
  `;

  db.query(createOrderQuery, [user_id], (err, result) => {
    if (err) {
      console.error("Database error:", err);
      return res.status(500).json({ error: "Database error" });
    }

    const order_id = result.insertId;

    // 2. Insert order_items
    const orderItemsValues = items.map(item => [order_id, item.product_id, item.qty, item.price]);

    const insertItemsQuery = `
      INSERT INTO order_items (order_id, product_id, qty, price)
      VALUES ?
    `;

    db.query(insertItemsQuery, [orderItemsValues], (err2) => {
      if (err2) {
        console.error("Database error:", err2);
        return res.status(500).json({ error: "Database error" });
      }

      // 3. คำนวณ total_price
      const total_price = items.reduce((sum, item) => sum + (item.qty * item.price), 0);

      const updateOrderQuery = `
        UPDATE orders SET total_price = ? WHERE order_id = ?
      `;

      db.query(updateOrderQuery, [total_price, order_id], (err3) => {
        if (err3) {
          console.error("Database error:", err3);
          return res.status(500).json({ error: "Database error" });
        }

        res.json({
          message: "Order placed successfully",
          order_id,
          total_price
        });
      });
    });
  });
});


// api Payment Confirmation

app.get('/api/Order_Summary', (req, res) => {
  const userId = req.query.user_id; // เช่น /cart?user_id=1

  const query = `
    SELECT 
    p.product_id,
    p.name AS product_name,
    p.price,
    oi.qty,
    (oi.qty * p.price) AS item_total,
    o.total_price,
    o.order_id
  FROM orders AS o
  JOIN order_items AS oi ON o.order_id = oi.order_id
  JOIN products AS p ON oi.product_id = p.product_id
  WHERE o.user_id = ? AND o.status = 'paid';
  `;

  db.query(query, [userId], (err, results) => {
    if (err) {
      console.error("Database error:", err);
      return res.status(500).json({ error: "Database error" });
    }

    // คำนวณ total
    const total_price = results.reduce((sum, item) => sum + item.item_total, 0);

    res.json({
      user_id: parseInt(userId),
      items: results,
      total_price
    });
  });
});

app.post("/api/slip_upload", upload.single("slip_image"), (req, res) => {
  const { order_id } = req.body;
  if (!order_id) {
    return res.status(400).json({ error: "Missing order_id" });
  }

  const slip_image = req.file ? `/uploads/${req.file.filename}` : "";
  if (!slip_image) {
    return res.status(400).json({ error: "No slip image uploaded" });
  }

  const sqlInsert = "INSERT INTO payments (order_id, slip_image, date) VALUES (?, ?, NOW())";
  db.query(sqlInsert, [order_id, slip_image], (err) => {
    if (err) {
      console.error("Insert error:", err);
      return res.status(500).json({ error: "Database insert error" });
    }

    const sqlUpdate = "UPDATE orders SET status = 'Payment completed' WHERE order_id = ?";
    db.query(sqlUpdate, [order_id], (err2) => {
      if (err2) {
        console.error("Update error:", err2);
        return res.status(500).json({ error: "Database update error" });
      }

      res.json({ message: "✅ Slip uploaded and order status updated successfully!" });
    });
  });
});

// end payment Confirmations


// API order History

app.get('/api/order_history', (req, res) => {
  const userId = req.query.user_id;
  const query = `
    SELECT
      p.payment_id,
      p.order_id,
      p.date,
      p.status,
      p.slip_image,
      o.total_price
    FROM payments AS p
    JOIN orders AS o ON p.order_id = o.order_id
    WHERE o.user_id = ?
    ORDER BY p.date DESC
  `;

  // สมมติว่าคุณใช้ mysql2 หรือ mysql library
  db.query(query, [userId], (err, results) => {
    if (err) {
      console.error(err);
      return res.status(500).json({ error: 'Database query failed' });
    }
    res.json(results);
  });
});

// end order History



// API (Admin)

app.get("/api/admin/dashboard", (req, res) => {

  const stats = {};

  const sql1 = "SELECT COUNT(*) AS total FROM products";
  const sql2 = "SELECT COUNT(*) AS total FROM orders";
  const sql3 = "SELECT COUNT(*) AS total FROM users WHERE role = 'customer'";
  const sql4 = "SELECT SUM(total_price) AS total FROM orders WHERE date = CURDATE()";

  const sqlRecent = `
    SELECT o.order_id, u.name, o.total_price, o.status, o.date
    FROM orders o
    JOIN users u ON o.user_id = u.user_id
    ORDER BY o.order_id DESC
    LIMIT 5
  `;

  db.query(sql1, (err, p) => {
    stats.products = p[0].total;

    db.query(sql2, (err, o) => {
      stats.orders = o[0].total;

      db.query(sql3, (err, c) => {
        stats.customers = c[0].total;

        db.query(sql4, (err, r) => {
          stats.revenue = r[0].total || 0;

          db.query(sqlRecent, (err, recent) => {
            res.json({
              stats,
              recentOrders: recent
            });
          });
        });
      });
    });
  });
});

app.get("/api/reports/total-sales", (req, res) => {
  const sql = `
    SELECT 
      SUM(total_price) AS total_sales,
      COUNT(order_id) AS total_orders
    FROM orders
    WHERE status IN ('paid', 'Payment completed')
  `;

  db.query(sql, (err, result) => {
    if (err) return res.status(500).send(err);
    res.json(result[0]);
  });
});

app.get("/api/reports/total_in_progress", (req,res) => {
  const sql =`
    SELECT
      COUNT(order_id) AS total_in_progress
    FROM orders
    WHERE status = 'pending'

  `;

  db.query(sql, (err, result) => {
    if (err) return res.status(500).send(err);
    res.json(result[0]);
  });
})

app.get("/api/reports/Waiting_for_payment", (req,res) => {
  const sql =`
  SELECT
    COUNT(order_id) AS total_waiting_for_payment
    FROM orders
    WHERE status = 'paid'

  `;
  db.query(sql, (err, result) => {
    if (err) return res.status(500).send(err);
    res.json(result[0]);
  });
})
app.get("/api/reports/Payment_completed", (req,res) => {
  const sql =`
  SELECT
    COUNT(order_id) AS total_Payment_completed
    FROM orders
    WHERE status = 'Payment completed'

  `;
  db.query(sql, (err, result) => {
    if (err) return res.status(500).send(err);
    res.json(result[0]);
  });
})


// API top 10

app.get("/api/report/top-products", (req, res) => {
  const sql = `
    SELECT 
        p.product_id,
        p.name,
        p.price,
        p.image,
        SUM(oi.qty) AS total_sold
    FROM order_items oi
    JOIN products p ON oi.product_id = p.product_id
    GROUP BY p.product_id, p.name, p.price, p.image
    ORDER BY total_sold DESC
    LIMIT 10;
  `;

  db.query(sql, (err, results) => {
    if (err) {
      console.error("Error loading top products:", err);
      return res.status(500).json({ error: "Database error" });
    }
    res.json(results);
  });
});


//API Product Management (Admin)
app.get("/api/manage_products", (req, res) => {
  db.query("SELECT * FROM products", (err, result) => {
    if (err) return res.status(500).json(err);
    res.json(result);
  });
});

app.delete("/api/products/:id", (req, res) => {
  const productId = req.params.id;

  const sql = "DELETE FROM products WHERE product_id = ?";
  db.query(sql, [productId], (err, result) => {
    if (err) return res.status(500).json(err);
    res.json({ message: "ลบสินค้าเรียบร้อย!" });
  });
});

app.put("/api/products/update/:id", upload.single("image"), (req, res) => {
  const productid = req.params.id;
  const { name, price, description } = req.body;
  const image = req.file ? `/uploads/${req.file.filename}` : null;

  const sql = image
    ? "UPDATE products SET name = ?, price = ?, description = ?, image = ? WHERE product_id = ?"
    : "UPDATE products SET name = ?, price = ?, description = ? WHERE product_id = ?";

  const params = image
    ? [name, price, description, image, productid]
    : [name, price, description, productid];

  db.query(sql, params, (err, result) => {
    if (err) return res.status(500).json(err);
    res.json({ message: "update product successfully!" });
  });
});

// end


// API Check the order (admin)

app.get("/api/check_orders", (req, res) => {
  const sql = `
    SELECT 
    o.order_id,
    o.user_id,
    o.date AS order_date,
    o.total_price,
    o.status AS order_status,

    p.payment_id,
    p.slip_image,
    p.date AS payment_date,
    p.status AS payment_status

FROM orders o
LEFT JOIN payments p ON o.order_id = p.order_id
ORDER BY o.order_id DESC;

  `;

  db.query(sql, (err, result) => {
    if (err) return res.status(500).json(err);
    res.json(result);
  });
});

app.put("/api/orders/status/:orderId", (req, res) => {
  const { orderId } = req.params;
  const { status } = req.body;

  const sql = "UPDATE orders SET status = ? WHERE order_id = ?";

  db.query(sql, [status, orderId], (err, result) => {
    if (err) return res.status(500).json({ error: err });
    res.json({ message: "Status updated", status });
  });
});


// API Sales report

app.get("/api/report/daily", (req, res) => {
  const sql = `
    SELECT 
      DATE(date) AS day,
      SUM(total_price) AS total
    FROM orders
    WHERE status = 'Payment completed'
    GROUP BY DATE(date)
    ORDER BY day DESC;
  `;

  db.query(sql, (err, results) => {
    if (err) return res.status(500).json({ error: err });
    res.json(results);
  });
});


app.get("/api/report/monthly", (req, res) => {
  const sql = `
    SELECT 
      DATE_FORMAT(date, '%Y-%m') AS month,
      SUM(total_price) AS total
    FROM orders
    WHERE status = 'Payment completed'
    GROUP BY DATE_FORMAT(date, '%Y-%m')
    ORDER BY month DESC;
  `;

  db.query(sql, (err, results) => {
    if (err) return res.status(500).json({ error: err });
    res.json(results);
  });
});


app.get("/api/report/yearly", (req, res) => {
  const sql = `
    SELECT 
      YEAR(date) AS year,
      SUM(total_price) AS total
    FROM orders
    WHERE status = 'Payment completed'
    GROUP BY YEAR(date)
    ORDER BY year DESC;
  `;

  db.query(sql, (err, results) => {
    if (err) return res.status(500).json({ error: err });
    res.json(results);
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
