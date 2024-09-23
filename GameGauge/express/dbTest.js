require('dotenv').config();  // Load .env variables
const mysql = require('mysql2');

// Create a connection using your .env variables
const connection = mysql.createConnection({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASS,
  database: process.env.DB_NAME
});

// Connect to the database
connection.connect((err) => {
  if (err) {
    return console.error('Error connecting to MySQL: ', err.message);
  }
  console.log('Connected to the MySQL server.');

  // Test query to verify the 'users' table exists
  connection.query('SHOW TABLES LIKE "users"', (error, results) => {
    if (error) throw error;

    if (results.length > 0) {
      console.log("Users table exists!");
    } else {
      console.log("Users table not found.");
    }

    // End the connection
    connection.end();
  });
});
