export default function BottomNav({ active, onNav, cartCount = 0 }) {
  const items = [
    { id: 'home', label: 'Home', cls: 'nav-home',
      icon: (a) => <svg viewBox="0 0 24 24" fill={a?"#E8001C":"none"} stroke={a?"#E8001C":"#ADB5BD"} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" width="20" height="20"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg> },
    { id: 'orders', label: 'Orders', cls: 'nav-orders',
      icon: (a) => <svg viewBox="0 0 24 24" fill="none" stroke={a?"#E8001C":"#ADB5BD"} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" width="20" height="20"><path d="M9 5H7a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2h-2"/><rect x="9" y="3" width="6" height="4" rx="2"/><line x1="9" y1="12" x2="15" y2="12"/><line x1="9" y1="16" x2="13" y2="16"/></svg> },
    { id: 'offers', label: 'Offers', cls: 'nav-offers',
      icon: (a) => <svg viewBox="0 0 24 24" fill="none" stroke={a?"#E8001C":"#ADB5BD"} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" width="20" height="20"><path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"/><line x1="3" y1="6" x2="21" y2="6"/><path d="M16 10a4 4 0 0 1-8 0"/></svg> },
    { id: 'games', label: 'Games', cls: 'nav-games',
      icon: (a) => <svg viewBox="0 0 24 24" fill="none" stroke={a?"#E8001C":"#ADB5BD"} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" width="20" height="20"><circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="4"/><line x1="21.17" y1="8" x2="12" y2="8"/><line x1="3.95" y1="6.06" x2="8.54" y2="14"/><line x1="10.88" y1="21.94" x2="15.46" y2="14"/></svg> },
    { id: 'account', label: 'Profile', cls: 'nav-profile',
      icon: (a) => <svg viewBox="0 0 24 24" fill="none" stroke={a?"#E8001C":"#ADB5BD"} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" width="20" height="20"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg> },
  ]

  return (
    <nav className="bottom-nav">
      {items.map(({ id, label, cls, icon }) => {
        const a = active === id
        const showBadge = id === 'orders' && cartCount > 0
        return (
          <button key={id} className={`nav-item ${cls} ${a ? 'active' : ''}`} onClick={() => onNav(id)} id={`nav-${id}`}>
            <div className="nav-icon" style={{ position: 'relative' }}>
              {icon(a)}
              {showBadge && (
                <span style={{
                  position: 'absolute', top: -4, right: -6,
                  background: '#E8001C', color: 'white',
                  width: 16, height: 16, borderRadius: '50%',
                  fontSize: 9, fontWeight: 900,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  border: '1.5px solid white',
                }}>
                  {cartCount > 9 ? '9+' : cartCount}
                </span>
              )}
            </div>
            <span>{label}</span>
          </button>
        )
      })}
    </nav>
  )
}
