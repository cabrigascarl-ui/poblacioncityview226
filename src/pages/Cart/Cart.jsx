import { useState } from 'react'
import './Cart.css'

export default function Cart({ items = [], updateQty, onBack, onShopping, onPlaceOrder, stalls = [] }) {
  const [notes, setNotes] = useState({}) // notes keyed by stall_id
  const [paymentMethod, setPaymentMethod] = useState('Cash on Delivery')
  const [promo, setPromo] = useState('')
  const [promoApplied, setPromoApplied] = useState(false)

  // Group items by stall_id
  const itemsByStall = {}
  items.forEach(item => {
    const sId = item.stall_id || 1
    if (!itemsByStall[sId]) {
      itemsByStall[sId] = []
    }
    itemsByStall[sId].push(item)
  })

  const sub = items.reduce((s, i) => s + i.price * i.qty, 0)
  
  // Single flat delivery fee of ₱15 (or free if subtotal >= 199)
  const delivery = sub >= 199 ? 0 : 15
  const service = 10
  const discount = promoApplied && (promo.toUpperCase() === 'POBLAGO' || promo.toUpperCase() === 'FREE10') ? (sub * 0.1) : 0
  const total = sub + delivery + service - discount
  const need = Math.max(0, 199 - sub)

  const handleApplyPromo = () => {
    const code = promo.toUpperCase()
    if (code === 'POBLAGO' || code === 'FREE10') {
      setPromoApplied(true)
    } else {
      alert('Invalid promo code.')
    }
  }

  const handleCheckout = () => {
    if (items.length === 0) {
      alert('Your cart is empty!')
      return
    }
    // Call parent to save the split orders
    onPlaceOrder({
      notes: notes,
      paymentMethod: paymentMethod,
      totalPrice: total,
    })
  }

  return (
    <div className="cart fade-in">
      {/* Header */}
      <div className="cart-hdr">
        <button className="pg-back" onClick={onBack} id="btn-cart-back">
          <svg viewBox="0 0 24 24" fill="none" stroke="#212529" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" width="22" height="22">
            <line x1="19" y1="12" x2="5" y2="12"/>
            <polyline points="12 19 5 12 12 5"/>
          </svg>
        </button>
        <h1 className="cart-title">My Cart</h1>
        <div style={{ width: 22 }} />
      </div>

      <div className="cart-scroll">
        {items.length === 0 ? (
          <div className="rd-empty-state" style={{ padding: '60px 16px' }}>
            <span>🛒</span>
            <p>Your cart is empty.</p>
            <button className="rd-btn-outline" onClick={onShopping}>Browse Food Stalls</button>
          </div>
        ) : (
          Object.keys(itemsByStall).map(stallIdStr => {
            const stallId = Number(stallIdStr)
            const stallObj = stalls.find(s => s.id === stallId) || { stall_name: 'Stall Owner', logo: '🍲' }
            const stallItems = itemsByStall[stallIdStr]

            return (
              <div key={stallId} className="cart-stall-group">
                {/* Stall Logo / Name Header */}
                <div className="cart-store" style={{ background: '#F8F9FA', margin: '0', borderRadius: '12px 12px 0 0', borderBottom: '1px solid #E9ECEF' }}>
                  <div style={{ width: 34, height: 34, background: '#FFF0F1', borderRadius: '8px', fontSize: 20, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    {(stallObj.logo?.startsWith('http') || stallObj.logo?.startsWith('data:')) ? (
                      <img src={stallObj.logo} alt="logo" style={{width: '100%', height: '100%', objectFit: 'cover', borderRadius: 'inherit'}} />
                    ) : (
                      stallObj.logo
                    )}
                  </div>
                  <div>
                    <p className="cart-store-name" style={{ fontSize: 13.5 }}>{stallObj.stall_name}</p>
                    <p className="cart-store-meta" style={{ fontSize: 10.5 }}>{stallObj.category}</p>
                  </div>
                </div>

                {/* Stall Items */}
                <div className="cart-items-card" style={{ borderTopLeftRadius: 0, borderTopRightRadius: 0, marginTop: 0, borderTop: 'none' }}>
                  {stallItems.map(item => (
                    <div key={item.id} className="cart-item" id={`ci-${item.id}`}>
                      <div className="cart-item-left">
                        <div style={{ fontSize: 20, marginRight: 10 }}>{item.image || '🍔'}</div>
                        <div>
                          <p className="cart-item-name">{item.food_name || item.name}</p>
                          <p className="cart-item-price">₱{Number(item.price).toFixed(2)}</p>
                        </div>
                      </div>
                      
                      <div className="qty-row">
                        <button className="qty-btn" onClick={() => updateQty(item.id, -1)} id={`qminus-${item.id}`}>
                          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" width="13" height="13">
                            <line x1="5" y1="12" x2="19" y2="12"/>
                          </svg>
                        </button>
                        <span className="qty-num">{item.qty}</span>
                        <button className="qty-btn qty-add" onClick={() => updateQty(item.id, 1)} id={`qplus-${item.id}`}>
                          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" width="13" height="13">
                            <line x1="12" y1="5" x2="12" y2="19"/>
                            <line x1="5" y1="12" x2="19" y2="12"/>
                          </svg>
                        </button>
                      </div>
                    </div>
                  ))}

                  {/* Notes per Stall */}
                  <div className="cart-notes-block" style={{ padding: '12px 14px 4px' }}>
                    <p className="cart-notes-lbl" style={{ margin: '0 0 6px', fontSize: 11 }}>Note for {stallObj.stall_name}</p>
                    <input
                      className="cart-notes-inp"
                      style={{ fontSize: 12, padding: '8px 10px', borderRadius: '8px', border: '1px solid #E9ECEF', width: '100%', boxSizing: 'border-box' }}
                      placeholder="e.g. Extra spicy, no onions..."
                      value={notes[stallId] || ''}
                      onChange={e => setNotes(prev => ({ ...prev, [stallId]: e.target.value }))}
                    />
                  </div>
                </div>
              </div>
            )
          })
        )}

        {items.length > 0 && (
          <>
            {/* Payment Method Selector */}
            <div className="cart-promo-card" style={{ padding: '12px 16px' }}>
              <p style={{ margin: '0 0 8px', fontSize: 13, fontWeight: 700, color: '#495057' }}>Payment Method</p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {['Cash on Delivery', 'GCash', 'PayMaya', 'Credit/Debit Card'].map(method => (
                  <label key={method} style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, cursor: 'pointer' }}>
                    <input
                      type="radio"
                      name="payment"
                      value={method}
                      checked={paymentMethod === method}
                      onChange={(e) => setPaymentMethod(e.target.value)}
                      style={{ accentColor: '#E8001C' }}
                    />
                    <span>{method}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Promo */}
            <div className="cart-promo-card">
              <div className="cart-promo-row">
                <input className="promo-inp" type="text" placeholder="Add promo code (e.g. POBLAGO)" value={promo} onChange={e => setPromo(e.target.value)} id="inp-promo" />
                <button className="promo-apply" onClick={handleApplyPromo} id="btn-apply">Apply</button>
              </div>
              {promoApplied && <p style={{ margin: '6px 0 0', fontSize: 11, color: '#22C55E', fontWeight: 700 }}>✓ Code applied successfully: 10% discount!</p>}
            </div>

            {/* Summary */}
            <div className="cart-summary-card">
              <div className="summary-row"><span className="s-lbl">Subtotal</span><span className="s-val">₱{sub.toFixed(2)}</span></div>
              {discount > 0 && <div className="summary-row"><span className="s-lbl" style={{ color: '#22C55E' }}>Discount (10%)</span><span className="s-val" style={{ color: '#22C55E' }}>-₱{discount.toFixed(2)}</span></div>}
              <div className="summary-row">
                <span className="s-lbl">Delivery Fee</span>
                <span className="s-val">
                  {delivery === 0 ? (
                    <><del style={{ color: '#ADB5BD', fontSize: 11, marginRight: 6 }}>₱15.00</del><span style={{ color: '#22C55E' }}>Free</span></>
                  ) : (
                    `₱${delivery.toFixed(2)}`
                  )}
                </span>
              </div>
              <div className="summary-row"><span className="s-lbl">Service Fee</span><span className="s-val">₱{service.toFixed(2)}</span></div>
              <div className="s-divider" />
              <div className="summary-row">
                <span className="s-lbl" style={{ fontWeight: 800, color: '#212529', fontSize: 14 }}>Total (incl. VAT)</span>
                <span className="s-val" style={{ fontWeight: 900, fontSize: 15, color: '#212529' }}>₱{total.toFixed(2)}</span>
              </div>
            </div>

            {/* Free delivery progress */}
            <div className="free-del-card" style={need === 0 ? { background: '#F0FDF4', borderColor: '#BBF7D0' } : {}}>
              <div style={{ display:'flex', alignItems: 'center', gap: 6 }}>
                {need > 0 ? (
                  <>
                    <div style={{ background: '#E8001C', width: 14, height: 14, borderRadius: '50%', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 10, fontWeight: 900 }}>!</div>
                    <span className="free-del-txt">Add ₱{need.toFixed(2)} more for free delivery!</span>
                    <span className="free-del-left" style={{ marginLeft: 'auto' }}>₱{need.toFixed(2)} left</span>
                  </>
                ) : (
                  <>
                    <div style={{ background: '#22C55E', width: 14, height: 14, borderRadius: '50%', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 10, fontWeight: 900 }}>✓</div>
                    <span className="free-del-txt" style={{ color: '#166534', fontWeight: 800 }}>You've unlocked Free Delivery!</span>
                  </>
                )}
              </div>
              <div className="free-del-track" style={{ marginTop: 8 }}>
                <div className="free-del-fill" style={{ width: `${Math.min(100, (sub/199)*100)}%`, background: need === 0 ? '#22C55E' : undefined }} />
              </div>
            </div>
          </>
        )}
      </div>

      {/* Footer */}
      {items.length > 0 && (
        <div className="cart-footer">
          <button className="pg-btn" onClick={handleCheckout} id="btn-checkout">Checkout</button>
          <button className="cart-continue" onClick={onShopping} id="btn-continue">Continue Shopping</button>
        </div>
      )}
    </div>
  )
}
