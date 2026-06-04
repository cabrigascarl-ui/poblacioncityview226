import { useState } from 'react'
import './Search.css'

const CUISINES = [
  { label: 'Chinese', emoji: '🥢' },
  { label: 'Milktea', emoji: '🧋' },
  { label: 'Burgers', emoji: '🍔' },
  { label: 'Noodles', emoji: '🍜' },
  { label: 'Rice', emoji: '🍚' },
  { label: 'Drinks', emoji: '🍹' },
]

export default function Search({ onRestaurant, onBack, stalls = [], foods = [] }) {
  const [q, setQ] = useState('')

  const activeStalls = stalls.filter(s => s.status === 'active')

  // Filter items matching query
  const matchedStalls = q.trim() === '' ? [] : activeStalls.filter(s => 
    (s.stall_name || '').toLowerCase().includes(q.toLowerCase()) ||
    (s.category || '').toLowerCase().includes(q.toLowerCase()) ||
    (s.desc || '').toLowerCase().includes(q.toLowerCase())
  )

  const matchedFoods = q.trim() === '' ? [] : foods.filter(f => {
    const parentStall = activeStalls.find(s => s.id === f.stall_id)
    if (!parentStall) return false // ignore suspended stall foods
    return (f.food_name || '').toLowerCase().includes(q.toLowerCase()) || 
           ((f.description || '').toLowerCase().includes(q.toLowerCase()))
  })

  return (
    <div className="srch">
      {/* Header */}
      <div className="srch-hdr">
        <button className="pg-back" onClick={onBack} id="btn-srch-back">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" width="20" height="20"><polyline points="15 18 9 12 15 6"/></svg>
        </button>
        <div className="pg-search srch-bar">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
          </svg>
          <input autoFocus type="text" placeholder="Search for food stalls or dishes..." value={q} onChange={e => setQ(e.target.value)} id="srch-input" />
          {q && (
            <button type="button" onClick={() => setQ('')} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 4 }}>
              <svg viewBox="0 0 24 24" fill="none" stroke="#ADB5BD" strokeWidth="2.5" width="16" height="16">
                <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
              </svg>
            </button>
          )}
        </div>
      </div>

      <div className="srch-body">
        {/* Search Results */}
        {q.trim() !== '' && (
          <div className="srch-sec">
            <p className="srch-sec-title">
              Search Results 
              <span style={{ color: '#868E96', fontWeight: 500, fontSize: 12, marginLeft: 6 }}>
                ({matchedStalls.length + matchedFoods.length} found)
              </span>
            </p>
            
            {matchedStalls.length === 0 && matchedFoods.length === 0 && (
              <div style={{ textAlign: 'center', padding: '24px', color: '#868E96' }}>
                <span style={{ fontSize: 40, display: 'block', marginBottom: 8 }}>🔍</span>
                <p style={{ fontWeight: 700, margin: '0 0 4px' }}>No results found for "{q}"</p>
                <p style={{ fontSize: 12, margin: 0 }}>Try searching for stall names or food items</p>
              </div>
            )}

            {/* Stalls results */}
            {matchedStalls.map(s => (
              <div key={`stall-${s.id}`} className="srch-row" onClick={() => onRestaurant(s)} id={`srch-rest-${s.id}`} style={{ borderBottom: '1px solid #F1F3F5', padding: '12px 0' }}>
                <div className="srch-img-wrap" style={{ fontSize: 24, display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#FFF0F1' }}>
                  {(s.logo?.startsWith('http') || s.logo?.startsWith('data:')) ? (
                    <img src={s.logo} alt="logo" style={{width: '100%', height: '100%', objectFit: 'cover', borderRadius: 'inherit'}} />
                  ) : (
                    s.logo || '🏪'
                  )}
                </div>
                <div className="srch-info">
                  <p className="srch-name">{s.stall_name}</p>
                  <p className="srch-tag">Stall · {s.category} · {s.delivery_time}</p>
                </div>
                <svg viewBox="0 0 24 24" fill="none" stroke="#CED4DA" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" width="16" height="16">
                  <polyline points="9 18 15 12 9 6"/>
                </svg>
              </div>
            ))}

            {/* Food results */}
            {matchedFoods.map(f => {
              const stall = activeStalls.find(s => s.id === f.stall_id)
              return (
                <div key={`food-${f.id}`} className="srch-row" onClick={() => onRestaurant(stall)} id={`srch-food-${f.id}`} style={{ borderBottom: '1px solid #F1F3F5', padding: '12px 0' }}>
                  <div className="srch-img-wrap" style={{ fontSize: 24, display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#F8F9FA', overflow: 'hidden' }}>
                    {(f.image?.startsWith('http') || f.image?.startsWith('data:')) ? (
                      <img src={f.image} alt="food" style={{width: '100%', height: '100%', objectFit: 'cover'}} />
                    ) : (
                      f.image || '🍔'
                    )}
                  </div>
                  <div className="srch-info">
                    <p className="srch-name">{f.food_name}</p>
                    <p className="srch-tag">₱{f.price} · from {stall?.stall_name}</p>
                  </div>
                  <svg viewBox="0 0 24 24" fill="none" stroke="#CED4DA" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" width="16" height="16">
                    <polyline points="9 18 15 12 9 6"/>
                  </svg>
                </div>
              )
            })}
          </div>
        )}

        {/* Popular Cuisines — now matches real stall categories */}
        <div className="srch-sec">
          <p className="srch-sec-title">Popular Categories</p>
          <div className="pg-hscroll" style={{ display: 'flex', gap: 10 }}>
            {CUISINES.map(c => (
              <button key={c.label} className="cuisine-chip" onClick={() => setQ(c.label)} id={`cuisine-${c.label.toLowerCase().replace(' ','-')}`} style={{ background: 'white', border: '1px solid #ECEFF1', borderRadius: '12px', padding: '8px 12px', display: 'flex', alignItems: 'center', gap: 6, cursor: 'pointer', fontFamily: 'inherit' }}>
                <span className="cuisine-bubble">{c.emoji}</span>
                <span className="cuisine-lbl" style={{ fontSize: 13, fontWeight: 600 }}>{c.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Active Stalls Directory */}
        <div className="srch-sec">
          <p className="srch-sec-title">Food Stalls Directory</p>
          <div className="srch-list">
            {activeStalls.map(s => (
              <div key={s.id} className="srch-row" onClick={() => onRestaurant(s)} id={`srch-rest-${s.id}`}>
                <div className="srch-img-wrap" style={{ fontSize: 24, display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#FFF0F1' }}>
                  {(s.logo?.startsWith('http') || s.logo?.startsWith('data:')) ? (
                    <img src={s.logo} alt="logo" style={{width: '100%', height: '100%', objectFit: 'cover', borderRadius: 'inherit'}} />
                  ) : (
                    s.logo || '🏪'
                  )}
                </div>
                <div className="srch-info">
                  <p className="srch-name">{s.stall_name}</p>
                  <p className="srch-tag">{s.category} · {s.hours}</p>
                </div>
                <svg viewBox="0 0 24 24" fill="none" stroke="#CED4DA" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" width="16" height="16" style={{ flexShrink: 0 }}>
                  <polyline points="9 18 15 12 9 6"/>
                </svg>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
