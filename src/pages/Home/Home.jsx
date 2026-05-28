import { useState } from 'react'
import './Home.css'
import promo1 from '../../assets/promo_1.png'

const CATS = [
  { id: 'all', label: 'All', emoji: '🏪' },
  { id: 'Chinese', label: 'Chinese', emoji: '🥢' },
  { id: 'Milktea', label: 'Milktea', emoji: '🧋' },
  { id: 'Burgers', label: 'Burgers', emoji: '🍔' },
  { id: 'Chicken', label: 'Chicken', emoji: '🍗' },
  { id: 'Pizza', label: 'Pizza', emoji: '🍕' },
  { id: 'Desserts', label: 'Desserts', emoji: '🍰' },
]

const STALL_GRADIENTS = [
  'linear-gradient(145deg, #FFE8EC 0%, #FFF5F7 100%)',
  'linear-gradient(145deg, #E8F4FD 0%, #F0FAFF 100%)',
  'linear-gradient(145deg, #FFF6E5 0%, #FFFBF0 100%)',
  'linear-gradient(145deg, #F3EBFF 0%, #FAF5FF 100%)',
  'linear-gradient(145deg, #E8FFF0 0%, #F5FFF8 100%)',
]

function getGreeting() {
  const h = new Date().getHours()
  if (h < 12) return 'Good morning'
  if (h < 17) return 'Good afternoon'
  return 'Good evening'
}

export default function Home({ onRestaurant, onSearch, onPromoOrder, stalls = [], currentCustomer, promos = [] }) {
  const [selectedCat, setSelectedCat] = useState('all')
  const [showNotif, setShowNotif] = useState(false)
  const [currentSlide, setCurrentSlide] = useState(0)
  const [currentAddress, setCurrentAddress] = useState(currentCustomer?.address ? currentCustomer.address.split(',')[0] : 'Poblacion City View')
  const [isLocating, setIsLocating] = useState(false)

  const handleGetLocation = () => {
    if (!navigator.geolocation) {
      alert("Geolocation is not supported by your browser")
      return
    }
    setIsLocating(true)
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        try {
          const { latitude, longitude } = pos.coords
          const res = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`)
          const data = await res.json()
          if (data && data.address) {
            const locName = data.address.road || data.address.suburb || data.address.city || data.address.town || data.address.village || 'Current Location'
            setCurrentAddress(locName)
          } else {
            setCurrentAddress('Current Location')
          }
        } catch (err) {
          console.error(err)
          setCurrentAddress('Location Found')
        } finally {
          setIsLocating(false)
        }
      },
      (err) => {
        console.error(err)
        alert("Unable to retrieve your location")
        setIsLocating(false)
      }
    )
  }

  const defaultPromos = [
    { id: 1, image: promo1, pretitle: 'Craving something', title: 'Delicious?', subtitle: 'Order Now and enjoy\nyour favorites!' },
    { id: 2, image: promo1, pretitle: 'Craving something', title: 'Tasty?',     subtitle: 'Order Now and enjoy\nyour favorites!' },
    { id: 3, image: promo1, pretitle: 'Craving something', title: 'Fresh?',     subtitle: 'Order Now and enjoy\nyour favorites!' },
    { id: 4, image: promo1, pretitle: 'Craving something', title: 'Sweet?',     subtitle: 'Order Now and enjoy\nyour favorites!' }
  ]

  // Map admin promotions that have an imageUrl into slider format; ignore text-only promos and games promos
  const adminSlides = (promos || []).filter(p => p.imageUrl && p.target !== 'Games').map(p => ({
    id: p.id,
    image: p.imageUrl,
    pretitle: p.pretitle || 'New Promotion',
    title: p.title || '🎉 Special Offer!',
    subtitle: p.subtitle || p.msg || 'Check it out!',
  }))

  const activePromos = adminSlides.length > 0 ? adminSlides : defaultPromos

  const handleScroll = (e) => {
    const scrollLeft = e.target.scrollLeft;
    const width = e.target.offsetWidth;
    const index = Math.round(scrollLeft / width);
    if (index !== currentSlide) setCurrentSlide(index);
  }

  const activeStalls = stalls.filter(s => s.status === 'active')
  const filteredStalls = selectedCat === 'all'
    ? activeStalls
    : activeStalls.filter(s => s.category === selectedCat)

  const customerName = currentCustomer?.fullname
    ? currentCustomer.fullname.split(' ')[0]
    : ''

  return (
    <div className="home">
      <div className="home-top">
        <p className="home-greeting">
          {getGreeting()}, <strong>{customerName || 'hungry'}?</strong> 🍽️
        </p>
        <div className="home-bar">
          <div className="home-loc-block" onClick={handleGetLocation}>
            <div className="home-loc-icon">
              <svg viewBox="0 0 24 24" fill="#E8001C" width="18" height="18">
                <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/>
              </svg>
            </div>
            <div>
              <span className="home-loc-label">Deliver to</span>
              <div className="home-loc-row">
                <span className="home-loc-place">{isLocating ? 'Locating...' : currentAddress}</span>
                {isLocating ? (
                  <span style={{fontSize: 10, marginLeft: 4}}>⏳</span>
                ) : (
                  <svg viewBox="0 0 24 24" fill="none" stroke="#6B6B80" strokeWidth="2.5" width="12" height="12">
                    <polyline points="6 9 12 15 18 9"/>
                  </svg>
                )}
              </div>
            </div>
          </div>
          <button
            className="home-notif premium-icon-btn"
            type="button"
            aria-label="Notifications"
            onClick={() => setShowNotif(!showNotif)}
            style={{ position: 'relative' }}
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="#3A3A4A" strokeWidth="2" width="20" height="20">
              <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/>
              <path d="M13.73 21a2 2 0 0 1-3.46 0"/>
            </svg>
            <span className="pg-notif-dot" />
          </button>
        </div>

        {/* Notification dropdown */}
        {showNotif && (
          <div className="home-notif-dropdown">
            <p className="home-notif-title">Notifications</p>
            <div className="home-notif-item">
              <span className="home-notif-dot-sm" />
              <div>
                <p className="home-notif-msg">🎉 FREE DELIVERY on orders ₱199+! Use code: POBLAGO</p>
                <p className="home-notif-time">2 hours ago</p>
              </div>
            </div>
            <div className="home-notif-item">
              <span className="home-notif-dot-sm" />
              <div>
                <p className="home-notif-msg">⚡ New items at Wok Express — Sweet & Sour Pork!</p>
                <p className="home-notif-time">Yesterday</p>
              </div>
            </div>
            <div className="home-notif-item">
              <div>
                <p className="home-notif-msg" style={{ color: '#868E96' }}>Welcome to Poblacion! Browse our food stalls.</p>
                <p className="home-notif-time">Just now</p>
              </div>
            </div>
          </div>
        )}
      </div>

      <div className="home-search-wrap" onClick={onSearch} id="btn-home-search">
        <div className="home-search">
          <div className="home-search-icon">
            <svg viewBox="0 0 24 24" fill="none" stroke="#9999AF" strokeWidth="2" width="18" height="18">
              <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
            </svg>
          </div>
          <span>Search for food or stalls</span>
        </div>
      </div>

      <div className="home-scroll">
        <div className="promo-hero-wrapper">
          <div className="promo-bg-slider" onScroll={handleScroll}>
            {activePromos.map((promo, index) => {
              const imgSrc = typeof promo === 'string' ? promo : promo.image;
              return (
                <div className="promo-bg-slide" key={promo.id || index}>
                  <img src={imgSrc} alt="Promo" />
                </div>
              );
            })}
          </div>

          <div className="promo-gradient-overlay">
            <div className="promo-heart-icon">
              <svg viewBox="0 0 24 24" fill="#E8001C" width="12" height="12">
                <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
              </svg>
            </div>
            <svg className="promo-dash-line" viewBox="0 0 100 40" preserveAspectRatio="none">
              <path d="M0,20 Q20,0 40,20 T80,20 T100,5" fill="none" stroke="rgba(255,255,255,0.4)" strokeWidth="1" strokeDasharray="3,3" />
            </svg>
          </div>

          <div className="promo-hero-content">
            <p className="promo-hero-pre">{activePromos[currentSlide]?.pretitle || 'Craving something'}</p>
            <h2 className="promo-hero-title">{activePromos[currentSlide]?.title || 'Delicious?'}</h2>
            <p className="promo-hero-sub">
              {(activePromos[currentSlide]?.subtitle || 'Order Now and enjoy\nyour favorites!')
                .split('\n').map((line, i) => <span key={i}>{line}{i === 0 && <br/>}</span>)}
            </p>
            <button className="promo-hero-btn" onClick={() => onPromoOrder?.()} type="button">
              Order Now
              <svg viewBox="0 0 24 24" fill="none" stroke="#E8001C" strokeWidth="2.5" width="16" height="16">
                <path d="M5 12h14M12 5l7 7-7 7"/>
              </svg>
            </button>
          </div>

          <div className="promo-hero-dots">
            {activePromos.map((_, idx) => (
              <span key={idx} className={`promo-hero-dot ${idx === currentSlide ? 'active' : ''}`} />
            ))}
          </div>
        </div>



        <div className="home-stalls-section">
          <div className="home-stalls-hdr">
            <h3>Popular Food Stalls</h3>
            <span className="home-stalls-count">{filteredStalls.length} open</span>
          </div>

          {filteredStalls.length === 0 ? (
            <div className="home-empty">
              <span>🏪</span>
              <p>No stalls in this category</p>
            </div>
          ) : (
            <div className="home-stalls-grid">
              {filteredStalls.map((stall, i) => (
                <div
                  key={stall.id}
                  className="stall-card premium-card--lift"
                  onClick={() => onRestaurant?.(stall)}
                  id={`stall-${stall.id}`}
                >
                  <div
                    className="stall-card-img"
                    style={{ background: STALL_GRADIENTS[i % STALL_GRADIENTS.length] }}
                  >
                    <span className="stall-card-badge">Open</span>
                    {(stall.logo?.startsWith('http') || stall.logo?.startsWith('data:')) ? (
                      <img src={stall.logo} alt="logo" style={{width: '100%', height: '100%', objectFit: 'cover', borderRadius: 'inherit'}} />
                    ) : (
                      <span>{stall.logo || '🏪'}</span>
                    )}
                  </div>
                  <div className="stall-card-body">
                    <p className="stall-card-name">{stall.stall_name}</p>
                    <p className="stall-card-meta">{stall.category}</p>
                    <div className="stall-card-footer">
                      <span className="stall-rating">
                        <span className="stall-rating-star">★</span> 4.8
                      </span>
                      <span className="stall-time">{stall.delivery_time || '25-35 min'}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
