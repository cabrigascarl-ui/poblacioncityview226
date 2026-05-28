import { useState } from 'react'
import './Orders.css'

const ClockIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" width="13" height="13">
    <circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>
  </svg>
)

export default function Orders({ onTrack, orders = [], stalls = [], currentCustomer }) {
  const [tab, setTab] = useState('active')

  const customerOrders = orders.filter(o => o.customer_id === currentCustomer?.id)
  const activeOrders = customerOrders.filter(o => o.status !== 'Delivered' && o.status !== 'Cancelled')
  const completedOrders = customerOrders.filter(o => o.status === 'Delivered')
  const cancelledOrders = customerOrders.filter(o => o.status === 'Cancelled')

  const tabCounts = { active: activeOrders.length, completed: completedOrders.length, cancelled: cancelledOrders.length }

  const getStallInfo = (stallId) => stalls.find(s => s.id === stallId) || { stall_name: 'PoblaGo Stall', logo: '🏪' }

  const statusColors = {
    'Pending':            { color: '#E65100', bg: '#FFF3E0' },
    'Preparing':          { color: '#F59E0B', bg: '#FEF3C7' },
    'Ready for Delivery': { color: '#3B82F6', bg: '#DBEAFE' },
    'Delivering':         { color: '#7E22CE', bg: '#E9D5FF' },
    'Delivered':          { color: '#10B981', bg: '#D1FAE5' },
    'Cancelled':          { color: '#EF4444', bg: '#FEE2E2' },
  }

  const renderOrderList = (list) => {
    if (list.length === 0) {
      return (
        <div className="ord-empty">
          <div className="ord-empty-icon">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" width="48" height="48">
              <path d="M9 5H7a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2h-2"/>
              <rect x="9" y="3" width="6" height="4" rx="2"/>
              <line x1="9" y1="12" x2="15" y2="12"/><line x1="9" y1="16" x2="13" y2="16"/>
            </svg>
          </div>
          <p className="ord-empty-title">No orders here</p>
          <p className="ord-empty-sub">Your {tab} orders will appear here</p>
        </div>
      )
    }

    return list.map((o, idx) => {
      const stall = getStallInfo(o.stall_id)
      const sc = statusColors[o.status] || { color: '#6B7280', bg: '#F3F4F6' }

      return (
        <div key={o.id} className="ord-card" id={`ord-${o.id}`}
             style={{ animationDelay: `${0.06 * idx}s` }}>
          <div className="ord-card-top">
            <div className="ord-stall-logo">
              {(stall.logo?.startsWith('http') || stall.logo?.startsWith('data:')) ? (
                <img src={stall.logo} alt="logo" style={{width: '100%', height: '100%', objectFit: 'cover', borderRadius: 'inherit'}} />
              ) : (
                stall.logo
              )}
            </div>
            <div className="ord-store-info">
              <p className="ord-store">{stall.stall_name}</p>
              <p className="ord-num">Order #{o.id}</p>
              <span className="ord-status-pill" style={{ color: sc.color, background: sc.bg }}>
                {o.status}
              </span>
            </div>
          </div>

          <div className="ord-details-block">
            <p className="ord-items-line">
              <span className="ord-detail-label">Items:</span> {o.items}
            </p>
            <p className="ord-detail-line">
              <span className="ord-detail-label">Payment:</span> {o.payment_method}
            </p>
            {o.notes && (
              <p className="ord-detail-line">
                <span className="ord-detail-label">Notes:</span> {o.notes}
              </p>
            )}
          </div>

          <div className="ord-card-foot">
            <span className="ord-total">₱{o.total_price}.00</span>
            {o.status !== 'Delivered' && o.status !== 'Cancelled' ? (
              <button className="ord-view-btn" onClick={() => onTrack(o)} id={`btn-view-${o.id}`}>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" width="13" height="13">
                  <circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>
                </svg>
                Track Order
              </button>
            ) : (
              <span className="ord-done-label">
                {o.status === 'Delivered' ? '✓ Done' : '✕ Cancelled'}
              </span>
            )}
          </div>
        </div>
      )
    })
  }

  return (
    <div className="ord">
      <div className="ord-hdr">
        <h1 className="ord-title">My Orders</h1>
        <span className="ord-count-badge">{customerOrders.length} total</span>
      </div>

      <div className="ord-tabs">
        {['active', 'completed', 'cancelled'].map(t => (
          <button key={t} className={`ord-tab ${tab === t ? 'active' : ''}`}
            onClick={() => setTab(t)} id={`tab-${t}`}>
            {t === 'active' ? 'Active' : t === 'completed' ? 'Completed' : 'Cancelled'}
            {tabCounts[t] > 0 && <span className="ord-tab-count">{tabCounts[t]}</span>}
          </button>
        ))}
      </div>

      <div className="ord-body">
        {tab === 'active' && renderOrderList(activeOrders)}
        {tab === 'completed' && renderOrderList(completedOrders)}
        {tab === 'cancelled' && renderOrderList(cancelledOrders)}
      </div>
    </div>
  )
}
