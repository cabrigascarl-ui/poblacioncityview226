import { useState, useMemo } from 'react'
import './AdminDashboard.css'

export default function AdminDashboard({ 
  onLogout, 
  stalls, setStalls, 
  customers, setCustomers, 
  orders, 
  promotions, setPromotions, 
  staff, setStaff, 
  riders, setRiders 
}) {
  const [tab, setTab] = useState('dashboard')
  
  // Tab states for lists
  const [ordersFilter, setOrdersFilter] = useState('All')
  const [stallsFilter, setStallsFilter] = useState('All')
  const [ridersFilter, setRidersFilter] = useState('All')
  
  // Search states
  const [stallsSearch, setStallsSearch] = useState('')
  const [ridersSearch, setRidersSearch] = useState('')
  const [ordersSearch, setOrdersSearch] = useState('')

  // Promotions state
  const [promoForm, setPromoForm] = useState({ msg: '', imageUrl: '', pretitle: '', title: '', target: 'Home' })
  const [promoSuccess, setPromoSuccess] = useState(false)

  // Notifications state
  const [notifMsg, setNotifMsg] = useState('')
  const [notifSent, setNotifSent] = useState(false)

  // Add Stall/Rider state
  const [isAddStallOpen, setIsAddStallOpen] = useState(false)
  const [newStall, setNewStall] = useState({ stall_name: '', category: '', logo: '', username: '', password: '', status: 'active' })

  const [isAddRiderOpen, setIsAddRiderOpen] = useState(false)
  const [newRider, setNewRider] = useState({ fullname: '', vehicle: '', phone: '', email: '', password: '', status: 'active' })

  const handleAddStall = () => {
    if (!newStall.stall_name || !newStall.username || !newStall.password) return
    const id = stalls.length ? Math.max(...stalls.map(s => s.id)) + 1 : 1
    const stallData = { ...newStall, id, desc: '', hours: '9:00 AM - 9:00 PM', delivery_fee: 15, delivery_time: '20-30 min' }
    setStalls(prev => [...prev, stallData])
    setIsAddStallOpen(false)
    setNewStall({ stall_name: '', category: '', logo: '', username: '', password: '', status: 'active' })
  }

  const handleAddRider = () => {
    if (!newRider.fullname || !newRider.email || !newRider.password) return
    const id = riders.length ? Math.max(...riders.map(r => r.id)) + 1 : 1
    const riderData = { ...newRider, id, location: { lat: 11.7760, lng: 124.8865 } }
    setRiders(prev => [...prev, riderData])
    setIsAddRiderOpen(false)
    setNewRider({ fullname: '', vehicle: '', phone: '', email: '', password: '', status: 'active' })
  }

  const defaultAdminAvatar = "https://ui-avatars.com/api/?name=Admin&background=E8001C&color=fff"

  // Icons
  const MenuIcon = () => <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="3" y1="12" x2="21" y2="12"></line><line x1="3" y1="6" x2="21" y2="6"></line><line x1="3" y1="18" x2="21" y2="18"></line></svg>
  const LogoIcon = () => (
    <div className="ad-header-logo">
      <svg width="24" height="24" viewBox="0 0 24 24" fill="#E8001C"><path d="M12 2L15 12L24 14L15 16L12 24L9 16L0 14L9 12L12 2Z"/></svg>
      <div style={{display:'flex', flexDirection:'column'}}>
        Poblacion
        <span className="ad-header-logo-sub">ADMIN PORTAL</span>
      </div>
    </div>
  )
  const BellIcon = () => <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"></path><path d="M13.73 21a2 2 0 0 1-3.46 0"></path></svg>
  const WalletIcon = ({ size = 24 }) => <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 12V7H5a2 2 0 0 1 2-2h14v4"></path><path d="M3 5v14a2 2 0 0 0 2 2h16v-5"></path><path d="M18 12a2 2 0 0 0 0 4h4v-4Z"></path></svg>
  const SearchIcon = () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>
  const FilterIcon = () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="4" y1="21" x2="4" y2="14"></line><line x1="4" y1="10" x2="4" y2="3"></line><line x1="12" y1="21" x2="12" y2="12"></line><line x1="12" y1="8" x2="12" y2="3"></line><line x1="20" y1="21" x2="20" y2="16"></line><line x1="20" y1="12" x2="20" y2="3"></line><line x1="1" y1="14" x2="7" y2="14"></line><line x1="9" y1="8" x2="15" y2="8"></line><line x1="17" y1="16" x2="23" y2="16"></line></svg>
  const PlusIcon = () => <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#E8001C" strokeWidth="2"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>
  const PhoneIcon = () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path></svg>
  const CalendarIcon = () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line><line x1="3" y1="10" x2="21" y2="10"></line></svg>
  const DotsMenuIcon = () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="1"></circle><circle cx="12" cy="5" r="1"></circle><circle cx="12" cy="19" r="1"></circle></svg>
  const ChartIcon = () => <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"></polyline></svg>
  const StarIcon = ({ size = 14 }) => <svg width={size} height={size} viewBox="0 0 24 24" fill="#F2C94C"><path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z"/></svg>

  // Derived Data
  const totalSales = orders.filter(o => o.status === 'Delivered').reduce((sum, o) => sum + o.total_price, 0)
  const totalOrders = orders.length
  const activeRiders = riders.filter(r => r.status === 'active').length
  const activeStalls = stalls.filter(s => s.status === 'active').length
  const totalCustomers = customers.filter(c => c.id !== 0).length // Exclude guest
  
  const getCustomerName = (id) => customers.find(c => c.id === id)?.fullname || 'Unknown Customer'
  const getStallName = (id) => stalls.find(s => s.id === id)?.stall_name || 'Unknown Stall'
  
  // Format Currency
  const formatCurrency = (val) => new Intl.NumberFormat('en-PH', { style: 'currency', currency: 'PHP' }).format(val || 0)

  // Status mapping for Order Pill CSS classes
  const mapOrderStatusClass = (status) => {
    const s = status.toLowerCase()
    if (s.includes('pending')) return 'pending'
    if (s.includes('preparing') || s.includes('ready')) return 'preparing'
    if (s.includes('delivery') || s.includes('delivering')) return 'out-for-delivery'
    if (s.includes('delivered')) return 'delivered'
    return 'pending'
  }

  // Analytics: Top stalls logic
  const topStalls = useMemo(() => {
    const stallSales = {}
    orders.filter(o => o.status === 'Delivered').forEach(o => {
      if (!stallSales[o.stall_id]) stallSales[o.stall_id] = 0
      stallSales[o.stall_id] += o.total_price
    })
    
    return Object.entries(stallSales)
      .map(([stall_id, sales]) => {
        const stall = stalls.find(s => s.id === Number(stall_id))
        return { 
          id: stall_id, 
          stall_name: stall?.stall_name, 
          logo: stall?.logo,
          sales,
          pct: totalSales > 0 ? Math.round((sales / totalSales) * 100) : 0
        }
      })
      .sort((a, b) => b.sales - a.sales)
      .slice(0, 3)
  }, [orders, stalls, totalSales])

  const renderDashboard = () => (
    <div className="ad-page-container">
      <div className="ad-header">
        <button className="ad-menu-btn"><MenuIcon /></button>
        <LogoIcon />
        <div className="ad-bell-wrapper">
          <button className="ad-icon-btn"><BellIcon /></button>
          <span className="ad-badge">3</span>
        </div>
      </div>

      <div className="ad-greeting">
        <img src={defaultAdminAvatar} alt="Admin" className="ad-avatar" />
        <div>
          <div className="ad-greeting-text">Welcome back,</div>
          <div className="ad-greeting-name">Admin 👋</div>
        </div>
      </div>

      <div className="ad-red-card">
        <div>
          <div className="ad-rc-title">Total Sales</div>
          <div className="ad-rc-amount">{formatCurrency(totalSales)}</div>
          <div className="ad-rc-diff">
            <span className="positive">+15%</span> vs yesterday
          </div>
        </div>
        <div className="ad-rc-icon">
          <WalletIcon size={24} />
        </div>
      </div>

      <div className="ad-stats-grid">
        <div className="ad-stat-box">
          <div className="ad-sb-header">
            <div className="ad-sb-title">Total Orders</div>
            <div className="ad-sb-icon red">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect><line x1="9" y1="3" x2="9" y2="21"></line></svg>
            </div>
          </div>
          <div className="ad-sb-value">{totalOrders}</div>
          <div className="ad-sb-sub"><span className="positive">+12%</span><br/>vs yesterday</div>
        </div>
        <div className="ad-stat-box">
          <div className="ad-sb-header">
            <div className="ad-sb-title">Active Riders</div>
            <div className="ad-sb-icon green">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="7" cy="17" r="3"></circle><circle cx="17" cy="17" r="3"></circle><path d="M14 17h-4"></path><path d="M14 17l1.5-6H19v-2l-2.5 0-2 8"></path><path d="M7 17l-1-4h-2"></path><path d="M6 13h4"></path><path d="M10 13l1-4h3"></path><path d="M11 9l-1-4H6"></path></svg>
            </div>
          </div>
          <div className="ad-sb-value">{activeRiders}</div>
          <div className="ad-sb-sub">Online</div>
        </div>
        <div className="ad-stat-box">
          <div className="ad-sb-header">
            <div className="ad-sb-title">Active Stalls</div>
            <div className="ad-sb-icon purple">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path><polyline points="9 22 9 12 15 12 15 22"></polyline></svg>
            </div>
          </div>
          <div className="ad-sb-value">{activeStalls}</div>
          <div className="ad-sb-sub">Open</div>
        </div>
        <div className="ad-stat-box">
          <div className="ad-sb-header">
            <div className="ad-sb-title">Total Customers</div>
            <div className="ad-sb-icon orange">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>
            </div>
          </div>
          <div className="ad-sb-value">{totalCustomers}</div>
          <div className="ad-sb-sub"><span className="positive">+15%</span><br/>vs yesterday</div>
        </div>
      </div>

      <div className="ad-section-block">
        <div className="ad-sec-header">
          <span className="ad-sec-title">Orders Overview</span>
          <div className="ad-sec-dropdown">
            This Week
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="6 9 12 15 18 9"></polyline></svg>
          </div>
        </div>
        <div className="ad-chart-legend">
          <div className="ad-legend-item"><span className="ad-legend-dot red"></span> Orders</div>
          <div className="ad-legend-item"><span className="ad-legend-dot grey"></span> Sales</div>
        </div>
        <div className="ad-chart-container">
          {/* Static representation of Chart for now */}
          <svg viewBox="0 0 300 120" style={{width: '100%', height: '100%'}}>
            <line x1="0" y1="0" x2="300" y2="0" stroke="#F0F0F0" strokeWidth="1" />
            <line x1="0" y1="30" x2="300" y2="30" stroke="#F0F0F0" strokeWidth="1" />
            <line x1="0" y1="60" x2="300" y2="60" stroke="#F0F0F0" strokeWidth="1" />
            <line x1="0" y1="90" x2="300" y2="90" stroke="#F0F0F0" strokeWidth="1" />
            <polyline points="0,90 40,75 80,60 120,80 160,30 200,60 240,40 280,50 300,10" fill="none" stroke="#E8001C" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            <circle cx="0" cy="90" r="3" fill="#E8001C"/>
            <circle cx="40" cy="75" r="3" fill="#E8001C"/>
            <circle cx="80" cy="60" r="3" fill="#E8001C"/>
            <circle cx="120" cy="80" r="3" fill="#E8001C"/>
            <circle cx="160" cy="30" r="3" fill="#E8001C"/>
            <circle cx="200" cy="60" r="3" fill="#E8001C"/>
            <circle cx="240" cy="40" r="3" fill="#E8001C"/>
            <circle cx="280" cy="50" r="3" fill="#E8001C"/>
            <circle cx="300" cy="10" r="3" fill="#E8001C"/>
            <path d="M0,90 L40,75 L80,60 L120,80 L160,30 L200,60 L240,40 L280,50 L300,10 L300,120 L0,120 Z" fill="url(#gradient)" opacity="0.1"/>
            <defs>
              <linearGradient id="gradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#E8001C" stopOpacity="1" />
                <stop offset="100%" stopColor="#E8001C" stopOpacity="0" />
              </linearGradient>
            </defs>
            <text x="0" y="115" fontSize="9" fill="#999">Mon</text>
            <text x="45" y="115" fontSize="9" fill="#999">Tue</text>
            <text x="90" y="115" fontSize="9" fill="#999">Wed</text>
            <text x="135" y="115" fontSize="9" fill="#999">Thu</text>
            <text x="185" y="115" fontSize="9" fill="#999">Fri</text>
            <text x="235" y="115" fontSize="9" fill="#999">Sat</text>
            <text x="280" y="115" fontSize="9" fill="#999">Sun</text>
            
            <text x="0" y="0" fontSize="8" fill="#999" alignmentBaseline="middle">400</text>
            <text x="0" y="30" fontSize="8" fill="#999" alignmentBaseline="middle">300</text>
            <text x="0" y="60" fontSize="8" fill="#999" alignmentBaseline="middle">200</text>
            <text x="0" y="90" fontSize="8" fill="#999" alignmentBaseline="middle">100</text>
            <text x="0" y="120" fontSize="8" fill="#999" alignmentBaseline="middle">0</text>
          </svg>
        </div>
      </div>

      <div className="ad-section-block">
        <div className="ad-sec-header" style={{marginBottom: 16}}>
          <span className="ad-sec-title">Recent Orders</span>
          <span className="ad-view-all" onClick={() => setTab('orders')}>View All</span>
        </div>
        <div className="ad-recent-list">
          {orders.slice().reverse().slice(0, 3).map(order => {
            const stall = stalls.find(s => s.id === order.stall_id)
            return (
              <div key={order.id} className="ad-recent-item">
                <div className="ad-ri-left">
                  <div className="ad-ri-icon" style={{ overflow: 'hidden' }}>
                    {(stall?.logo?.startsWith('http') || stall?.logo?.startsWith('data:')) ? (
                      <img src={stall.logo} alt="logo" style={{width: '100%', height: '100%', objectFit: 'cover', borderRadius: 'inherit'}} />
                    ) : (
                      stall?.logo || '🍔'
                    )}
                  </div>
                  <div>
                    <div className="ad-ri-id">#PGO{order.id}</div>
                    <div className="ad-ri-sub">{getCustomerName(order.customer_id)}</div>
                  </div>
                </div>
                <div className="ad-ri-right">
                  <div className="ad-ri-price">{formatCurrency(order.total_price)}</div>
                  <div className={`ad-ri-status ${mapOrderStatusClass(order.status)}`}>{order.status}</div>
                </div>
              </div>
            )
          })}
          {orders.length === 0 && <div style={{textAlign:'center', color:'#888', fontSize: 13}}>No recent orders</div>}
        </div>
      </div>
    </div>
  )

  const renderOrders = () => {
    let filteredOrders = orders.filter(o => {
      if (ordersSearch) {
        if (!String(o.id).includes(ordersSearch) && !getCustomerName(o.customer_id).toLowerCase().includes(ordersSearch.toLowerCase())) {
          return false
        }
      }
      if (ordersFilter === 'Pending') return o.status === 'Pending'
      if (ordersFilter === 'Preparing') return o.status === 'Preparing' || o.status === 'Ready for Delivery'
      if (ordersFilter === 'Ready') return o.status === 'Delivering' || o.status === 'Delivered'
      return true
    })

    const pendingCount = orders.filter(o => o.status === 'Pending').length
    const preparingCount = orders.filter(o => o.status === 'Preparing' || o.status === 'Ready for Delivery').length
    const ongoingCount = orders.filter(o => o.status === 'Preparing' || o.status === 'Ready for Delivery' || o.status === 'Delivering').length
    const todaySales = orders.filter(o => o.status === 'Delivered').reduce((sum, o) => sum + o.total_price, 0) // Assume all delivered are today for now

    return (
      <div className="ad-page-container">
        <div className="ad-header">
          <div className="ad-header-left">
            <button className="ad-menu-btn"><MenuIcon /></button>
            <span className="ad-header-title" style={{marginLeft: 16}}>Orders</span>
          </div>
          <div className="ad-header-right" style={{gap: 16}}>
            <FilterIcon />
          </div>
        </div>

        <div className="ad-search-bar" style={{paddingBottom: 0}}>
          <div className="ad-search-input-wrapper">
            <span className="ad-search-icon"><SearchIcon /></span>
            <input 
              type="text" 
              className="ad-search-input" 
              placeholder="Search by ID or Name..." 
              value={ordersSearch}
              onChange={(e) => setOrdersSearch(e.target.value)}
            />
          </div>
        </div>

        <div className="ad-tabs-row" style={{marginTop: 16}}>
          <button className={`ad-tab-btn ${ordersFilter === 'All' ? 'active' : ''}`} onClick={() => setOrdersFilter('All')}>All</button>
          <button className={`ad-tab-btn ${ordersFilter === 'Pending' ? 'active' : ''}`} onClick={() => setOrdersFilter('Pending')}>Pending ({pendingCount})</button>
          <button className={`ad-tab-btn ${ordersFilter === 'Preparing' ? 'active' : ''}`} onClick={() => setOrdersFilter('Preparing')}>Preparing ({preparingCount})</button>
          <button className={`ad-tab-btn ${ordersFilter === 'Ready' ? 'active' : ''}`} onClick={() => setOrdersFilter('Ready')}>Ready</button>
        </div>

        <div className="ad-list-container">
          {filteredOrders.slice().reverse().map(order => (
            <div key={order.id} className="ad-card-item">
              <div className="ad-oc-header">
                <span className="ad-oc-id">#PGO{order.id}</span>
                <span className="ad-oc-time">{order.time}</span>
              </div>
              <div className="ad-oc-main">
                <span className="ad-oc-name">{getCustomerName(order.customer_id)}</span>
                <span className="ad-oc-price">{formatCurrency(order.total_price)}</span>
              </div>
              <div className="ad-oc-footer">
                <span className="ad-oc-details" style={{textOverflow: 'ellipsis', whiteSpace:'nowrap', overflow:'hidden', maxWidth: '60%'}}>
                  {order.items} • {getStallName(order.stall_id)}
                </span>
                <span className={`ad-status-pill ${mapOrderStatusClass(order.status)}`}>{order.status}</span>
              </div>
            </div>
          ))}
          {filteredOrders.length === 0 && <div style={{textAlign:'center', color:'#888', marginTop: 20}}>No orders found</div>}
        </div>

        <div className="ad-sticky-summary">
          <div className="ad-summary-title">Today's Summary</div>
          <div className="ad-summary-grid">
            <div className="ad-summary-item">
              <div className="ad-summary-icon" style={{color: '#555'}}><svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line><polyline points="10 9 9 9 8 9"></polyline></svg></div>
              <div className="ad-summary-val">{totalOrders}</div>
              <div className="ad-summary-lbl">Orders</div>
            </div>
            <div className="ad-summary-item">
              <div className="ad-summary-icon" style={{color: '#00B050'}}><svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path></svg></div>
              <div className="ad-summary-val" style={{fontSize: 16}}>{formatCurrency(todaySales)}</div>
              <div className="ad-summary-lbl">Sales</div>
            </div>
            <div className="ad-summary-item">
              <div className="ad-summary-icon" style={{color: '#F2994A'}}><svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg></div>
              <div className="ad-summary-val">{pendingCount}</div>
              <div className="ad-summary-lbl">Pending</div>
            </div>
            <div className="ad-summary-item">
              <div className="ad-summary-icon" style={{color: '#00B050'}}><svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"></circle><path d="M22 12h-4l-3 9L9 3l-3 9H2"></path></svg></div>
              <div className="ad-summary-val">{ongoingCount}</div>
              <div className="ad-summary-lbl">Ongoing</div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  const renderStalls = () => {
    let filteredStalls = stalls.filter(s => {
      if (stallsSearch && !s.stall_name.toLowerCase().includes(stallsSearch.toLowerCase())) return false;
      if (stallsFilter === 'Open') return s.status === 'active';
      if (stallsFilter === 'Closed') return s.status !== 'active';
      return true;
    })

    const openCount = stalls.filter(s => s.status === 'active').length;
    const closedCount = stalls.filter(s => s.status !== 'active').length;

    return (
      <div className="ad-page-container">
        <div className="ad-header">
          <div className="ad-header-left">
            <button className="ad-menu-btn"><MenuIcon /></button>
            <span className="ad-header-title" style={{marginLeft: 16}}>Stalls</span>
          </div>
          <div className="ad-header-right">
            <button className="ad-icon-btn" onClick={() => setIsAddStallOpen(true)}><PlusIcon /></button>
          </div>
        </div>

        <div className="ad-search-bar">
          <div className="ad-search-input-wrapper">
            <span className="ad-search-icon"><SearchIcon /></span>
            <input 
              type="text" 
              className="ad-search-input" 
              placeholder="Search stalls..." 
              value={stallsSearch}
              onChange={(e) => setStallsSearch(e.target.value)}
            />
          </div>
        </div>

        <div className="ad-tabs-row">
          <button className={`ad-tab-btn ${stallsFilter === 'All' ? 'active' : ''}`} onClick={() => setStallsFilter('All')}>All ({stalls.length})</button>
          <button className={`ad-tab-btn ${stallsFilter === 'Open' ? 'active' : ''}`} onClick={() => setStallsFilter('Open')}>Open ({openCount})</button>
          <button className={`ad-tab-btn ${stallsFilter === 'Closed' ? 'active' : ''}`} onClick={() => setStallsFilter('Closed')}>Closed ({closedCount})</button>
        </div>

        <div className="ad-list-container">
          {filteredStalls.map(stall => (
            <div key={stall.id} className="ad-card-item ad-stall-card">
              <div className="ad-stall-logo" style={{display:'flex', alignItems:'center', justifyContent:'center', fontSize: 32, overflow: 'hidden'}}>
                {(stall.logo?.startsWith('http') || stall.logo?.startsWith('data:')) ? (
                  <img src={stall.logo} alt="logo" style={{width: '100%', height: '100%', objectFit: 'cover', borderRadius: 'inherit'}} />
                ) : (
                  stall.logo
                )}
              </div>
              <div className="ad-stall-info">
                <div className="ad-stall-name">{stall.stall_name}</div>
                <div className="ad-stall-cat">{stall.category}</div>
              </div>
              <div className={`ad-outline-badge ${stall.status === 'active' ? 'open' : 'closed'}`}>
                {stall.status === 'active' ? 'Open' : 'Closed'}
              </div>
              <div className="ad-dots-menu"><DotsMenuIcon /></div>
            </div>
          ))}
          {filteredStalls.length === 0 && <div style={{textAlign:'center', color:'#888', marginTop: 20}}>No stalls found</div>}
        </div>

        <div className="ad-sticky-summary">
          <div className="ad-summary-title">Stalls Summary</div>
          <div className="ad-summary-grid">
            <div className="ad-summary-item">
              <div className="ad-summary-icon" style={{color: '#111116', borderColor: '#111116'}}><svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path><polyline points="9 22 9 12 15 12 15 22"></polyline></svg></div>
              <div className="ad-summary-val">{stalls.length}</div>
              <div className="ad-summary-lbl">Total</div>
            </div>
            <div className="ad-summary-item">
              <div className="ad-summary-icon" style={{color: '#00B050', borderColor: '#00B050'}}><svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg></div>
              <div className="ad-summary-val">{openCount}</div>
              <div className="ad-summary-lbl">Open</div>
            </div>
            <div className="ad-summary-item">
              <div className="ad-summary-icon" style={{color: '#E8001C', borderColor: '#E8001C'}}><svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"></circle><line x1="15" y1="9" x2="9" y2="15"></line><line x1="9" y1="9" x2="15" y2="15"></line></svg></div>
              <div className="ad-summary-val">{closedCount}</div>
              <div className="ad-summary-lbl">Closed</div>
            </div>
            <div className="ad-summary-item">
              <div className="ad-summary-icon" style={{color: '#111116', borderColor: '#111116'}}><svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path><line x1="12" y1="9" x2="12" y2="13"></line><line x1="12" y1="17" x2="12.01" y2="17"></line></svg></div>
              <div className="ad-summary-val">0</div>
              <div className="ad-summary-lbl">Suspended</div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  const renderRiders = () => {
    let filteredRiders = riders.filter(r => {
      if (ridersSearch && !r.fullname.toLowerCase().includes(ridersSearch.toLowerCase())) return false;
      if (ridersFilter === 'Online') return r.status === 'active';
      if (ridersFilter === 'Offline') return r.status !== 'active';
      return true;
    })

    const onlineCount = riders.filter(r => r.status === 'active').length;
    const offlineCount = riders.filter(r => r.status !== 'active').length;

    return (
      <div className="ad-page-container">
        <div className="ad-header">
          <div className="ad-header-left">
            <button className="ad-menu-btn"><MenuIcon /></button>
            <span className="ad-header-title" style={{marginLeft: 16}}>Riders</span>
          </div>
          <div className="ad-header-right">
            <button className="ad-icon-btn" onClick={() => setIsAddRiderOpen(true)}><PlusIcon /></button>
          </div>
        </div>

        <div className="ad-search-bar">
          <div className="ad-search-input-wrapper">
            <span className="ad-search-icon"><SearchIcon /></span>
            <input 
              type="text" 
              className="ad-search-input" 
              placeholder="Search riders..." 
              value={ridersSearch}
              onChange={(e) => setRidersSearch(e.target.value)}
            />
          </div>
        </div>

        <div className="ad-tabs-row">
          <button className={`ad-tab-btn ${ridersFilter === 'All' ? 'active' : ''}`} onClick={() => setRidersFilter('All')}>All ({riders.length})</button>
          <button className={`ad-tab-btn ${ridersFilter === 'Online' ? 'active' : ''}`} onClick={() => setRidersFilter('Online')}>Online ({onlineCount})</button>
          <button className={`ad-tab-btn ${ridersFilter === 'Offline' ? 'active' : ''}`} onClick={() => setRidersFilter('Offline')}>Offline ({offlineCount})</button>
        </div>

        <div className="ad-list-container">
          {filteredRiders.map(rider => (
            <div key={rider.id} className="ad-card-item ad-rider-card">
              <img src={`https://ui-avatars.com/api/?name=${encodeURIComponent(rider.fullname)}&background=E8001C&color=fff`} alt={rider.fullname} className="ad-rider-avatar" />
              <div className="ad-rider-info">
                <div className="ad-rider-name-row">
                  <span className="ad-rider-name">{rider.fullname}</span>
                  <span className="ad-rider-rating"><StarIcon /> 4.9</span>
                </div>
                <div className="ad-rider-details">
                  {rider.vehicle || 'Motorcycle'}<br/>
                  Phone: {rider.phone}
                </div>
              </div>
              <div className="ad-rider-right">
                <div className={`ad-outline-badge ${rider.status === 'active' ? 'online' : 'offline'}`}>
                  {rider.status === 'active' ? 'Online' : 'Offline'}
                </div>
                <button className="ad-phone-btn" onClick={() => window.location.href=`tel:${rider.phone}`}><PhoneIcon /></button>
              </div>
              <div className="ad-dots-menu" style={{marginLeft: 4, alignSelf: 'flex-start'}}><DotsMenuIcon /></div>
            </div>
          ))}
          {filteredRiders.length === 0 && <div style={{textAlign:'center', color:'#888', marginTop: 20}}>No riders found</div>}
        </div>

        <div className="ad-sticky-summary">
          <div className="ad-summary-title">Riders Summary</div>
          <div className="ad-summary-grid">
            <div className="ad-summary-item">
              <div className="ad-summary-icon" style={{color: '#555'}}><svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="7" cy="17" r="3"></circle><circle cx="17" cy="17" r="3"></circle><path d="M14 17h-4"></path><path d="M14 17l1.5-6H19v-2l-2.5 0-2 8"></path><path d="M7 17l-1-4h-2"></path><path d="M6 13h4"></path><path d="M10 13l1-4h3"></path><path d="M11 9l-1-4H6"></path></svg></div>
              <div className="ad-summary-val">{riders.length}</div>
              <div className="ad-summary-lbl">Total</div>
            </div>
            <div className="ad-summary-item">
              <div className="ad-summary-icon" style={{color: '#00B050'}}><svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg></div>
              <div className="ad-summary-val">{onlineCount}</div>
              <div className="ad-summary-lbl">Online</div>
            </div>
            <div className="ad-summary-item">
              <div className="ad-summary-icon" style={{color: '#555'}}><svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="16"></line><line x1="8" y1="12" x2="16" y2="12"></line></svg></div>
              <div className="ad-summary-val">{offlineCount}</div>
              <div className="ad-summary-lbl">Offline</div>
            </div>
            <div className="ad-summary-item">
              <div className="ad-summary-icon" style={{color: '#555'}}><svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path><line x1="12" y1="9" x2="12" y2="13"></line><line x1="12" y1="17" x2="12.01" y2="17"></line></svg></div>
              <div className="ad-summary-val">0</div>
              <div className="ad-summary-lbl">Suspended</div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  const renderMore = () => (
    <div className="ad-page-container">
      <div className="ad-header">
        <button className="ad-menu-btn"><MenuIcon /></button>
        <span className="ad-header-title">More</span>
        <div style={{width:40}} />
      </div>

      <div className="ad-more-profile">
        <div className="ad-mp-avatar-wrap">
          <img src={defaultAdminAvatar} alt="Admin" className="ad-mp-avatar" />
          <div className="ad-mp-online-dot" />
        </div>
        <div>
          <div className="ad-mp-name">Admin</div>
          <div className="ad-mp-email">admin@poblago.com</div>
          <div className="ad-mp-role-badge">Super Admin</div>
        </div>
      </div>

      <div className="ad-menu-list">
        {[
          { label:'Reports',      icon:'📊', tab:'analytics',     color:'#7C3AED' },
          { label:'Promotions',   icon:'🏷️', tab:'promotions',    color:'#E8001C' },
          { label:'Customers',    icon:'👥', tab:'customers',     color:'#2D9CDB' },
          { label:'Transactions', icon:'💳', tab:'transactions',  color:'#00B050' },
          { label:'Notifications',icon:'🔔', tab:'notifications', color:'#F2994A' },
        ].map(item => (
          <div key={item.tab} className="ad-menu-item" onClick={() => setTab(item.tab)}>
            <div className="ad-menu-left">
              <div className="ad-menu-icon-emoji" style={{background: item.color + '18'}}>
                <span>{item.icon}</span>
              </div>
              <span>{item.label}</span>
            </div>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#CCC" strokeWidth="2"><polyline points="9 18 15 12 9 6"/></svg>
          </div>
        ))}
        <div className="ad-menu-divider" />
        <div className="ad-menu-item logout" onClick={onLogout}>
          <div className="ad-menu-left">
            <div className="ad-menu-icon-emoji" style={{background:'rgba(232,0,28,0.08)'}}>
              <span>🚪</span>
            </div>
            <span>Logout</span>
          </div>
        </div>
      </div>
    </div>
  )

  const renderAnalytics = () => (
    <div className="ad-page-container">
      <div className="ad-header" style={{boxShadow: 'none'}}>
        <div className="ad-header-left">
          <button className="ad-menu-btn" onClick={() => setTab('more')}><svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="15 18 9 12 15 6"></polyline></svg></button>
          <span className="ad-header-title" style={{marginLeft: 16}}>Analytics</span>
        </div>
        <div className="ad-header-right">
          <button className="ad-icon-btn"><CalendarIcon /></button>
        </div>
      </div>

      <div style={{padding: '16px 20px', background: 'transparent'}}>
        <div className="ad-sec-dropdown" style={{background: 'rgba(255,255,255,0.8)', padding: '10px 16px', borderRadius: 12, display: 'inline-flex', border: '1px solid rgba(255,255,255,0.5)'}}>
          This Week
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{marginLeft: 8}}><polyline points="6 9 12 15 18 9"></polyline></svg>
        </div>
      </div>

      <div className="ad-red-card" style={{margin: '0 20px 20px'}}>
        <div>
          <div className="ad-rc-title">Total Sales</div>
          <div className="ad-rc-amount">{formatCurrency(totalSales)}</div>
          <div className="ad-rc-diff">
            <span className="positive" style={{color: '#00FF85', background: 'rgba(0, 255, 133, 0.15)'}}>+15%</span> vs last week
          </div>
        </div>
        <div className="ad-rc-icon" style={{background: 'none', border: 'none'}}>
          <ChartIcon />
        </div>
      </div>

      <div className="ad-section-block">
        <div className="ad-sec-header" style={{marginBottom: 16}}>
          <span className="ad-sec-title">Sales Overview</span>
        </div>
        <div className="ad-chart-legend">
          <div className="ad-legend-item"><span className="ad-legend-dot red"></span> Sales (₱)</div>
          <div className="ad-legend-item"><span className="ad-legend-dot grey"></span> Orders</div>
        </div>
        <div className="ad-chart-container" style={{height: 220}}>
          <svg viewBox="0 0 300 120" style={{width: '100%', height: '100%'}}>
            <line x1="0" y1="0" x2="300" y2="0" stroke="#F0F0F0" strokeWidth="1" />
            <line x1="0" y1="30" x2="300" y2="30" stroke="#F0F0F0" strokeWidth="1" />
            <line x1="0" y1="60" x2="300" y2="60" stroke="#F0F0F0" strokeWidth="1" />
            <line x1="0" y1="90" x2="300" y2="90" stroke="#F0F0F0" strokeWidth="1" />
            <polyline points="0,90 40,75 80,60 120,80 160,30 200,60 240,40 280,50 300,10" fill="none" stroke="#E8001C" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            <circle cx="0" cy="90" r="3" fill="#E8001C"/>
            <circle cx="40" cy="75" r="3" fill="#E8001C"/>
            <circle cx="80" cy="60" r="3" fill="#E8001C"/>
            <circle cx="120" cy="80" r="3" fill="#E8001C"/>
            <circle cx="160" cy="30" r="3" fill="#E8001C"/>
            <circle cx="200" cy="60" r="3" fill="#E8001C"/>
            <circle cx="240" cy="40" r="3" fill="#E8001C"/>
            <circle cx="280" cy="50" r="3" fill="#E8001C"/>
            <circle cx="300" cy="10" r="3" fill="#E8001C"/>
            <path d="M0,90 L40,75 L80,60 L120,80 L160,30 L200,60 L240,40 L280,50 L300,10 L300,120 L0,120 Z" fill="url(#gradient-analytics)" opacity="0.1"/>
            <defs>
              <linearGradient id="gradient-analytics" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#E8001C" stopOpacity="1" />
                <stop offset="100%" stopColor="#E8001C" stopOpacity="0" />
              </linearGradient>
            </defs>
            <text x="0" y="115" fontSize="9" fill="#999">Mon</text>
            <text x="45" y="115" fontSize="9" fill="#999">Tue</text>
            <text x="90" y="115" fontSize="9" fill="#999">Wed</text>
            <text x="135" y="115" fontSize="9" fill="#999">Thu</text>
            <text x="185" y="115" fontSize="9" fill="#999">Fri</text>
            <text x="235" y="115" fontSize="9" fill="#999">Sat</text>
            <text x="280" y="115" fontSize="9" fill="#999">Sun</text>
            
            <text x="0" y="0" fontSize="8" fill="#999" alignmentBaseline="middle">40K</text>
            <text x="0" y="30" fontSize="8" fill="#999" alignmentBaseline="middle">30K</text>
            <text x="0" y="60" fontSize="8" fill="#999" alignmentBaseline="middle">20K</text>
            <text x="0" y="90" fontSize="8" fill="#999" alignmentBaseline="middle">10K</text>
            <text x="0" y="120" fontSize="8" fill="#999" alignmentBaseline="middle">0</text>
          </svg>
        </div>
      </div>

      <div className="ad-section-block">
        <div className="ad-sec-header" style={{marginBottom: 16}}>
          <span className="ad-sec-title">Top Performing Stalls</span>
        </div>
        <div className="ad-top-stalls-list">
          {topStalls.map((stall, index) => (
            <div key={stall.id} className="ad-top-stall-item">
              <span className="ad-ts-rank">{index + 1}</span>
              <div className="ad-ts-logo" style={{display:'flex', alignItems:'center', justifyContent:'center', fontSize: 24, overflow: 'hidden'}}>
                {(stall.logo?.startsWith('http') || stall.logo?.startsWith('data:')) ? (
                  <img src={stall.logo} alt="logo" style={{width: '100%', height: '100%', objectFit: 'cover'}} />
                ) : (
                  stall.logo || '🍔'
                )}
              </div>
              <span className="ad-ts-name">{stall.stall_name}</span>
              <div className="ad-ts-right">
                <div className="ad-ts-price">{formatCurrency(stall.sales)}</div>
                <div className="ad-ts-pct">{stall.pct}%</div>
              </div>
            </div>
          ))}
          {topStalls.length === 0 && <div style={{textAlign:'center', color:'#888', marginTop: 10}}>No sales data available</div>}
        </div>
      </div>
    </div>
  )

  // ── Promotions page ────────────────────────────────────────────────────────
  const renderPromotions = () => {
    const handleAddPromo = () => {
      if (!promoForm.msg.trim() && !promoForm.imageUrl.trim()) return
      const newPromo = { 
        id: Date.now(), 
        msg: promoForm.msg, 
        subtitle: promoForm.msg,
        imageUrl: promoForm.imageUrl, 
        pretitle: promoForm.pretitle,
        title: promoForm.title,
        target: promoForm.target,
        time: 'Just now' 
      }
      setPromotions(prev => [newPromo, ...prev])
      setPromoForm({ msg: '', imageUrl: '', pretitle: '', title: '', target: 'Home' })
      setPromoSuccess(true)
      setTimeout(() => setPromoSuccess(false), 2500)
    }
    const handleDeletePromo = (id) => setPromotions(prev => prev.filter(p => p.id !== id))
    return (
      <div className="ad-page-container">
        <div className="ad-header">
          <button className="ad-menu-btn" onClick={() => setTab('more')}><svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="15 18 9 12 15 6"/></svg></button>
          <span className="ad-header-title">Promotions</span>
          <div style={{width:40}}/>
        </div>
        <div style={{padding:'20px 20px 0'}}>
          <div className="ad-subpage-card">
            <div className="ad-subpage-card-title">📢 New Promotion</div>
            
            <label className="ad-form-label">Placement Target</label>
            <select className="ad-form-input" style={{marginBottom: 16}} value={promoForm.target} onChange={e => setPromoForm(f => ({...f, target: e.target.value}))}>
              <option value="Home">Home Tab (Food & Delivery)</option>
              <option value="Games">Games Tab (Court Rental)</option>
            </select>

            <label className="ad-form-label">Pre-title (Small text above)</label>
            <input className="ad-form-input" type="text" placeholder="e.g. Craving something" value={promoForm.pretitle} onChange={e => setPromoForm(f => ({...f, pretitle: e.target.value}))} />
            
            <label className="ad-form-label">Main Title (Large text)</label>
            <input className="ad-form-input" type="text" placeholder="e.g. Delicious?" value={promoForm.title} onChange={e => setPromoForm(f => ({...f, title: e.target.value}))} />
            
            <label className="ad-form-label">Message / Subtitle Text</label>
            <textarea className="ad-form-input" rows={2} placeholder="e.g. Order Now and enjoy your favorites!" value={promoForm.msg} onChange={e => setPromoForm(f => ({...f, msg: e.target.value}))} />
            
            <label className="ad-form-label">Slider Image</label>
            <input 
              className="ad-form-input" 
              type="file" 
              accept="image/*"
              style={{ padding: '8px' }}
              onChange={e => {
                const file = e.target.files[0];
                if (file) {
                  const reader = new FileReader();
                  reader.onloadend = () => {
                    setPromoForm(f => ({...f, imageUrl: reader.result}));
                  };
                  reader.readAsDataURL(file);
                }
              }} 
            />
            {promoForm.imageUrl ? <img src={promoForm.imageUrl} alt="preview" style={{width:'100%',height:120,objectFit:'cover',borderRadius:12,marginTop:8}} onError={e=>e.target.style.display='none'} /> : null}
            {promoSuccess && <div className="ad-success-banner">✅ Promotion published!</div>}
            <button className="ad-form-submit" onClick={handleAddPromo}>Publish Promotion</button>
          </div>
          <div className="ad-subpage-section-title">Active Promotions ({promotions.length})</div>
          {promotions.map(p => (
            <div key={p.id} className="ad-promo-card">
              {p.imageUrl && <img src={p.imageUrl} alt="promo" style={{width:'100%',height:100,objectFit:'cover',borderRadius:10,marginBottom:10}} onError={e=>e.target.style.display='none'} />}
              <div className="ad-promo-msg"><span style={{fontSize: 10, background: '#F1F3F5', padding: '2px 6px', borderRadius: 4, marginRight: 6}}>{p.target || 'Home'}</span>{p.msg}</div>
              <div className="ad-promo-footer">
                <span className="ad-promo-time">{p.time || 'Today'}</span>
                <button className="ad-promo-delete" onClick={() => handleDeletePromo(p.id)}>Delete</button>
              </div>
            </div>
          ))}
          {promotions.length === 0 && <div className="ad-empty-state">No promotions yet</div>}
        </div>
      </div>
    )
  }

  // ── Customers page ─────────────────────────────────────────────────────────
  const renderCustomers = () => {
    const realCustomers = customers.filter(c => c.id !== 0)
    return (
      <div className="ad-page-container">
        <div className="ad-header">
          <button className="ad-menu-btn" onClick={() => setTab('more')}><svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="15 18 9 12 15 6"/></svg></button>
          <span className="ad-header-title">Customers</span>
          <span style={{color:'#888',fontSize:13}}>{realCustomers.length} total</span>
        </div>
        <div className="ad-list-container" style={{paddingBottom:40}}>
          {realCustomers.map(c => {
            const custOrders = orders.filter(o => o.customer_id === c.id)
            const custSpend = custOrders.filter(o => o.status === 'Delivered').reduce((s, o) => s + o.total_price, 0)
            return (
              <div key={c.id} className="ad-card-item">
                <div style={{display:'flex',alignItems:'center',gap:14}}>
                  <img src={`https://ui-avatars.com/api/?name=${encodeURIComponent(c.fullname)}&background=2D9CDB&color=fff`} alt={c.fullname} style={{width:52,height:52,borderRadius:'50%',flexShrink:0}} />
                  <div style={{flex:1}}>
                    <div style={{fontWeight:800,fontSize:16,marginBottom:3}}>{c.fullname}</div>
                    <div style={{fontSize:13,color:'#666'}}>{c.email}</div>
                    <div style={{fontSize:12,color:'#999',marginTop:2}}>📞 {c.phone || '—'}</div>
                  </div>
                  <div style={{textAlign:'right'}}>
                    <div style={{fontWeight:900,fontSize:15}}>{formatCurrency(custSpend)}</div>
                    <div style={{fontSize:12,color:'#888'}}>{custOrders.length} orders</div>
                    <div className={`ad-outline-badge ${c.status === 'active' ? 'online' : 'offline'}`} style={{marginTop:4,display:'inline-block'}}>{c.status}</div>
                  </div>
                </div>
              </div>
            )
          })}
          {realCustomers.length === 0 && <div className="ad-empty-state">No customers yet</div>}
        </div>
      </div>
    )
  }

  // ── Transactions page ──────────────────────────────────────────────────────
  const renderTransactions = () => {
    const delivered = orders.filter(o => o.status === 'Delivered')
    const totalRevenue = delivered.reduce((s,o) => s + o.total_price, 0)
    return (
      <div className="ad-page-container">
        <div className="ad-header">
          <button className="ad-menu-btn" onClick={() => setTab('more')}><svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="15 18 9 12 15 6"/></svg></button>
          <span className="ad-header-title">Transactions</span>
          <div style={{width:40}}/>
        </div>
        <div style={{padding:'20px 20px 0'}}>
          <div className="ad-red-card" style={{margin:'0 0 20px'}}>
            <div>
              <div className="ad-rc-title">Total Revenue</div>
              <div className="ad-rc-amount">{formatCurrency(totalRevenue)}</div>
              <div className="ad-rc-diff">{delivered.length} completed transactions</div>
            </div>
            <div className="ad-rc-icon"><span style={{fontSize:28}}>💳</span></div>
          </div>
        </div>
        <div className="ad-list-container" style={{paddingBottom:40}}>
          {orders.slice().reverse().map(o => {
            const isDelivered = o.status === 'Delivered'
            const stall = stalls.find(s => s.id === o.stall_id)
            return (
              <div key={o.id} className="ad-card-item">
                <div className="ad-oc-header">
                  <span className="ad-oc-id">#PGO{o.id}</span>
                  <span className="ad-oc-time">{o.time}</span>
                </div>
                <div className="ad-oc-main">
                  <div>
                    <div className="ad-oc-name">{getCustomerName(o.customer_id)}</div>
                    <div style={{fontSize:13,color:'#888'}}>{stall?.logo} {stall?.stall_name}</div>
                  </div>
                  <span className="ad-oc-price">{formatCurrency(o.total_price)}</span>
                </div>
                <div className="ad-oc-footer">
                  <span style={{fontSize:12,color:'#888'}}>{o.payment_method}</span>
                  <span className={`ad-status-pill ${mapOrderStatusClass(o.status)}`}>{o.status}</span>
                </div>
              </div>
            )
          })}
          {orders.length === 0 && <div className="ad-empty-state">No transactions yet</div>}
        </div>
      </div>
    )
  }

  // ── Notifications page ─────────────────────────────────────────────────────
  const renderNotifications = () => {
    const handleSend = () => {
      if (!notifMsg.trim()) return
      setNotifSent(true)
      setNotifMsg('')
      setTimeout(() => setNotifSent(false), 2500)
    }
    const systemNotifs = [
      { icon:'🛵', msg:`${orders.filter(o=>o.status==='Pending').length} orders are pending assignment`, time:'Just now', color:'#FFF4E6' },
      { icon:'🏪', msg:`${stalls.filter(s=>s.status==='pending').length} stall(s) pending approval`, time:'5 min ago', color:'#E6F4F9' },
      { icon:'👤', msg:`${customers.filter(c=>c.id!==0).length} registered customers on platform`, time:'Today', color:'#E6F7ED' },
    ]
    return (
      <div className="ad-page-container">
        <div className="ad-header">
          <button className="ad-menu-btn" onClick={() => setTab('more')}><svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="15 18 9 12 15 6"/></svg></button>
          <span className="ad-header-title">Notifications</span>
          <div style={{width:40}}/>
        </div>
        <div style={{padding:'20px'}}>
          <div className="ad-subpage-card">
            <div className="ad-subpage-card-title">📣 Broadcast Message</div>
            <label className="ad-form-label">Message to all users</label>
            <textarea className="ad-form-input" rows={3} placeholder="Type your announcement here..." value={notifMsg} onChange={e => setNotifMsg(e.target.value)} />
            {notifSent && <div className="ad-success-banner">✅ Broadcast sent to all users!</div>}
            <button className="ad-form-submit" onClick={handleSend}>Send Broadcast</button>
          </div>
          <div className="ad-subpage-section-title">System Alerts</div>
          {systemNotifs.map((n,i) => (
            <div key={i} className="ad-notif-row" style={{background:n.color}}>
              <span className="ad-notif-emoji">{n.icon}</span>
              <div style={{flex:1}}>
                <div style={{fontSize:14,fontWeight:700}}>{n.msg}</div>
                <div style={{fontSize:12,color:'#888',marginTop:3}}>{n.time}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    )
  }

  const renderContent = () => {
    switch (tab) {
      case 'dashboard':    return renderDashboard();
      case 'orders':       return renderOrders();
      case 'stalls':       return renderStalls();
      case 'riders':       return renderRiders();
      case 'more':         return renderMore();
      case 'analytics':    return renderAnalytics();
      case 'promotions':   return renderPromotions();
      case 'customers':    return renderCustomers();
      case 'transactions': return renderTransactions();
      case 'notifications':return renderNotifications();
      default:             return renderDashboard();
    }
  }

  // Which tab to highlight — sub-pages under More still highlight More
  const moreSubTabs = ['analytics','promotions','customers','transactions','notifications']
  const activeTab = moreSubTabs.includes(tab) ? 'more' : tab

  return (
    <div className="ad-container">
      <div className="ad-content">
        {renderContent()}
      </div>

      <div className="ad-bottom-nav">
        <button className={`ad-nav-item ${activeTab === 'dashboard' ? 'active' : ''}`} onClick={() => setTab('dashboard')}>
          <svg className="ad-nav-icon" viewBox="0 0 24 24" fill="currentColor"><path d="M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8z"/></svg>
          <span className="ad-nav-label">Dashboard</span>
        </button>
        <button className={`ad-nav-item ${activeTab === 'orders' ? 'active' : ''}`} onClick={() => setTab('orders')}>
          <svg className="ad-nav-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line><polyline points="10 9 9 9 8 9"></polyline></svg>
          <span className="ad-nav-label">Orders</span>
        </button>
        <button className={`ad-nav-item ${activeTab === 'stalls' ? 'active' : ''}`} onClick={() => setTab('stalls')}>
          <svg className="ad-nav-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path><polyline points="9 22 9 12 15 12 15 22"></polyline></svg>
          <span className="ad-nav-label">Stalls</span>
        </button>
        <button className={`ad-nav-item ${activeTab === 'riders' ? 'active' : ''}`} onClick={() => setTab('riders')}>
          <svg className="ad-nav-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>
          <span className="ad-nav-label">Riders</span>
        </button>
        <button className={`ad-nav-item ${activeTab === 'more' ? 'active' : ''}`} onClick={() => setTab('more')}>
          <DotsMenuIcon />
          <span className="ad-nav-label">More</span>
        </button>
      </div>

      {isAddStallOpen && (
        <div className="ad-modal-overlay">
          <div className="ad-modal-content">
            <div className="ad-modal-header">
              <span className="ad-modal-title">Add New Stall</span>
              <button className="ad-modal-close" onClick={() => setIsAddStallOpen(false)}>✕</button>
            </div>
            <div className="ad-modal-body">
              <div className="ad-form-group">
                <label className="ad-form-label">Stall Name</label>
                <input type="text" className="ad-form-input" placeholder="e.g. Burger Hub" value={newStall.stall_name} onChange={e => setNewStall({...newStall, stall_name: e.target.value})} />
              </div>
              <div className="ad-form-group">
                <label className="ad-form-label">Category</label>
                <input type="text" className="ad-form-input" placeholder="e.g. Fast Food" value={newStall.category} onChange={e => setNewStall({...newStall, category: e.target.value})} />
              </div>
              <div className="ad-form-group">
                <label className="ad-form-label">Emoji / Logo</label>
                <input type="text" className="ad-form-input" placeholder="e.g. 🍔" value={newStall.logo} onChange={e => setNewStall({...newStall, logo: e.target.value})} />
              </div>
              <div className="ad-form-group">
                <label className="ad-form-label">Login Username</label>
                <input type="text" className="ad-form-input" placeholder="e.g. burgerhub" value={newStall.username} onChange={e => setNewStall({...newStall, username: e.target.value})} />
              </div>
              <div className="ad-form-group">
                <label className="ad-form-label">Login Password</label>
                <input type="password" className="ad-form-input" placeholder="Enter password" value={newStall.password} onChange={e => setNewStall({...newStall, password: e.target.value})} />
              </div>
            </div>
            <div className="ad-modal-footer">
              <button className="ad-btn-cancel" onClick={() => setIsAddStallOpen(false)}>Cancel</button>
              <button className="ad-btn-submit" onClick={handleAddStall}>Add Stall</button>
            </div>
          </div>
        </div>
      )}

      {isAddRiderOpen && (
        <div className="ad-modal-overlay">
          <div className="ad-modal-content">
            <div className="ad-modal-header">
              <span className="ad-modal-title">Add New Rider</span>
              <button className="ad-modal-close" onClick={() => setIsAddRiderOpen(false)}>✕</button>
            </div>
            <div className="ad-modal-body">
              <div className="ad-form-group">
                <label className="ad-form-label">Full Name</label>
                <input type="text" className="ad-form-input" placeholder="e.g. Juan Dela Cruz" value={newRider.fullname} onChange={e => setNewRider({...newRider, fullname: e.target.value})} />
              </div>
              <div className="ad-form-group">
                <label className="ad-form-label">Vehicle Info</label>
                <input type="text" className="ad-form-input" placeholder="e.g. Motorcycle - ABC 123" value={newRider.vehicle} onChange={e => setNewRider({...newRider, vehicle: e.target.value})} />
              </div>
              <div className="ad-form-group">
                <label className="ad-form-label">Phone Number</label>
                <input type="tel" className="ad-form-input" placeholder="e.g. 09123456789" value={newRider.phone} onChange={e => setNewRider({...newRider, phone: e.target.value})} />
              </div>
              <div className="ad-form-group">
                <label className="ad-form-label">Login Email</label>
                <input type="email" className="ad-form-input" placeholder="e.g. rider@poblago.com" value={newRider.email} onChange={e => setNewRider({...newRider, email: e.target.value})} />
              </div>
              <div className="ad-form-group">
                <label className="ad-form-label">Login Password</label>
                <input type="password" className="ad-form-input" placeholder="Enter password" value={newRider.password} onChange={e => setNewRider({...newRider, password: e.target.value})} />
              </div>
            </div>
            <div className="ad-modal-footer">
              <button className="ad-btn-cancel" onClick={() => setIsAddRiderOpen(false)}>Cancel</button>
              <button className="ad-btn-submit" onClick={handleAddRider}>Add Rider</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
