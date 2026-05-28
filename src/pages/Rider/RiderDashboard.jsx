import { useState, useEffect, useRef } from 'react'
import './RiderDashboard.css'

const L_CSS = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css'
const L_JS  = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js'

const RIDER_ICON_HTML = `<div id="lf-rider-icon" style="position:relative;width:72px;height:72px;display:flex;align-items:center;justify-content:center;transition:transform 0.4s cubic-bezier(0.22,1,0.36,1)">
  <div class="map-moto-pulse" style="position:absolute;inset:0;border-radius:50%;background:rgba(232,0,28,0.2);animation:riderPulse 2s infinite"></div>
  <svg width="64" height="64" viewBox="0 0 64 64" xmlns="http://www.w3.org/2000/svg" style="position:relative;z-index:2;filter:drop-shadow(0 6px 6px rgba(0,0,0,0.35))" class="fp-scooter">
    <style>
      .fp-scooter { animation: fpBob 0.3s infinite alternate cubic-bezier(0.4, 0, 0.2, 1); }
      @keyframes fpBob { from { transform: scale(0.98) translateY(1px); } to { transform: scale(1.02) translateY(-1px); } }
    </style>
    <rect x="25" y="4" width="14" height="56" rx="7" fill="rgba(0,0,0,0.15)" />
    <rect x="29" y="2" width="6" height="14" rx="3" fill="#1C1C1E" />
    <path d="M24 16 C24 4, 40 4, 40 16 L36 28 L28 28 Z" fill="#F4F4F5" />
    <circle cx="32" cy="10" r="3" fill="#FFFBE6" />
    <path d="M26 18 Q32 12 38 18" stroke="#B3E5FC" stroke-width="3" fill="none" opacity="0.8" stroke-linecap="round" />
    <path d="M12 28 Q32 20 52 28" stroke="#2C2C2E" stroke-width="5" stroke-linecap="round" fill="none" />
    <circle cx="16" cy="20" r="4" fill="#1C1C1E" />
    <circle cx="16" cy="20" r="2.5" fill="#D1D1D6" />
    <circle cx="48" cy="20" r="4" fill="#1C1C1E" />
    <circle cx="48" cy="20" r="2.5" fill="#D1D1D6" />
    <rect x="26" y="28" width="12" height="12" fill="#2C2C2E" />
    <rect x="14" y="40" width="36" height="22" rx="4" fill="#8A0000" />
    <rect x="16" y="42" width="32" height="18" rx="2" fill="#E8001C" />
    <path d="M16 51 L48 51" stroke="#5A0000" stroke-width="2" />
    <path d="M18 36 C18 20, 46 20, 46 36 Z" fill="#FF3B30" />
    <path d="M22 36 C22 26, 42 26, 42 36 Z" fill="#C61010" />
    <circle cx="32" cy="28" r="10" fill="#FF3B30" stroke="#1C1C1E" stroke-width="1.5" />
    <path d="M24 25 Q32 19 40 25 Q32 29 24 25 Z" fill="#1C1C1E" />
  </svg>
</div>`;

function RiderLiveMap({ isFull = false, riderPos }) {
  const mapRef = useRef(null)
  const instanceRef = useRef(null)
  const riderMarkerRef = useRef(null)

  useEffect(() => {
    if (!document.getElementById('leaflet-css')) {
      const link = document.createElement('link')
      link.id = 'leaflet-css'; link.rel = 'stylesheet'; link.href = L_CSS
      document.head.appendChild(link)
    }
    // Inject rider pulse animation CSS
    if (!document.getElementById('rider-pulse-css')) {
      const style = document.createElement('style')
      style.id = 'rider-pulse-css'
      style.textContent = `@keyframes riderPulse{0%,100%{transform:scale(1);opacity:0.4}50%{transform:scale(1.6);opacity:0}}`
      document.head.appendChild(style)
    }

    const initMap = (L) => {
      if (instanceRef.current || !mapRef.current) return
      const startCenter = riderPos ? [riderPos.lat, riderPos.lng] : [11.7766, 124.8873]
      const map = L.map(mapRef.current, {
        center: startCenter,
        zoom: isFull ? 16 : 14,
        zoomControl: false,
        attributionControl: false
      })
      instanceRef.current = map
      L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', { maxZoom: 19, attribution: '© OpenStreetMap' }).addTo(map)
      
      const createIcon = (html, size, anchor) => L.divIcon({ html, className: '', iconSize: size, iconAnchor: anchor });
      const dropoffIcon = createIcon(`<div style="background: white; border-radius: 50%; width: 28px; height: 28px; display: flex; align-items: center; justify-content: center; color: #E8001C; box-shadow: 0 3px 8px rgba(0,0,0,0.3); border: 2px solid #E8001C;"><svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z"/></svg></div>`, [32, 32], [16, 16]);
      const riderIcon = createIcon(RIDER_ICON_HTML, [72, 72], [36, 36]);

      L.marker([11.7783, 124.8897], { icon: dropoffIcon }).addTo(map);
      
      const pos = riderPos || { lat: 11.7742, lng: 124.8835 }
      const rm = L.marker([pos.lat, pos.lng], { icon: riderIcon, zIndexOffset: 1000 }).addTo(map)
      riderMarkerRef.current = rm

      fetch('https://router.project-osrm.org/route/v1/driving/124.8835,11.7742;124.8849,11.7749;124.8855,11.7755;124.8860,11.7760;124.8897,11.7783?overview=full&geometries=geojson')
        .then(res => res.json())
        .then(data => {
          if (data.routes && data.routes[0]) {
            const coords = data.routes[0].geometry.coordinates.map(c => [c[1], c[0]]);
            L.polyline(coords, { color: '#E8001C', weight: 18, lineCap: 'round', opacity: 0.08, lineJoin: 'round' }).addTo(map);
            L.polyline(coords, { color: '#E8001C', weight: 6, opacity: 1, lineCap: 'round', lineJoin: 'round' }).addTo(map);
            L.polyline(coords, { color: 'white', weight: 2, lineCap: 'round', opacity: 0.35, lineJoin: 'round', dashArray: '1 12' }).addTo(map);
            map.fitBounds(coords, { padding: [40, 40] });
          } else {
            const latLngs = [[11.7742, 124.8835], [11.7749, 124.8849], [11.7755, 124.8855], [11.7760, 124.8860], [11.7783, 124.8897]];
            L.polyline(latLngs, { color: '#E8001C', weight: 4, opacity: 1 }).addTo(map);
            map.fitBounds(latLngs, { padding: [20, 20] });
          }
        })
        .catch(err => console.error('Routing error:', err));
    }

    if (window.L) initMap(window.L)
    else { const s = document.createElement('script'); s.src = L_JS; s.onload = () => initMap(window.L); document.head.appendChild(s) }

    return () => { if (instanceRef.current) { instanceRef.current.remove(); instanceRef.current = null } }
  }, [isFull])

  // Update rider marker when riderPos changes
  useEffect(() => {
    if (riderMarkerRef.current && riderPos) {
      riderMarkerRef.current.setLatLng([riderPos.lat, riderPos.lng])
      const el = document.getElementById('lf-rider-icon')
      if (el) el.style.transform = `rotate(${riderPos.heading || 0}deg)`
      if (instanceRef.current) instanceRef.current.panTo([riderPos.lat, riderPos.lng], { animate: true, duration: 0.5 })
    }
  }, [riderPos])

  return <div ref={mapRef} style={{ width: '100%', height: '100%' }} />
}

export default function RiderDashboard({ onLogout, rider, orders = [], setOrders, stalls = [], customers = [] }) {
  const [tab, setTab] = useState('home')
  const [deliveryView, setDeliveryView] = useState('available') // available, ongoing, live
  const [isOnline, setIsOnline] = useState(false)
  const [riderPos, setRiderPos] = useState(null)
  const watchIdRef = useRef(null)

  // Real-time GPS broadcasting — writes to localStorage for customer tracking page
  useEffect(() => {
    if (!navigator.geolocation) return
    const watchId = navigator.geolocation.watchPosition(
      (pos) => {
        const loc = { lat: pos.coords.latitude, lng: pos.coords.longitude, heading: pos.coords.heading || 0, speed: pos.coords.speed || 0, ts: Date.now() }
        setRiderPos(loc)
        try { localStorage.setItem('poblago_rider_location', JSON.stringify(loc)) } catch(e) {}
      },
      (err) => {
        // Fallback to a default location for development
        const fallback = { lat: 11.7756, lng: 124.8862, heading: 0, speed: 0, ts: Date.now() }
        setRiderPos(fallback)
        try { localStorage.setItem('poblago_rider_location', JSON.stringify(fallback)) } catch(e) {}
      },
      { enableHighAccuracy: true, maximumAge: 2000, timeout: 10000 }
    )
    watchIdRef.current = watchId
    return () => navigator.geolocation.clearWatch(watchId)
  }, [])

  const defaultAvatar = "https://ui-avatars.com/api/?name=Mark+Reyes&background=E8001C&color=fff"

  // Icons
  const MenuIcon = () => (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="3" y1="12" x2="21" y2="12"></line><line x1="3" y1="6" x2="21" y2="6"></line><line x1="3" y1="18" x2="21" y2="18"></line></svg>
  )
  const LogoIcon = () => (
    <svg width="100" height="24" viewBox="0 0 100 24" fill="none">
      <path d="M12 2L15 12L24 14L15 16L12 24L9 16L0 14L9 12L12 2Z" fill="#E8001C"/>
      <text x="30" y="18" fontFamily="Inter" fontSize="18" fontWeight="800" fill="#1A1A1A">Poblacion</text>
    </svg>
  )
  const BellIcon = () => (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"></path><path d="M13.73 21a2 2 0 0 1-3.46 0"></path></svg>
  )
  const StarIcon = ({ size = 16, color = "#F2C94C" }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill={color}><path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z"/></svg>
  )
  const WalletIcon = ({ size = 24 }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 12V7H5a2 2 0 0 1 2-2h14v4"></path><path d="M3 5v14a2 2 0 0 0 2 2h16v-5"></path><path d="M18 12a2 2 0 0 0 0 4h4v-4Z"></path></svg>
  )
  const ScooterIcon = ({ size = 24 }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="7" cy="17" r="3"></circle><circle cx="17" cy="17" r="3"></circle><path d="M14 17h-4"></path><path d="M14 17l1.5-6H19v-2l-2.5 0-2 8"></path><path d="M7 17l-1-4h-2"></path><path d="M6 13h4"></path><path d="M10 13l1-4h3"></path><path d="M11 9l-1-4H6"></path></svg>
  )
  const BackIcon = () => (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="15 18 9 12 15 6"></polyline></svg>
  )
  const HelpIcon = () => (
    <span className="rd-header-help">Help</span>
  )

  const renderHome = () => (
    <div className="rd-page-container">
      <div className="rd-header">
        <button className="rd-menu-btn"><MenuIcon /></button>
        <div className="rd-header-logo">
          {/* Using text for simplicity to match design visually */}
          <div style={{display:'flex', alignItems:'center', gap: 4, fontWeight: 900, fontSize: 18}}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="#E8001C"><path d="M12 2L15 12L24 14L15 16L12 24L9 16L0 14L9 12L12 2Z"/></svg>
            <span style={{letterSpacing: '-0.5px'}}>Poblacion</span>
          </div>
        </div>
        <div className="rd-bell-wrapper">
          <button className="rd-icon-btn"><BellIcon /></button>
          <span className="rd-badge">3</span>
        </div>
      </div>

      <div className="rd-home-profile">
        <div className="rd-avatar-container">
          <img src={defaultAvatar} alt="Rider" className="rd-avatar" />
        </div>
        <div className="rd-profile-info">
          <div className="rd-profile-name-row">
            <span className="rd-profile-name">Mark Reyes</span>
            <div className="rd-profile-rating">
              <StarIcon size={12} /> 4.9
            </div>
          </div>
          <div className="rd-profile-status-row">
            <span className="rd-status-dot"></span> Active
          </div>
          <div className="rd-rider-id" style={{color: '#E8001C', fontWeight: 700}}>Poblacion Staff Rider <br/><span style={{fontWeight: 400, color: '#888'}}>Staff ID: STAFF-00123</span></div>
        </div>
      </div>

      <div className="rd-earnings-card">
        <div className="rd-earnings-left">
          <h3>Today's Earnings</h3>
          <div className="rd-earnings-amount">₱750.00</div>
          <div className="rd-earnings-diff">
            <span className="rd-diff-positive">+20%</span>
            <span className="rd-diff-text">vs yesterday</span>
          </div>
        </div>
        <div className="rd-wallet-icon">
          <WalletIcon size={24} />
        </div>
      </div>

      <div className="rd-stats-grid">
        <div className="rd-stat-box" onClick={() => setTab('deliveries')}>
          <div className="rd-stat-header">
            <span>Deliveries</span>
            <div className="rd-stat-icon green"><ScooterIcon size={16} /></div>
          </div>
          <div className="rd-stat-value">12</div>
          <div className="rd-stat-sub">Completed</div>
        </div>
        <div className="rd-stat-box" onClick={() => { setTab('deliveries'); setDeliveryView('ongoing'); }}>
          <div className="rd-stat-header">
            <span>Ongoing</span>
            <div className="rd-stat-icon purple"><ScooterIcon size={16} /></div>
          </div>
          <div className="rd-stat-value">1</div>
          <div className="rd-stat-sub">Delivery</div>
        </div>
        <div className="rd-stat-box">
          <div className="rd-stat-header">
            <span>Acceptance Rate</span>
          </div>
          <div className="rd-stat-value">98%</div>
          <div className="rd-stat-sub positive">Great!</div>
        </div>
        <div className="rd-stat-box">
          <div className="rd-stat-header">
            <span>Rating</span>
            <div className="rd-stat-icon yellow"><StarIcon size={16} /></div>
          </div>
          <div className="rd-stat-value">4.9</div>
          <div className="rd-stat-sub">Excellent</div>
        </div>
      </div>

      <div className="rd-go-online-section">
        <p className="rd-go-online-text">Go Online to start receiving delivery requests.</p>
        <button 
          className={`rd-go-online-btn ${isOnline ? 'rd-go-offline-btn' : ''}`}
          onClick={() => setIsOnline(!isOnline)}
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18.36 6.64a9 9 0 1 1-12.73 0"></path><line x1="12" y1="2" x2="12" y2="12"></line></svg>
          {isOnline ? 'Go Offline' : 'Go Online'}
        </button>
      </div>
    </div>
  )

  const pendingOrders = orders.filter(o => o.status === 'Pending' && !o.rider_id && o.group_id);
  const groupedPending = pendingOrders.reduce((acc, o) => {
    if (!acc[o.group_id]) acc[o.group_id] = [];
    acc[o.group_id].push(o);
    return acc;
  }, {});
  const availableBatches = Object.values(groupedPending);
  const firstBatch = availableBatches[0];
  
  const handleAcceptBatch = (groupId) => {
    if (setOrders) {
      setOrders(prev => prev.map(o => o.group_id === groupId ? { ...o, status: 'Delivering', rider_id: rider?.id } : o));
    }
    setDeliveryView('ongoing');
  };

  const renderAvailableDelivery = () => {
    if (!firstBatch) {
      return (
        <div className="rd-page-container">
          <div className="rd-header">
            <div className="rd-header-left">
              <button className="rd-back-btn" onClick={() => setTab('home')}><BackIcon /></button>
              <span className="rd-header-title" style={{marginLeft: 16}}>Available Delivery</span>
            </div>
          </div>
          <div className="rd-card-white" style={{textAlign: 'center', padding: 40}}>
            <p style={{color: '#888'}}>No available deliveries right now.</p>
          </div>
        </div>
      );
    }

    const customer = customers.find(c => c.id === firstBatch[0].customer_id) || { fullname: 'Juan Dela Cruz', address: 'Poblacion City View, Davao City' };
    const earnings = firstBatch.length * 45; // Approx 45 per stop

    return (
      <div className="rd-page-container">
        <div className="rd-header">
          <div className="rd-header-left">
            <button className="rd-back-btn" onClick={() => setTab('home')}><BackIcon /></button>
            <span className="rd-header-title" style={{marginLeft: 16}}>Available Delivery</span>
          </div>
        </div>

        <div className="rd-card-white">
          <div className="rd-stops-header">
            <span>Pickup from</span>
            <span className="rd-stops-count">{firstBatch.length} {firstBatch.length > 1 ? 'Stops' : 'Stop'}</span>
          </div>
          
          <div className="rd-timeline">
            {firstBatch.map((order, idx) => {
              const stall = stalls.find(s => s.id === order.stall_id);
              const isLast = idx === firstBatch.length - 1;
              const colors = ['bg-red', 'bg-teal', 'bg-green', 'bg-purple'];
              return (
                <div className="rd-timeline-item" key={order.id}>
                  <div className={`rd-timeline-icon ${colors[idx % colors.length]}`}>{idx + 1}</div>
                  <div className="rd-timeline-content">
                    <div className="rd-timeline-title">{stall ? stall.stall_name : 'Restaurant'}</div>
                  </div>
                  <div className="rd-timeline-line"></div>
                </div>
              );
            })}
          </div>

          <div className="rd-stops-header" style={{marginTop: 24}}>
            <span>Drop off</span>
          </div>
          
          <div className="rd-timeline-item" style={{marginBottom: 0}}>
            <div className="rd-timeline-content">
              <div className="rd-timeline-title">{customer.fullname}</div>
              <div className="rd-timeline-sub">{customer.address}</div>
            </div>
            <div className="rd-timeline-dist">2.4 km</div>
          </div>
        </div>

        <div className="rd-card-white" style={{marginTop: 0}}>
          <div className="rd-info-row">
            <div className="rd-info-label">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg>
              Estimated Earnings
            </div>
            <div className="rd-info-value" style={{fontSize: 16}}>₱{earnings.toFixed(2)}</div>
          </div>
          <div className="rd-info-row">
            <div className="rd-info-label">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg>
              Estimated Time
            </div>
            <div className="rd-info-value">25 - 30 mins</div>
          </div>
          <div className="rd-info-row">
            <div className="rd-info-label">
              <WalletIcon size={16} />
              Payment Method
            </div>
            <div className="rd-info-value">{firstBatch[0].payment_method}</div>
          </div>
        </div>

        <div className="rd-actions-row">
          <button className="rd-btn-decline" onClick={() => setTab('home')}>Decline</button>
          <button className="rd-btn-accept" onClick={() => handleAcceptBatch(firstBatch[0].group_id)}>
            Accept Order <br/><span style={{fontSize: 12, fontWeight: 500}}>(15s)</span>
          </button>
        </div>
      </div>
    );
  }

  const renderOngoingDelivery = () => {
    const ongoingOrders = orders.filter(o => o.status === 'Delivering' && o.rider_id === rider?.id && o.group_id);
    const activeBatch = ongoingOrders.reduce((acc, o) => {
      if (!acc[o.group_id]) acc[o.group_id] = [];
      acc[o.group_id].push(o);
      return acc;
    }, {});
    const activeGroups = Object.values(activeBatch);
    const currentBatch = activeGroups[0];

    if (!currentBatch) {
      return (
        <div className="rd-page-container">
          <div className="rd-header">
            <div className="rd-header-left">
              <button className="rd-back-btn" onClick={() => setDeliveryView('available')}><BackIcon /></button>
              <span className="rd-header-title" style={{marginLeft: 16}}>Ongoing Delivery</span>
            </div>
          </div>
          <div className="rd-card-white" style={{textAlign: 'center', padding: 40}}>
            <p style={{color: '#888'}}>No ongoing delivery.</p>
          </div>
        </div>
      );
    }

    const customer = customers.find(c => c.id === currentBatch[0].customer_id) || { fullname: 'Juan Dela Cruz', address: 'Poblacion City View, Davao City' };
    const groupId = currentBatch[0].group_id;

    return (
      <div className="rd-page-container">
        <div className="rd-header">
          <div className="rd-header-left">
            <button className="rd-back-btn" onClick={() => setDeliveryView('available')}><BackIcon /></button>
            <span className="rd-header-title" style={{marginLeft: 16}}>Ongoing Delivery</span>
          </div>
          <HelpIcon />
        </div>

        <div className="rd-card-white" style={{marginBottom: 0, borderBottomLeftRadius: 0, borderBottomRightRadius: 0, paddingBottom: 10}}>
          <div className="rd-stops-header" style={{marginBottom: 20}}>
            <div>
              <span style={{fontSize: 11, color: '#888'}}>Order ID</span><br/>
              <span style={{fontSize: 15, fontWeight: 800, color: '#1A1A1A'}}>#{groupId}</span>
            </div>
            <span className="rd-stops-count">{currentBatch.length} {currentBatch.length > 1 ? 'Stops' : 'Stop'}</span>
          </div>

          <div className="rd-timeline">
            {currentBatch.map((order, idx) => {
              const stall = stalls.find(s => s.id === order.stall_id);
              const colors = ['bg-red', 'bg-teal', 'bg-green', 'bg-purple'];
              return (
                <div className="rd-timeline-item" key={order.id}>
                  <div className={`rd-timeline-icon ${colors[idx % colors.length]}`}>{idx + 1}</div>
                  <div className="rd-timeline-content">
                    <div className="rd-timeline-meta">
                      <div className="rd-timeline-title">{stall ? stall.stall_name : 'Restaurant'}</div>
                      <div className="rd-timeline-time">{order.time} <svg width="14" height="14" viewBox="0 0 24 24" fill="#00B050"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/></svg></div>
                    </div>
                    <div className="rd-timeline-status">Picked up</div>
                  </div>
                  <div className="rd-timeline-line"></div>
                </div>
              );
            })}
            <div className="rd-timeline-item">
              <div className="rd-timeline-icon dropoff">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z"/></svg>
              </div>
              <div className="rd-timeline-content">
                <div className="rd-timeline-title">Drop off</div>
                <div className="rd-timeline-sub">{customer.fullname}<br/>{customer.address}</div>
              </div>
              <div className="rd-timeline-dist">2.4 km</div>
            </div>
          </div>
        </div>

        <div className="rd-map-preview" onClick={() => setDeliveryView('live')}>
          <RiderLiveMap riderPos={riderPos} />
        </div>

        <div className="rd-card-white" style={{marginTop: 16}}>
          <div className="rd-arrival-info">
            <div>
              <div className="rd-arrival-time">Arriving in</div>
              <div className="rd-arrival-mins">18 mins</div>
              <div className="rd-arrival-dist">2.4 km away</div>
            </div>
            <div style={{display: 'flex', gap: 12}}>
              <button className="rd-circle-btn">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"></path></svg>
              </button>
              <button className="rd-circle-btn">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path></svg>
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const renderLiveTracking = () => (
    <div className="rd-page-container" style={{height: '100dvh'}}>
      <div className="rd-header" style={{position: 'absolute', width: '100%', background: 'transparent', boxShadow: 'none'}}>
        <button className="rd-back-btn" style={{background: 'white', borderRadius: '50%', padding: 8, width: 40, height: 40, boxShadow: '0 2px 8px rgba(0,0,0,0.1)'}} onClick={() => setDeliveryView('ongoing')}>
          <BackIcon />
        </button>
        <span className="rd-header-title" style={{background: 'white', padding: '8px 16px', borderRadius: 20, boxShadow: '0 2px 8px rgba(0,0,0,0.1)'}}>Live Tracking</span>
        <div style={{width: 40}}></div>
      </div>

      <div className="rd-map-full">
        <div className="rd-map-order-pill">Order ID: #PGO12345</div>
        <RiderLiveMap isFull={true} riderPos={riderPos} />
      </div>

      <div className="rd-bottom-sheet">
        <div className="rd-bottom-sheet-handle"></div>
        <div className="rd-customer-info">
          <img src={defaultAvatar} alt="Customer" className="rd-customer-avatar" />
          <div className="rd-customer-details">
            <div className="rd-customer-name">Juan Dela Cruz</div>
            <div className="rd-customer-rating"><StarIcon size={14}/> 4.9</div>
            <div style={{fontSize: 13, color: '#555', marginTop: 4}}>Poblacion City View, Davao City</div>
          </div>
          <button className="rd-circle-btn" style={{width: 40, height: 40}}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path></svg>
          </button>
        </div>
        <button className="rd-chat-btn">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"></path></svg>
          Chat with Customer
        </button>
      </div>
    </div>
  )

  const renderDeliveries = () => {
    if (deliveryView === 'available') return renderAvailableDelivery()
    if (deliveryView === 'ongoing') return renderOngoingDelivery()
    if (deliveryView === 'live') return renderLiveTracking()
  }

  const renderEarnings = () => (
    <div className="rd-page-container">
      <div className="rd-earnings-header">
        <span className="rd-earnings-title">Earnings</span>
        <div className="rd-earnings-dropdown">
          This Week
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="6 9 12 15 18 9"></polyline></svg>
        </div>
      </div>

      <div className="rd-earnings-card red" style={{margin: '16px 20px'}}>
        <div className="rd-earnings-left">
          <h3>This Week's Earnings</h3>
          <div className="rd-earnings-amount">₱2,450.00</div>
          <div className="rd-earnings-diff">
            <span className="rd-diff-positive">+15%</span>
            <span className="rd-diff-text">vs last week</span>
          </div>
        </div>
        <div className="rd-wallet-icon">
          <WalletIcon size={24} />
        </div>
      </div>

      <div className="rd-chart-section">
        <div className="rd-section-title">Earnings Overview</div>
        {/* Simple SVG Chart to mimic design */}
        <svg viewBox="0 0 300 120" style={{width: '100%', marginBottom: 24}}>
          <polyline points="0,100 40,70 80,60 120,80 160,50 200,80 240,40 280,60 300,10" fill="none" stroke="#E8001C" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"/>
          <circle cx="0" cy="100" r="4" fill="#E8001C"/>
          <circle cx="40" cy="70" r="4" fill="#E8001C"/>
          <circle cx="80" cy="60" r="4" fill="#E8001C"/>
          <circle cx="120" cy="80" r="4" fill="#E8001C"/>
          <circle cx="160" cy="50" r="4" fill="#E8001C"/>
          <circle cx="200" cy="80" r="4" fill="#E8001C"/>
          <circle cx="240" cy="40" r="4" fill="#E8001C"/>
          <circle cx="280" cy="60" r="4" fill="#E8001C"/>
          <circle cx="300" cy="10" r="4" fill="#E8001C"/>
          {/* Fill gradient under line */}
          <path d="M0,100 L40,70 L80,60 L120,80 L160,50 L200,80 L240,40 L280,60 L300,10 L300,120 L0,120 Z" fill="url(#gradient)" opacity="0.1"/>
          <defs>
            <linearGradient id="gradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#E8001C" stopOpacity="1" />
              <stop offset="100%" stopColor="#E8001C" stopOpacity="0" />
            </linearGradient>
          </defs>
          <text x="0" y="120" fontSize="10" fill="#999">Mon</text>
          <text x="45" y="120" fontSize="10" fill="#999">Tue</text>
          <text x="90" y="120" fontSize="10" fill="#999">Wed</text>
          <text x="135" y="120" fontSize="10" fill="#999">Thu</text>
          <text x="185" y="120" fontSize="10" fill="#999">Fri</text>
          <text x="235" y="120" fontSize="10" fill="#999">Sat</text>
          <text x="280" y="120" fontSize="10" fill="#999">Sun</text>
        </svg>

        <div className="rd-stats-list">
          <div className="rd-stats-list-item">
            <div className="rd-stats-list-label">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="20 6 9 17 4 12"></polyline></svg> Total Deliveries
            </div>
            <div className="rd-stats-list-value">28</div>
          </div>
          <div className="rd-stats-list-item">
            <div className="rd-stats-list-label">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg> Completed Deliveries
            </div>
            <div className="rd-stats-list-value">26</div>
          </div>
          <div className="rd-stats-list-item">
            <div className="rd-stats-list-label">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"></circle><line x1="15" y1="9" x2="9" y2="15"></line><line x1="9" y1="9" x2="15" y2="15"></line></svg> Cancelled Deliveries
            </div>
            <div className="rd-stats-list-value">2</div>
          </div>
          <div className="rd-stats-list-item">
            <div className="rd-stats-list-label">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg> Avg. Earnings per Delivery
            </div>
            <div className="rd-stats-list-value">₱87.50</div>
          </div>
        </div>
      </div>

      <div className="rd-recent-header">
        <span className="rd-section-title" style={{marginBottom: 0}}>Recent Transactions</span>
        <span className="rd-view-all">View All</span>
      </div>

      <div className="rd-tx-list">
        <div className="rd-tx-item">
          <div>
            <div className="rd-tx-id">#PGO12345</div>
            <div className="rd-tx-date">May 21, 2025</div>
          </div>
          <div className="rd-tx-amount">₱120.00</div>
        </div>
        <div className="rd-tx-item">
          <div>
            <div className="rd-tx-id">#PGO12344</div>
            <div className="rd-tx-date">May 21, 2025</div>
          </div>
          <div className="rd-tx-amount">₱95.00</div>
        </div>
        <div className="rd-tx-item">
          <div>
            <div className="rd-tx-id">#PGO12343</div>
            <div className="rd-tx-date">May 20, 2025</div>
          </div>
          <div className="rd-tx-amount">₱110.00</div>
        </div>
      </div>
    </div>
  )

  const renderProfile = () => (
    <div className="rd-page-container">
      <div className="rd-header" style={{justifyContent: 'center', position: 'relative'}}>
        <span className="rd-header-title">Profile</span>
        <button className="rd-icon-btn" style={{position: 'absolute', right: 20}}>
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="3"></circle><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"></path></svg>
        </button>
      </div>

      <div className="rd-profile-header">
        <div className="rd-profile-avatar-wrapper">
          <img src={defaultAvatar} alt="Mark Reyes" className="rd-profile-avatar-lg" />
          <div className="rd-profile-camera">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"></path><circle cx="12" cy="13" r="4"></circle></svg>
          </div>
        </div>
        <div className="rd-profile-name-lg">Mark Reyes</div>
        <div className="rd-profile-badge" style={{background: '#E8001C', color: 'white'}}>Poblacion Staff Rider</div>
        <div className="rd-profile-rating-lg">
          <span style={{color: '#00B050', fontWeight: 800}}>✓ Official In-house Staff</span>
        </div>
        <div className="rd-rider-id">Staff ID: STAFF-00123</div>
      </div>

      <div className="rd-menu-list">
        <div className="rd-menu-item">
          <div className="rd-menu-left">
            <div className="rd-menu-icon"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg></div>
            My Information
          </div>
          <div className="rd-menu-arrow"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="9 18 15 12 9 6"></polyline></svg></div>
        </div>
        <div className="rd-menu-item">
          <div className="rd-menu-left">
            <div className="rd-menu-icon"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="1" y="3" width="15" height="13"></rect><polygon points="16 8 20 8 23 11 23 16 16 16 16 8"></polygon><circle cx="5.5" cy="18.5" r="2.5"></circle><circle cx="18.5" cy="18.5" r="2.5"></circle></svg></div>
            Vehicle Information
          </div>
          <div className="rd-menu-arrow"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="9 18 15 12 9 6"></polyline></svg></div>
        </div>
        <div className="rd-menu-item">
          <div className="rd-menu-left">
            <div className="rd-menu-icon"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path><polyline points="9 22 9 12 15 12 15 22"></polyline></svg></div>
            Bank Information
          </div>
          <div className="rd-menu-arrow"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="9 18 15 12 9 6"></polyline></svg></div>
        </div>
        <div className="rd-menu-item">
          <div className="rd-menu-left">
            <div className="rd-menu-icon"><StarIcon size={20} color="currentColor" /></div>
            Ratings & Reviews
          </div>
          <div className="rd-menu-arrow"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="9 18 15 12 9 6"></polyline></svg></div>
        </div>
        <div className="rd-menu-item">
          <div className="rd-menu-left">
            <div className="rd-menu-icon"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"></circle><path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"></path><line x1="12" y1="17" x2="12.01" y2="17"></line></svg></div>
            Help Center
          </div>
          <div className="rd-menu-arrow"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="9 18 15 12 9 6"></polyline></svg></div>
        </div>
        <div className="rd-menu-item">
          <div className="rd-menu-left">
            <div className="rd-menu-icon"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line><polyline points="10 9 9 9 8 9"></polyline></svg></div>
            Terms and Conditions
          </div>
          <div className="rd-menu-arrow"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="9 18 15 12 9 6"></polyline></svg></div>
        </div>
        <div className="rd-menu-item logout" onClick={onLogout}>
          <div className="rd-menu-left">
            <div className="rd-menu-icon"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path><polyline points="16 17 21 12 16 7"></polyline><line x1="21" y1="12" x2="9" y2="12"></line></svg></div>
            Logout
          </div>
        </div>
      </div>
    </div>
  )

  return (
    <div className="rd-container">
      <div className="rd-content">
        {tab === 'home' && renderHome()}
        {tab === 'deliveries' && renderDeliveries()}
        {tab === 'earnings' && renderEarnings()}
        {tab === 'profile' && renderProfile()}
      </div>

      {tab !== 'deliveries' || deliveryView === 'available' ? (
        <div className="rd-bottom-nav">
          <button className={`rd-nav-item ${tab === 'home' ? 'active' : ''}`} onClick={() => setTab('home')}>
            <svg className="rd-nav-icon" viewBox="0 0 24 24" fill="currentColor"><path d="M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8z"/></svg>
            <span className="rd-nav-label">Home</span>
          </button>
          <button className={`rd-nav-item ${tab === 'deliveries' ? 'active' : ''}`} onClick={() => { setTab('deliveries'); setDeliveryView('available'); }}>
            <svg className="rd-nav-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line><polyline points="10 9 9 9 8 9"></polyline></svg>
            <span className="rd-nav-label">Deliveries</span>
          </button>
          <button className={`rd-nav-item ${tab === 'earnings' ? 'active' : ''}`} onClick={() => setTab('earnings')}>
            <WalletIcon size={24} />
            <span className="rd-nav-label">Earnings</span>
          </button>
          <button className={`rd-nav-item ${tab === 'profile' ? 'active' : ''}`} onClick={() => setTab('profile')}>
            <svg className="rd-nav-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>
            <span className="rd-nav-label">Profile</span>
          </button>
        </div>
      ) : null}
    </div>
  )
}
