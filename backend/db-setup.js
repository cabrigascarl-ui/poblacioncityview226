require('dotenv').config();
const sql = require('mssql');

const config = {
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  server: process.env.DB_SERVER,
  database: process.env.DB_DATABASE,
  options: { encrypt: true, trustServerCertificate: false },
  port: parseInt(process.env.DB_PORT) || 1433,
};

async function setup() {
  try {
    console.log('Connecting to Azure SQL...');
    const pool = await sql.connect(config);
    console.log('Connected. Creating tables...');

    await pool.request().query(`
      IF NOT EXISTS (SELECT * FROM sysobjects WHERE name='customers' AND xtype='U')
      CREATE TABLE customers (
        id INT IDENTITY(1,1) PRIMARY KEY,
        fullname NVARCHAR(100) NOT NULL,
        email NVARCHAR(100) NOT NULL UNIQUE,
        phone NVARCHAR(20),
        address NVARCHAR(255),
        password NVARCHAR(100) NOT NULL,
        status NVARCHAR(20) DEFAULT 'active',
        created_at DATETIME DEFAULT GETDATE()
      )
    `);
    console.log('✓ customers table ready');

    await pool.request().query(`
      IF NOT EXISTS (SELECT * FROM sysobjects WHERE name='stalls' AND xtype='U')
      CREATE TABLE stalls (
        id INT IDENTITY(1,1) PRIMARY KEY,
        stall_name NVARCHAR(100) NOT NULL,
        logo NVARCHAR(10) DEFAULT '🍽',
        username NVARCHAR(50) NOT NULL UNIQUE,
        password NVARCHAR(100) NOT NULL,
        category NVARCHAR(50),
        status NVARCHAR(20) DEFAULT 'pending',
        description NVARCHAR(255),
        hours NVARCHAR(100),
        delivery_fee INT DEFAULT 15,
        delivery_time NVARCHAR(50) DEFAULT '25-35 min',
        created_at DATETIME DEFAULT GETDATE()
      )
    `);
    console.log('✓ stalls table ready');

    await pool.request().query(`
      IF NOT EXISTS (SELECT * FROM sysobjects WHERE name='staff' AND xtype='U')
      CREATE TABLE staff (
        id INT IDENTITY(1,1) PRIMARY KEY,
        stall_id INT NOT NULL,
        fullname NVARCHAR(100) NOT NULL,
        email NVARCHAR(100) NOT NULL UNIQUE,
        password NVARCHAR(100) NOT NULL,
        created_at DATETIME DEFAULT GETDATE(),
        FOREIGN KEY (stall_id) REFERENCES stalls(id)
      )
    `);
    console.log('✓ staff table ready');

    await pool.request().query(`
      IF NOT EXISTS (SELECT * FROM sysobjects WHERE name='riders' AND xtype='U')
      CREATE TABLE riders (
        id INT IDENTITY(1,1) PRIMARY KEY,
        fullname NVARCHAR(100) NOT NULL,
        email NVARCHAR(100) NOT NULL UNIQUE,
        phone NVARCHAR(20),
        vehicle NVARCHAR(50) DEFAULT 'Motorcycle',
        password NVARCHAR(100) NOT NULL,
        status NVARCHAR(20) DEFAULT 'active',
        location_lat FLOAT DEFAULT 11.7760,
        location_lng FLOAT DEFAULT 124.8865,
        created_at DATETIME DEFAULT GETDATE()
      )
    `);
    console.log('✓ riders table ready');

    await pool.request().query(`
      IF NOT EXISTS (SELECT * FROM sysobjects WHERE name='foods' AND xtype='U')
      CREATE TABLE foods (
        id INT IDENTITY(1,1) PRIMARY KEY,
        stall_id INT NOT NULL,
        food_name NVARCHAR(100) NOT NULL,
        price INT NOT NULL,
        image NVARCHAR(10) DEFAULT '🍽',
        description NVARCHAR(255),
        available BIT DEFAULT 1,
        created_at DATETIME DEFAULT GETDATE(),
        FOREIGN KEY (stall_id) REFERENCES stalls(id)
      )
    `);
    console.log('✓ foods table ready');

    await pool.request().query(`
      IF NOT EXISTS (SELECT * FROM sysobjects WHERE name='orders' AND xtype='U')
      CREATE TABLE orders (
        id INT IDENTITY(1,1) PRIMARY KEY,
        customer_id INT,
        stall_id INT,
        rider_id INT,
        group_id NVARCHAR(50),
        total_price INT DEFAULT 0,
        status NVARCHAR(50) DEFAULT 'Pending',
        payment_method NVARCHAR(50) DEFAULT 'Cash on Delivery',
        items NVARCHAR(MAX),
        notes NVARCHAR(255),
        created_at DATETIME DEFAULT GETDATE(),
        FOREIGN KEY (customer_id) REFERENCES customers(id),
        FOREIGN KEY (stall_id) REFERENCES stalls(id)
      )
    `);
    console.log('✓ orders table ready');

    await pool.request().query(`
      IF NOT EXISTS (SELECT * FROM sysobjects WHERE name='promotions' AND xtype='U')
      CREATE TABLE promotions (
        id INT IDENTITY(1,1) PRIMARY KEY,
        target NVARCHAR(50) DEFAULT 'Home',
        msg NVARCHAR(500) NOT NULL,
        created_at DATETIME DEFAULT GETDATE()
      )
    `);
    console.log('✓ promotions table ready');

    await pool.request().query(`
      IF NOT EXISTS (SELECT * FROM sysobjects WHERE name='game_reservations' AND xtype='U')
      CREATE TABLE game_reservations (
        id NVARCHAR(20) PRIMARY KEY,
        username NVARCHAR(100),
        avatar NVARCHAR(10),
        court NVARCHAR(50),
        reservation_date NVARCHAR(50),
        time NVARCHAR(50),
        price NVARCHAR(50),
        status NVARCHAR(50) DEFAULT 'Pending',
        type NVARCHAR(50),
        phone NVARCHAR(20),
        created_at DATETIME DEFAULT GETDATE()
      )
    `);
    console.log('✓ game_reservations table ready');

    await pool.request().query(`
      IF NOT EXISTS (SELECT * FROM sysobjects WHERE name='court_prices' AND xtype='U')
      CREATE TABLE court_prices (
        id INT IDENTITY(1,1) PRIMARY KEY,
        morning_rate INT DEFAULT 200,
        afternoon_rate INT DEFAULT 280,
        open_play_rate INT DEFAULT 150,
        court_name1 NVARCHAR(50) DEFAULT 'Court 1',
        court_name2 NVARCHAR(50) DEFAULT 'Court 2',
        open_hour INT DEFAULT 5,
        close_hour INT DEFAULT 19,
        max_players INT DEFAULT 24,
        notes NVARCHAR(500),
        updated_at DATETIME DEFAULT GETDATE()
      )
    `);
    // Insert default court prices if none exist
    await pool.request().query(`
      IF NOT EXISTS (SELECT * FROM court_prices)
      INSERT INTO court_prices (morning_rate, afternoon_rate, open_play_rate) VALUES (200, 280, 150)
    `);
    console.log('✓ court_prices table ready');

    console.log('\n✅ All tables created successfully! Database is ready.');
    process.exit(0);
  } catch (err) {
    console.error('Setup failed:', err.message);
    process.exit(1);
  }
}

setup();
