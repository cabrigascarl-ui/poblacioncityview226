const BASE = 'https://poblacioncityview26.onrender.com/api';

async function req(method, path, body) {
  const res = await fetch(`${BASE}${path}`, {
    method,
    headers: { 'Content-Type': 'application/json' },
    body: body ? JSON.stringify(body) : undefined,
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Request failed');
  return data;
}

export const api = {
  // Auth
  login: (email, password) => req('POST', '/auth/login', { email, password }),

  // Customers
  getCustomers: () => req('GET', '/customers'),
  addCustomer: (data) => req('POST', '/customers', data),
  updateCustomer: (id, data) => req('PATCH', `/customers/${id}`, data),

  // Stalls
  getStalls: () => req('GET', '/stalls'),
  addStall: (data) => req('POST', '/stalls', data),
  updateStall: (id, data) => req('PATCH', `/stalls/${id}`, data),

  // Riders
  getRiders: () => req('GET', '/riders'),
  addRider: (data) => req('POST', '/riders', data),
  updateRider: (id, data) => req('PATCH', `/riders/${id}`, data),

  // Foods
  getFoods: () => req('GET', '/foods'),
  addFood: (data) => req('POST', '/foods', data),
  updateFood: (id, data) => req('PATCH', `/foods/${id}`, data),
  deleteFood: (id) => req('DELETE', `/foods/${id}`),

  // Orders
  getOrders: () => req('GET', '/orders'),
  addOrder: (data) => req('POST', '/orders', data),
  updateOrder: (id, data) => req('PATCH', `/orders/${id}`, data),

  // Promotions
  getPromotions: () => req('GET', '/promotions'),
  addPromotion: (data) => req('POST', '/promotions', data),
  deletePromotion: (id) => req('DELETE', `/promotions/${id}`),

  // Game Reservations
  getReservations: () => req('GET', '/reservations'),
  addReservation: (data) => req('POST', '/reservations', data),
  updateReservation: (id, data) => req('PATCH', `/reservations/${id}`, data),

  // Court Prices
  getCourtPrices: () => req('GET', '/court-prices'),
  updateCourtPrices: (data) => req('PUT', '/court-prices', data),

  // Game Managers
  getGameManagers: () => req('GET', '/game-managers'),
  addGameManager: (data) => req('POST', '/game-managers', data),
};
