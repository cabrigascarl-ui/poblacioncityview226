import { useState } from 'react'
import './Favorites.css'

const RESTAURANTS = [
  { id: 1, name: 'Jollibee', img: '/jollibee.png', tag: 'PP · Fast Food', rating: '4.6', reviews: '1.2k', time: '25–35 min', dist: '1.2 km' },
  { id: 2, name: 'Mang Inasal', img: '/manginasal.png', tag: '♦ Filipino', rating: '4.7', reviews: '849', time: '25–35 min', dist: '1.4 km' },
  { id: 3, name: 'KFC', img: '/kfc.png', tag: '♦ Chicken', rating: '4.3', reviews: '760', time: '20–30 min', dist: '1.3 km' },
  { id: 4, name: 'Chowking', img: '/chowking.png', tag: '♦ Chinese', rating: '4.3', reviews: '829', time: '25–35 min', dist: '1.6 km' },
]

export default function Favorites({ onRestaurant }) {
  const [tab, setTab] = useState('restaurants')
  return (
    <div className="fav">
      <div className="fav-hdr">
        <h1 className="fav-title">Favorites</h1>
      </div>
      <div className="fav-tabs">
        {['restaurants','dishes'].map(t => (
          <button key={t} className={`fav-tab ${tab===t?'active':''}`} onClick={() => setTab(t)} id={`fav-tab-${t}`}>
            {t[0].toUpperCase()+t.slice(1)}
          </button>
        ))}
      </div>
      <div className="fav-list">
        {tab === 'restaurants' && RESTAURANTS.map(r => (
          <div key={r.id} className="fav-row" onClick={onRestaurant} id={`fav-${r.id}`}>
            <img src={r.img} alt={r.name} className="fav-img" />
            <div className="fav-info">
              <p className="fav-name">{r.name}</p>
              <p className="fav-tag">{r.tag}</p>
              <div className="pg-rating" style={{ marginTop: 3 }}>
                <span className="pg-star">★</span>
                <span>{r.rating} ({r.reviews}) · {r.time} · {r.dist}</span>
              </div>
            </div>
            <button className="heart-btn" id={`heart-${r.id}`}>
              <svg viewBox="0 0 24 24" fill="#E8001C" stroke="#E8001C" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" width="20" height="20">
                <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
              </svg>
            </button>
          </div>
        ))}
        {tab === 'dishes' && (
          <div className="fav-empty"><span style={{fontSize:36}}>🍽️</span><p>No favourite dishes yet</p></div>
        )}
      </div>
    </div>
  )
}
