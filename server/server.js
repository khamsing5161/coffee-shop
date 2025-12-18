const express = require("express")
const PORT = process.env.PORT || 5000
const dotenv = require('dotenv')
const mysql = require("mysql2");
const bodyParser = require('body-parser')
const cors = require('cors')
const axios = require('axios')
const multer = require("multer");
const path = require("path");
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs')

const session = require('express-session')
const fs = require("fs");


const { error } = require("console")
const cookieSession = require("cookie-session");



// const auth = require("./middleware/auth");

const app = express();
const router = express.Router();
const JWT_SECRET = process.env.JWT_SECRET || "myjwtsecretkey";
const COOKIE_SECRET = process.env.COOKIE_SECRET || "mysecretkey";
// ✅ Middleware
app.use(bodyParser.json());
app.use(cors());              // อนุญาตให้ frontend เรียก backend ได้
app.use(express.json());      // อ่านข้อมูล JSON จาก body ได้
app.use(express.urlencoded({ extended: true }));
app.use("/uploads", express.static(path.join(__dirname, "uploads")));
app.use(
  cookieSession({
    name: "session",
    keys: [JWT_SECRET],  // 🔑 ต้องใส่ keys
    maxAge: 24 * 60 * 60 * 1000 // 1 วัน
  })
);
app.use(session({
  secret: 'secret',
  resave: false,
  saveUninitialized: true
}))



dotenv.config()

const verifyToken = (req, res, next) => {
  const authHeader = req.headers['authorization']
  const token = authHeader && authHeader.split(' ')[1]

  if (token == null) {
    return res.sendStatus(403)
  }

  jwt.verify(token, JWT_SECRET, (err, user) => {

    if (err) {
      return res.sendStatus(403)
    }
    req.user = user

    next()

  })


}







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

// API Endpoints
app.get("/api/dashboard", verifyToken, (req, res) => {
  const username = req.user.name
  res.json({ message: `Welcome to dashboard, ${username}`, user: req.user });
});

// register

app.post('/api/register', async (req, res) => {
  const { name, email, password } = req.body;

  if (!name || !email || !password) {
    return res.status(400).json({ error: "Missing required fields" });
  }

  try {
    // ตรวจสอบ email ซ้ำ
    const [existsSync] = await db
      .promise()
      .query("SELECT * FROM users WHERE email = ?", [email]);

    if (existsSync.length > 0) {
      return res.status(400).json({ error: "Email already in use" });
    }

    // TODO: continue hashing password...
    const hashedPassword = await bcrypt.hash(password, 10);

    // TODO: save to database...
    await db.promise().query(
      "INSERT INTO users (name, email, password) VALUES (?, ?, ?)",
      [name, email, hashedPassword]
    );

    res.json({ message: "User registered successfully" });

  } catch (error) {
    console.error("Registration error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});
// end register

// login 
app.post("/login", (req, res) => {
  const { email, password } = req.body;
  try {


    const sql = "SELECT * FROM users WHERE email = ?";
    db.query(sql, [email], async (err, result) => {
      if (err) return res.status(500).json({ message: "Database error" });
      if (result.length === 0)
        return res.status(400).json({ message: "Email not found" });

      const user = result[0];

      // Check password
      const isValid = await bcrypt.compare(password, user.password);
      if (!isValid)
        return res.status(400).json({ message: "Incorrect password" });

      // Create JWT
      const token = jwt.sign(
        {
          user_id: user.user_id,
          role: user.role
        },
        process.env.JWT_SECRET,   // ต้องตรงชื่อ ENV
        { expiresIn: "1d" }
      );

      res.json({
        message: "Login successful",
        token,
        role: user.role,
        user_id: user.user_id,
        name: user.name
      });
    });

  } catch (error) {
    console.error("login error:", error);
    res.status(500).json({ error: "Internal server error" });
  }

});


// end login
app.post(
  "/api/register/user_profiles",
  verifyToken,
  upload.single("profile_image"),
  (req, res) => {
    const { user_id } = req.user;
    const { phone, address, gender, birthdate } = req.body;

    if (!phone || !address || !gender || !birthdate) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    const profile_image = req.file
      ? `/uploads/${req.file.filename}`
      : null;

    const checkSql = `
      SELECT user_id FROM user_profiles WHERE user_id = ?
    `;

    db.query(checkSql, [user_id], (err, rows) => {
      if (err) return res.status(500).json({ error: "Database error" });
      if (rows.length > 0) {
        return res.status(400).json({ error: "Profile already exists" });
      }

      const insertSql = `
        INSERT INTO user_profiles
        (user_id, profile_image, phone, address, gender, birthdate)
        VALUES (?, ?, ?, ?, ?, ?)
      `;

      db.query(
        insertSql,
        [user_id, profile_image, phone, address, gender, birthdate],
        (err2) => {
          if (err2) {
            console.error(err2);
            return res.status(500).json({ error: "Database error" });
          }

          res.json({ message: "✅ Profile created successfully" });
        }
      );
    });
  }
);



app.get("/api/profile", verifyToken, (req, res) => {
  const { user_id } = req.user;

  const sql = `
    SELECT 
      pf.user_id,
      pf.profile_image,
      pf.phone,
      pf.address,
      pf.gender,
      pf.birthdate,
      pf.points,

      u.name,
      u.email
    FROM user_profiles AS pf
    JOIN users AS u ON pf.user_id = u.user_id
    WHERE pf.user_id = ?
  `;

  db.query(sql, [user_id], (err, results) => {
    if (err) {
      console.error("Database error:", err);
      return res.status(500).json({ error: "Database error" });
    }

    // 🔴 ยังไม่มี profile
    if (results.length === 0) {
      // Option A: Return default empty profile
      return res.json({
        user_id,
        profile_image: null,
        phone: null,
        address: null,
        gender: null,
        birthdate: null,
        points: 0,
        name: null,
        email: null
      });

      // OR Option B: Auto-create profile
      // (requires separate logic)
    }

    // ✅ มี profile
    res.json(results[0]);
  });
});







app.put(
  "/api/profile",
  verifyToken,
  upload.single("profile_image"),
  (req, res) => {
    const { user_id } = req.user;
    const { phone, address, gender, birthdate } = req.body;

    const fields = [];
    const values = [];

    if (phone) {
      fields.push("phone=?");
      values.push(phone);
    }
    if (address) {
      fields.push("address=?");
      values.push(address);
    }
    if (gender) {
      fields.push("gender=?");
      values.push(gender);
    }
    if (birthdate) {
      fields.push("birthdate=?");
      values.push(birthdate);
    }
    if (req.file) {
      fields.push("profile_image=?");
      values.push(`/uploads/${req.file.filename}`);
    }

    if (fields.length === 0) {
      return res.status(400).json({ error: "No data to update" });
    }

    const sql = `
      UPDATE user_profiles
      SET ${fields.join(", ")}
      WHERE user_id=?
    `;

    values.push(user_id);

    db.query(sql, values, (err) => {
      if (err) return res.status(500).json({ error: "Database error" });
      res.json({ message: "✅ Profile updated successfully" });
    });
  }
);









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

app.get('/cart', verifyToken, (req, res) => {
  const { user_id } = req.user;  // ✔️ ดึงจาก token อย่างปลอดภัย

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

  db.query(query, [user_id], (err, results) => {
    if (err) {
      console.error("Database error:", err);
      return res.status(500).json({ error: "Database error" });
    }

    const total_price = results.reduce((sum, item) => sum + item.item_total, 0);

    res.json({
      user_id,
      items: results,
      total_price
    });
  });
});

// delete product
app.delete('/cart/:id', verifyToken, (req, res) => {
  const product_id = req.params.id;
  const { user_id } = req.user;

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
app.post('/cart_input', verifyToken, (req, res) => {
  const { product_id, qty, price } = req.body;
  const { user_id } = req.user;

  if (!product_id || !qty || !price) {
    return res.status(400).json({ error: "Missing required fields" });
  }

  // 1) หา order pending ของ user
  const findOrder = `
    SELECT order_id 
    FROM orders 
    WHERE user_id = ? AND status = 'pending'
    LIMIT 1
  `;

  db.query(findOrder, [user_id], (err, row) => {
    if (err) return res.status(500).json({ error: "Database error" });

    if (row.length > 0) {
      // มี order pending
      addItem(row[0].order_id);
    } else {
      // ไม่มี order → สร้างใหม่
      const createOrder = `
        INSERT INTO orders (user_id, status, total_price, date)
        VALUES (?, 'pending', 0, NOW())
      `;

      db.query(createOrder, [user_id], (err2, result) => {
        if (err2) return res.status(500).json({ error: "Database error" });
        addItem(result.insertId);
      });
    }
  });

  // 2) Add item to order
  function addItem(order_id) {

    // ⬇ เช็คก่อนว่ามีสินค้าเดิมใน order แล้วหรือยัง
    const checkItem = `
      SELECT qty 
      FROM order_items 
      WHERE order_id = ? AND product_id = ?
      LIMIT 1
    `;

    db.query(checkItem, [order_id, product_id], (err, itemRow) => {
      if (err) return res.status(500).json({ error: "Database error" });

      if (itemRow.length > 0) {
        // ถ้ามี → update qty
        const updateQty = `
          UPDATE order_items
          SET qty = qty + ?
          WHERE order_id = ? AND product_id = ?
        `;

        db.query(updateQty, [qty, order_id, product_id], (err2) => {
          if (err2) return res.status(500).json({ error: "Database error" });
          updateOrderTotal(order_id);
        });

      } else {

        // ถ้าไม่มี → insert ใหม่
        const insertItem = `
          INSERT INTO order_items (order_id, product_id, qty, price)
          VALUES (?, ?, ?, ?)
        `;

        db.query(insertItem, [order_id, product_id, qty, price], (err3) => {
          if (err3) return res.status(500).json({ error: "Database error" });
          updateOrderTotal(order_id);
        });
      }
    });
  }

  // 3) Update total price
  function updateOrderTotal(order_id) {
    const updateTotal = `
      UPDATE orders
      SET total_price = (
        SELECT SUM(qty * price)
        FROM order_items
        WHERE order_id = ?
      )
      WHERE order_id = ?
    `;

    db.query(updateTotal, [order_id, order_id], (err) => {
      if (err) return res.status(500).json({ error: "Database error" });
      res.json({ message: "Item added to cart", order_id });
    });
  }
});

app.put('/cart_update', verifyToken, (req, res) => {
  const { order_id } = req.body;     // ✔ ดึง order_id ที่ส่งมาจาก frontend
  const { user_id } = req.user;      // ✔ ดึง user_id จาก token

  const updateOrderQuery = `
    UPDATE orders
    SET status = 'paid'
    WHERE order_id = ? AND user_id = ?
  `;

  db.query(updateOrderQuery, [order_id, user_id], (err, result) => {
    if (err) {
      console.error("Database error:", err);
      return res.status(500).json({ error: "Database error" });
    }

    if (result.affectedRows === 0) {
      return res.status(403).json({
        error: "Not allowed — this order does not belong to you"
      });
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

app.get('/api/Order_Summary', verifyToken, (req, res) => {
  const { user_id } = req.user;   // เช่น /cart?user_id=1

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

  db.query(query, [user_id], (err, results) => {
    if (err) {
      console.error("Database error:", err);
      return res.status(500).json({ error: "Database error" });
    }

    // คำนวณ total
    const total_price = results.reduce((sum, item) => sum + item.item_total, 0);

    res.json({
      user_id,
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

app.post("/api/redeem-points", verifyToken, (req, res) => {
  const { user_id } = req.user;
  const { order_id, points_used } = req.body;

  if (!order_id || points_used <= 0) {
    return res.status(400).json({ error: "Invalid data" });
  }

  const rate = 1000; // ✅ 1 point = 1 THB
  const discount = points_used * rate;

  const sqlOrder = `
    SELECT total_price, discount_amount
    FROM orders
    WHERE order_id = ? AND user_id = ?
  `;

  const sqlProfile = `
    SELECT points
    FROM user_profiles
    WHERE user_id = ?
  `;

  db.beginTransaction((err) => {
    if (err) return res.status(500).json({ error: "Transaction error" });

    // 1️⃣ ตรวจสอบ Order
    db.query(sqlOrder, [order_id, user_id], (err, orderResult) => {
      if (err || orderResult.length === 0) {
        return db.rollback(() =>
          res.status(404).json({ error: "Order not found" })
        );
      }

      const { total_price, discount_amount } = orderResult[0];

      if (discount_amount > 0) {
        return db.rollback(() =>
          res.status(400).json({ error: "Points already redeemed" })
        );
      }

      if (discount > total_price) {
        return db.rollback(() =>
          res.status(400).json({ error: "Discount exceeds total" })
        );
      }

      // 2️⃣ ตรวจสอบแต้มผู้ใช้
      db.query(sqlProfile, [user_id], (err, profileResult) => {
        if (err || profileResult.length === 0) {
          return db.rollback(() =>
            res.status(404).json({ error: "Profile not found" })
          );
        }

        const userPoints = profileResult[0].points;

        if (points_used > userPoints) {
          return db.rollback(() =>
            res.status(400).json({ error: "Not enough points" })
          );
        }

        const updateOrder = `
          UPDATE orders
          SET 
            discount_amount = ?,
            total_after_discount = total_price - ?,
            points_used = ?
          WHERE order_id = ?
        `;

        const updateProfile = `
          UPDATE user_profiles
          SET points = points - ?
          WHERE user_id = ?
        `;

        // 3️⃣ UPDATE orders
        db.query(
          updateOrder,
          [discount, discount, points_used, order_id],
          (err) => {
            if (err) {
              return db.rollback(() =>
                res.status(500).json({ error: "Update order failed" })
              );
            }

            // 4️⃣ UPDATE points
            db.query(updateProfile, [points_used, user_id], (err) => {
              if (err) {
                return db.rollback(() =>
                  res.status(500).json({ error: "Update points failed" })
                );
              }

              // ✅ Commit
              db.commit((err) => {
                if (err) {
                  return db.rollback(() =>
                    res.status(500).json({ error: "Commit failed" })
                  );
                }

                res.json({
                  discount,
                  total_after_discount: total_price - discount,
                  points_left: userPoints - points_used
                });
              });
            });
          }
        );
      });
    });
  });
});





// end payment Confirmations


// API order History

app.get('/api/order_history', verifyToken, (req, res) => {
  const { user_id } = req.user;

  const query = `
    SELECT
      p.payment_id,
      p.order_id,
      p.date,
      p.status,
      p.slip_image,
      o.total_price,
      o.discount_amount,
      o.total_after_discount
    FROM payments AS p
    JOIN orders AS o ON p.order_id = o.order_id
    WHERE o.user_id = ?
    ORDER BY p.date DESC
  `;

  db.query(query, [user_id], (err, results) => {
    if (err) {
      console.error("Database error:", err);
      return res.status(500).json({ error: "Database query failed" });
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

app.get("/api/reports/total_in_progress", (req, res) => {
  const sql = `
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

app.get("/api/reports/Waiting_for_payment", (req, res) => {
  const sql = `
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
app.get("/api/reports/Payment_completed", (req, res) => {
  const sql = `
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
  const productId = req.params.id;
  const { name, price, description } = req.body;
  const newImage = req.file ? `/uploads/${req.file.filename}` : null;

  // 1️⃣ ดึงข้อมูลเก่าก่อน (ป้องกันสินค้าไม่พบ)
  const checkSql = "SELECT image FROM products WHERE product_id = ?";
  db.query(checkSql, [productId], (err, rows) => {
    if (err) return res.status(500).json({ error: "Database error", detail: err });
    if (rows.length === 0)
      return res.status(404).json({ message: "Product not found" });

    const oldImage = rows[0].image;

    // 2️⃣ เตรียมคำสั่ง SQL
    const sql = newImage
      ? "UPDATE products SET name = ?, price = ?, description = ?, image = ? WHERE product_id = ?"
      : "UPDATE products SET name = ?, price = ?, description = ? WHERE product_id = ?";

    const params = newImage
      ? [name, price, description, newImage, productId]
      : [name, price, description, productId];

    // 3️⃣ อัปเดตข้อมูลในฐานข้อมูล
    db.query(sql, params, (err, result) => {
      if (err)
        return res.status(500).json({ error: "Fail to update product", detail: err });

      // 4️⃣ ลบภาพเก่า (เฉพาะเมื่อมีรูปใหม่)
      if (newImage && oldImage) {
        const oldImagePath = path.join(process.cwd(), oldImage);

        if (fs.existsSync(oldImagePath)) {
          fs.unlink(oldImagePath, (unlinkErr) => {
            if (unlinkErr) {
              console.error("⚠️ Failed to delete old image:", unlinkErr);
            }
          });
        }
      }

      res.json({
        message: "Product updated successfully!",
        updatedProduct: {
          productId,
          name,
          price,
          description,
          image: newImage || oldImage
        }
      });
    });
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

  const sql = "UPDATE payments SET status = ? WHERE order_id = ?";

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
