import { useState } from 'react'
import './Restaurant.css'

const PlusIcon  = () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" width="14" height="14"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
const MinusIcon = () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" width="14" height="14"><line x1="5" y1="12" x2="19" y2="12"/></svg>
const BackIcon  = () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.8" strokeLinecap="round" strokeLinejoin="round" width="20" height="20"><polyline points="15 18 9 12 15 6"/></svg>
const HeartIcon = () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" width="18" height="18"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>

export default function Restaurant({ onBack, onCart, addToCart, cartItems, stall, foods = [] }) {
  const [activeTab, setActiveTab] = useState('menu')

  // Filter foods for this specific stall
  const stallFoods = foods.filter(f => f.stall_id === stall?.id)

  // Map counts based on items currently in cart
  const counts = {}
  cartItems.forEach(i => {
    if (i.stall_id === stall?.id) {
      counts[i.id] = i.qty
    }
  })

  const increment = (item) => {
    addToCart({ ...item, stall_id: stall.id })
  }

  const totalQty = Object.values(counts).reduce((a, b) => a + b, 0)
  const totalPrice = stallFoods.reduce((s, i) => s + (counts[i.id] || 0) * i.price, 0)

  return (
    <div className="rest">
      
      {/* ── Top Nav Header ── */}
      <div className="rest-nav-header">
        <button className="rest-back-btn" onClick={onBack} id="btn-rest-back">
          <BackIcon />
        </button>
        <span className="rest-header-title">{stall?.stall_name || 'Food Stall'}</span>
        <button className="rest-fav-btn" id="btn-rest-heart">
          <HeartIcon />
        </button>
      </div>

      {/* ── Scroll Area ── */}
      <div className="rest-scroll" style={{ paddingBottom: totalQty > 0 ? '88px' : '24px' }}>
        
        {/* Stall Hero Banner */}
        <div className="rest-hero-container">
          <div className="rest-banner-img">
            {(stall?.logo?.startsWith('http') || stall?.logo?.startsWith('data:')) ? (
              <img src={stall.logo} alt="logo" style={{width: 80, height: 80, objectFit: 'cover', borderRadius: 20}} />
            ) : (
              <span style={{ fontSize: 56 }}>{stall?.logo || '🍜'}</span>
            )}
          </div>
          <div className="rest-hero-card">
            <h1 className="rest-hero-name">{stall?.stall_name}</h1>
            <div className="rest-rating-row">
              <span className="rest-star">★</span>
              <span className="rest-rating-val">4.8</span>
              <span className="rest-reviews-count">(120)</span>
              <span className="rest-meta-sep">•</span>
              <span className="rest-cuisine">{stall?.category}</span>
            </div>
            <div className="rest-delivery-info">
              <span>₱{stall?.delivery_fee} Delivery</span>
              <span className="rest-meta-sep">•</span>
              <span>30 min</span>
            </div>
          </div>
        </div>

        {/* Green Proximity Alert Box */}
        <div className="rest-proximity-alert">
          <div className="rest-alert-content">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" width="16" height="16">
              <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/>
            </svg>
            <div className="rest-alert-text">
              <p className="rest-alert-title">You are near this stall!</p>
              <p className="rest-alert-desc">You are only 290m away</p>
            </div>
          </div>
          <button className="rest-alert-link">View on Map</button>
        </div>

        {/* Tabs Selector */}
        <div className="rest-tabs">
          <button className={`rest-tab ${activeTab === 'menu' ? 'active' : ''}`} onClick={() => setActiveTab('menu')}>Menu</button>
          <button className={`rest-tab ${activeTab === 'reviews' ? 'active' : ''}`} onClick={() => setActiveTab('reviews')}>Reviews (120)</button>
          <button className={`rest-tab ${activeTab === 'info' ? 'active' : ''}`} onClick={() => setActiveTab('info')}>Info</button>
        </div>

        {activeTab === 'menu' && (
          <div className="rest-menu-section">
            <h2 className="rest-section-heading">Best Sellers</h2>
            <div className="rest-items-grid">
              {stallFoods.map(item => (
                <div key={item.id} className="rest-item-card" id={`ritem-${item.id}`}>
                  <div className="rest-item-content">
                    <div className="rest-item-details">
                      <h3 className="rest-item-title">{item.food_name}</h3>
                      <p className="rest-item-desc">{item.description}</p>
                      <p className="rest-item-price">₱{item.price}</p>
                    </div>
                    <div className="rest-item-image-wrap">
                      {item.image && (item.image.startsWith('data:') || item.image.startsWith('http')) ? (
                        <img src={item.image} alt={item.food_name} style={{width: '100%', height: '100%', objectFit: 'cover', borderRadius: 'inherit'}} />
                      ) : (
                        <span className="rest-item-emoji">{item.image || '🍔'}</span>
                      )}
                    </div>
                  </div>
                  
                  {counts[item.id] ? (
                    <div className="rest-qty-wrapper">
                      <span className="rest-qty-indicator">{counts[item.id]} in Cart</span>
                      <button className="rest-plus-btn active" onClick={() => increment(item)} id={`rplus-${item.id}`}>
                        <PlusIcon />
                      </button>
                    </div>
                  ) : (
                    <button className="rest-plus-btn" onClick={() => increment(item)} id={`radd-${item.id}`}>
                      <PlusIcon />
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'reviews' && (
          <div className="rest-reviews-section">
            <div className="rest-review-card">
              <div className="rest-review-header">
                <span className="rest-review-author">Maria C.</span>
                <span className="rest-review-stars">★★★★★</span>
              </div>
              <p className="rest-review-text">Super delicious beef noodles! Packed hot and clean.</p>
            </div>
            <div className="rest-review-card">
              <div className="rest-review-header">
                <span className="rest-review-author">Juan D.</span>
                <span className="rest-review-stars">★★★★☆</span>
              </div>
              <p className="rest-review-text">Great service, will order again.</p>
            </div>
          </div>
        )}

        {activeTab === 'info' && (
          <div className="rest-info-section">
            <div className="rest-info-row">
              <span className="rest-info-label">Cuisine</span>
              <span className="rest-info-value">{stall?.category}</span>
            </div>
            <div className="rest-info-row">
              <span className="rest-info-label">Hours</span>
              <span className="rest-info-value">{stall?.hours}</span>
            </div>
            <div className="rest-info-row">
              <span className="rest-info-label">Description</span>
              <span className="rest-info-value">{stall?.desc}</span>
            </div>
          </div>
        )}

      </div>

      {/* ── View Cart Bar ── */}
      {totalQty > 0 && (
        <div className="rest-cart-bar">
          <button className="rest-cart-btn" onClick={onCart} id="btn-view-cart">
            View Cart ({totalQty}) — ₱{totalPrice}
          </button>
        </div>
      )}

    </div>
  )
}
