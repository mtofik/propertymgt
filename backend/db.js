const mysql = require("mysql2");
const path = require("path");
require('dotenv').config({ path: path.join(__dirname, '.env') });
require('colors');

const connection = mysql.createConnection({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    port: process.env.DB_PORT || 3306,
});

connection.connect((err)=>{
    if(err) return console.log("DB connection error".red, err.message);
    console.log('Database connected successfully!'.green);
})

module.exports = connection;