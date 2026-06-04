import { db, auth } from './firebase.js';
import { ref, get, set, push, update, remove, onValue } from 'firebase/database';
import { signInWithEmailAndPassword, createUserWithEmailAndPassword } from 'firebase/auth';

// Helper to get all items as an array from RTDB
async function fetchAll(pathName) {
  const snapshot = await get(ref(db, pathName));
  if (!snapshot.exists()) return [];
  const data = snapshot.val();
  return Object.keys(data).map(key => ({ id: key, ...data[key] }));
}

// Helper to add an item
async function add(pathName, data) {
  const newRef = push(ref(db, pathName));
  const newDoc = { ...data, created_at: new Date().toISOString() };
  await set(newRef, newDoc);
  return { id: newRef.key, ...newDoc };
}

// Helper to update an item
async function updateItem(pathName, id, data) {
  const itemRef = ref(db, `${pathName}/${id}`);
  await update(itemRef, data);
  return { id, ...data };
}

// Helper to delete an item
async function del(pathName, id) {
  await remove(ref(db, `${pathName}/${id}`));
  return { id };
}

// Helper to subscribe to a path
function subscribe(pathName, callback) {
  return onValue(ref(db, pathName), (snapshot) => {
    if (!snapshot.exists()) {
      callback([]);
      return;
    }
    const data = snapshot.val();
    const arr = Object.keys(data).map(key => ({ id: key, ...data[key] }));
    callback(arr);
  });
}

export const api = {
  // Auth
  login: async (email, password) => {
    // 1. Admin hardcoded
    if ((email === 'admin' || email === 'admin@pobla.go') && password === 'admin')
      return { role: 'admin', user: { fullname: 'Admin', email } };

    // 2. Games Manager hardcoded fallback
    if ((email === 'games' || email === 'games@pobla.go') && password === 'games')
      return { role: 'game-manager', user: { fullname: 'Games Manager', email } };

    const checkPath = async (pathName, role) => {
      const items = await fetchAll(pathName);
      const field = pathName === 'stalls' ? 'username' : 'email';
      const found = items.find(i => i[field]?.toLowerCase() === email.toLowerCase());
      
      if (found) {
        if (found.status === 'suspended') throw new Error('Account suspended.');
        return { role, user: found, plain_password: found.password };
      }
      return null;
    };

    let record = await checkPath('game_managers', 'game-manager') ||
                 await checkPath('customers', 'customer') ||
                 await checkPath('stalls', 'stall') ||
                 await checkPath('riders', 'rider');

    if (!record) {
      throw new Error('Invalid email or password.');
    }

    try {
      await signInWithEmailAndPassword(auth, email, password);
    } catch (error) {
      // Fallback for old users who haven't been migrated to Firebase Auth yet
      if (error.code === 'auth/user-not-found' || error.code === 'auth/invalid-credential' || error.code === 'auth/invalid-login-credentials' || error.code === 'auth/wrong-password') {
        if (record.plain_password === password) {
          try {
             // Auto-migrate user
             await createUserWithEmailAndPassword(auth, email, password);
          } catch(e) {
             console.error("Firebase Auth migration failed:", e.message);
          }
        } else {
          throw new Error('Invalid email or password.');
        }
      } else {
        throw new Error(error.message);
      }
    }

    return { role: record.role, user: record.user };
  },

  // Customers
  getCustomers: () => fetchAll('customers'),
  subscribeCustomers: (cb) => subscribe('customers', cb),
  addCustomer: async (data) => {
    const items = await fetchAll('customers');
    const exists = items.find(i => i.email?.toLowerCase() === data.email.toLowerCase());
    if (exists) throw new Error('Email already registered.');
    
    try {
      await createUserWithEmailAndPassword(auth, data.email, data.password);
    } catch (error) {
      throw new Error(error.message);
    }
    
    return add('customers', data);
  },
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
    const prices = await fetchAll('court_prices');
    if (prices.length > 0) return prices;
    return [{ morning_rate: 200, afternoon_rate: 280, open_play_rate: 150 }];
  },
  updateCourtPrices: async (data) => {
    const prices = await fetchAll('court_prices');
    if (prices.length > 0) {
      return updateItem('court_prices', prices[0].id, data);
    } else {
      return add('court_prices', data);
    }
  },

  // Game Managers
  getGameManagers: () => fetchAll('game_managers'),
  addGameManager: (data) => add('game_managers', data),
};
