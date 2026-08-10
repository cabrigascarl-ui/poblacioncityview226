require('dotenv').config();
const express = require('express');
const cors = require('cors');
const https = require('https');

const app = express();
app.use(cors());
app.use(express.json());

// This backend now exists for exactly one purpose: proxying PayMongo
// payment-link requests (the app's own PayMongo secret key must never be
// shipped to the browser). Every other endpoint that used to live here
// talked to a separate Azure SQL database that the live app no longer
// uses at all — the app runs entirely on Firebase now. That old surface
// included a hardcoded admin/games-manager login bypass and read/wrote
// plaintext passwords directly, so it was removed rather than patched.

// ── PAYMONGO ─────────────────────────────────────────────────
/**
 * POST /api/paymongo/create-link
 * Body: { amount: Number (PHP), description: String }
 * Returns: { checkout_url, link_id, reference_number }
 */
app.post('/api/paymongo/create-link', async (req, res) => {
  const { amount, description } = req.body;
  if (!amount || amount <= 0) return res.status(400).json({ error: 'Invalid amount.' });

  const secretKey = process.env.PAYMONGO_SECRET_KEY;
  if (!secretKey) return res.status(500).json({ error: 'PayMongo secret key not configured.' });

  const payload = JSON.stringify({
    data: {
      attributes: {
        amount: Math.round(Number(amount) * 100), // Convert PHP to centavos
        description: description || 'Poblacion Payment',
        remarks: 'Poblacion City View - Online Payment'
      }
    }
  });

  const options = {
    hostname: 'api.paymongo.com',
    path: '/v1/links',
    method: 'POST',
    headers: {
      'Authorization': 'Basic ' + Buffer.from(secretKey + ':').toString('base64'),
      'Content-Type': 'application/json',
      'Content-Length': Buffer.byteLength(payload)
    }
  };

  const pmReq = https.request(options, (pmRes) => {
    let data = '';
    pmRes.on('data', (chunk) => { data += chunk; });
    pmRes.on('end', () => {
      try {
        const json = JSON.parse(data);
        if (pmRes.statusCode >= 400) {
          return res.status(pmRes.statusCode).json({ error: json.errors?.[0]?.detail || 'PayMongo error.' });
        }
        const attrs = json.data.attributes;
        res.json({
          checkout_url: attrs.checkout_url,
          link_id: json.data.id,
          reference_number: attrs.reference_number,
          status: attrs.status
        });
      } catch (e) {
        res.status(500).json({ error: 'Failed to parse PayMongo response.' });
      }
    });
  });

  pmReq.on('error', (e) => res.status(500).json({ error: e.message }));
  pmReq.write(payload);
  pmReq.end();
});

/**
 * GET /api/paymongo/link/:id
 * Retrieves a payment link status to check if it's paid
 */
app.get('/api/paymongo/link/:id', async (req, res) => {
  const secretKey = process.env.PAYMONGO_SECRET_KEY;
  if (!secretKey) return res.status(500).json({ error: 'PayMongo secret key not configured.' });

  const options = {
    hostname: 'api.paymongo.com',
    path: `/v1/links/${req.params.id}`,
    method: 'GET',
    headers: {
      'Authorization': 'Basic ' + Buffer.from(secretKey + ':').toString('base64')
    }
  };

  const pmReq = https.request(options, (pmRes) => {
    let data = '';
    pmRes.on('data', (chunk) => { data += chunk; });
    pmRes.on('end', () => {
      try {
        const json = JSON.parse(data);
        if (pmRes.statusCode >= 400) {
          return res.status(pmRes.statusCode).json({ error: json.errors?.[0]?.detail || 'PayMongo error.' });
        }
        const attrs = json.data.attributes;
        res.json({ status: attrs.status, amount: attrs.amount / 100, link_id: json.data.id });
      } catch (e) {
        res.status(500).json({ error: 'Failed to parse PayMongo response.' });
      }
    });
  });

  pmReq.on('error', (e) => res.status(500).json({ error: e.message }));
  pmReq.end();
});

// ── HEALTH CHECK ────────────────────────────────────────────
app.get('/api/health', (req, res) => res.json({ status: 'ok', time: new Date() }));

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`✅ PoblaGo API running on http://localhost:${PORT}`));
