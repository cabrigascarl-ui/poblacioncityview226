import { useEffect, useRef, useState } from 'react'
import './OrderTracking.css'

const STALL = { lat: 11.7749, lng: 124.8849 }
const L_CSS = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css'
const L_JS  = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js'

function haversine(a, b) {
  const R = 6371000, toR = Math.PI/180
  const dLat = (b.lat-a.lat)*toR, dLng = (b.lng-a.lng)*toR
  const x = Math.sin(dLat/2)**2 + Math.cos(a.lat*toR)*Math.cos(b.lat*toR)*Math.sin(dLng/2)**2
  return R*2*Math.atan2(Math.sqrt(x),Math.sqrt(1-x))
}
function bearing(a,b){
  const dL=(b.lng-a.lng)*Math.PI/180,la=a.lat*Math.PI/180,lb=b.lat*Math.PI/180
  return((Math.atan2(Math.sin(dL)*Math.cos(lb),Math.cos(la)*Math.sin(lb)-Math.sin(la)*Math.cos(lb)*Math.cos(dL))*180/Math.PI)+360)%360
}

function TrackMap({ onUpdate, isActive, groupOrders=[], stalls=[], onMapReady, userLoc, assignedRider }) {
  const mapRef=useRef(null), instanceRef=useRef(null), rmRef=useRef(null)
  const prevPos=useRef(null), prevTime=useRef(null), intervalRef=useRef(null)
  const pickupStalls=[]
  groupOrders.forEach(o=>{const s=stalls.find(st=>st.id===o.stall_id);if(s&&!pickupStalls.some(x=>x.id===s.id))pickupStalls.push(s)})

  useEffect(()=>{
    if(!userLoc) return;
    if(!document.getElementById('leaflet-css')){
      const l=document.createElement('link');l.id='leaflet-css';l.rel='stylesheet';l.href=L_CSS;document.head.appendChild(l)
    }
    const init=(L)=>{
      if(instanceRef.current||!mapRef.current)return
      const map=L.map(mapRef.current,{center:[11.7766,124.8873],zoom:16,zoomControl:false,attributionControl:false,dragging:true,scrollWheelZoom:false,doubleClickZoom:false})
      instanceRef.current=map; onMapReady(map)
      L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png',{maxZoom:19,attribution:'© OpenStreetMap'}).addTo(map)

      const ch=`<div class="map-dest-pin"><svg width="36" height="44" viewBox="0 0 36 44" fill="none"><path d="M18 0C8.06 0 0 8.06 0 18c0 13.5 18 26 18 26s18-12.5 18-26C36 8.06 27.94 0 18 0z" fill="#1971C2"/><circle cx="18" cy="17" r="7" fill="white"/></svg></div>`
      L.marker([userLoc.lat,userLoc.lng],{icon:L.divIcon({className:'',html:ch,iconSize:[36,44],iconAnchor:[18,44]})}).addTo(map)
      fetch(`https://router.project-osrm.org/route/v1/driving/${STALL.lng},${STALL.lat};${userLoc.lng},${userLoc.lat}?overview=full&geometries=geojson`)
        .then(r=>r.json()).then(data=>{
          if(!data.routes?.[0])return
          const coords=data.routes[0].geometry.coordinates
          const lls=coords.map(c=>[c[1],c[0]])
          L.polyline(lls,{color:'#E8001C',weight:18,lineCap:'round',opacity:0.08,lineJoin:'round'}).addTo(map)
          L.polyline(lls,{color:'#E8001C',weight:6,lineCap:'round',opacity:1,lineJoin:'round'}).addTo(map)
          L.polyline(lls,{color:'white',weight:2,lineCap:'round',opacity:0.35,lineJoin:'round',dashArray:'1 12'}).addTo(map)
          map.fitBounds(lls,{padding:[50,50]})
          if(!isActive)return
          const rh=`<div id="lf-rider-icon" style="position:relative;width:72px;height:72px;display:flex;align-items:center;justify-content:center;transition:transform 0.4s cubic-bezier(0.22,1,0.36,1)"><div class="map-moto-pulse" style="position:absolute;inset:0;border-radius:50%;background:rgba(232,0,28,0.2);animation:riderPulse 2s infinite"></div><svg width="64" height="64" viewBox="0 0 64 64" xmlns="http://www.w3.org/2000/svg" style="position:relative;z-index:2;filter:drop-shadow(0 6px 6px rgba(0,0,0,0.35))" class="fp-scooter"><style>.fp-scooter { animation: fpBob 0.3s infinite alternate cubic-bezier(0.4, 0, 0.2, 1); } @keyframes fpBob { from { transform: scale(0.98) translateY(1px); } to { transform: scale(1.02) translateY(-1px); } }</style><rect x="25" y="4" width="14" height="56" rx="7" fill="rgba(0,0,0,0.15)" /><rect x="29" y="2" width="6" height="14" rx="3" fill="#1C1C1E" /><path d="M24 16 C24 4, 40 4, 40 16 L36 28 L28 28 Z" fill="#F4F4F5" /><circle cx="32" cy="10" r="3" fill="#FFFBE6" /><path d="M26 18 Q32 12 38 18" stroke="#B3E5FC" stroke-width="3" fill="none" opacity="0.8" stroke-linecap="round" /><path d="M12 28 Q32 20 52 28" stroke="#2C2C2E" stroke-width="5" stroke-linecap="round" fill="none" /><circle cx="16" cy="20" r="4" fill="#1C1C1E" /><circle cx="16" cy="20" r="2.5" fill="#D1D1D6" /><circle cx="48" cy="20" r="4" fill="#1C1C1E" /><circle cx="48" cy="20" r="2.5" fill="#D1D1D6" /><rect x="26" y="28" width="12" height="12" fill="#2C2C2E" /><rect x="14" y="40" width="36" height="22" rx="4" fill="#8A0000" /><rect x="16" y="42" width="32" height="18" rx="2" fill="#E8001C" /><path d="M16 51 L48 51" stroke="#5A0000" stroke-width="2" /><path d="M18 36 C18 20, 46 20, 46 36 Z" fill="#FF3B30" /><path d="M22 36 C22 26, 42 26, 42 36 Z" fill="#C61010" /><circle cx="32" cy="28" r="10" fill="#FF3B30" stroke="#1C1C1E" stroke-width="1.5" /><path d="M24 25 Q32 19 40 25 Q32 29 24 25 Z" fill="#1C1C1E" /></svg></div>`
          const ri=L.divIcon({className:'',html:rh,iconSize:[72,72],iconAnchor:[36,36]})
          const n=coords.length-1
          const interp=(p)=>{const ei=p*n,i=Math.min(Math.floor(ei),n-1),t=ei-i,a=coords[i],b=coords[Math.min(i+1,n)];return{lat:a[1]+(b[1]-a[1])*t,lng:a[0]+(b[0]-a[0])*t}}
          let sp={lat:STALL.lat,lng:STALL.lng}
          if (assignedRider?.location?.lat) {
             sp = assignedRider.location
          } else {
            try{const s=JSON.parse(localStorage.getItem('poblago_rider_location')||'{}');if(s.lat)sp=s}catch(e){}
          }
          const rm=L.marker([sp.lat,sp.lng],{icon:ri}).addTo(map)
          rmRef.current=rm; prevPos.current=sp; prevTime.current=Date.now()
        })
    }
    if(window.L)init(window.L)
    else{const s=document.createElement('script');s.src=L_JS;s.onload=()=>init(window.L);document.head.appendChild(s)}
    return()=>{if(instanceRef.current){instanceRef.current.remove();instanceRef.current=null}}
  },[isActive,pickupStalls.length,userLoc])

  useEffect(() => {
    if (!assignedRider?.location?.lat || !rmRef.current || !instanceRef.current) return;
    const d = assignedRider.location;
    const el = document.getElementById('lf-rider-icon');
    if (el) el.style.transform = `rotate(${d.heading || 0}deg)`;
    
    const now=Date.now(), dt=(now-prevTime.current)/1000;
    const dist=haversine(prevPos.current || d, d);
    const spd = dt > 0 ? Math.round((dist/dt)*3.6) : 0;
    
    prevPos.current = d; prevTime.current = now;
    rmRef.current.setLatLng([d.lat, d.lng]);
    instanceRef.current.panTo([d.lat, d.lng], { animate: true, duration: 0.8 });
    
    if (userLoc) {
      const rem = haversine(d, userLoc);
      onUpdate({ eta: Math.max(0, Math.ceil(rem/150)), dist: Math.round(rem), speed: spd, progress: d.progress || 0 });
    }
  }, [assignedRider?.location, userLoc]);

  return <div ref={mapRef} style={{width:'100%',height:'100%'}}/>
}

const QUICK_MSGS = ["I'm outside! 🚪","On my way! 🛵","Please call me 📞","5 minutes away! ⏱","At the gate 🔔","Leave at door please 📦"]

export default function OrderTracking({ onBack, order, stalls=[], orders=[], riders=[] }) {
  const [eta,setEta]=useState(8)
  const [dist,setDist]=useState(400)
  const [speed,setSpeed]=useState(0)
  const [progress,setProgress]=useState(0)
  const [viewMode,setViewMode]=useState('steps')
  const [isFullscreen,setIsFullscreen]=useState(false)
  const [nearbyAlert,setNearbyAlert]=useState(false)
  const [showMessages,setShowMessages]=useState(false)
  const [chatMessages, setChatMessages] = useState([])
  const [chatInput, setChatInput] = useState('')
  const [sheetExpanded,setSheetExpanded]=useState(false)
  const mapRef=useRef(null)
  const groupOrders = order?.group_id ? orders.filter(o => o.group_id === order.group_id) : orders.filter(o => o.id === order?.id)
  const actualStatus = groupOrders[0]?.status || 'Pending'
  const assignedRider = riders.find(r => r.id === groupOrders[0]?.rider_id)
  const [userLoc, setUserLoc] = useState(null)

  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        pos => {
          setUserLoc({ lat: pos.coords.latitude, lng: pos.coords.longitude })
        },
        err => {
          console.warn("GPS Location Error:", err.message)
          // Fallback to Poblacion City View center if GPS is denied/unavailable
          setUserLoc({ lat: 11.7783, lng: 124.8897 })
        },
        {
          enableHighAccuracy: true, // Forces precise GPS tracking instead of IP/Cell towers
          timeout: 10000,
          maximumAge: 0
        }
      )
    } else {
      setUserLoc({ lat: 11.7783, lng: 124.8897 })
    }
  }, [])

  const handleSendChat = (text) => {
    if(!text.trim()) return;
    setChatMessages(p => [...p, { id: Date.now(), text: text.trim(), sender: 'me' }]);
    setChatInput('');
  }



  const isDelivering = actualStatus === 'Delivering', isDelivered = actualStatus === 'Delivered'
  useEffect(()=>{if(isDelivering)setViewMode('map');else setViewMode('steps')},[isDelivering])
  useEffect(()=>{if(progress>0.8&&isDelivering)setNearbyAlert(true)},[progress,isDelivering])

  const arrivalTime=(()=>{const d=new Date(Date.now()+eta*60000);return d.toLocaleTimeString('en-PH',{hour:'2-digit',minute:'2-digit'})})()

  const handleUpdate=({eta:e,dist:d,speed:s,progress:p})=>{setEta(e);setDist(d);setSpeed(s);setProgress(p)}
  const recenter=()=>{try{const d=JSON.parse(localStorage.getItem('poblago_rider_location')||'{}');if(d.lat&&mapRef.current)mapRef.current.flyTo([d.lat,d.lng],17,{animate:true,duration:0.8})}catch(e){}}

  let lvl=1
  if(isDelivered)lvl=5; else if(isDelivering)lvl=4
  else if(actualStatus==='Ready for Pickup'||actualStatus==='Ready for Delivery')lvl=3
  else if(actualStatus==='Preparing')lvl=2
  const steps=[
    {label:'Order Placed',desc:"We've received your multi-stall orders",done:lvl>=1,active:lvl===1},
    {label:'Preparing Food',desc:'Stalls are preparing your dishes',done:lvl>=2,active:lvl===2},
    {label:'Rider Collecting',desc:'Rider is picking up from food stalls',done:lvl>=3,active:lvl===3},
    {label:'Out for Delivery',desc:'Rider is heading to your location',done:lvl>=4,active:lvl===4},
    {label:'Delivered!',desc:'Enjoy your warm food court meal!',done:lvl>=5,active:lvl===5},
  ]

  if(viewMode==='map') return (
    <div className={`ot-live-map fade-in${isFullscreen?' ot-fullscreen':''}`}>
      {nearbyAlert&&<div className="ot-nearby-alert"><span>🛵</span><span>Your rider is almost there! Get ready.</span><button onClick={()=>setNearbyAlert(false)}>✕</button></div>}
      {!isFullscreen&&<div className="ot-map-header">
        <button className="ot-map-back" onClick={()=>setViewMode('steps')}><svg viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" width="20" height="20"><polyline points="15 18 9 12 15 6"/></svg></button>
        <span className="ot-map-title">Live Tracking</span>
        <div style={{width:40}}/>
      </div>}
      <div className="ot-progress-bar-track"><div className="ot-progress-bar-fill" style={{width:`${Math.round(progress*100)}%`}}/></div>
      {!isFullscreen&&<div className="ot-map-stats-row">
        <div className="ot-stat-card"><span className="ot-stat-label">ETA</span><span className="ot-stat-value">{eta} min</span><span className="ot-stat-sub">~{arrivalTime}</span></div>
        <div className="ot-stat-card"><span className="ot-stat-label">Remaining</span><span className="ot-stat-value">{dist<1000?`${dist}m`:`${(dist/1000).toFixed(1)}km`}</span><span className="ot-stat-sub">{Math.round(progress*100)}% done</span></div>
        <div className="ot-stat-card"><span className="ot-stat-label">Speed</span><span className="ot-stat-value">{speed}<small> km/h</small></span><span className="ot-stat-sub">🛵 Live</span></div>
      </div>}
      <div className="ot-map-canvas">
        {userLoc ? (
          <TrackMap onUpdate={handleUpdate} isActive={true} groupOrders={groupOrders} stalls={stalls} onMapReady={m=>mapRef.current=m} userLoc={userLoc} assignedRider={assignedRider} />
        ) : (
          <div style={{display:'flex',alignItems:'center',justifyContent:'center',height:'100%',background:'#f8f9fa',color:'#999'}}>Locating...</div>
        )}
        <div className="ot-map-float-controls">
          <button className="ot-float-btn" onClick={recenter} title="Re-center"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" width="20" height="20"><circle cx="12" cy="12" r="3"/><path d="M12 2v3m0 14v3M2 12h3m14 0h3"/></svg></button>
          <button className="ot-float-btn" onClick={()=>mapRef.current?.zoomIn()}><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" width="18" height="18"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/><line x1="11" y1="8" x2="11" y2="14"/><line x1="8" y1="11" x2="14" y2="11"/></svg></button>
          <button className="ot-float-btn" onClick={()=>mapRef.current?.zoomOut()}><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" width="18" height="18"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/><line x1="8" y1="11" x2="14" y2="11"/></svg></button>
          <button className={`ot-float-btn${isFullscreen?' active':''}`} onClick={()=>setIsFullscreen(f=>!f)}><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" width="18" height="18">{isFullscreen?<><path d="M8 3v3a2 2 0 0 1-2 2H3m18 0h-3a2 2 0 0 1-2-2V3m0 18v-3a2 2 0 0 1 2-2h3M3 16h3a2 2 0 0 1 2 2v3"/></>:<><path d="M8 3H5a2 2 0 0 0-2 2v3m18 0V5a2 2 0 0 0-2-2h-3m0 18h3a2 2 0 0 0 2-2v-3M3 16v3a2 2 0 0 0 2 2h3"/></>}</svg></button>
        </div>
        <button className="ot-float-call" onClick={()=>{ if (assignedRider?.phone) alert(`Calling Rider: ${assignedRider.phone}`); else alert('No rider assigned yet.'); }}><svg viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" width="20" height="20"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/></svg></button>
      </div>
      {!isFullscreen&&<div className={`ot-rider-sheet${sheetExpanded?' expanded':''}`}>
        <div className="ot-sheet-handle" onClick={()=>setSheetExpanded(e=>!e)}/>
        <div className="ot-rider-profile">
          <div className="ot-rider-photo" style={{background: '#E8001C', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: '50%', fontWeight: 'bold', fontSize: 20}}>
            {assignedRider?.fullname ? assignedRider.fullname.charAt(0).toUpperCase() : 'R'}
          </div>
          <div className="ot-rider-info">
            <span className="ot-rider-lbl" style={{color: '#E8001C', fontWeight: 800}}>
              {assignedRider?.vehicle_details || 'Poblacion Delivery Rider'}
            </span>
            <span className="ot-rider-name">
              {assignedRider?.fullname || 'Looking for a rider...'}
            </span>
            <div className="ot-rider-rating">
              {assignedRider?.phone ? (
                <><span className="ot-rider-star" style={{color: '#00B050'}}>✓</span><span style={{color: '#00B050', fontWeight: 700}}>Verified Partner</span></>
              ) : (
                <span style={{color: '#888', fontWeight: 600}}>Waiting for assignment</span>
              )}
            </div>
          </div>
          <div className="ot-rider-actions">
            <button className="ot-action-btn phone" onClick={()=> { if (assignedRider?.phone) alert(`Calling Rider: ${assignedRider.phone}`); else alert('No rider assigned yet.'); }}><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" width="18" height="18"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/></svg></button>
            <button className="ot-action-btn chat" onClick={()=>setShowMessages(m=>!m)}><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" width="18" height="18"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg></button>
          </div>
        </div>
        {(sheetExpanded||showMessages)&&<div className="ot-chat-container fade-in">
          {chatMessages.length > 0 && (
            <div className="ot-chat-history">
              {chatMessages.map(m => (
                <div key={m.id} className={`ot-chat-bubble ${m.sender}`}>
                  {m.text}
                </div>
              ))}
            </div>
          )}
          <div className="ot-qm-scroll">
            {QUICK_MSGS.map((m,i)=><button key={i} className="ot-qm-btn" onClick={()=>handleSendChat(m)}>{m}</button>)}
          </div>
          <div className="ot-chat-input-row">
            <input value={chatInput} onChange={e=>setChatInput(e.target.value)} placeholder="Message your rider..." onKeyDown={e=>e.key==='Enter'&&handleSendChat(chatInput)} />
            <button onClick={()=>handleSendChat(chatInput)}>
              <svg viewBox="0 0 24 24" fill="currentColor" width="16" height="16"><path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z"/></svg>
            </button>
          </div>
        </div>}
        {sheetExpanded&&<div className="ot-sheet-order-summary">
          <p className="ot-sheet-sum-title">Your Order Summary</p>
          {groupOrders.map(o=>{
            const s=stalls.find(st=>st.id===o.stall_id)||{stall_name:'Stall',logo:'🍲'}
            return <div key={o.id} className="ot-sheet-sum-row"><span>{(s.logo?.startsWith('http') || s.logo?.startsWith('data:')) ? <img src={s.logo} alt="logo" style={{width: 16, height: 16, objectFit: 'cover', borderRadius: '50%', verticalAlign: 'middle', marginRight: 4}} /> : s.logo} {s.stall_name}</span><span>₱{o.total_price}</span></div>
          })}
        </div>}
      </div>}
    </div>
  )

  return (
    <div className="ot-steps-view fade-in">
      <div className="ot-steps-header">
        <button className="ot-steps-back" onClick={onBack}><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" width="20" height="20"><polyline points="15 18 9 12 15 6"/></svg></button>
        <span className="ot-steps-title">Order Status</span>
        <div style={{width:40}}/>
      </div>
      <div className="ot-steps-scroll">
        <div className="ot-order-top-card">
          <div className="ot-order-main-info"><span className="ot-order-num">Group #{order?.group_id||'G1234'}</span><span className="ot-order-time">{order?.time||'Just now'}</span></div>
          <div className="ot-order-status-badge"><span className="ot-badge-dot animate"/><span className="ot-badge-text">{isDelivered?'Delivered':isDelivering?'Delivering':'Preparing'}</span></div>
        </div>
        <div className="ot-vertical-steps-card" style={{padding:'16px'}}>
          <h4 style={{margin:'0 0 12px',fontSize:13,fontWeight:800}}>Stall Preparation Tracker</h4>
          {groupOrders.map(o=>{
            const s=stalls.find(st=>st.id===o.stall_id)||{stall_name:'Stall',logo:'🍲'}
            return <div key={o.id} style={{display:'flex',alignItems:'center',justifyContent:'space-between',paddingBottom:8,borderBottom:'1px solid #F1F3F5',marginBottom:8}}>
              <div style={{display:'flex',alignItems:'center',gap:8}}>
                <span style={{fontSize:18, width: 24, height: 24, display: 'inline-block'}}>
                  {(s.logo?.startsWith('http') || s.logo?.startsWith('data:')) ? <img src={s.logo} alt="logo" style={{width: '100%', height: '100%', objectFit: 'cover', borderRadius: '4px'}} /> : s.logo}
                </span>
                <div><p style={{fontSize:12.5,fontWeight:700,margin:0}}>{s.stall_name}</p><p style={{fontSize:10,color:'#868E96',margin:0}}>{o.items}</p></div></div>
              <span className={`ad-badge-status ${(actualStatus || '').toLowerCase().replace(/ /g,'-')}`} style={{fontSize:9.5}}>{actualStatus}</span>
            </div>
          })}
        </div>
        <div className="ot-vertical-steps-card">
          {steps.map((s,i)=><div key={i} className={`ot-vertical-step${s.done?' done':''}${s.active?' active':''}`}>
            <div className="ot-step-visual"><div className={`ot-step-circle${s.done?' done':''}${s.active?' active':''}`}>{s.done?'✓':(i+1)}</div>{i<steps.length-1&&<div className={`ot-step-connector-line${s.done?' done':''}`}/>}</div>
            <div className="ot-step-body"><h4 className="ot-step-name">{s.label}</h4><p className="ot-step-desc">{s.desc}</p></div>
          </div>)}
        </div>
        {isDelivering&&<button type="button" className="ot-map-cta" onClick={()=>setViewMode('map')}>🗺️ View Live Rider Map</button>}
        <div className="ot-help-card">
          <p className="ot-help-title">Need help with your order?</p>
          <p className="ot-help-desc">Contact our 24/7 Poblacion support line.</p>
          <button type="button" className="ot-help-btn" onClick={()=>alert('Support: 24/7 Poblacion City View')}>Contact Support</button>
        </div>
      </div>
    </div>
  )
}
