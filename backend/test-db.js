require('dotenv').config();
const sql = require('mssql');

const config = {
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  server: process.env.DB_SERVER,
  database: process.env.DB_DATABASE,
  options: {
    encrypt: true,
    trustServerCertificate: false
  },
  port: parseInt(process.env.DB_PORT) || 1433,
  connectionTimeout: 15000 // 15 seconds timeout
};

async function testConnection() {
  try {
    console.log('Connecting to Azure SQL Database...');
    const pool = await sql.connect(config);
    console.log('Connected successfully!');
    const result = await pool.request().query('SELECT @@VERSION as version');
    console.log('Database Version:', result.recordset[0].version);
    process.exit(0);
  } catch (err) {
    console.error('Connection Failed:', err.message);
    process.exit(1);
  }
}

testConnection();
