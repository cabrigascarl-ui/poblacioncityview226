import { useState, useEffect } from 'react'
import { api } from './api'
import Splash          from './pages/Splash/Splash'
import GetStarted      from './pages/GetStarted/GetStarted'
import Login           from './pages/Login/Login'
import Home            from './pages/Home/Home'
import Search          from './pages/Search/Search'
import Orders          from './pages/Orders/Orders'
import Offers          from './pages/Offers/Offers'
import Account         from './pages/Account/Account'
import Games           from './pages/Games/Games'
import Restaurant      from './pages/Restaurant/Restaurant'
import Cart            from './pages/Cart/Cart'
import OrderTracking   from './pages/OrderTracking/OrderTracking'
import BottomNav       from './components/BottomNav'
import StallDashboard  from './pages/Stall/StallDashboard'
import AdminDashboard  from './pages/Admin/AdminDashboard'
import RiderDashboard  from './pages/Rider/RiderDashboard'
import PaymentGateway  from './pages/PaymentGateway/PaymentGateway'

const CUSTOMER_SCREENS = ['home', 'orders', 'offers', 'games', 'account']

// ─── Initial Database (loaded from Azure SQL) ──────────────────────────────

export default function App() {
  // ── Session States (Persisted) ──
  const initialRole = localStorage.getItem('userRole') || null
  const initialScreen = initialRole ? 
    (initialRole === 'customer' ? 'home' : 
     initialRole === 'stall' ? 'stall-dashboard' : 
     initialRole === 'rider' ? 'rider-dashboard' : 
     initialRole === 'admin' ? 'admin-dashboard' : 
     initialRole === 'game manager' ? 'games-admin' : 'splash')
    : 'splash'

  const [screen,  setScreen]  = useState(initialScreen)
  const [history, setHistory] = useState([])
  const [userRole, setUserRole] = useState(initialRole) // 'customer' | 'stall' | 'rider' | 'admin' | 'game manager'

  // ── Database States (synced with Azure SQL) ──
  const [customers,   setCustomers]   = useState([])
  const [stalls,      setStalls]      = useState([])
  const [staff,       setStaff]       = useState([])
  const [riders,      setRiders]      = useState([])
  const [foods,       setFoods]       = useState([])
  const [orders,      setOrders]      = useState([])
  const [promotions,  setPromotions]  = useState([])
  const [gameManagers,setGameManagers]  = useState([])
  const [dbLoaded,    setDbLoaded]    = useState(false)

  // Safe JSON parse helper to prevent crashes from "undefined" string in localStorage
  const safeJsonParse = (key, fallback) => {
    try {
      const val = localStorage.getItem(key)
      if (val === 'undefined') return fallback
      return val ? JSON.parse(val) : fallback
    } catch (e) {
      console.warn(`Error parsing localStorage key "${key}":`, e)
      return fallback
    }
  }

  // ── Load all data from Azure on startup ──
  // ── Session States (Persisted) ──
  const [currentCustomer, setCurrentCustomer] = useState(() => safeJsonParse('currentCustomer', null))
  const [currentStall,    setCurrentStall]    = useState(() => safeJsonParse('currentStall', null))
  const [currentRider,    setCurrentRider]    = useState(() => safeJsonParse('currentRider', null))
  const [currentStallId,  setCurrentStallId]  = useState(() => localStorage.getItem('currentStallId') || null)
  const [currentTrackingOrder, setCurrentTrackingOrder] = useState(() => safeJsonParse('currentTrackingOrder', null))
  const [cartItems, setCartItems] = useState(() => safeJsonParse('cartItems', []))
  const [pendingPaymentDetails, setPendingPaymentDetails] = useState(null)

  // Persist session state changes to localStorage
  useEffect(() => { localStorage.setItem('currentCustomer', JSON.stringify(currentCustomer)) }, [currentCustomer])
  useEffect(() => { localStorage.setItem('currentStall', JSON.stringify(currentStall)) }, [currentStall])
  useEffect(() => { localStorage.setItem('currentRider', JSON.stringify(currentRider)) }, [currentRider])
  useEffect(() => { localStorage.setItem('currentStallId', currentStallId || '') }, [currentStallId])
  useEffect(() => { localStorage.setItem('currentTrackingOrder', JSON.stringify(currentTrackingOrder)) }, [currentTrackingOrder])
  useEffect(() => { localStorage.setItem('cartItems', JSON.stringify(cartItems)) }, [cartItems])
  useEffect(() => { if (userRole) { localStorage.setItem('userRole', userRole) } else { localStorage.removeItem('userRole') } }, [userRole])

  // ── Load all data from Azure on startup ──
  useEffect(() => {
    // We use Real-time Listeners now instead of get()
    const unsubs = [];
    unsubs.push(api.subscribeCustomers(c => { setCustomers(c) }))
    unsubs.push(api.subscribeStalls(s => { setStalls(s) }))
    unsubs.push(api.subscribeRiders(r => { setRiders(r) }))
    unsubs.push(api.subscribeFoods(f => { setFoods(f) }))
    unsubs.push(api.subscribePromotions(p => { setPromotions(p) }))
    
    // Setup Audio Ringing for Stalls
    let initialLoad = true;
    unsubs.push(api.subscribeOrders(o => {
      setOrders(prev => {
        // If there's a new order and we are logged in as a stall, play a sound
        if (!initialLoad && currentStall && o.length > prev.length) {
          const latestOrder = o[o.length - 1];
          if (latestOrder.stall_id === currentStall.id && latestOrder.status === 'Pending') {
            try {
              const audio = new Audio('https://assets.mixkit.co/active_storage/sfx/2869/2869-preview.mp3');
              audio.play();
            } catch (e) {}
          }
        }
        return o;
      })
      initialLoad = false;
    }))

    // Game Managers doesn't have subscribe yet, so fetch once
    api.getGameManagers().then(gm => {
      setGameManagers(gm)
      setDbLoaded(true)
    }).catch(err => {
      console.warn('⚠️ Could not load GameManagers:', err.message)
      setDbLoaded(true)
    })

    return () => unsubs.forEach(unsub => unsub && unsub());
  }, [currentStall])

  // ── Navigation ──
  const nav  = (s) => { setHistory(h => [...h, screen]); setScreen(s) }
  const goTo = (s) => { setHistory([]); setScreen(s) }
  const back = ()  => { const h = [...history]; const prev = h.pop() || 'home'; setHistory(h); setScreen(prev) }

  // ── Cart ──
  const addToCart = (item) => {
    setCartItems(prev => {
      const ex = prev.find(i => i.id === item.id)
      if (ex) return prev.map(i => i.id === item.id ? { ...i, qty: i.qty + 1 } : i)
      return [...prev, { ...item, qty: 1 }]
    })
  }

  const updateQty = (id, d) => {
    setCartItems(prev =>
      prev.map(i => i.id === id ? { ...i, qty: Math.max(0, i.qty + d) } : i).filter(i => i.qty > 0)
    )
  }

  // ── Auth Handlers ──
  const handleCustomerLogin = (customerObj) => {
    setUserRole('customer')
    setCurrentCustomer(customerObj)
    goTo('home')
  }

  const handleStallLogin = (stallObj) => {
    setUserRole('stall')
    setCurrentStall(stallObj)
    goTo('stall-dashboard')
  }

  const handleRiderLogin = (riderObj) => {
    setUserRole('rider')
    setCurrentRider(riderObj)
    goTo('rider-dashboard')
  }

  const handleAdminLogin = () => {
    setUserRole('admin')
    goTo('admin-dashboard')
  }

  const handleGamesLogin = () => {
    setUserRole('game manager')
    goTo('games-admin')
  }

  const handleLogout = () => {
    localStorage.clear()
    setUserRole(null)
    setCurrentCustomer(null)
    setCurrentStall(null)
    setCurrentRider(null)
    setCurrentStallId(null)
    setCurrentTrackingOrder(null)
    setCartItems([])
    setHistory([])
    setScreen('getstarted')
  }

  // ── Multi-Stall Order Splitter ──
  // Takes the unified cart and splits into one order per stall,
  // all linked by a shared group_id for the rider to pick up together.
  const handlePlaceOrder = (details) => {
    if (cartItems.length === 0) return

    // Block guest users from placing orders
    if (!currentCustomer || currentCustomer.id === 0) {
      alert('Please login or register to place an order.')
      return
    }

    if (details.paymentMethod !== 'Cash on Delivery') {
      setPendingPaymentDetails(details)
      return
    }

    finalizeOrder(details)
  }

  const finalizeOrder = async (details) => {
    const groupId = `G${Math.floor(10000 + Math.random() * 90000)}`
    const timestamp = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })

    // Group cart items by stall_id
    const byStall = {}
    cartItems.forEach(item => {
      const sId = item.stall_id
      if (!sId) return // Skip items without a stall_id
      if (!byStall[sId]) byStall[sId] = []
      byStall[sId].push(item)
    })

    const newOrdersPromises = Object.keys(byStall).map(async stallIdStr => {
      const stallId = isNaN(Number(stallIdStr)) ? stallIdStr : Number(stallIdStr)
      const stallItems = byStall[stallIdStr]
      const itemsSummary = stallItems.map(i => `${i.qty}x ${i.food_name || i.name}`).join(', ')
      const stallTotal = stallItems.reduce((s, i) => s + i.price * i.qty, 0)
      const stallNote = details.notes?.[stallId] || details.notes || ''

      const newOrderData = {
        customer_id: currentCustomer?.id,
        stall_id: stallId,
        rider_id: null,         // Assigned later when a Rider accepts
        group_id: groupId,      // Links all sub-orders in this checkout
        total_price: stallTotal,
        status: 'Pending',
        payment_method: details.paymentMethod,
        items: itemsSummary,
        notes: stallNote,
        time: timestamp,
      }
      
      try {
        const savedOrder = await api.addOrder(newOrderData)
        return savedOrder
      } catch (err) {
        console.error('Failed to save order to Firebase:', err)
        // Fallback to local order if offline
        return { id: Math.floor(10000 + Math.random() * 90000).toString(), ...newOrderData }
      }
    })

    const savedOrders = await Promise.all(newOrdersPromises)

    // Also create a "virtual" master order object for the tracking screen
    const masterOrder = {
      id: groupId,
      group_id: groupId,
      customer_id: currentCustomer?.id,
      total_price: details.totalPrice,
      payment_method: details.paymentMethod,
      status: 'Pending',
      time: timestamp,
    }

    setOrders(prev => [...prev, ...savedOrders])
    setCartItems([])
    setCurrentTrackingOrder(masterOrder)
    nav('tracking')
  }

  const handleUpdateProfile = async (updatedCust) => {
    try {
      const saved = await api.updateCustomer(updatedCust.id, updatedCust)
      setCustomers(prev => prev.map(c => c.id === saved.id ? saved : c))
      setCurrentCustomer(saved)
    } catch (err) {
      // Fallback to local update if API fails
      setCustomers(prev => prev.map(c => c.id === updatedCust.id ? updatedCust : c))
      setCurrentCustomer(updatedCust)
    }
  }

  const handleUpdateStallProfile = async (updatedStall) => {
    try {
      const saved = await api.updateStall(updatedStall.id, updatedStall)
      setStalls(prev => prev.map(s => s.id === saved.id ? saved : s))
      setCurrentStall(saved)
    } catch (err) {
      console.error('Failed to update stall profile:', err)
      // Fallback
      setStalls(prev => prev.map(s => s.id === updatedStall.id ? updatedStall : s))
      setCurrentStall(updatedStall)
    }
  }

  // ── Screen Renderer ──
  const renderScreen = () => {
    switch (screen) {

      // ── Onboarding ──────────────────────────────────────────────────────
      case 'splash':
        return <Splash onStart={() => goTo('getstarted')} />

      case 'getstarted':
        return (
          <GetStarted
            onLogin={() => nav('login')}
            onRegister={() => { nav('login') }}   // Login page has inline register
            onGuest={() => {
              // Guest browsing — show home without account
              setUserRole('customer')
              setCurrentCustomer({ id: 0, fullname: 'Guest', phone: '', address: '', status: 'active' })
              goTo('home')
            }}
          />
        )

      case 'login':
        return (
          <Login
            onBack={back}
            onLogin={handleCustomerLogin}
            onStallLogin={handleStallLogin}
            onRiderLogin={handleRiderLogin}
            onAdminLogin={handleAdminLogin}
            onGamesLogin={handleGamesLogin}
            customers={customers}
            stalls={stalls}
            staff={staff}
            riders={riders}
            onRegisterCustomer={async (newCust) => {
              try {
                const saved = await api.addCustomer(newCust)
                setCustomers(prev => [...prev, saved])
                return saved
              } catch (err) {
                throw err;
              }
            }}
            onGuest={() => {
              setUserRole('customer')
              setCurrentCustomer({ id: 0, fullname: 'Guest', phone: '', address: '', status: 'active' })
              goTo('home')
            }}
          />
        )

      // ── Customer ─────────────────────────────────────────────────────────
      case 'home':
        return (
          <Home
            stalls={stalls}
            foods={foods}
            currentCustomer={currentCustomer}
            promos={promotions}
            onRestaurant={(stall) => { setCurrentStallId(stall.id); nav('restaurant') }}
            onSearch={() => nav('search')}
            onPromoOrder={() => nav('search')}
          />
        )

      case 'search':
        return (
          <Search
            stalls={stalls}
            foods={foods}
            onRestaurant={(stall) => { setCurrentStallId(stall.id); nav('restaurant') }}
            onBack={back}
          />
        )

      case 'orders':
        return (
          <Orders
            orders={orders}
            stalls={stalls}
            currentCustomer={currentCustomer}
            onTrack={(order) => { setCurrentTrackingOrder(order); nav('tracking') }}
          />
        )

      case 'offers':
        return <Offers promotions={promotions} />

      case 'games':
        return <Games currentCustomer={currentCustomer} promotions={promotions} />

      case 'games-admin':
        return <Games currentCustomer={currentCustomer} promotions={promotions} initialView="admin" />

      case 'tracking': {
        // Find the right order/group to track
        const trackOrder = currentTrackingOrder
          || orders.find(o => o.customer_id === currentCustomer?.id && o.status === 'Delivering')
          || orders.find(o => o.customer_id === currentCustomer?.id && o.status !== 'Delivered' && o.status !== 'Cancelled')
        
        return (
          <OrderTracking
            onBack={back}
            order={trackOrder}
            orders={orders}
            setOrders={setOrders}
            stalls={stalls}
            riders={riders}
          />
        )
      }

      case 'account':
        return (
          <Account
            onLogout={handleLogout}
            currentCustomer={currentCustomer}
            onUpdateProfile={handleUpdateProfile}
            orders={orders}
          />
        )

      case 'restaurant':
        return (
          <Restaurant
            stall={stalls.find(s => s.id === currentStallId)}
            foods={foods}
            onBack={back}
            onCart={() => nav('cart')}
            addToCart={addToCart}
            cartItems={cartItems}
            isGuest={currentCustomer?.id === 0}
          />
        )

      case 'cart':
        return (
          <Cart
            items={cartItems}
            updateQty={updateQty}
            onBack={back}
            onShopping={() => goTo('home')}
            onPlaceOrder={handlePlaceOrder}
            stalls={stalls}
            isGuest={currentCustomer?.id === 0}
            onLogin={() => nav('login')}
          />
        )

      // ── Stall Staff ───────────────────────────────────────────────────────
      case 'stall-dashboard':
        return (
          <StallDashboard
            onLogout={handleLogout}
            stall={stalls.find(s => s.id === currentStall?.id) || currentStall}
            foods={foods}
            setFoods={setFoods}
            orders={orders}
            setOrders={setOrders}
            customers={customers}
            onUpdateStallProfile={handleUpdateStallProfile}
          />
        )

      // ── Delivery Rider ────────────────────────────────────────────────────
      case 'rider-dashboard':
        return (
          <RiderDashboard
            onLogout={handleLogout}
            rider={currentRider}
            orders={orders}
            setOrders={setOrders}
            stalls={stalls}
            customers={customers}
          />
        )

      // ── Admin ─────────────────────────────────────────────────────────────
      case 'admin-dashboard':
        return (
          <AdminDashboard
            onLogout={handleLogout}
            stalls={stalls}
            setStalls={setStalls}
            customers={customers}
            setCustomers={setCustomers}
            orders={orders}
            promotions={promotions}
            setPromotions={setPromotions}
            staff={staff}
            setStaff={setStaff}
            riders={riders}
            setRiders={setRiders}
            gameManagers={gameManagers}
            setGameManagers={setGameManagers}
          />
        )

      default:
        return <Splash onStart={() => goTo('getstarted')} />
    }
  }

  const showBottomNav = CUSTOMER_SCREENS.includes(screen) && userRole === 'customer'

  // Count active orders for badge on Track tab
  const activeOrderCount = currentCustomer
    ? orders.filter(o => o.customer_id === currentCustomer.id && o.status !== 'Delivered' && o.status !== 'Cancelled').length
    : 0

  return (
    <div className="app-shell">
      <div className="screen-wrap">
        <div className="screen">
          {renderScreen()}
        </div>
        {showBottomNav && (
          <BottomNav
            active={screen}
            onNav={nav}
            cartCount={cartItems.reduce((s,i) => s+i.qty, 0)}
            activeOrderCount={activeOrderCount}
          />
        )}
      </div>

      {pendingPaymentDetails && (
        <PaymentGateway 
          amount={pendingPaymentDetails.totalPrice}
          method={pendingPaymentDetails.paymentMethod}
          onSuccess={() => {
            const details = pendingPaymentDetails
            setPendingPaymentDetails(null)
            finalizeOrder(details)
          }}
          onCancel={() => setPendingPaymentDetails(null)}
        />
      )}
    </div>
  )
}
