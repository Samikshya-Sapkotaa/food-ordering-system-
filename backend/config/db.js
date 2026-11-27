// MySQL connection using mysql2 promise pool
const mysql = require("mysql2");
require("dotenv").config();

const pool = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  waitForConnections: true,
  connectionLimit: 10,
});

// we use the promise version so we can write async/await queries
const db = pool.promise();

// small check on startup so we know DB is connected
db.query("SELECT 1")
  .then(() => console.log("MySQL connected"))
  .catch((err) => console.log("MySQL connection failed:", err.message));

module.exports = db;
