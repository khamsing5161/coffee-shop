const express = require("express")
const PORT = process.env.PORT || 5000
const dotenv = require('dotenv')
const mysql = require('mysql2')
const bodyParser = require('body-parser')
const cors = require('cors')
const axios =require('axios')


dotenv.config()
const app = express()
const db = mysql.createConnection({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    port: process.env.DB_PORT
})

db.connect((err) => {
    if(err) {
        console.log('database connection error' + err)
    } else {
        console.log('database connected running')
    }
})

app.get('/', (req,res) => {
    const query =  `
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


app.listen(PORT, () => {
    console.log(`✅ Server running at http://localhost:${PORT}`);
})
