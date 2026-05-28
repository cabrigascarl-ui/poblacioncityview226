require('dotenv').config();
const express = require('express');
const sql = require('mssql');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());

// ── DB Config ──────────────────────────────────────────────
const config = {
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  server: process.env.DB_SERVER,
  database: process.env.DB_DATABASE,
  options: { encrypt: true, trustServerCertificate: false },
  port: parseInt(process.env.DB_PORT) || 1433,
  pool: { max: 10, min: 0, idleTimeoutMillis: 30000 }
};

let pool;
async function getPool() {
  if (!pool) pool = await sql.connect(config);
  return pool;
}

// ── AUTH ────────────────────────────────────────────────────
app.post('/api/auth/login', async (req, res) => {
  const { email, password } = req.body;
  try {
    const db = await getPool();

    // Admin hardcoded
    if ((email === 'admin' || email === 'admin@pobla.go') && password === 'admin')
      return res.json({ role: 'admin', user: { fullname: 'Admin', email } });

    // Games Manager hardcoded fallback
    if ((email === 'games' || email === 'games@pobla.go') && password === 'games')
      return res.json({ role: 'game-manager', user: { fullname: 'Games Manager', email } });

    // Games Manager from DB
    const gm = await db.request()
      .input('email', sql.NVarChar, email)
      .input('password', sql.NVarChar, password)
      .query(`SELECT * FROM game_managers WHERE email = @email AND password = @password`);
    if (gm.recordset.length > 0) {
      const u = gm.recordset[0];
      return res.json({ role: 'game-manager', user: u });
    }

    // Customer
    const cust = await db.request()
      .input('email', sql.NVarChar, email)
      .input('password', sql.NVarChar, password)
      .query(`SELECT * FROM customers WHERE (email = @email OR phone = @email) AND password = @password`);
    if (cust.recordset.length > 0) {
      const u = cust.recordset[0];
      if (u.status === 'suspended') return res.status(403).json({ error: 'Account suspended.' });
      return res.json({ role: 'customer', user: u });
    }

    // Staff
    const stf = await db.request()
      .input('email', sql.NVarChar, email)
      .input('password', sql.NVarChar, password)
      .query(`SELECT s.*, st.* FROM staff s JOIN stalls st ON s.stall_id = st.id WHERE s.email = @email AND s.password = @password`);
    if (stf.recordset.length > 0) {
      const u = stf.recordset[0];
      if (u.status === 'suspended') return res.status(403).json({ error: 'Stall suspended.' });
      return res.json({ role: 'stall', user: { ...u, staffName: u.fullname } });
    }

    // Stall owner
    const stall = await db.request()
      .input('username', sql.NVarChar, email)
      .input('password', sql.NVarChar, password)
      .query(`SELECT * FROM stalls WHERE username = @username AND password = @password`);
    if (stall.recordset.length > 0) {
      const u = stall.recordset[0];
      if (u.status === 'suspended') return res.status(403).json({ error: 'Stall suspended.' });
      return res.json({ role: 'stall', user: u });
    }

    // Rider
    const rider = await db.request()
      .input('email', sql.NVarChar, email)
      .input('password', sql.NVarChar, password)
      .query(`SELECT * FROM riders WHERE email = @email AND password = @password`);
    if (rider.recordset.length > 0) {
      const u = rider.recordset[0];
      if (u.status === 'suspended') return res.status(403).json({ error: 'Rider account suspended.' });
      return res.json({ role: 'rider', user: u });
    }

    return res.status(401).json({ error: 'Invalid email or password.' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error.' });
  }
});

// ── CUSTOMERS ───────────────────────────────────────────────
app.get('/api/customers', async (req, res) => {
  try {
    const db = await getPool();
    const result = await db.request().query('SELECT * FROM customers ORDER BY created_at DESC');
    res.json(result.recordset);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

app.post('/api/customers', async (req, res) => {
  const { fullname, email, phone, address, password } = req.body;
  try {
    const db = await getPool();
    const result = await db.request()
      .input('fullname', sql.NVarChar, fullname)
      .input('email', sql.NVarChar, email.toLowerCase())
      .input('phone', sql.NVarChar, phone)
      .input('address', sql.NVarChar, address)
      .input('password', sql.NVarChar, password)
      .query(`INSERT INTO customers (fullname, email, phone, address, password) 
              OUTPUT INSERTED.* VALUES (@fullname, @email, @phone, @address, @password)`);
    res.json(result.recordset[0]);
  } catch (err) {
    if (err.message.includes('UNIQUE')) return res.status(400).json({ error: 'Email already registered.' });
    res.status(500).json({ error: err.message });
  }
});

app.patch('/api/customers/:id', async (req, res) => {
  const { fullname, phone, address, status } = req.body;
  try {
    const db = await getPool();
    const result = await db.request()
      .input('id', sql.Int, req.params.id)
      .input('fullname', sql.NVarChar, fullname)
      .input('phone', sql.NVarChar, phone)
      .input('address', sql.NVarChar, address)
      .input('status', sql.NVarChar, status)
      .query(`UPDATE customers SET fullname=@fullname, phone=@phone, address=@address, status=@status
              OUTPUT UPDATED.* WHERE id=@id`);
    res.json(result.recordset[0]);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// ── STALLS ──────────────────────────────────────────────────
app.get('/api/stalls', async (req, res) => {
  try {
    const db = await getPool();
    const result = await db.request().query('SELECT * FROM stalls ORDER BY created_at DESC');
    res.json(result.recordset);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

app.post('/api/stalls', async (req, res) => {
  const { stall_name, logo, username, password, category, description, hours, delivery_fee, delivery_time } = req.body;
  try {
    const db = await getPool();
    const result = await db.request()
      .input('stall_name', sql.NVarChar, stall_name)
      .input('logo', sql.NVarChar, logo || '🍽')
      .input('username', sql.NVarChar, username)
      .input('password', sql.NVarChar, password)
      .input('category', sql.NVarChar, category)
      .input('description', sql.NVarChar, description)
      .input('hours', sql.NVarChar, hours)
      .input('delivery_fee', sql.Int, delivery_fee || 15)
      .input('delivery_time', sql.NVarChar, delivery_time || '25-35 min')
      .query(`INSERT INTO stalls (stall_name, logo, username, password, category, description, hours, delivery_fee, delivery_time)
              OUTPUT INSERTED.* VALUES (@stall_name, @logo, @username, @password, @category, @description, @hours, @delivery_fee, @delivery_time)`);
    res.json(result.recordset[0]);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

app.patch('/api/stalls/:id', async (req, res) => {
  const fields = req.body;
  try {
    const db = await getPool();
    const sets = Object.keys(fields).map(k => `${k}=@${k}`).join(', ');
    const request = db.request().input('id', sql.Int, req.params.id);
    Object.entries(fields).forEach(([k, v]) => request.input(k, v));
    const result = await request.query(`UPDATE stalls SET ${sets} OUTPUT INSERTED.* WHERE id=@id`);
    res.json(result.recordset[0]);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// ── RIDERS ──────────────────────────────────────────────────
app.get('/api/riders', async (req, res) => {
  try {
    const db = await getPool();
    const result = await db.request().query('SELECT * FROM riders ORDER BY created_at DESC');
    res.json(result.recordset);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

app.post('/api/riders', async (req, res) => {
  const { fullname, email, phone, vehicle, password } = req.body;
  try {
    const db = await getPool();
    const result = await db.request()
      .input('fullname', sql.NVarChar, fullname)
      .input('email', sql.NVarChar, email)
      .input('phone', sql.NVarChar, phone)
      .input('vehicle', sql.NVarChar, vehicle || 'Motorcycle')
      .input('password', sql.NVarChar, password)
      .query(`INSERT INTO riders (fullname, email, phone, vehicle, password)
              OUTPUT INSERTED.* VALUES (@fullname, @email, @phone, @vehicle, @password)`);
    res.json(result.recordset[0]);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

app.patch('/api/riders/:id', async (req, res) => {
  const { status } = req.body;
  try {
    const db = await getPool();
    const result = await db.request()
      .input('id', sql.Int, req.params.id)
      .input('status', sql.NVarChar, status)
      .query(`UPDATE riders SET status=@status OUTPUT INSERTED.* WHERE id=@id`);
    res.json(result.recordset[0]);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// ── FOODS ───────────────────────────────────────────────────
app.get('/api/foods', async (req, res) => {
  try {
    const db = await getPool();
    const result = await db.request().query('SELECT * FROM foods ORDER BY stall_id, id');
    res.json(result.recordset);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

app.post('/api/foods', async (req, res) => {
  const { stall_id, food_name, price, image, description } = req.body;
  try {
    const db = await getPool();
    const result = await db.request()
      .input('stall_id', sql.Int, stall_id)
      .input('food_name', sql.NVarChar, food_name)
      .input('price', sql.Int, price)
      .input('image', sql.NVarChar, image || '🍽')
      .input('description', sql.NVarChar, description)
      .query(`INSERT INTO foods (stall_id, food_name, price, image, description)
              OUTPUT INSERTED.* VALUES (@stall_id, @food_name, @price, @image, @description)`);
    res.json(result.recordset[0]);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

app.patch('/api/foods/:id', async (req, res) => {
  const { food_name, price, image, description, available } = req.body;
  try {
    const db = await getPool();
    const result = await db.request()
      .input('id', sql.Int, req.params.id)
      .input('food_name', sql.NVarChar, food_name)
      .input('price', sql.Int, price)
      .input('image', sql.NVarChar, image)
      .input('description', sql.NVarChar, description)
      .input('available', sql.Bit, available)
      .query(`UPDATE foods SET food_name=@food_name, price=@price, image=@image, description=@description, available=@available
              OUTPUT INSERTED.* WHERE id=@id`);
    res.json(result.recordset[0]);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

app.delete('/api/foods/:id', async (req, res) => {
  try {
    const db = await getPool();
    await db.request().input('id', sql.Int, req.params.id).query('DELETE FROM foods WHERE id=@id');
    res.json({ success: true });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// ── ORDERS ──────────────────────────────────────────────────
app.get('/api/orders', async (req, res) => {
  try {
    const db = await getPool();
    const result = await db.request().query('SELECT * FROM orders ORDER BY created_at DESC');
    res.json(result.recordset);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

app.post('/api/orders', async (req, res) => {
  const { customer_id, stall_id, group_id, total_price, payment_method, items, notes } = req.body;
  try {
    const db = await getPool();
    const result = await db.request()
      .input('customer_id', sql.Int, customer_id)
      .input('stall_id', sql.Int, stall_id)
      .input('group_id', sql.NVarChar, group_id)
      .input('total_price', sql.Int, total_price)
      .input('payment_method', sql.NVarChar, payment_method)
      .input('items', sql.NVarChar, items)
      .input('notes', sql.NVarChar, notes)
      .query(`INSERT INTO orders (customer_id, stall_id, group_id, total_price, payment_method, items, notes)
              OUTPUT INSERTED.* VALUES (@customer_id, @stall_id, @group_id, @total_price, @payment_method, @items, @notes)`);
    res.json(result.recordset[0]);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

app.patch('/api/orders/:id', async (req, res) => {
  const { status, rider_id } = req.body;
  try {
    const db = await getPool();
    const result = await db.request()
      .input('id', sql.Int, req.params.id)
      .input('status', sql.NVarChar, status)
      .input('rider_id', sql.Int, rider_id || null)
      .query(`UPDATE orders SET status=@status, rider_id=@rider_id OUTPUT INSERTED.* WHERE id=@id`);
    res.json(result.recordset[0]);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// ── PROMOTIONS ──────────────────────────────────────────────
app.get('/api/promotions', async (req, res) => {
  try {
    const db = await getPool();
    const result = await db.request().query('SELECT * FROM promotions ORDER BY created_at DESC');
    res.json(result.recordset);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

app.post('/api/promotions', async (req, res) => {
  const { target, msg } = req.body;
  try {
    const db = await getPool();
    const result = await db.request()
      .input('target', sql.NVarChar, target || 'Home')
      .input('msg', sql.NVarChar, msg)
      .query(`INSERT INTO promotions (target, msg) OUTPUT INSERTED.* VALUES (@target, @msg)`);
    res.json(result.recordset[0]);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

app.delete('/api/promotions/:id', async (req, res) => {
  try {
    const db = await getPool();
    await db.request().input('id', sql.Int, req.params.id).query('DELETE FROM promotions WHERE id=@id');
    res.json({ success: true });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// ── GAME RESERVATIONS ───────────────────────────────────────
app.get('/api/reservations', async (req, res) => {
  try {
    const db = await getPool();
    const result = await db.request().query('SELECT * FROM game_reservations ORDER BY created_at DESC');
    res.json(result.recordset);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

app.post('/api/reservations', async (req, res) => {
  const { id, username, avatar, court, reservation_date, time, price, status, type, phone } = req.body;
  try {
    const db = await getPool();
    const result = await db.request()
      .input('id', sql.NVarChar, id)
      .input('username', sql.NVarChar, username)
      .input('avatar', sql.NVarChar, avatar)
      .input('court', sql.NVarChar, court)
      .input('reservation_date', sql.NVarChar, reservation_date)
      .input('time', sql.NVarChar, time)
      .input('price', sql.NVarChar, price)
      .input('status', sql.NVarChar, status || 'Pending')
      .input('type', sql.NVarChar, type)
      .input('phone', sql.NVarChar, phone)
      .query(`INSERT INTO game_reservations (id, username, avatar, court, reservation_date, time, price, status, type, phone)
              OUTPUT INSERTED.* VALUES (@id, @username, @avatar, @court, @reservation_date, @time, @price, @status, @type, @phone)`);
    res.json(result.recordset[0]);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

app.patch('/api/reservations/:id', async (req, res) => {
  const { status } = req.body;
  try {
    const db = await getPool();
    const result = await db.request()
      .input('id', sql.NVarChar, req.params.id)
      .input('status', sql.NVarChar, status)
      .query(`UPDATE game_reservations SET status=@status OUTPUT INSERTED.* WHERE id=@id`);
    res.json(result.recordset[0]);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// ── COURT PRICES ────────────────────────────────────────────
app.get('/api/court-prices', async (req, res) => {
  try {
    const db = await getPool();
    const result = await db.request().query('SELECT TOP 1 * FROM court_prices ORDER BY id DESC');
    res.json(result.recordset[0]);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

app.put('/api/court-prices', async (req, res) => {
  const { morning_rate, afternoon_rate, open_play_rate, court_name1, court_name2, open_hour, close_hour, max_players, notes } = req.body;
  try {
    const db = await getPool();
    await db.request()
      .input('morning_rate', sql.Int, morning_rate)
      .input('afternoon_rate', sql.Int, afternoon_rate)
      .input('open_play_rate', sql.Int, open_play_rate)
      .input('court_name1', sql.NVarChar, court_name1)
      .input('court_name2', sql.NVarChar, court_name2)
      .input('open_hour', sql.Int, open_hour)
      .input('close_hour', sql.Int, close_hour)
      .input('max_players', sql.Int, max_players)
      .input('notes', sql.NVarChar, notes)
      .query(`UPDATE court_prices SET 
        morning_rate=@morning_rate, afternoon_rate=@afternoon_rate, open_play_rate=@open_play_rate,
        court_name1=@court_name1, court_name2=@court_name2, open_hour=@open_hour,
        close_hour=@close_hour, max_players=@max_players, notes=@notes, updated_at=GETDATE()`);
    res.json({ success: true });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// ── GAME MANAGERS ───────────────────────────────────────────
app.get('/api/game-managers', async (req, res) => {
  try {
    const db = await getPool();
    const result = await db.request().query('SELECT id, fullname, email, created_at FROM game_managers ORDER BY created_at DESC');
    res.json(result.recordset);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

app.post('/api/game-managers', async (req, res) => {
  const { fullname, email, password } = req.body;
  try {
    const db = await getPool();
    const result = await db.request()
      .input('fullname', sql.NVarChar, fullname)
      .input('email', sql.NVarChar, email)
      .input('password', sql.NVarChar, password)
      .query(`INSERT INTO game_managers (fullname, email, password)
              OUTPUT INSERTED.id, INSERTED.fullname, INSERTED.email, INSERTED.created_at
              VALUES (@fullname, @email, @password)`);
    res.json(result.recordset[0]);
  } catch (err) {
    if (err.message.includes('UNIQUE')) return res.status(400).json({ error: 'Email already registered.' });
    res.status(500).json({ error: err.message });
  }
});

// ── HEALTH CHECK ────────────────────────────────────────────
app.get('/api/health', (req, res) => res.json({ status: 'ok', time: new Date() }));

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`✅ PoblaGo API running on http://localhost:${PORT}`));
