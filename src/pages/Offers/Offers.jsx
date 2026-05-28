import './Offers.css'

export default function Offers({ promotions }) {
  return (
    <div className="off">
      <div className="off-hdr">
        <h1 className="off-title">Offers & Promos</h1>
        <span className="off-badge">Latest Announcements</span>
      </div>

      <div className="off-scroll">
        {/* Promos Cards list */}
        <div className="off-cards">
          <div className="off-promo-card">
            <div className="off-promo-icon">🏷️</div>
            <div className="off-promo-content">
              <p className="off-promo-title">Free Delivery Promo</p>
              <p className="off-promo-desc">Get free delivery on all orders ₱199 and above from Jollibee, McDonald's, and all active stalls! Use code: <strong>POBLAGO</strong></p>
              <div className="off-promo-footer">
                <span className="off-promo-tag">Active</span>
                <span className="off-promo-expiry">Expires in 3 days</span>
              </div>
            </div>
          </div>

          <div className="off-promo-card">
            <div className="off-promo-icon">✨</div>
            <div className="off-promo-content">
              <p className="off-promo-title">Welcome Discount</p>
              <p className="off-promo-desc">New to PoblaGo? Enjoy 15% off your first 3 food court orders. No minimum spend required!</p>
              <div className="off-promo-footer">
                <span className="off-promo-tag">New User</span>
                <span className="off-promo-expiry">Limited Time Only</span>
              </div>
            </div>
          </div>
        </div>

        {/* Announcements list directly from Admin */}
        <h2 className="off-sub-title">Admin Announcements</h2>
        <div className="off-announcements">
          {promotions.map((p, index) => (
            <div key={p.id || index} className="off-ann-row">
              <div className="off-ann-dot" />
              <div className="off-ann-body">
                <p className="off-ann-msg">{p.msg}</p>
                <p className="off-ann-time">{p.time}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
