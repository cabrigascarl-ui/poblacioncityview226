import { useState } from 'react'
import './Account.css'

/* ── Icons ── */
const IcoPin   = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
       strokeLinecap="round" strokeLinejoin="round" width="18" height="18">
    <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/>
    <circle cx="12" cy="10" r="3"/>
  </svg>
)
const IcoHelp  = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
       strokeLinecap="round" strokeLinejoin="round" width="18" height="18">
    <circle cx="12" cy="12" r="10"/>
    <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"/>
    <line x1="12" y1="17" x2="12.01" y2="17"/>
  </svg>
)
const IcoEdit  = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2"
       strokeLinecap="round" strokeLinejoin="round" width="14" height="14">
    <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
    <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
  </svg>
)
const IcoLogout = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2"
       strokeLinecap="round" strokeLinejoin="round" width="18" height="18">
    <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
    <polyline points="16 17 21 12 16 7"/>
    <line x1="21" y1="12" x2="9" y2="12"/>
  </svg>
)
const IcoChevron = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"
       strokeLinecap="round" strokeLinejoin="round" width="14" height="14">
    <polyline points="9 18 15 12 9 6"/>
  </svg>
)
const IcoSave = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2"
       strokeLinecap="round" strokeLinejoin="round" width="16" height="16">
    <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"/>
    <polyline points="17 21 17 13 7 13 7 21"/>
    <polyline points="7 3 7 8 15 8"/>
  </svg>
)
const IcoClose = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"
       strokeLinecap="round" strokeLinejoin="round" width="15" height="15">
    <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
  </svg>
)

export default function Account({ onLogout, currentCustomer, onUpdateProfile, orders = [] }) {
  const [isEditing, setIsEditing] = useState(false)
  const [showSupport, setShowSupport] = useState(false)
  const [name,    setName]    = useState(currentCustomer?.fullname || '')
  const [phone,   setPhone]   = useState(currentCustomer?.phone   || '')
  const [address, setAddress] = useState(currentCustomer?.address || '')

  const myOrders = orders.filter(o => o.customer_id === currentCustomer?.id)
  const delivered = myOrders.filter(o => o.status === 'Delivered').length
  const initials  = (currentCustomer?.fullname || 'C').split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase()

  const handleSave = () => {
    onUpdateProfile?.({ ...currentCustomer, fullname: name, phone, address })
    setIsEditing(false)
  }
  const handleCancel = () => {
    setName(currentCustomer?.fullname || '')
    setPhone(currentCustomer?.phone   || '')
    setAddress(currentCustomer?.address || '')
    setIsEditing(false)
  }

  return (
    <div className="acct">

      {/* ── Header ── */}
      <div className="acct-hdr">
        <h1 className="acct-title">My Profile</h1>
        {!isEditing && (
          <button className="acct-hdr-edit" onClick={() => setIsEditing(true)} id="btn-acct-edit">
            <IcoEdit /> Edit
          </button>
        )}
      </div>

      <div className="acct-body">

        {/* ── Hero Card ── */}
        <div className="profile-card fade-up">
          {/* Ambient blob */}
          <div className="profile-blob" />

          <div className="profile-avatar-wrap">
            <div className="profile-avatar">
              <span>{initials}</span>
            </div>
            {!isEditing && (
              <button className="avatar-edit-btn" onClick={() => setIsEditing(true)} aria-label="Edit profile">
                <IcoEdit />
              </button>
            )}
          </div>

          {!isEditing ? (
            <div className="profile-view">
              <p className="profile-name">{currentCustomer?.fullname}</p>

              <div className="profile-meta-row">
                <span className="profile-meta-ico">📞</span>
                <span className="profile-meta-txt">{currentCustomer?.phone || 'No phone'}</span>
              </div>

              <div className="profile-meta-row">
                <span className="profile-meta-ico">📍</span>
                <span className="profile-meta-txt addr">{currentCustomer?.address || 'No address set'}</span>
              </div>

              {/* Stats Bar */}
              <div className="profile-stats">
                <div className="profile-stat">
                  <span className="stat-num">{myOrders.length}</span>
                  <span className="stat-lbl">Total Orders</span>
                </div>
                <div className="stat-divider" />
                <div className="profile-stat">
                  <span className="stat-num">{delivered}</span>
                  <span className="stat-lbl">Completed</span>
                </div>
                <div className="stat-divider" />
                <div className="profile-stat">
                  <span className="stat-num">{myOrders.length - delivered}</span>
                  <span className="stat-lbl">Active</span>
                </div>
              </div>

              <button className="edit-profile-btn" onClick={() => setIsEditing(true)} id="btn-edit-profile">
                Edit Profile Info
              </button>
            </div>
          ) : (
            <div className="profile-edit-form">
              <p className="edit-form-title">Edit Your Info</p>

              <div className="edit-field">
                <label className="edit-label">Full Name</label>
                <input
                  className="edit-input"
                  type="text"
                  value={name}
                  placeholder="Your full name"
                  onChange={e => setName(e.target.value)}
                  id="input-name"
                />
              </div>

              <div className="edit-field">
                <label className="edit-label">Phone Number</label>
                <input
                  className="edit-input"
                  type="tel"
                  value={phone}
                  placeholder="09XXXXXXXXX"
                  onChange={e => setPhone(e.target.value)}
                  id="input-phone"
                />
              </div>

              <div className="edit-field">
                <label className="edit-label">Delivery Address</label>
                <input
                  className="edit-input"
                  type="text"
                  value={address}
                  placeholder="Your address"
                  onChange={e => setAddress(e.target.value)}
                  id="input-address"
                />
              </div>

              <div className="edit-actions">
                <button className="pg-btn edit-save-btn" onClick={handleSave} id="btn-save-profile">
                  <IcoSave /> Save Changes
                </button>
                <button className="edit-cancel-btn" onClick={handleCancel} id="btn-cancel-edit">
                  <IcoClose /> Cancel
                </button>
              </div>
            </div>
          )}
        </div>

        {/* ── Menu Section ── */}
        <div className="acct-section fade-up stagger-2">
          <p className="acct-section-label">Account</p>
          <div className="acct-menu-group">
            <button className="acct-menu-item" id="btn-default-addr" onClick={() => {
              setIsEditing(true);
              setTimeout(() => document.getElementById('input-address')?.focus(), 100);
            }}>
              <span className="menu-ico-wrap" style={{ background: 'var(--amber-bg)', color: 'var(--amber)' }}>
                <IcoPin />
              </span>
              <div className="menu-text">
                <p className="menu-lbl">Default Address</p>
                <p className="menu-sub-txt">{currentCustomer?.address || 'Not set'}</p>
              </div>
              <span className="menu-chevron"><IcoChevron /></span>
            </button>

            <div className="menu-divider" />

            <button className="acct-menu-item" id="btn-support" onClick={() => setShowSupport(true)}>
              <span className="menu-ico-wrap" style={{ background: 'var(--blue-bg)', color: 'var(--blue)' }}>
                <IcoHelp />
              </span>
              <div className="menu-text">
                <p className="menu-lbl">Support Center</p>
                <p className="menu-sub-txt">Get help with your food court orders</p>
              </div>
              <span className="menu-chevron"><IcoChevron /></span>
            </button>
          </div>
        </div>

        {/* ── Logout ── */}
        <div className="acct-section fade-up stagger-3">
          <button className="logout-btn" onClick={onLogout} id="btn-logout">
            <IcoLogout />
            Log Out
          </button>
        </div>
      </div>

      {/* ── Support Center Modal ── */}
      {showSupport && (
        <div className="support-modal-overlay">
          <div className="support-modal">
            <div className="support-header">
              <h2 className="support-title">Support Center</h2>
              <button className="support-close-btn" onClick={() => setShowSupport(false)}>
                <IcoClose />
              </button>
            </div>
            <div className="support-body">
              <div className="support-hero">
                <h3>Hi {currentCustomer?.fullname?.split(' ')[0] || 'there'}, how can we help?</h3>
                <p>Find answers to common questions below.</p>
              </div>
              <div className="support-faq-list">
                <div className="support-faq">
                  <h4>Where is my order?</h4>
                  <p>Check the "Orders" tab at the bottom of the screen to track your active deliveries in real-time.</p>
                </div>
                <div className="support-faq">
                  <h4>How to cancel an order?</h4>
                  <p>Orders can only be cancelled while in "Pending" status. Contact the stall immediately if needed.</p>
                </div>
                <div className="support-faq">
                  <h4>Payment or refund issues?</h4>
                  <p>If you were charged incorrectly for an unfulfilled order, our team will process a refund within 24 hours.</p>
                </div>
              </div>
              <button className="support-contact-btn" onClick={() => {
                alert("Live Chat support will be available soon!");
                setShowSupport(false);
              }}>
                💬 Chat with Support
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
