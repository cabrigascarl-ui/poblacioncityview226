const API_URL = 'http://localhost:5000/api';

// Helper for standard GET requests
async function fetchAll(endpoint) {
  const res = await fetch(`${API_URL}/${endpoint}`);
  if (!res.ok) throw new Error(`Failed to fetch ${endpoint}`);
  return await res.json();
}

// Helper for POST requests
async function add(endpoint, data) {
  const res = await fetch(`${API_URL}/${endpoint}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  });
  if (!res.ok) throw new Error(await res.text());
  return await res.json();
}

// Helper for PATCH requests
async function updateItem(endpoint, id, data) {
  const res = await fetch(`${API_URL}/${endpoint}/${id}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  });
  if (!res.ok) throw new Error(await res.text());
  return await res.json();
}

// Helper for DELETE requests
async function del(endpoint, id) {
  const res = await fetch(`${API_URL}/${endpoint}/${id}`, {
    method: 'DELETE'
  });
  if (!res.ok) throw new Error(await res.text());
  return { id };
}

// Real-time polling fallback since Azure SQL doesn't have native WebSockets like Firebase
function subscribe(endpoint, callback) {
  // Initial fetch
  fetchAll(endpoint).then(callback).catch(console.error);
  
  // Poll every 3 seconds to mimic Firebase Realtime updates
  const intervalId = setInterval(() => {
    fetchAll(endpoint).then(callback).catch(console.error);
  }, 3000);
  
  // Return an unsubscribe function
  return () => clearInterval(intervalId);
}

export const api = {
  // Auth
  login: async (email, password) => {
    const res = await fetch(`${API_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    });
    if (!res.ok) throw new Error((await res.json()).error || 'Login failed');
    return await res.json(); // { role, user }
  },

  // Customers
  getCustomers: () => fetchAll('customers'),
  subscribeCustomers: (cb) => subscribe('customers', cb),
  addCustomer: (data) => add('customers', data),
  updateCustomer: (id, data) => updateItem('customers', id, data),

  // Stalls
  getStalls: () => fetchAll('stalls'),
  subscribeStalls: (cb) => subscribe('stalls', cb),
  addStall: (data) => add('stalls', data),
  updateStall: (id, data) => updateItem('stalls', id, data),
  deleteStall: (id) => del('stalls', id),

  // Riders
  getRiders: () => fetchAll('riders'),
  subscribeRiders: (cb) => subscribe('riders', cb),
  addRider: (data) => add('riders', data),
  updateRider: (id, data) => updateItem('riders', id, data),

  // Foods
  getFoods: () => fetchAll('foods'),
  subscribeFoods: (cb) => subscribe('foods', cb),
  addFood: (data) => add('foods', data),
  updateFood: (id, data) => updateItem('foods', id, data),
  deleteFood: (id) => del('foods', id),

  // Orders
  getOrders: () => fetchAll('orders'),
  subscribeOrders: (cb) => subscribe('orders', cb),
  addOrder: (data) => add('orders', data),
  updateOrder: (id, data) => updateItem('orders', id, data),

  // Promotions
  getPromotions: () => fetchAll('promotions'),
  subscribePromotions: (cb) => subscribe('promotions', cb),
  addPromotion: (data) => add('promotions', data),
  deletePromotion: (id) => del('promotions', id),

  // Game Reservations
  getReservations: () => fetchAll('reservations'),
  subscribeReservations: (cb) => subscribe('reservations', cb),
  addReservation: (data) => add('reservations', data),
  updateReservation: (id, data) => updateItem('reservations', id, data),

  // Court Prices
  getCourtPrices: async () => {
    try {
      const res = await fetch(`${API_URL}/court-prices`);
      if (res.ok) return [await res.json()];
    } catch(e) {}
    return [{ morning_rate: 200, afternoon_rate: 280, open_play_rate: 150 }];
  },
  updateCourtPrices: async (data) => {
    const res = await fetch(`${API_URL}/court-prices`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    if (!res.ok) throw new Error(await res.text());
    return await res.json();
  },

  // Game Managers
  getGameManagers: () => fetchAll('game-managers'),
  addGameManager: (data) => add('game-managers', data),
};
