import { useState, useEffect, useRef } from 'react'
import { api } from '../../api'
import './StallDashboard.css'

const STALL_TABS = [
  { id: 'dashboard', label: 'Dashboard', icon: <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path><polyline points="9 22 9 12 15 12 15 22"></polyline></svg> },
  { id: 'orders',    label: 'Orders',    icon: <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line><polyline points="10 9 9 9 8 9"></polyline></svg> },
  { id: 'menu',      label: 'Menu',      icon: <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line><polyline points="10 9 9 9 8 9"></polyline></svg> },
  { id: 'sales',     label: 'Sales',     icon: <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line><polyline points="10 9 9 9 8 9"></polyline></svg> },
  { id: 'more',      label: 'More',      icon: <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="1"></circle><circle cx="19" cy="12" r="1"></circle><circle cx="5" cy="12" r="1"></circle></svg> },
]

export default function StallDashboard({ onLogout, stall, foods = [], setFoods, orders = [], setOrders, customers = [], onUpdateStallProfile }) {
  const [tab, setTab] = useState('dashboard')

  // Dynamic greeting
  const hour = new Date().getHours()
  const greeting = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening'

  // Filter Tabs
  const [ordersFilter, setOrdersFilter] = useState('new') // 'new' | 'preparing' | 'ready' | 'completed'
  const [menuFilter, setMenuFilter] = useState('all')     // 'all' | 'best' | 'noodles' | 'drinks'

  // Modals state
  const [showAddModal, setShowAddModal] = useState(false)
  const [showEditModal, setShowEditModal] = useState(false)
  const [editingItem, setEditingItem] = useState(null)
  const [selectedOrderDetails, setSelectedOrderDetails] = useState(null)
  const logoInputRef = useRef(null)
  const addImageInputRef = useRef(null)
  const editImageInputRef = useRef(null)

  // Add Item Fields
  const [newName, setNewName] = useState('')
  const [newPrice, setNewPrice] = useState('')
  const [newDesc, setNewDesc] = useState('')
  const [newCat, setNewCat] = useState('Noodles')
  const [newEmoji, setNewEmoji] = useState('🍜')
  const [newAvailable, setNewAvailable] = useState(true)

  // Edit Profile Fields
  const [profName, setProfName] = useState(stall?.stall_name || '')
  const [profDesc, setProfDesc] = useState(stall?.desc || '')
  const [profHours, setProfHours] = useState(stall?.hours || '')
  const [profFee, setProfFee] = useState(stall?.delivery_fee || 15)
  const [profRider, setProfRider] = useState(stall?.rider || 'Juan D.')
  const [profLogo, setProfLogo] = useState(stall?.logo || '')

  const handleLogoUpload = (e) => {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = (ev) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const MAX_WIDTH = 500;
        const scaleSize = MAX_WIDTH / img.width;
        canvas.width = MAX_WIDTH;
        canvas.height = img.height * scaleSize;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
        const compressedBase64 = canvas.toDataURL('image/jpeg', 0.6);
        setProfLogo(compressedBase64);
      };
      img.src = ev.target.result;
    }
    reader.readAsDataURL(file)
  }

  const handleAddImageUpload = (e) => {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = (ev) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const MAX_WIDTH = 500;
        const scaleSize = MAX_WIDTH / img.width;
        canvas.width = MAX_WIDTH;
        canvas.height = img.height * scaleSize;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
        const compressedBase64 = canvas.toDataURL('image/jpeg', 0.6);
        setNewEmoji(compressedBase64);
      };
      img.src = ev.target.result;
    }
    reader.readAsDataURL(file)
  }

  const handleEditImageUpload = (e) => {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = (ev) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const MAX_WIDTH = 500;
        const scaleSize = MAX_WIDTH / img.width;
        canvas.width = MAX_WIDTH;
        canvas.height = img.height * scaleSize;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
        const compressedBase64 = canvas.toDataURL('image/jpeg', 0.6);
        setEditingItem(prev => ({...prev, image: compressedBase64}));
      };
      img.src = ev.target.result;
    }
    reader.readAsDataURL(file)
  }

  // Filter food and orders belonging to this stall
  const stallFoods = foods.filter(f => f.stall_id === stall?.id)
  const stallOrders = orders.filter(o => o.stall_id === stall?.id)

  const handleUpdateStatus = async (orderId, nextStatus) => {
    try {
      await api.updateOrder(orderId, { status: nextStatus })
      if (selectedOrderDetails && selectedOrderDetails.id === orderId) {
        setSelectedOrderDetails(prev => ({ ...prev, status: nextStatus }))
      }
    } catch (err) { console.error(err) }
  }

  const handleReject = async (orderId) => {
    try {
      await api.updateOrder(orderId, { status: 'Cancelled' })
      if (selectedOrderDetails && selectedOrderDetails.id === orderId) {
        setSelectedOrderDetails(null)
      }
    } catch (err) { console.error(err) }
  }

  const handleToggleAvail = async (foodId) => {
    const item = foods.find(f => f.id === foodId)
    if (item) {
      try {
        await api.updateFood(foodId, { available: item.available === undefined ? false : !item.available })
      } catch (err) { console.error(err) }
    }
  }

  const handleDeleteMenu = async (foodId) => {
    if (window.confirm("Are you sure you want to delete this menu item?")) {
      try { await api.deleteFood(foodId) } catch (err) { console.error(err) }
    }
  }

  const handleAddItem = async (e) => {
    e.preventDefault()
    if (!newName || !newPrice) return
    const newItem = {
      stall_id: stall.id,
      food_name: newName,
      price: parseFloat(newPrice),
      image: newEmoji,
      description: newDesc,
      category: newCat,
      available: newAvailable
    }
    try {
      await api.addFood(newItem)
      setShowAddModal(false)
      setNewName(''); setNewPrice(''); setNewDesc(''); setNewEmoji('🍜'); setNewAvailable(true);
    } catch (err) { console.error(err) }
  }

  const handleEditItem = async (e) => {
    e.preventDefault()
    if (!editingItem.food_name || !editingItem.price) return
    try {
      await api.updateFood(editingItem.id, editingItem)
      setShowEditModal(false)
      setEditingItem(null)
    } catch (err) { console.error(err) }
  }

  // Auto-save profile changes
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      onUpdateStallProfile?.({
        ...stall,
        stall_name: profName,
        desc: profDesc,
        hours: profHours,
        delivery_fee: parseFloat(profFee) || 0,
        rider: profRider,
        logo: profLogo
      })
    }, 500)
    return () => clearTimeout(timeoutId)
  }, [profName, profDesc, profHours, profFee, profRider, profLogo, stall, onUpdateStallProfile])

  // Stats computation
  const completedOrders = stallOrders.filter(o => o.status === 'Delivered')
  const totalRevenue = completedOrders.reduce((s, o) => s + o.total_price, 0)
  const pendingOrders = stallOrders.filter(o => o.status === 'Pending' || o.status === 'Accepted')
  const preparingOrders = stallOrders.filter(o => o.status === 'Preparing')
  const readyOrders = stallOrders.filter(o => o.status === 'Ready for Pickup' || o.status === 'Ready for Delivery' || o.status === 'Delivering')

  const formatItems = (items) => {
    if (Array.isArray(items)) return items.map(i => `${i.qty}x ${i.name || i.food_name || 'Item'}`).join(', ');
    return String(items || '');
  }

  // Filter orders by tab
  const filteredOrders = stallOrders.filter(o => {
    if (ordersFilter === 'new') return o.status === 'Pending' || o.status === 'Accepted'
    if (ordersFilter === 'preparing') return o.status === 'Preparing'
    if (ordersFilter === 'ready') return o.status === 'Ready for Pickup' || o.status === 'Ready for Delivery' || o.status === 'Delivering'
    if (ordersFilter === 'completed') return o.status === 'Delivered'
    return true
  })

  // Filter foods by category tab
  const filteredFoods = stallFoods.filter(f => {
    if (menuFilter === 'all') return true
    if (menuFilter === 'best') return f.price >= 140
    if (menuFilter === 'noodles') return f.food_name.toLowerCase().includes('noodle') || f.food_name.toLowerCase().includes('pancit')
    if (menuFilter === 'drinks') return f.category === 'Drinks'
    return true
  })

  // Sales chart coordinates mockup (Mockup #5)
  const mockChartPoints = "10,90 60,70 120,85 180,45 240,60 300,30 360,40"

  return (
    <div className="sd">
      {/* Top Header Section */}
      {(tab !== 'profile' && tab !== 'more') && (
      <div className="sd-header">
        <div className="sd-header-top">
          <div className="sd-greeting">
            <span className="sd-greeting-text">{greeting},</span>
            <h1 className="sd-greeting-name">{stall?.stall_name || 'Burger Hub'}! 👋</h1>
          </div>
          <button className="sd-bell-btn">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"></path>
              <path d="M13.73 21a2 2 0 0 1-3.46 0"></path>
            </svg>
            <span className="sd-bell-badge">3</span>
          </button>
        </div>

        {/* Floating Profile Card — absolutely positioned to extend below header */}
        <div className="sd-profile-card-wrapper">
          <div className="sd-profile-card">
            <div className="sd-pc-left">
              <div className="sd-pc-avatar">
                {(stall?.logo?.startsWith('http') || stall?.logo?.startsWith('data:')) ? (
                  <img src={stall.logo} alt="logo" style={{width: '100%', height: '100%', objectFit: 'cover', borderRadius: 'inherit'}} />
                ) : (
                  stall?.logo || '\uD83C\uDF54'
                )}
              </div>
              <div className="sd-pc-info">
                <h2 className="sd-pc-name">{stall?.stall_name || 'Burger Hub'}</h2>
                <span className="sd-pc-sub">Food Stall</span>
                <div className="sd-pc-status">
                  <span className="sd-pc-status-dot"></span>
                  <span>Open</span>
                </div>
              </div>
            </div>
            <button className="sd-pc-view" onClick={() => setTab('profile')}>View Profile &gt;</button>
          </div>
        </div>
      </div>
      )}

      <div className="sd-scroll-body" style={{ paddingTop: (tab === 'profile' || tab === 'more') ? 0 : undefined }}>

        {/* ── 1. DASHBOARD OVERVIEW ── */}
        {tab === 'dashboard' && (
          <div style={{padding: '0 0 20px'}}>

            {/* ── Revenue Hero Banner ── */}
            <div style={{
              margin: '24px 16px 0',
              background: 'linear-gradient(145deg, #EF5350 0%, #C62828 100%)',
              borderRadius: 24,
              padding: '24px 20px',
              position: 'relative',
              overflow: 'hidden',
              boxShadow: '0 16px 32px rgba(198,40,40,0.35), inset 0 2px 0 rgba(255,255,255,0.08), inset 0 -4px 0 rgba(0,0,0,0.4)',
              border: '1px solid rgba(255,255,255,0.05)'
            }}>
              <div style={{position:'absolute',top:-30,right:-30,width:140,height:140,borderRadius:'50%',background:'radial-gradient(circle, rgba(255,255,255,0.08) 0%, transparent 70%)'}}/>
              <div style={{position:'absolute',bottom:-40,left:-20,width:120,height:120,borderRadius:'50%',background:'radial-gradient(circle, rgba(255,255,255,0.05) 0%, transparent 70%)'}}/>
              <div style={{position:'absolute',top:0,left:0,right:0,height:'50%',background:'linear-gradient(180deg, rgba(255,255,255,0.03) 0%, transparent 100%)'}}/>
              
              <div style={{position:'relative',zIndex:1}}>
                <p style={{color:'rgba(255,255,255,0.55)',fontSize:11,fontWeight:700,margin:'0 0 4px',letterSpacing:1.2,textTransform:'uppercase', textShadow: '0 1px 2px rgba(0,0,0,0.5)'}}>Today's Revenue</p>
                <div style={{display:'flex',alignItems:'flex-end',gap:10,marginBottom:16}}>
                  <span style={{color:'white',fontSize:38,fontWeight:900,letterSpacing:-1, textShadow: '0 2px 10px rgba(0,0,0,0.3)'}}>₱{totalRevenue > 0 ? totalRevenue.toLocaleString() : '0'}</span>
                  {totalRevenue > 0 && (
                    <span style={{
                      background:'rgba(76,175,80,0.15)',color:'#A5D6A7',
                      fontSize:11,fontWeight:800,padding:'4px 10px',borderRadius:8,
                      border:'1px solid rgba(76,175,80,0.4)',marginBottom:8,
                      boxShadow: '0 2px 8px rgba(76,175,80,0.2), inset 0 1px 0 rgba(255,255,255,0.2)'
                    }}>+0% ↑</span>
                  )}
                </div>
                
                <div style={{display:'flex',gap:16, background: 'rgba(0,0,0,0.2)', padding: '12px 16px', borderRadius: 16, border: '1px solid rgba(255,255,255,0.04)', boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.2)'}}>
                  <div style={{flex: 1}}>
                    <p style={{color:'rgba(255,255,255,0.45)',fontSize:10,margin:'0 0 4px',fontWeight:700, textTransform: 'uppercase'}}>Orders</p>
                    <p style={{color:'white',fontSize:16,fontWeight:800,margin:0}}>{stallOrders.length}</p>
                  </div>
                  <div style={{width:1,background:'rgba(255,255,255,0.08)'}}/>
                  <div style={{flex: 1}}>
                    <p style={{color:'rgba(255,255,255,0.45)',fontSize:10,margin:'0 0 4px',fontWeight:700, textTransform: 'uppercase'}}>Pending</p>
                    <p style={{color:'#FFB74D',fontSize:16,fontWeight:800,margin:0}}>{pendingOrders.length}</p>
                  </div>
                  <div style={{width:1,background:'rgba(255,255,255,0.08)'}}/>
                  <div style={{flex: 1}}>
                    <p style={{color:'rgba(255,255,255,0.45)',fontSize:10,margin:'0 0 4px',fontWeight:700, textTransform: 'uppercase'}}>Preparing</p>
                    <p style={{color:'#64B5F6',fontSize:16,fontWeight:800,margin:0}}>{preparingOrders.length}</p>
                  </div>
                  <div style={{width:1,background:'rgba(255,255,255,0.08)'}}/>
                  <div style={{flex: 1}}>
                    <p style={{color:'rgba(255,255,255,0.45)',fontSize:10,margin:'0 0 4px',fontWeight:700, textTransform: 'uppercase'}}>Rating</p>
                    <p style={{color:'#FFD54F',fontSize:16,fontWeight:800,margin:0, textShadow: '0 2px 6px rgba(255,213,79,0.3)'}}>{stallOrders.length > 0 ? '5.0' : '0.0'} ⭐</p>
                  </div>
                </div>
              </div>
            </div>

            {/* ── Quick Actions ── */}
            <div style={{margin:'16px 16px 0',display:'grid',gridTemplateColumns:'1fr 1fr',gap:12}}>
              <button onClick={() => setTab('orders')} style={{
                background:'linear-gradient(145deg, #EF5350 0%, #C62828 100%)',
                border:'1px solid rgba(255,255,255,0.1)',borderRadius:16,padding:'12px 10px',
                display:'flex',alignItems:'center',gap:10,cursor:'pointer',
                boxShadow:'0 8px 20px rgba(198,40,40,0.35), inset 0 2px 0 rgba(255,255,255,0.3), inset 0 -3px 0 rgba(0,0,0,0.25)',
                transition:'all 0.2s', position: 'relative', overflow: 'hidden'
              }}>
                <div style={{position:'absolute',top:0,left:0,right:0,height:'40%',background:'linear-gradient(180deg, rgba(255,255,255,0.1) 0%, transparent 100%)'}}/>
                <div style={{width:32,height:32,borderRadius:10,background:'linear-gradient(135deg, rgba(255,255,255,0.3), rgba(255,255,255,0.1))',display:'flex',alignItems:'center',justifyContent:'center',flexShrink:0,boxShadow:'inset 0 1px 0 rgba(255,255,255,0.5), 0 4px 8px rgba(0,0,0,0.15)', position: 'relative', zIndex: 1}}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" style={{filter:'drop-shadow(0 2px 2px rgba(0,0,0,0.2))'}}><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/></svg>
                </div>
                <div style={{textAlign:'left', position: 'relative', zIndex: 1}}>
                  <p style={{color:'rgba(255,255,255,0.8)',fontSize:9,fontWeight:700,margin:'0 0 1px',textTransform:'uppercase',letterSpacing:0.5, textShadow:'0 1px 2px rgba(0,0,0,0.3)'}}>Manage</p>
                  <p style={{color:'white',fontSize:14,fontWeight:900,margin:0, textShadow:'0 1px 2px rgba(0,0,0,0.3)'}}>Orders</p>
                </div>
                {pendingOrders.length > 0 && (
                  <span style={{marginLeft:'auto',background:'white',color:'#C62828',fontSize:11,fontWeight:900,width:20,height:20,borderRadius:'50%',display:'flex',alignItems:'center',justifyContent:'center',flexShrink:0,boxShadow:'0 2px 8px rgba(0,0,0,0.2), inset 0 1px 0 rgba(255,255,255,1)', position: 'relative', zIndex: 1}}>{pendingOrders.length}</span>
                )}
              </button>

              <button onClick={() => setTab('menu')} style={{
                background:'linear-gradient(145deg, #EF5350 0%, #C62828 100%)',
                border:'1px solid rgba(255,255,255,0.1)',borderRadius:16,padding:'12px 10px',
                display:'flex',alignItems:'center',gap:10,cursor:'pointer',
                boxShadow:'0 8px 20px rgba(198,40,40,0.35), inset 0 2px 0 rgba(255,255,255,0.3), inset 0 -3px 0 rgba(0,0,0,0.25)',
                transition:'all 0.2s', position: 'relative', overflow: 'hidden'
              }}>
                <div style={{position:'absolute',top:0,left:0,right:0,height:'40%',background:'linear-gradient(180deg, rgba(255,255,255,0.1) 0%, transparent 100%)'}}/>
                <div style={{width:32,height:32,borderRadius:10,background:'linear-gradient(135deg, rgba(255,255,255,0.3), rgba(255,255,255,0.1))',display:'flex',alignItems:'center',justifyContent:'center',flexShrink:0,boxShadow:'inset 0 1px 0 rgba(255,255,255,0.5), 0 4px 8px rgba(0,0,0,0.15)', position: 'relative', zIndex: 1}}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" style={{filter:'drop-shadow(0 2px 2px rgba(0,0,0,0.2))'}}><path d="M12 2L2 7l10 5 10-5-10-5z"/><path d="M2 17l10 5 10-5"/><path d="M2 12l10 5 10-5"/></svg>
                </div>
                <div style={{textAlign:'left', position: 'relative', zIndex: 1}}>
                  <p style={{color:'rgba(255,255,255,0.8)',fontSize:9,fontWeight:700,margin:'0 0 1px',textTransform:'uppercase',letterSpacing:0.5, textShadow:'0 1px 2px rgba(0,0,0,0.3)'}}>Edit</p>
                  <p style={{color:'white',fontSize:14,fontWeight:900,margin:0, textShadow:'0 1px 2px rgba(0,0,0,0.3)'}}>Menu</p>
                </div>
              </button>

              <button onClick={() => setTab('sales')} style={{
                background:'linear-gradient(145deg, #EF5350 0%, #C62828 100%)',
                border:'1px solid rgba(255,255,255,0.1)',borderRadius:16,padding:'12px 10px',
                display:'flex',alignItems:'center',gap:10,cursor:'pointer',
                boxShadow:'0 8px 20px rgba(198,40,40,0.35), inset 0 2px 0 rgba(255,255,255,0.3), inset 0 -3px 0 rgba(0,0,0,0.25)',
                transition:'all 0.2s', position: 'relative', overflow: 'hidden'
              }}>
                <div style={{position:'absolute',top:0,left:0,right:0,height:'40%',background:'linear-gradient(180deg, rgba(255,255,255,0.1) 0%, transparent 100%)'}}/>
                <div style={{width:32,height:32,borderRadius:10,background:'linear-gradient(135deg, rgba(255,255,255,0.3), rgba(255,255,255,0.1))',display:'flex',alignItems:'center',justifyContent:'center',flexShrink:0,boxShadow:'inset 0 1px 0 rgba(255,255,255,0.5), 0 4px 8px rgba(0,0,0,0.15)', position: 'relative', zIndex: 1}}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" style={{filter:'drop-shadow(0 2px 2px rgba(0,0,0,0.2))'}}><polyline points="22 7 13.5 15.5 8.5 10.5 2 17"/><polyline points="16 7 22 7 22 13"/></svg>
                </div>
                <div style={{textAlign:'left', position: 'relative', zIndex: 1}}>
                  <p style={{color:'rgba(255,255,255,0.8)',fontSize:9,fontWeight:700,margin:'0 0 1px',textTransform:'uppercase',letterSpacing:0.5, textShadow:'0 1px 2px rgba(0,0,0,0.3)'}}>View</p>
                  <p style={{color:'white',fontSize:14,fontWeight:900,margin:0, textShadow:'0 1px 2px rgba(0,0,0,0.3)'}}>Sales</p>
                </div>
              </button>

              <button onClick={() => setTab('more')} style={{
                background:'linear-gradient(145deg, #EF5350 0%, #C62828 100%)',
                border:'1px solid rgba(255,255,255,0.1)',borderRadius:16,padding:'12px 10px',
                display:'flex',alignItems:'center',gap:10,cursor:'pointer',
                boxShadow:'0 8px 20px rgba(198,40,40,0.35), inset 0 2px 0 rgba(255,255,255,0.3), inset 0 -3px 0 rgba(0,0,0,0.25)',
                transition:'all 0.2s', position: 'relative', overflow: 'hidden'
              }}>
                <div style={{position:'absolute',top:0,left:0,right:0,height:'40%',background:'linear-gradient(180deg, rgba(255,255,255,0.1) 0%, transparent 100%)'}}/>
                <div style={{width:32,height:32,borderRadius:10,background:'linear-gradient(135deg, rgba(255,255,255,0.3), rgba(255,255,255,0.1))',display:'flex',alignItems:'center',justifyContent:'center',flexShrink:0,boxShadow:'inset 0 1px 0 rgba(255,255,255,0.5), 0 4px 8px rgba(0,0,0,0.15)', position: 'relative', zIndex: 1}}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" style={{filter:'drop-shadow(0 2px 2px rgba(0,0,0,0.2))'}}><circle cx="12" cy="12" r="3"/><path d="M19.07 4.93a10 10 0 0 1 1.63 13.28A10 10 0 0 1 2 12 10 10 0 0 1 19.07 4.93z"/></svg>
                </div>
                <div style={{textAlign:'left', position: 'relative', zIndex: 1}}>
                  <p style={{color:'rgba(255,255,255,0.8)',fontSize:9,fontWeight:700,margin:'0 0 1px',textTransform:'uppercase',letterSpacing:0.5, textShadow:'0 1px 2px rgba(0,0,0,0.3)'}}>Edit</p>
                  <p style={{color:'white',fontSize:14,fontWeight:900,margin:0, textShadow:'0 1px 2px rgba(0,0,0,0.3)'}}>Profile</p>
                </div>
              </button>
            </div>

            {/* ── Live Orders Section ── */}
            <div style={{margin:'20px 16px 0'}}>
              <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:12}}>
                <div style={{display:'flex',alignItems:'center',gap:8}}>
                  <div style={{width:8,height:8,borderRadius:'50%',background:'#E53935',animation:'pulse-red 2s infinite'}}/>
                  <h3 style={{fontSize:16,fontWeight:800,color:'#111',margin:0,letterSpacing:-0.3}}>Live Orders</h3>
                </div>
                <button className="sd-link-btn" onClick={() => setTab('orders')}>See all →</button>
              </div>

              {stallOrders.filter(o => o.status !== 'Delivered' && o.status !== 'Cancelled').length === 0 ? (
                <div style={{
                  background:'white',borderRadius:20,padding:'28px 20px',
                  textAlign:'center',boxShadow:'0 2px 10px rgba(0,0,0,0.05)',
                  border:'1px solid rgba(0,0,0,0.04)'
                }}>
                  <div style={{fontSize:36,marginBottom:8}}>🎉</div>
                  <p style={{color:'#111',fontWeight:800,fontSize:15,margin:'0 0 4px'}}>All caught up!</p>
                  <p style={{color:'#999',fontSize:13,fontWeight:500,margin:0}}>No active orders right now.</p>
                </div>
              ) : (
                stallOrders.filter(o => o.status !== 'Delivered' && o.status !== 'Cancelled').slice(0,3).map(o => {
                  const statusColor = ['Pending','Accepted'].includes(o.status) ? '#E53935' : o.status === 'Preparing' ? '#F57C00' : '#2E7D32'
                  const statusBg = ['Pending','Accepted'].includes(o.status) ? '#FFF0F0' : o.status === 'Preparing' ? '#FFF8E1' : '#E8F5E9'
                  return (
                    <div key={o.id} onClick={() => setSelectedOrderDetails({id:o.id,status:o.status,time:o.time,total_price:o.total_price,items:o.items,customer_id:o.customer_id,payment_method:o.payment_method,notes:o.notes})} style={{
                      background:'white',borderRadius:18,padding:'14px 16px',marginBottom:8,
                      boxShadow:'0 2px 10px rgba(0,0,0,0.05)',border:'1px solid rgba(0,0,0,0.04)',
                      display:'flex',alignItems:'center',gap:12,cursor:'pointer'
                    }}>
                      <div style={{
                        width:42,height:42,borderRadius:14,flexShrink:0,
                        background:'linear-gradient(135deg,#FFF0F0,#FFE8E8)',
                        display:'flex',alignItems:'center',justifyContent:'center',
                        border:'1px solid rgba(229,57,53,0.1)'
                      }}>
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#E53935" strokeWidth="2.5"><path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"/><line x1="3" y1="6" x2="21" y2="6"/></svg>
                      </div>
                      <div style={{flex:1,minWidth:0}}>
                        <div style={{display:'flex',alignItems:'center',gap:6,marginBottom:2}}>
                          <span style={{fontSize:13,fontWeight:800,color:'#111'}}>#{o.id}</span>
                          <span style={{background:statusBg,color:statusColor,fontSize:9,fontWeight:800,padding:'2px 7px',borderRadius:6,textTransform:'uppercase',letterSpacing:0.3}}>{o.status}</span>
                        </div>
                        <p style={{color:'#888',fontSize:11,fontWeight:600,margin:0,whiteSpace:'nowrap',overflow:'hidden',textOverflow:'ellipsis'}}>{formatItems(o.items)}</p>
                      </div>
                      <span style={{color:'#E53935',fontWeight:900,fontSize:14,flexShrink:0}}>₱{o.total_price}</span>
                    </div>
                  )
                })
              )}
            </div>
          </div>
        )}

        {/* ── 2. ORDERS TAB ── */}
        {tab === 'orders' && (
          <div className="sd-tab-content" style={{marginTop: 24}}>
            <div className="sd-section-header">
              <h3 className="sd-section-title">Manage Orders</h3>
            </div>

            <div className="sd-filter-pills">
              <button className={`sd-pill ${ordersFilter === 'new' ? 'active' : ''}`} onClick={() => setOrdersFilter('new')}>New ({pendingOrders.length})</button>
              <button className={`sd-pill ${ordersFilter === 'preparing' ? 'active' : ''}`} onClick={() => setOrdersFilter('preparing')}>Preparing ({preparingOrders.length})</button>
              <button className={`sd-pill ${ordersFilter === 'ready' ? 'active' : ''}`} onClick={() => setOrdersFilter('ready')}>Ready ({readyOrders.length})</button>
              <button className={`sd-pill ${ordersFilter === 'completed' ? 'active' : ''}`} onClick={() => setOrdersFilter('completed')}>Completed ({completedOrders.length})</button>
            </div>

            <div className="sd-list-column">
              {filteredOrders.length === 0 ? (
                <div style={{textAlign: 'center', color: '#999', padding: '20px'}}>No orders here.</div>
              ) : filteredOrders.map(o => {
                const customer = customers.find(c => c.id === o.customer_id)
                const cName = customer?.fullname || 'Guest User'
                const cAddress = customer?.address || 'Pickup'
                const st = (o.status || '').toLowerCase()
                const statusClass = ['pending', 'accepted'].includes(st) ? 'new' : 
                                    st === 'preparing' ? 'preparing' : 
                                    ['ready for pickup', 'ready for delivery', 'delivering'].includes(st) ? 'ready' : 'completed';
                return (
                <div key={o.id} className="sd-order-card" onClick={() => { setSelectedOrderDetails({ id: o.id, status: o.status, time: o.time, total_price: o.total_price, items: o.items, customer_id: o.customer_id, payment_method: o.payment_method, notes: o.notes }); }}>
                  
                  <div className="sd-oc-header">
                    <div className="sd-oc-left-icon-container">
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#E53935" strokeWidth="2.5"><path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"></path><line x1="3" y1="6" x2="21" y2="6"></line></svg>
                    </div>
                    <div style={{flex: 1}}>
                      <div className="sd-oc-top-row">
                        <span className="sd-oc-id">#{o.id}</span>
                        <span className={`sd-oc-badge ${statusClass}`}>{o.status}</span>
                        <span className="sd-oc-time">{o.time}</span>
                      </div>
                      <span className="sd-oc-items-price">{formatItems(o.items)} • ₱{o.total_price}</span>
                    </div>
                  </div>

                  <div className="sd-oc-details">
                    <div className="sd-oc-detail-row">
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#666" strokeWidth="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>
                      <span>{cName}</span>
                    </div>
                    <div className="sd-oc-detail-row">
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#666" strokeWidth="2"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path><circle cx="12" cy="10" r="3"></circle></svg>
                      <span>{cAddress}</span>
                    </div>
                  </div>

                  <div className="sd-oc-actions">
                    {['Pending', 'Accepted'].includes(o.status) ? (
                      <>
                        <button className="sd-btn-accept" onClick={(e) => { e.stopPropagation(); handleUpdateStatus(o.id, 'Preparing') }}>Accept & Prep</button>
                        <button className="sd-btn-reject" onClick={(e) => { e.stopPropagation(); handleReject(o.id) }}>Reject</button>
                      </>
                    ) : o.status === 'Preparing' ? (
                      <button className="sd-btn-ready" onClick={(e) => { e.stopPropagation(); handleUpdateStatus(o.id, 'Ready for Delivery') }}>Mark Ready</button>
                    ) : o.status === 'Ready for Delivery' || o.status === 'Ready for Pickup' ? (
                      <button className="sd-btn-update" onClick={(e) => { e.stopPropagation(); handleUpdateStatus(o.id, 'Delivering') }}>Out for Delivery</button>
                    ) : o.status === 'Delivering' ? (
                      <button className="sd-btn-update" onClick={(e) => { e.stopPropagation(); handleUpdateStatus(o.id, 'Delivered') }}>Complete</button>
                    ) : null}
                  </div>
                </div>
                )
              })}
            </div>
          </div>
        )}

        {/* ── 3. MENU TAB ── */}
        {tab === 'menu' && (
          <div className="sd-tab-content" style={{marginTop: 24}}>
            <div className="sd-section-header">
              <h3 className="sd-section-title">Manage Menu</h3>
              <button className="sd-link-btn" style={{fontWeight: 'bold', color: '#E8001C'}} onClick={() => setShowAddModal(true)}>+ Add Item</button>
            </div>

            <div className="sd-filter-pills">
              <button className={`sd-pill ${menuFilter === 'all' ? 'active' : ''}`} onClick={() => setMenuFilter('all')}>All</button>
              <button className={`sd-pill ${menuFilter === 'best' ? 'active' : ''}`} onClick={() => setMenuFilter('best')}>Best Sellers</button>
              <button className={`sd-pill ${menuFilter === 'noodles' ? 'active' : ''}`} onClick={() => setMenuFilter('noodles')}>Noodles/Pancit</button>
              <button className={`sd-pill ${menuFilter === 'drinks' ? 'active' : ''}`} onClick={() => setMenuFilter('drinks')}>Drinks</button>
            </div>

            <div className="sd-menu-list">
              {filteredFoods.map(item => (
                <div key={item.id} className="sd-menu-row">
                  <div className="sd-mr-img">
                    {item.image && (item.image.startsWith('data:') || item.image.startsWith('http')) ? (
                      <img src={item.image} alt={item.food_name} style={{width: '100%', height: '100%', objectFit: 'cover', borderRadius: 'inherit'}} />
                    ) : (
                      item.image || '🍔'
                    )}
                  </div>
                  <div className="sd-mr-info">
                    <span className="sd-mr-name">{item.food_name}</span>
                    <span className="sd-mr-desc">{item.description}</span>
                    <div style={{display: 'flex', alignItems: 'center', gap: 8, marginTop: 4}}>
                      <span className="sd-mr-price">₱{item.price}</span>
                      <span className="sd-mr-avail" style={{ opacity: item.available !== false ? 1 : 0.5, filter: item.available !== false ? 'none' : 'grayscale(1)' }}>
                        {item.available !== false ? 'Available' : 'Sold Out'}
                      </span>
                    </div>
                  </div>
                  <div className="sd-mr-actions">
                    <button className="sd-mr-edit" onClick={() => { setEditingItem(item); setShowEditModal(true); }}>
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#E53935" strokeWidth="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path></svg>
                    </button>
                    <button className="sd-mr-delete" onClick={() => handleDeleteMenu(item.id)} style={{background: 'none', border: 'none', cursor: 'pointer', padding: 4}}>
                       <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#E53935" strokeWidth="2"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path><line x1="10" y1="11" x2="10" y2="17"></line><line x1="14" y1="11" x2="14" y2="17"></line></svg>
                    </button>
                    <label className="sd-switch">
                      <input type="checkbox" checked={item.available !== false} onChange={() => handleToggleAvail(item.id)} />
                      <span className="sd-slider" />
                    </label>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ── 4. SALES TAB ── */}
        {tab === 'sales' && (
          <div className="sd-tab-content" style={{marginTop: 24}}>
            <div className="sd-section-header">
              <h3 className="sd-section-title">Sales & Analytics</h3>
              <span className="sd-link-btn" style={{color: '#666', fontWeight: 500}}>This Week</span>
            </div>

            <div className="sd-og-box og-green" style={{width: '100%', marginBottom: 24}}>
              <div className="sd-og-top">
                <span className="sd-og-label">Total Revenue</span>
              </div>
              <div className="sd-og-mid">
                <span className="sd-og-val">₱{totalRevenue || '0'}</span>
                <div className="sd-og-icon-green">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#2E7D32" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="22 7 13.5 15.5 8.5 10.5 2 17"></polyline><polyline points="16 7 22 7 22 13"></polyline></svg>
                </div>
              </div>
              <div className="sd-og-bot">
                {totalRevenue > 0 && <><span className="sd-og-trend pos">+0%</span> <span className="sd-og-trend-text">vs last week</span></>}
              </div>
            </div>

            <h4 style={{fontSize: 16, marginBottom: 16}}>Sales Chart</h4>
            <div style={{width: '100%', height: 200, background: 'white', borderRadius: 16, padding: 20, boxShadow: '0 4px 12px rgba(0,0,0,0.03)'}}>
               <svg viewBox="0 0 400 100" style={{width: '100%', height: '100%'}}>
                  <polyline points={mockChartPoints} fill="none" stroke="#2E7D32" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
                  {mockChartPoints.split(' ').map((pt, i) => {
                     const [x, y] = pt.split(',')
                     return <circle key={i} cx={x} cy={y} r="4" fill="#2E7D32" />
                  })}
               </svg>
            </div>
          </div>
        )}

        {(tab === 'profile' || tab === 'more') && (
          <div style={{padding: '0 0 100px'}}>

            {/* ── Hero Banner ── */}
            <div style={{
              background: 'linear-gradient(145deg, #B71C1C 0%, #D32F2F 50%, #E53935 100%)',
              padding: '52px 20px 70px',
              position: 'relative',
              overflow: 'hidden'
            }}>
              {/* Decorative circles */}
              <div style={{position:'absolute',top:-40,right:-30,width:120,height:120,borderRadius:'50%',background:'rgba(255,255,255,0.07)'}}/>
              <div style={{position:'absolute',bottom:-20,left:-20,width:90,height:90,borderRadius:'50%',background:'rgba(255,255,255,0.05)'}}/>
              <div style={{position:'relative',zIndex:1}}>
                <p style={{color:'rgba(255,255,255,0.75)',fontSize:12,fontWeight:600,margin:'0 0 4px',letterSpacing:1,textTransform:'uppercase'}}>Settings</p>
                <h2 style={{color:'white',fontSize:22,fontWeight:900,margin:0,letterSpacing:-0.5}}>Store Profile</h2>
                <p style={{color:'rgba(255,255,255,0.65)',fontSize:13,fontWeight:500,margin:'6px 0 0'}}>Manage your stall information</p>
              </div>
            </div>

            {/* ── Logo Card ── */}
            <div style={{margin:'-44px 16px 0',position:'relative',zIndex:10}}>
              <div style={{
                background:'white',
                borderRadius:24,
                padding:'20px',
                boxShadow:'0 12px 40px rgba(0,0,0,0.13)',
                display:'flex',
                alignItems:'center',
                gap:16
              }}>
                {/* Avatar */}
                <div
                  onClick={() => logoInputRef.current?.click()}
                  style={{
                    width:80, height:80, borderRadius:22,
                    border:'3px solid rgba(229,57,53,0.25)',
                    background:'linear-gradient(135deg,#FFF5F5,#FFE8E8)',
                    display:'flex', alignItems:'center', justifyContent:'center',
                    overflow:'hidden', flexShrink:0, cursor:'pointer',
                    position:'relative', boxShadow:'0 6px 20px rgba(229,57,53,0.2)'
                  }}
                >
                  {profLogo ? (
                    <img src={profLogo} alt="logo" style={{width:'100%',height:'100%',objectFit:'cover'}} />
                  ) : (
                    <span style={{fontSize:36}}>{stall?.logo || '🍔'}</span>
                  )}
                  {/* Camera overlay */}
                  <div style={{
                    position:'absolute',bottom:0,right:0,
                    width:24,height:24,borderRadius:'50%',
                    background:'#E53935',
                    display:'flex',alignItems:'center',justifyContent:'center',
                    border:'2px solid white'
                  }}>
                    <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5"><path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/><circle cx="12" cy="13" r="4"/></svg>
                  </div>
                </div>
                <div style={{flex:1,minWidth:0}}>
                  <h3 style={{margin:'0 0 3px',fontSize:18,fontWeight:900,color:'#111',letterSpacing:-0.5}}>{profName || stall?.stall_name || 'My Stall'}</h3>
                  <p style={{margin:'0 0 8px',fontSize:12,color:'#888',fontWeight:500}}>{profDesc || stall?.desc || 'Food Stall'}</p>
                  <div style={{display:'flex',gap:6}}>
                    <span style={{background:'rgba(229,57,53,0.08)',color:'#E53935',fontSize:10,fontWeight:800,padding:'3px 8px',borderRadius:6,border:'1px solid rgba(229,57,53,0.15)'}}>
                      OPEN
                    </span>
                    <span style={{background:'#F4F5F7',color:'#555',fontSize:10,fontWeight:700,padding:'3px 8px',borderRadius:6}}>
                      ₱{profFee} delivery
                    </span>
                  </div>
                </div>
                <input ref={logoInputRef} type="file" accept="image/*" style={{display:'none'}} onChange={handleLogoUpload} />
              </div>
            </div>

            {/* ── Form Fields ── */}
            <div style={{padding:'20px 16px 0',display:'flex',flexDirection:'column',gap:12}}>

              {/* Store Name */}
              <div style={{background:'white',borderRadius:18,padding:'4px 16px 4px',boxShadow:'0 2px 10px rgba(0,0,0,0.05)',border:'1px solid rgba(0,0,0,0.04)'}}>
                <label style={{fontSize:10,fontWeight:800,color:'#E53935',letterSpacing:1,textTransform:'uppercase',display:'block',paddingTop:12}}>Store Name</label>
                <input
                  type="text"
                  value={profName}
                  onChange={e => setProfName(e.target.value)}
                  placeholder="Enter store name"
                  style={{width:'100%',border:'none',outline:'none',fontSize:15,fontWeight:700,color:'#111',padding:'6px 0 12px',background:'transparent',fontFamily:'Inter,sans-serif'}}
                />
              </div>

              {/* Description */}
              <div style={{background:'white',borderRadius:18,padding:'4px 16px 4px',boxShadow:'0 2px 10px rgba(0,0,0,0.05)',border:'1px solid rgba(0,0,0,0.04)'}}>
                <label style={{fontSize:10,fontWeight:800,color:'#E53935',letterSpacing:1,textTransform:'uppercase',display:'block',paddingTop:12}}>Description</label>
                <input
                  type="text"
                  value={profDesc}
                  onChange={e => setProfDesc(e.target.value)}
                  placeholder="e.g. Burgers • Fast Food • Sides"
                  style={{width:'100%',border:'none',outline:'none',fontSize:14,fontWeight:600,color:'#333',padding:'6px 0 12px',background:'transparent',fontFamily:'Inter,sans-serif'}}
                />
              </div>

              {/* Operating Hours */}
              <div style={{background:'white',borderRadius:18,padding:'4px 16px 4px',boxShadow:'0 2px 10px rgba(0,0,0,0.05)',border:'1px solid rgba(0,0,0,0.04)'}}>
                <label style={{fontSize:10,fontWeight:800,color:'#E53935',letterSpacing:1,textTransform:'uppercase',display:'block',paddingTop:12}}>
                  🕐 Operating Hours
                </label>
                <input
                  type="text"
                  value={profHours}
                  onChange={e => setProfHours(e.target.value)}
                  placeholder="e.g. 8:00 AM – 10:00 PM"
                  style={{width:'100%',border:'none',outline:'none',fontSize:14,fontWeight:600,color:'#333',padding:'6px 0 12px',background:'transparent',fontFamily:'Inter,sans-serif'}}
                />
              </div>

              {/* Delivery Fee */}
              <div style={{background:'white',borderRadius:18,padding:'4px 16px 4px',boxShadow:'0 2px 10px rgba(0,0,0,0.05)',border:'1px solid rgba(0,0,0,0.04)'}}>
                <label style={{fontSize:10,fontWeight:800,color:'#E53935',letterSpacing:1,textTransform:'uppercase',display:'block',paddingTop:12}}>
                  🛵 Delivery Fee (₱)
                </label>
                <input
                  type="number"
                  value={profFee}
                  onChange={e => setProfFee(e.target.value)}
                  placeholder="15"
                  style={{width:'100%',border:'none',outline:'none',fontSize:15,fontWeight:700,color:'#111',padding:'6px 0 12px',background:'transparent',fontFamily:'Inter,sans-serif'}}
                />
              </div>

              {/* Auto-save indicator */}
              <div style={{
                display:'flex',alignItems:'center',justifyContent:'center',gap:6,
                background:'rgba(0,176,80,0.07)',borderRadius:12,padding:'10px',
                border:'1px solid rgba(0,176,80,0.15)'
              }}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#00B050" strokeWidth="2.5"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>
                <span style={{fontSize:12,fontWeight:700,color:'#00B050'}}>All changes are auto-saved</span>
              </div>

              {/* Divider */}
              <div style={{height:1,background:'#F0F1F3',margin:'4px 0'}}/>

              {/* Logout */}
              <button
                onClick={onLogout}
                style={{
                  width:'100%',padding:'15px',
                  borderRadius:16,
                  background:'linear-gradient(135deg,#FFF5F5,#FFE8E8)',
                  color:'#C62828',
                  fontWeight:800,fontSize:14,
                  border:'1.5px solid rgba(229,57,53,0.2)',
                  cursor:'pointer',
                  display:'flex',alignItems:'center',justifyContent:'center',gap:8,
                  fontFamily:'Inter,sans-serif',
                  boxShadow:'0 2px 8px rgba(229,57,53,0.1)',
                  transition:'all 0.2s'
                }}
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>
                Log Out
              </button>
            </div>
          </div>
        )}
      </div>

      {selectedOrderDetails && (() => {
        const c = customers.find(x => x.id === selectedOrderDetails.customer_id);
        const cName = c?.fullname || 'Guest User';
        const cPhone = c?.phone || 'No phone provided';
        const cAddress = c?.address || 'Pickup';
        const dFee = stall?.delivery_fee || 0;
        const total = selectedOrderDetails.total_price + dFee;
        
        return (
        <div className="sd-modal-overlay" onClick={() => setSelectedOrderDetails(null)}>
          <div className="sd-bs-modal" onClick={e => e.stopPropagation()}>
            <div className="sd-bs-handle"></div>
            
            <div className="sd-bs-header">
              <span className="sd-bs-title">Order Details</span>
              <button className="sd-bs-close" onClick={() => setSelectedOrderDetails(null)}>×</button>
            </div>
            
            <div className="sd-bs-content">
              {/* Order Header Block */}
              <div className="sd-bs-order-head">
                <div className="sd-bs-icon-box">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#E53935" strokeWidth="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line><polyline points="10 9 9 9 8 9"></polyline></svg>
                </div>
                <div style={{flex: 1}}>
                  <div className="sd-bs-id-row">
                    <span className="sd-bs-id">#{selectedOrderDetails.id}</span>
                    <span className={`sd-oc-badge ${['Pending','Accepted'].includes(selectedOrderDetails.status) ? 'new' : selectedOrderDetails.status === 'Preparing' ? 'preparing' : ['Ready for Pickup','Ready for Delivery','Delivering'].includes(selectedOrderDetails.status) ? 'ready' : 'completed'}`}>{selectedOrderDetails.status}</span>
                    <span className="sd-bs-time" style={{marginLeft: 'auto'}}>{selectedOrderDetails.time}</span>
                  </div>
                  <span className="sd-bs-items" style={{color: '#777', fontSize: 13, fontWeight: 600, display: 'block', marginTop: 4}}>{formatItems(selectedOrderDetails.items)}</span>
                </div>
              </div>

              {/* Customer Details */}
              <div className="sd-bs-details-list">
                <div className="sd-bs-detail-item">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#666" strokeWidth="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>
                  <span>{cName}</span>
                </div>
                <div className="sd-bs-detail-item">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#666" strokeWidth="2"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path></svg>
                  <span>{cPhone}</span>
                </div>
                <div className="sd-bs-detail-item">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#666" strokeWidth="2"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path><circle cx="12" cy="10" r="3"></circle></svg>
                  <span>{cAddress}</span>
                </div>
                <div className="sd-bs-detail-item mt-2">
                  <span style={{fontSize: 12, color: '#999', display: 'block', width: '100%', marginLeft: 26}}>Payment Method</span>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#666" strokeWidth="2" style={{marginTop: 4}}><rect x="2" y="6" width="20" height="12" rx="2"></rect><circle cx="12" cy="12" r="2"></circle><path d="M6 12h.01M18 12h.01"></path></svg>
                  <span style={{marginTop: 4}}>{selectedOrderDetails.payment_method || 'Cash on Delivery'}</span>
                </div>
                {selectedOrderDetails.notes && (
                  <div className="sd-bs-detail-item mt-2">
                    <span style={{fontSize: 12, color: '#999', display: 'block', width: '100%', marginLeft: 26}}>Order Notes</span>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#666" strokeWidth="2" style={{marginTop: 4}}><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path></svg>
                    <span style={{marginTop: 4, fontStyle: 'italic'}}>{selectedOrderDetails.notes}</span>
                  </div>
                )}
              </div>

              {/* Order Items List */}
              <div className="sd-bs-items-section">
                <h4 className="sd-bs-section-title">Order Items</h4>
                {formatItems(selectedOrderDetails.items).split(', ').map((itemStr, idx) => {
                  const match = itemStr.match(/^(\d+x)\s+(.*)$/)
                  const qty = match ? match[1] : ''
                  const name = match ? match[2] : itemStr
                  return (
                    <div key={idx} className="sd-bs-item-row">
                      <span className="sd-bs-item-qty">{qty}</span>
                      <span className="sd-bs-item-name">{name}</span>
                    </div>
                  )
                })}
              </div>

              {/* Order Summary Block */}
              <div className="sd-bs-summary-section">
                <h4 className="sd-bs-section-title">Order Summary</h4>
                <div className="sd-bs-summary-row">
                  <span>Subtotal</span>
                  <span>₱{selectedOrderDetails.total_price}</span>
                </div>
                <div className="sd-bs-summary-row">
                  <span>Delivery Fee</span>
                  <span>₱{dFee}</span>
                </div>
                <div className="sd-bs-summary-row total">
                  <span>Total</span>
                  <span className="red-total">₱{total}</span>
                </div>
              </div>
              
              {/* Actions */}
              <div className="sd-bs-actions">
                {['Pending', 'Accepted'].includes(selectedOrderDetails.status) ? (
                  <>
                    <button className="sd-btn-accept-huge" onClick={() => { handleUpdateStatus(selectedOrderDetails.id, 'Preparing'); setSelectedOrderDetails(null) }}>Accept Order</button>
                    <button className="sd-btn-reject-huge" onClick={() => { handleReject(selectedOrderDetails.id); setSelectedOrderDetails(null) }}>Reject Order</button>
                  </>
                ) : selectedOrderDetails.status === 'Preparing' ? (
                  <button className="sd-btn-accept-huge" style={{background: 'linear-gradient(135deg, #43A047, #2E7D32)', boxShadow: '0 6px 18px rgba(67,160,71,0.35)'}} onClick={() => { handleUpdateStatus(selectedOrderDetails.id, 'Ready for Delivery'); setSelectedOrderDetails(null) }}>Mark as Ready</button>
                ) : selectedOrderDetails.status === 'Ready for Delivery' || selectedOrderDetails.status === 'Ready for Pickup' ? (
                  <button className="sd-btn-accept-huge" style={{background: 'linear-gradient(135deg, #FB8C00, #E65100)', boxShadow: '0 6px 18px rgba(251,140,0,0.35)'}} onClick={() => { handleUpdateStatus(selectedOrderDetails.id, 'Delivering'); setSelectedOrderDetails(null) }}>Out for Delivery</button>
                ) : selectedOrderDetails.status === 'Delivering' ? (
                  <button className="sd-btn-accept-huge" style={{background: 'linear-gradient(135deg, #1E88E5, #1565C0)', boxShadow: '0 6px 18px rgba(30,136,229,0.35)'}} onClick={() => { handleUpdateStatus(selectedOrderDetails.id, 'Delivered'); setSelectedOrderDetails(null) }}>Mark Completed</button>
                ) : null}
              </div>

            </div>
          </div>
        </div>
        )
      })()}

      {/* Bottom Navigation */}
      <div className="sd-nav">
        {STALL_TABS.map(t => (
          <button
            key={t.id}
            className={`sd-nav-btn ${tab === t.id ? 'active' : ''}`}
            onClick={() => setTab(t.id)}
          >
            <div className="sd-nav-icon">
               {t.icon}
               {t.id === 'orders' && pendingOrders.length > 0 && <span className="sd-nav-badge">{pendingOrders.length}</span>}
            </div>
            <span className="sd-nav-label">{t.label}</span>
          </button>
        ))}
      </div>

      {/* ── ADD ITEM MODAL ── */}
      {showAddModal && (
        <div className="sd-modal-overlay" onClick={() => setShowAddModal(false)}>
          <div className="sd-bs-modal" onClick={e => e.stopPropagation()} style={{padding: 24, paddingBottom: 40, borderTopLeftRadius: 28, borderTopRightRadius: 28}}>
            <div className="sd-bs-handle"></div>
            <div className="sd-bs-header" style={{paddingLeft: 0, paddingRight: 0}}>
              <h3 className="sd-bs-title">Add Menu Item</h3>
              <button className="sd-bs-close" onClick={() => setShowAddModal(false)}>×</button>
            </div>
            <form onSubmit={handleAddItem} style={{display: 'flex', flexDirection: 'column', gap: 12, marginTop: 16}}>
              <input placeholder="Food Name" required value={newName} onChange={e => setNewName(e.target.value)} style={{padding: 12, borderRadius: 12, border: '1px solid #E5E7EB', fontSize: 14}} />
              <input placeholder="Price (₱)" type="number" required value={newPrice} onChange={e => setNewPrice(e.target.value)} style={{padding: 12, borderRadius: 12, border: '1px solid #E5E7EB', fontSize: 14}} />
              <input placeholder="Description" value={newDesc} onChange={e => setNewDesc(e.target.value)} style={{padding: 12, borderRadius: 12, border: '1px solid #E5E7EB', fontSize: 14}} />
              <input 
                list="category-options"
                placeholder="Category (e.g. Burgers, Rice Meals)"
                required
                value={newCat} 
                onChange={e => setNewCat(e.target.value)} 
                style={{padding: 12, borderRadius: 12, border: '1px solid #E5E7EB', fontSize: 14, background: 'white', width: '100%', boxSizing: 'border-box'}}
              />
              <datalist id="category-options">
                <option value="Burgers" />
                <option value="Fries" />
                <option value="Drinks" />
                <option value="Noodles" />
                <option value="Rice Meals" />
              </datalist>
              <div style={{display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 14px', borderRadius: 12, border: '1px solid #E5E7EB', background: 'white'}}>
                <span style={{fontSize: 14, fontWeight: 600, color: '#374151'}}>Item Available</span>
                <label style={{position: 'relative', display: 'inline-block', width: 44, height: 24}}>
                  <input type="checkbox" checked={newAvailable} onChange={e => setNewAvailable(e.target.checked)} style={{opacity: 0, width: 0, height: 0}} />
                  <span style={{position: 'absolute', cursor: 'pointer', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: newAvailable ? '#22C55E' : '#E5E7EB', transition: '.3s', borderRadius: 24}}>
                    <span style={{position: 'absolute', content: '""', height: 18, width: 18, left: newAvailable ? 22 : 3, bottom: 3, backgroundColor: 'white', transition: '.3s', borderRadius: '50%', boxShadow: '0 2px 4px rgba(0,0,0,0.2)'}}></span>
                  </span>
                </label>
              </div>
              <div style={{display: 'flex', alignItems: 'center', gap: 12, marginTop: 4}}>
                <div style={{
                  width: 60, height: 60, borderRadius: 12, border: '1px solid #E5E7EB',
                  background: '#F9FAFB', display: 'flex', alignItems: 'center', justifyContent: 'center',
                  overflow: 'hidden', flexShrink: 0
                }}>
                  {newEmoji && (newEmoji.startsWith('data:') || newEmoji.startsWith('http')) ? (
                    <img src={newEmoji} alt="preview" style={{width: '100%', height: '100%', objectFit: 'cover'}} />
                  ) : newEmoji ? (
                    <span style={{fontSize: 28}}>{newEmoji}</span>
                  ) : (
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#CCC" strokeWidth="1.5"><rect x="3" y="3" width="18" height="18" rx="3"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg>
                  )}
                </div>
                <div style={{flex: 1}}>
                  <button
                    type="button"
                    onClick={() => addImageInputRef.current?.click()}
                    style={{
                      padding: '10px 14px', borderRadius: 10, border: '1.5px solid #E8001C',
                      background: 'white', color: '#E8001C', fontWeight: 700, fontSize: 13, cursor: 'pointer',
                      display: 'flex', alignItems: 'center', gap: 6, justifyContent: 'center', width: '100%'
                    }}
                  >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg>
                    Upload Photo
                  </button>
                  <input ref={addImageInputRef} type="file" accept="image/*" style={{display: 'none'}} onChange={handleAddImageUpload} />
                </div>
              </div>
              <button type="submit" className="sd-save-btn" style={{marginTop: 12}}>Save Item</button>
            </form>
          </div>
        </div>
      )}

      {/* ── EDIT ITEM MODAL ── */}
      {showEditModal && editingItem && (
        <div className="sd-modal-overlay" onClick={() => setShowEditModal(false)}>
          <div className="sd-bs-modal" onClick={e => e.stopPropagation()} style={{padding: 24, paddingBottom: 40, borderTopLeftRadius: 28, borderTopRightRadius: 28}}>
            <div className="sd-bs-handle"></div>
            <div className="sd-bs-header" style={{paddingLeft: 0, paddingRight: 0}}>
              <h3 className="sd-bs-title">Edit Menu Item</h3>
              <button className="sd-bs-close" onClick={() => setShowEditModal(false)}>×</button>
            </div>
            <form onSubmit={handleEditItem} style={{display: 'flex', flexDirection: 'column', gap: 12, marginTop: 16}}>
              <input placeholder="Food Name" required value={editingItem.food_name} onChange={e => setEditingItem({...editingItem, food_name: e.target.value})} style={{padding: 12, borderRadius: 12, border: '1px solid #E5E7EB', fontSize: 14}} />
              <input placeholder="Price (₱)" type="number" required value={editingItem.price} onChange={e => setEditingItem({...editingItem, price: e.target.value})} style={{padding: 12, borderRadius: 12, border: '1px solid #E5E7EB', fontSize: 14}} />
              <input placeholder="Description" value={editingItem.description} onChange={e => setEditingItem({...editingItem, description: e.target.value})} style={{padding: 12, borderRadius: 12, border: '1px solid #E5E7EB', fontSize: 14}} />
              <input 
                list="category-options"
                placeholder="Category (e.g. Burgers, Rice Meals)"
                required
                value={editingItem.category || ''} 
                onChange={e => setEditingItem({...editingItem, category: e.target.value})} 
                style={{padding: 12, borderRadius: 12, border: '1px solid #E5E7EB', fontSize: 14, background: 'white', width: '100%', boxSizing: 'border-box'}}
              />
              <div style={{display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 14px', borderRadius: 12, border: '1px solid #E5E7EB', background: 'white'}}>
                <span style={{fontSize: 14, fontWeight: 600, color: '#374151'}}>Item Available</span>
                <label style={{position: 'relative', display: 'inline-block', width: 44, height: 24}}>
                  <input type="checkbox" checked={editingItem.available !== false} onChange={e => setEditingItem({...editingItem, available: e.target.checked})} style={{opacity: 0, width: 0, height: 0}} />
                  <span style={{position: 'absolute', cursor: 'pointer', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: editingItem.available !== false ? '#22C55E' : '#E5E7EB', transition: '.3s', borderRadius: 24}}>
                    <span style={{position: 'absolute', content: '""', height: 18, width: 18, left: editingItem.available !== false ? 22 : 3, bottom: 3, backgroundColor: 'white', transition: '.3s', borderRadius: '50%', boxShadow: '0 2px 4px rgba(0,0,0,0.2)'}}></span>
                  </span>
                </label>
              </div>
              <div style={{display: 'flex', alignItems: 'center', gap: 12, marginTop: 4}}>
                <div style={{
                  width: 60, height: 60, borderRadius: 12, border: '1px solid #E5E7EB',
                  background: '#F9FAFB', display: 'flex', alignItems: 'center', justifyContent: 'center',
                  overflow: 'hidden', flexShrink: 0
                }}>
                  {editingItem.image && (editingItem.image.startsWith('data:') || editingItem.image.startsWith('http')) ? (
                    <img src={editingItem.image} alt="preview" style={{width: '100%', height: '100%', objectFit: 'cover'}} />
                  ) : editingItem.image ? (
                    <span style={{fontSize: 28}}>{editingItem.image}</span>
                  ) : (
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#CCC" strokeWidth="1.5"><rect x="3" y="3" width="18" height="18" rx="3"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg>
                  )}
                </div>
                <div style={{flex: 1}}>
                  <button
                    type="button"
                    onClick={() => editImageInputRef.current?.click()}
                    style={{
                      padding: '10px 14px', borderRadius: 10, border: '1.5px solid #E8001C',
                      background: 'white', color: '#E8001C', fontWeight: 700, fontSize: 13, cursor: 'pointer',
                      display: 'flex', alignItems: 'center', gap: 6, justifyContent: 'center', width: '100%'
                    }}
                  >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg>
                    Upload Photo
                  </button>
                  <input ref={editImageInputRef} type="file" accept="image/*" style={{display: 'none'}} onChange={handleEditImageUpload} />
                </div>
              </div>
              <button type="submit" className="sd-save-btn" style={{marginTop: 12}}>Update Item</button>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
