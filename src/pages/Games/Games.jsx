import { useState, useEffect } from 'react';
import './Games.css';
import pickleballBg from '../../assets/pickleball_bg.png';

export default function Games({ currentCustomer, promotions = [], initialView = 'home' }) {
  const [view, setView] = useState(initialView);
  const [selectedCourt, setSelectedCourt] = useState(null);
  const [selectedDate, setSelectedDate] = useState(null);
  const [selectedTime, setSelectedTime] = useState(null);
  const [selectedPayment, setSelectedPayment] = useState(null);

  // --- Shared Reservations State (lifted) ---
  const fmtDate = (d) => d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  const makeDate = (daysFromNow) => {
    const d = new Date();
    d.setDate(d.getDate() + daysFromNow);
    return d;
  };

  const [reservations, setReservations] = useState([]);

  const addReservation = (res) => setReservations(prev => [res, ...prev]);

  // --- Court Prices (managed by Game Manager) ---
  const [courtPrices, setCourtPrices] = useState({
    morningRate: 200,   // 5AM - 11AM
    afternoonRate: 280, // 3PM - 7PM
    openPlayRate: 150,  // Open Play per person
    courtName1: 'Court 1',
    courtName2: 'Court 2',
    openHour: 5,        // courts open at 5 AM
    closeHour: 19,      // courts close at 7 PM
    maxPlayersOpenPlay: 24,
    notes: '',
  });

  const mockCourts = [
    { id: 1, name: "Poblacion Pickle Hub", location: "Poblacion City View", rating: 4.9, reviews: 129, price: 400, type: "Indoor", available: true },
    { id: 2, name: "Ace Pickleball Center", location: "Rizal Avenue, Poblacion", rating: 4.8, reviews: 76, price: 450, type: "Outdoor", available: true },
    { id: 3, name: "The Pickle Yard", location: "JP Laurel Street", rating: 4.7, reviews: 55, price: 350, type: "Indoor", available: true },
  ];

  const renderView = () => {
    switch (view) {
      case 'home':
        return <GamesHome setView={setView} promotions={promotions} />;
      case 'court-rental':
        return <CourtRental setView={setView} courts={mockCourts} onSelect={(c) => { setSelectedCourt(c); setView('court-details'); }} />;
      case 'court-details':
        return <CourtDetails setView={setView} court={selectedCourt} onNext={() => setView('select-date')} />;
      case 'select-date':
        return <SelectDate setView={setView} onNext={(d) => { setSelectedDate(d); setView('select-time'); }} />;
      case 'select-time':
        return <SelectTime setView={setView} onNext={(t) => { setSelectedTime(t); setView('booking-summary'); }} />;
      case 'booking-summary':
        return <BookingSummary setView={setView} court={selectedCourt} date={selectedDate} time={selectedTime} onNext={() => setView('payment')} />;
      case 'payment':
        return <Payment setView={setView} onNext={(p) => { setSelectedPayment(p); setView('confirmation'); }} />;
      case 'confirmation':
        return <Confirmation setView={setView} court={selectedCourt} date={selectedDate} time={selectedTime} />;
      case 'my-reservations':
        return <MyReservations setView={setView} reservations={reservations} currentCustomer={currentCustomer} />;
      case 'open-play':
        return <OpenPlay setView={setView} reservations={reservations} addReservation={addReservation} currentCustomer={currentCustomer} />;
      case 'reservation-details':
        return <ReservationDetails setView={setView} court={selectedCourt || mockCourts[0]} />;
      case 'booking-hub':
        return <BookingHub setView={setView} addReservation={addReservation} currentCustomer={currentCustomer} courtPrices={courtPrices} reservations={reservations} />;
      case 'admin':
        return <AdminReservations setView={setView} reservations={reservations} setReservations={setReservations} courtPrices={courtPrices} setCourtPrices={setCourtPrices} />;
      default:
        return <GamesHome setView={setView} promotions={promotions} />;
    }
  };

  return (
    <div className="games-page-container">
      {renderView()}
    </div>
  );
}

// --- Subcomponents ---

function GamesHome({ setView, promotions = [] }) {
  const customBanners = promotions.filter(p => p.imageUrl && p.target === 'Games');
  const slide = customBanners.length > 0 ? customBanners[0] : { isDefault: true };

  return (
    <div className="games-view">
      <div className="games-header" style={{ marginBottom: 24 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <h1 style={{ fontSize: 24, fontWeight: 800, margin: '0 0 4px', color: '#1A1A1A' }}>Games & Activities</h1>
            <p style={{ fontSize: 14, color: '#666', margin: 0 }}>Book your court and play!</p>
          </div>
          <button 
            onClick={() => setView('admin')} 
            style={{ background: '#f0f0f0', border: 'none', padding: '8px 12px', borderRadius: 8, fontSize: 12, fontWeight: 600, cursor: 'pointer', color: '#333' }}
          >
            Admin View
          </button>
        </div>
      </div>
      
      <div className="games-banner-slider" style={{ position: 'relative', overflow: 'hidden' }}>
        <div className="games-banner-tracks" style={{ display: 'flex', height: '100%' }}>
          <div className="games-banner-slide" style={{ minWidth: '100%', position: 'relative' }}>
            {slide.isDefault ? (
              <>
                <img src={pickleballBg} alt="Pickleball Background" style={{ width: '100%', height: '100%', objectFit: 'cover', position: 'absolute', inset: 0, borderRadius: 16 }} />
                <div className="games-banner-overlay" style={{ background: 'linear-gradient(to right, rgba(198,0,0,0.85) 0%, rgba(198,0,0,0.4) 100%)', borderRadius: 16, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                  <h2 className="games-banner-title">PLAY.<br/>RESERVE.<br/>COMPETE.</h2>
                  <p className="games-banner-sub">Book your pickleball court<br/>in seconds!</p>
                  <button className="games-banner-btn" onClick={() => setView('booking-hub')} style={{ marginTop: 12, alignSelf: 'flex-start' }}>Book a Court &rarr;</button>
                </div>
              </>
            ) : (
              <>
                <img src={slide.imageUrl} alt="Promo" style={{ width: '100%', height: '100%', objectFit: 'cover', position: 'absolute', inset: 0, borderRadius: 16 }} />
                <div className="games-banner-overlay" style={{ background: 'linear-gradient(to right, rgba(198,0,0,0.85) 0%, rgba(198,0,0,0.4) 100%)', borderRadius: 16, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                  {slide.pretitle && <p style={{ color: '#fff', fontSize: 12, fontWeight: 700, margin: '0 0 4px', textTransform: 'uppercase', letterSpacing: 1 }}>{slide.pretitle}</p>}
                  
                  {slide.title ? (
                    <h2 className="games-banner-title" style={{ fontSize: 24, lineHeight: 1.1, marginBottom: 8 }}>{slide.title}</h2>
                  ) : (
                    <h2 className="games-banner-title">PLAY.<br/>RESERVE.<br/>COMPETE.</h2>
                  )}

                  {slide.msg ? (
                    <p className="games-banner-sub" style={{ opacity: 0.9, marginTop: 0 }}>{slide.msg}</p>
                  ) : (
                    <p className="games-banner-sub">Book your pickleball court<br/>in seconds!</p>
                  )}

                  <button className="games-banner-btn" onClick={() => setView('booking-hub')} style={{ marginTop: 12, alignSelf: 'flex-start' }}>{slide.title ? 'Check it out' : 'Book a Court'} &rarr;</button>
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      <div className="games-categories">
        <div className="category-item" onClick={() => setView('booking-hub')}>
          <div className="cat-icon" style={{background: '#ffe5e5', color: '#c60000'}}>🎾</div>
          <span>Court Rental</span>
        </div>
        <div className="category-item" onClick={() => setView('booking-hub')}>
          <div className="cat-icon" style={{background: '#fff0e5', color: '#ff6b00'}}>🏓</div>
          <span>Open Play</span>
        </div>
        <div className="category-item" onClick={() => setView('my-reservations')}>
          <div className="cat-icon" style={{background: '#f0e5ff', color: '#8a2be2'}}>📅</div>
          <span>Reservations</span>
        </div>
      </div>

    </div>
  );
}

function CourtRental({ setView, courts, onSelect }) {
  return (
    <div className="games-view">
      <div className="view-header">
        <button className="back-btn" onClick={() => setView('home')}>&larr;</button>
        <h2>Court Rental</h2>
        <div style={{width: 24}}></div>
      </div>

      <div className="filter-tabs">
        <button className="tab active">All Courts</button>
        <button className="tab">Indoor</button>
        <button className="tab">Outdoor</button>
      </div>

      <div className="court-list">
        {courts.map(court => (
          <div key={court.id} className="court-card" onClick={() => onSelect(court)}>
            <div className="court-img-placeholder" style={{background: '#e0e0e0', height: 140}}></div>
            <div className="court-info">
              <div className="court-title-row">
                <h4>{court.name}</h4>
                <span className="badge-available">Available</span>
              </div>
              <p className="court-location">{court.location}</p>
              <div className="court-bottom-row">
                <span className="court-rating">★ {court.rating} ({court.reviews})</span>
                <span className="court-price">₱{court.price} / hour</span>
              </div>
              <button className="btn-book-now" onClick={(e) => { e.stopPropagation(); onSelect(court); }}>Book Now</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function CourtDetails({ setView, court, onNext }) {
  if (!court) return null;
  return (
    <div className="games-view no-padding">
      <div className="court-hero">
        <button className="back-btn hero-back" onClick={() => setView('court-rental')}>&larr;</button>
      </div>
      <div className="court-details-body">
        <div className="court-title-row">
          <h2>{court.name}</h2>
          <span className="badge-available">Available</span>
        </div>
        <p className="court-location">{court.location}</p>
        <div className="court-rating-price">
          <span className="court-rating">★ {court.rating} ({court.reviews} reviews)</span>
          <span className="court-price">₱{court.price} / hour</span>
        </div>

        <div className="court-features">
          <div className="feature"><div className="icon">🏠</div><span>Indoor Court</span></div>
          <div className="feature"><div className="icon">👥</div><span>Capacity 4-6</span></div>
          <div className="feature"><div className="icon">💡</div><span>Lighting</span></div>
          <div className="feature"><div className="icon">🛋️</div><span>Rest Area</span></div>
        </div>

        <div className="court-section">
          <h3>About This Court</h3>
          <p className="court-desc">Premium indoor pickleball court with professional flooring, lighting, and seating area for players and spectators.</p>
        </div>

        <div className="court-section" style={{marginBottom: 80}}>
          <h3>Amenities</h3>
          <ul className="amenities-list">
            <li>✓ Restrooms</li>
            <li>✓ Equipment Rental</li>
            <li>✓ Parking Area</li>
            <li>✓ Shower Room</li>
            <li>✓ Water Station</li>
          </ul>
        </div>
      </div>
      <div className="fixed-bottom-bar">
        <button className="btn-primary full" onClick={onNext}>Select Date & Time</button>
      </div>
    </div>
  );
}

function SelectDate({ setView, onNext }) {
  return (
    <div className="games-view">
      <div className="view-header">
        <button className="back-btn" onClick={() => setView('court-details')}>&larr;</button>
        <h2>Select Date</h2>
        <div style={{width: 24}}></div>
      </div>
      
      <div className="calendar-placeholder">
        <h3>May 2024</h3>
        <div className="calendar-grid">
          {['Mon','Tue','Wed','Thu','Fri','Sat','Sun'].map(d => <div key={d} className="cal-day-name">{d}</div>)}
          {Array.from({length: 31}).map((_, i) => (
            <div key={i} className={`cal-day ${i+1 === 24 ? 'selected' : ''}`}>{i+1}</div>
          ))}
        </div>
      </div>

      <div className="selected-date-info">
        <p style={{fontSize: 14, color: '#666', marginBottom: 4}}>Selected Date</p>
        <h4 style={{fontSize: 18, fontWeight: 700, margin: 0}}>Friday, May 24, 2024</h4>
      </div>

      <div className="popular-times" style={{marginTop: 24}}>
        <p style={{fontSize: 14, color: '#666', marginBottom: 12}}>Popular Times</p>
        <div className="time-chips">
          <span className="time-chip">7 AM - 9 AM</span>
          <span className="time-chip active">5 PM - 7 PM</span>
          <span className="time-chip">7 PM - 9 PM</span>
        </div>
      </div>

      <div className="fixed-bottom-bar">
        <button className="btn-primary full" onClick={() => onNext('May 24, 2024 (Fri)')}>Continue</button>
      </div>
    </div>
  );
}

function SelectTime({ setView, onNext }) {
  const times = [
    { time: '6:00 AM - 7:00 AM', status: 'Available' },
    { time: '7:00 AM - 8:00 AM', status: 'Available' },
    { time: '8:00 AM - 9:00 AM', status: 'Reserved' },
    { time: '9:00 AM - 10:00 AM', status: 'Available' },
    { time: '10:00 AM - 11:00 AM', status: 'Available' },
    { time: '11:00 AM - 12:00 PM', status: 'Ongoing' },
    { time: '12:00 PM - 1:00 PM', status: 'Available' },
    { time: '1:00 PM - 2:00 PM', status: 'Reserved' },
    { time: '7:00 PM - 8:00 PM', status: 'Available' }
  ];

  const [sel, setSel] = useState('7:00 PM - 8:00 PM');

  return (
    <div className="games-view" style={{paddingBottom: 80}}>
      <div className="view-header">
        <button className="back-btn" onClick={() => setView('select-date')}>&larr;</button>
        <h2>Select Time Slot</h2>
        <div style={{width: 24}}></div>
      </div>

      <div className="time-legend">
        <span><div className="dot green"></div> Available</span>
        <span><div className="dot yellow"></div> Ongoing</span>
        <span><div className="dot red"></div> Reserved</span>
      </div>

      <div className="time-slots">
        {times.map((t, i) => (
          <div 
            key={i} 
            className={`time-slot ${t.status.toLowerCase()} ${sel === t.time && t.status === 'Available' ? 'selected' : ''}`}
            onClick={() => t.status === 'Available' && setSel(t.time)}
          >
            <span className="time-label">{t.time}</span>
            <span className="status-label">{t.status}</span>
          </div>
        ))}
      </div>

      <div className="fixed-bottom-bar">
        <button className="btn-primary full" onClick={() => onNext(sel)} disabled={!sel}>Continue</button>
      </div>
    </div>
  );
}

function BookingSummary({ setView, court, date, time, onNext }) {
  if (!court) return null;
  return (
    <div className="games-view" style={{paddingBottom: 80}}>
      <div className="view-header">
        <button className="back-btn" onClick={() => setView('select-time')}>&larr;</button>
        <h2>Booking Summary</h2>
        <div style={{width: 24}}></div>
      </div>

      <div className="summary-court-card">
        <div className="scc-img" style={{background: '#e0e0e0'}}></div>
        <div className="scc-info">
          <h4>{court.name}</h4>
          <p>{court.type} Court</p>
        </div>
      </div>

      <div className="booking-details-box">
        <h3>Booking Details</h3>
        <div className="bd-row"><span>Date</span><span>{date || 'Friday, May 24, 2024'}</span></div>
        <div className="bd-row"><span>Time</span><span>{time || '7:00 PM - 8:00 PM'}</span></div>
        <div className="bd-row"><span>Duration</span><span>1 Hour</span></div>
        <div className="bd-row"><span>Players</span><span>4 Players</span></div>
        <div className="bd-row"><span>Price per Hour</span><span>₱{court.price}</span></div>
        
        <div className="divider"></div>
        <div className="bd-row"><span>Subtotal</span><span>₱{court.price}</span></div>
        <div className="bd-row"><span>Service Fee</span><span>₱20</span></div>
        
        <div className="divider"></div>
        <div className="bd-row total"><span>Total</span><span className="price">₱{court.price + 20}</span></div>
      </div>

      <p className="cancellation-policy">You can cancel or reschedule up to 2 hours before your booking.</p>

      <div className="fixed-bottom-bar">
        <button className="btn-primary full" onClick={onNext}>Continue to Payment</button>
      </div>
    </div>
  );
}

function Payment({ setView, onNext }) {
  const [method, setMethod] = useState('gcash');
  return (
    <div className="games-view" style={{paddingBottom: 120}}>
      <div className="view-header">
        <button className="back-btn" onClick={() => setView('booking-summary')}>&larr;</button>
        <h2>Payment Method</h2>
        <div style={{width: 24}}></div>
      </div>

      <h3 className="section-title">Choose Payment Method</h3>
      <div className="payment-methods">
        <label className={`pm-option ${method === 'gcash' ? 'selected' : ''}`}>
          <input type="radio" name="payment" checked={method === 'gcash'} onChange={() => setMethod('gcash')} style={{accentColor: '#C60000'}} />
          <div className="pm-info">
            <h4>GCash</h4>
            <p>Pay using GCash</p>
          </div>
        </label>
        <label className={`pm-option ${method === 'card' ? 'selected' : ''}`}>
          <input type="radio" name="payment" checked={method === 'card'} onChange={() => setMethod('card')} style={{accentColor: '#C60000'}} />
          <div className="pm-info">
            <h4>Credit / Debit Card</h4>
            <p>Visa, Mastercard, JCB</p>
          </div>
        </label>
        <label className={`pm-option ${method === 'cash' ? 'selected' : ''}`}>
          <input type="radio" name="payment" checked={method === 'cash'} onChange={() => setMethod('cash')} style={{accentColor: '#C60000'}} />
          <div className="pm-info">
            <h4>Cash on Arrival</h4>
            <p>Pay at the venue</p>
          </div>
        </label>
        <label className={`pm-option ${method === 'wallet' ? 'selected' : ''}`}>
          <input type="radio" name="payment" checked={method === 'wallet'} onChange={() => setMethod('wallet')} style={{accentColor: '#C60000'}} />
          <div className="pm-info">
            <h4>Poblacion Wallet</h4>
            <p>Available Balance: ₱500.00</p>
          </div>
        </label>
      </div>

      <div className="fixed-bottom-bar payment-bar">
        <div className="total-amount-row">
          <span>Total Amount</span>
          <span className="price">₱420</span>
        </div>
        <button className="btn-primary full" onClick={() => onNext(method)}>Pay Now</button>
      </div>
    </div>
  );
}

function Confirmation({ setView, court, date, time }) {
  return (
    <div className="games-view confirmation-view">
      <div className="success-icon">✓</div>
      <h2>Reservation Confirmed!</h2>
      <p className="conf-sub">Your court has been successfully reserved.</p>

      <div className="conf-details-card">
        <div className="summary-court-card" style={{boxShadow:'none', padding:0, marginBottom:16}}>
          <div className="scc-img" style={{background: '#e0e0e0'}}></div>
          <div className="scc-info">
            <h4>{court?.name || 'Poblacion Pickle Hub'}</h4>
            <p>Indoor Court</p>
          </div>
        </div>
        <div className="divider"></div>
        <div className="bd-row"><span>Date</span><span>{date || 'May 24, 2024 (Fri)'}</span></div>
        <div className="bd-row"><span>Time</span><span>{time || '7:00 PM - 8:00 PM'}</span></div>
        <div className="bd-row"><span>Duration</span><span>1 Hour</span></div>
        <div className="bd-row"><span>Booking ID</span><span>PGO-240524-001</span></div>
        <div className="divider"></div>
        <div className="bd-row total"><span>Total Paid</span><span style={{color: '#1a1a1a'}}>₱420</span></div>
      </div>

      <div className="fixed-bottom-bar flex-col">
        <button className="btn-primary full" onClick={() => setView('reservation-details')}>View My Reservations</button>
        <button className="btn-secondary full" onClick={() => setView('home')} style={{marginTop: 12}}>Back to Play Home</button>
      </div>
    </div>
  );
}

function MyReservations({ setView, reservations = [], currentCustomer }) {
  const [activeTab, setActiveTab] = useState('upcoming');

  const myRes = reservations.filter(r => {
    const isOwn = !currentCustomer || r.user === currentCustomer.fullname || r.isOwn;
    if (!isOwn) return false;
    if (activeTab === 'upcoming') return r.status === 'Confirmed' || r.status === 'Pending' || r.status === 'Waiting Payment';
    if (activeTab === 'cancelled') return r.status === 'Cancelled';
    return true;
  });

  const statusColor = (s) => {
    if (s === 'Confirmed') return '#2E7D32';
    if (s === 'Pending') return '#E65100';
    if (s === 'Cancelled') return '#C62828';
    if (s === 'Waiting Payment') return '#F57F17';
    return '#666';
  };

  return (
    <div className="games-view" style={{ paddingBottom: 80 }}>
      <div className="view-header">
        <button className="back-btn" onClick={() => setView('home')}>&larr;</button>
        <h2>My Reservations</h2>
        <div style={{width: 24}}></div>
      </div>

      <div className="filter-tabs">
        <button className={`tab ${activeTab === 'upcoming' ? 'active' : ''}`} onClick={() => setActiveTab('upcoming')}>Upcoming</button>
        <button className={`tab ${activeTab === 'all' ? 'active' : ''}`} onClick={() => setActiveTab('all')}>All</button>
        <button className={`tab ${activeTab === 'cancelled' ? 'active' : ''}`} onClick={() => setActiveTab('cancelled')}>Cancelled</button>
      </div>

      {myRes.length === 0 && (
        <div style={{ textAlign: 'center', padding: 48, color: '#888' }}>
          <div style={{ fontSize: 40, marginBottom: 12 }}>📅</div>
          <div style={{ fontWeight: 700, fontSize: 16 }}>No reservations yet</div>
          <div style={{ fontSize: 13, marginTop: 6 }}>Book a court to get started!</div>
          <button onClick={() => setView('booking-hub')} style={{ marginTop: 20, background: '#C60000', color: 'white', border: 'none', padding: '12px 28px', borderRadius: 30, fontWeight: 700, fontSize: 14, cursor: 'pointer' }}>Book Now</button>
        </div>
      )}

      <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginTop: 8 }}>
        {myRes.map(r => (
          <div key={r.id} style={{ background: 'white', borderRadius: 16, padding: 16, boxShadow: '0 2px 12px rgba(0,0,0,0.06)', border: '1px solid #f0f0f0' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 10 }}>
              <div>
                <div style={{ fontWeight: 800, fontSize: 15, color: '#1A1A1A' }}>{r.court}</div>
                <div style={{ fontSize: 12, color: '#888', marginTop: 2 }}>{r.id}</div>
              </div>
              <span style={{ background: statusColor(r.status) + '18', color: statusColor(r.status), padding: '4px 10px', borderRadius: 20, fontSize: 11, fontWeight: 700 }}>{r.status}</span>
            </div>
            <div style={{ background: '#FAFAFA', borderRadius: 10, padding: '10px 12px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                <span style={{ fontSize: 13, color: '#555' }}>📅 {r.date}</span>
                <span style={{ fontSize: 13, fontWeight: 700, color: '#C60000' }}>{r.price}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ fontSize: 13, color: '#555' }}>🕐 {r.time}</span>
                <span style={{ fontSize: 11, background: r.type === 'Open Play' ? '#E3F2FD' : '#F3E5F5', color: r.type === 'Open Play' ? '#1565C0' : '#6A1B9A', padding: '2px 8px', borderRadius: 10, fontWeight: 700 }}>{r.type}</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function ReservationDetails({ setView, court }) {
  return (
    <div className="games-view">
      <div className="view-header">
        <button className="back-btn" onClick={() => setView('my-reservations')}>&larr;</button>
        <h2>Reservation Details</h2>
        <div style={{width: 24}}></div>
      </div>

      <div className="qr-container">
        <div className="qr-header">Your Entry QR Code</div>
        <div className="qr-box">
          <div className="qr-placeholder">
            {/* Fake QR code */}
            <div style={{width: 180, height: 180, background: '#000', display: 'grid', gridTemplateColumns: 'repeat(10, 1fr)', gap: 2, padding: 10, backgroundClip: 'content-box', backgroundColor: 'white'}}>
               {Array.from({length: 100}).map((_, i) => <div key={i} style={{background: Math.random() > 0.5 ? 'black' : 'white'}}></div>)}
            </div>
          </div>
        </div>
        <div className="qr-footer">PGO-240524-001</div>
      </div>

      <div className="summary-court-card" style={{marginTop: 24}}>
        <div className="scc-img" style={{background: '#e0e0e0'}}></div>
        <div className="scc-info">
          <h4>{court?.name || 'Poblacion Pickle Hub'}</h4>
          <p>Indoor Court</p>
        </div>
      </div>

      <div className="booking-details-box" style={{boxShadow: 'none', padding: 0, background: 'transparent', marginTop: 16}}>
        <div className="bd-row"><span>Date</span><span>May 24, 2024 (Fri)</span></div>
        <div className="bd-row"><span>Time</span><span>7:00 PM - 8:00 PM</span></div>
        <div className="bd-row"><span>Duration</span><span>1 Hour</span></div>
        <div className="bd-row"><span>Players</span><span>4 Players</span></div>
        <div className="bd-row total" style={{marginTop: 16}}><span>Total Paid</span><span>₱420</span></div>
      </div>

      <button className="btn-secondary full" style={{marginTop: 32, borderColor: '#ccc', color: '#666'}}>Cancel Reservation</button>
    </div>
  )
}

function OpenPlay({ setView }) {
  return (
    <div className="games-view">
      <div className="view-header">
        <button className="back-btn" onClick={() => setView('home')}>&larr;</button>
        <h2>Open Play</h2>
        <div style={{width: 24}}></div>
      </div>

      <div className="filter-tabs">
        <button className="tab active">Upcoming</button>
        <button className="tab">Today</button>
        <button className="tab">This Week</button>
      </div>

      <div className="open-play-list">
        <div className="op-list-item">
          <div className="op-list-info">
            <h4>Beginner Open Play</h4>
            <p className="time" style={{fontSize: 13, color: '#666', margin: '4px 0'}}>Today • 6:00 PM - 8:00 PM</p>
            <p className="players" style={{fontSize: 12, color: '#C60000', margin: '4px 0'}}>🔥 6 / 8 Players</p>
            <p className="price" style={{fontWeight: 700, margin: '8px 0 0'}}>₱150 / player</p>
          </div>
          <button className="btn-join">Join Now</button>
        </div>
        <div className="op-list-item">
          <div className="op-list-info">
            <h4>Intermediate Open Play</h4>
            <p className="time" style={{fontSize: 13, color: '#666', margin: '4px 0'}}>Tomorrow • 8:00 AM - 10:00 AM</p>
            <p className="players" style={{fontSize: 12, color: '#C60000', margin: '4px 0'}}>🔥 4 / 8 Players</p>
            <p className="price" style={{fontWeight: 700, margin: '8px 0 0'}}>₱200 / player</p>
          </div>
          <button className="btn-join">Join Now</button>
        </div>
        <div className="op-list-item">
          <div className="op-list-info">
            <h4>Advanced Open Play</h4>
            <p className="time" style={{fontSize: 13, color: '#666', margin: '4px 0'}}>May 26 • 5:00 PM - 7:00 PM</p>
            <p className="players" style={{fontSize: 12, color: '#C60000', margin: '4px 0'}}>🔥 3 / 8 Players</p>
            <p className="price" style={{fontWeight: 700, margin: '8px 0 0'}}>₱200 / player</p>
          </div>
          <button className="btn-join">Join Now</button>
        </div>
      </div>
      
      <div style={{textAlign: 'center', marginTop: 24, fontSize: 13, color: '#888'}}>
        Open Play is a great way to meet new players and enjoy the game!
      </div>
    </div>
  );
}

function AdminReservations({ setView, reservations, setReservations, courtPrices = {}, setCourtPrices }) {
  const [activeTab, setActiveTab] = useState('all');
  const [detailModal, setDetailModal] = useState(null);
  const [priceEdit, setPriceEdit] = useState(null); // temp edit state

  const updateStatus = (id, newStatus) => {
    setReservations(prev => prev.map(r => r.id === id ? { ...r, status: newStatus } : r));
    if (detailModal?.id === id) setDetailModal(prev => ({ ...prev, status: newStatus }));
  };

  const baseDate = new Date();
  const days = Array.from({ length: 14 }, (_, i) => {
    const d = new Date(baseDate);
    d.setDate(baseDate.getDate() + i);
    const month = d.toLocaleDateString('en-US', { month: 'long' });
    const shortMonth = d.toLocaleDateString('en-US', { month: 'short' });
    const day = d.getDate();
    const year = d.getFullYear();
    const matchStr = `${shortMonth} ${day}, ${year}`;
    return {
      name: i === 0 ? 'TODAY' : d.toLocaleDateString('en-US', { weekday: 'short' }).toUpperCase(),
      num: day,
      fullTitle: `${d.toLocaleDateString('en-US', { weekday: 'long' })}, ${month} ${day}`,
      matchStr,
    };
  });

  const [selectedDay, setSelectedDay] = useState(0);

  const pendingCount  = reservations.filter(r => r.status === 'Pending').length;
  const todayCount    = reservations.filter(r => r.date.includes(days[0].matchStr)).length;
  const openPlayCount = reservations.filter(r => r.type === 'Open Play' && r.status === 'Confirmed').length;

  const filtered = reservations.filter(r => {
    if (activeTab === 'rentals' && r.type !== 'Court Rental') return false;
    if (activeTab === 'open-play' && r.type !== 'Open Play') return false;
    
    // Filter by selected date
    if (!r.date.includes(days[selectedDay].matchStr)) return false;
    
    return true;
  });

  const statusColor = (s) => {
    if (s === 'Confirmed')      return { bg: '#E8F5E9', color: '#2E7D32' };
    if (s === 'Pending')        return { bg: '#FFF3E0', color: '#E65100' };
    if (s === 'Cancelled')      return { bg: '#FFEBEE', color: '#C62828' };
    if (s === 'Waiting Payment') return { bg: '#FFF8E1', color: '#F57F17' };
    return { bg: '#f0f0f0', color: '#666' };
  };

  return (
    <div className="games-view no-padding" style={{ paddingBottom: 80 }}>
      {/* Header and Date Strip */}
      <div className="bc-header-blue" style={{ borderRadius: '0 0 24px 24px', marginBottom: 20 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
          <button className="bc-back-btn" onClick={() => setView('home')}>&larr;</button>
          <h2 style={{ margin: 0, color: 'white', fontSize: 18, fontWeight: 700 }}>Games Manager</h2>
          <div style={{ width: 24 }}></div>
        </div>
        <h2 className="bc-date-title">{days[selectedDay].fullTitle}</h2>
        <div className="bc-calendar-strip">
          {days.map((d, i) => (
            <div
              key={i}
              className={`bc-cal-day ${selectedDay === i ? 'selected' : ''}`}
              onClick={() => setSelectedDay(i)}
            >
              <span className="bc-day-name">{d.name}</span>
              <span className="bc-day-num">{d.num}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Stats Row */}
      <div style={{ display: 'flex', gap: 10, marginBottom: 20, padding: '0 16px' }}>
        <div style={{ flex: 1, background: '#C60000', color: 'white', padding: '14px 12px', borderRadius: 14, boxShadow: '0 4px 16px rgba(198,0,0,0.25)', textAlign: 'center' }}>
          <div style={{ fontSize: 26, fontWeight: 800, lineHeight: 1 }}>{todayCount}</div>
          <div style={{ fontSize: 11, opacity: 0.9, marginTop: 4, fontWeight: 500 }}>Today</div>
        </div>
        <div style={{ flex: 1, background: 'white', padding: '14px 12px', borderRadius: 14, border: '1.5px solid #eee', textAlign: 'center' }}>
          <div style={{ fontSize: 26, fontWeight: 800, color: '#E65100', lineHeight: 1 }}>{pendingCount}</div>
          <div style={{ fontSize: 11, color: '#888', marginTop: 4, fontWeight: 500 }}>Pending</div>
        </div>
        <div style={{ flex: 1, background: 'white', padding: '14px 12px', borderRadius: 14, border: '1.5px solid #eee', textAlign: 'center' }}>
          <div style={{ fontSize: 26, fontWeight: 800, color: '#2E7D32', lineHeight: 1 }}>{openPlayCount}</div>
          <div style={{ fontSize: 11, color: '#888', marginTop: 4, fontWeight: 500 }}>Open Play</div>
        </div>
        <div style={{ flex: 1, background: 'white', padding: '14px 12px', borderRadius: 14, border: '1.5px solid #eee', textAlign: 'center' }}>
          <div style={{ fontSize: 26, fontWeight: 800, color: '#1A1A1A', lineHeight: 1 }}>{reservations.length}</div>
          <div style={{ fontSize: 11, color: '#888', marginTop: 4, fontWeight: 500 }}>Total</div>
        </div>
      </div>

      {/* Tabs */}
      <div className="filter-tabs" style={{ marginBottom: 16, padding: '0 16px', flexWrap: 'wrap', gap: 6 }}>
        {[['all','All Bookings'],['rentals','Court Rental'],['open-play','Open Play'],['prices','⚙ Prices']].map(([val, label]) => (
          <button key={val} className={`tab ${activeTab === val ? 'active' : ''}`} onClick={() => setActiveTab(val)}>{label}</button>
        ))}
      </div>

      {/* Manage Prices Panel */}
      {activeTab === 'prices' && (
        <ManagePrices courtPrices={courtPrices} setCourtPrices={setCourtPrices} />
      )}

      {/* Booking Cards */}
      {activeTab !== 'prices' && (
      <div style={{ display: 'flex', flexDirection: 'column', gap: 20, padding: '0 16px' }}>
        {filtered.length === 0 && (
          <div style={{ textAlign: 'center', color: '#888', padding: 40 }}>No bookings found for this day.</div>
        )}
        {Object.entries(filtered.reduce((acc, curr) => {
          if (!acc[curr.date]) acc[curr.date] = [];
          acc[curr.date].push(curr);
          return acc;
        }, {})).map(([date, bookings]) => (
          <div key={date}>
            <div style={{ 
              fontSize: 12, fontWeight: 800, color: '#999', marginBottom: 12, 
              textTransform: 'uppercase', letterSpacing: 1, paddingLeft: 4
            }}>
              {date}
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {bookings.map((res) => {
                const sc = statusColor(res.status);
                return (
                  <div key={res.id} style={{
                    background: 'white', borderRadius: 16, padding: 16,
                    boxShadow: '0 2px 12px rgba(0,0,0,0.06)',
                    border: res.status === 'Pending' ? '1.5px solid #FFB74D' : '1.5px solid transparent'
                  }}>
                    {/* Top row */}
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 10 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        {/* Avatar */}
                        <div style={{
                          width: 40, height: 40, borderRadius: '50%',
                          background: '#FFF0F0', color: '#C60000',
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                          fontWeight: 800, fontSize: 13, flexShrink: 0
                        }}>{res.avatar}</div>
                        <div>
                          <div style={{ fontWeight: 700, fontSize: 14, color: '#1A1A1A' }}>{res.user}</div>
                          <div style={{ fontSize: 11, color: '#888', marginTop: 1 }}>{res.id}</div>
                        </div>
                      </div>
                      <span style={{ background: sc.bg, color: sc.color, padding: '4px 10px', borderRadius: 20, fontSize: 11, fontWeight: 700, whiteSpace: 'nowrap' }}>
                        {res.status}
                      </span>
                    </div>

                    {/* Details */}
                    <div style={{ background: '#FAFAFA', borderRadius: 10, padding: '10px 12px', marginBottom: 12 }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                        <span style={{ fontSize: 12, color: '#888' }}>🕐 {res.time}</span>
                        <span style={{ fontSize: 12, fontWeight: 600, color: '#C60000' }}>{res.price}</span>
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                        <span style={{
                          background: res.type === 'Open Play' ? '#E3F2FD' : '#F3E5F5',
                          color: res.type === 'Open Play' ? '#1565C0' : '#6A1B9A',
                          fontSize: 10, fontWeight: 700, padding: '2px 8px', borderRadius: 10
                        }}>{res.type}</span>
                        <span style={{ fontSize: 12, fontWeight: 600, color: '#333' }}>{res.court}</span>
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div style={{ display: 'flex', gap: 8 }}>
                      <button
                        onClick={() => setDetailModal(res)}
                        style={{ flex: 1, padding: '10px 0', borderRadius: 10, border: '1.5px solid #eee', background: 'white', fontWeight: 600, fontSize: 13, cursor: 'pointer', color: '#444' }}
                      >
                        View Details
                      </button>
                      {res.status === 'Pending' && (
                        <button
                          onClick={() => updateStatus(res.id, 'Confirmed')}
                          style={{ flex: 1, padding: '10px 0', borderRadius: 10, border: 'none', background: '#C60000', fontWeight: 700, fontSize: 13, cursor: 'pointer', color: 'white' }}
                        >
                          ✓ Approve
                        </button>
                      )}
                      {res.status === 'Waiting Payment' && (
                        <button
                          onClick={() => updateStatus(res.id, 'Confirmed')}
                          style={{ flex: 1, padding: '10px 0', borderRadius: 10, border: 'none', background: '#F57F17', fontWeight: 700, fontSize: 13, cursor: 'pointer', color: 'white' }}
                        >
                          Mark Paid
                        </button>
                      )}
                      {(res.status === 'Confirmed' || res.status === 'Pending') && (
                        <button
                          onClick={() => updateStatus(res.id, 'Cancelled')}
                          style={{ padding: '10px 16px', borderRadius: 10, border: '1.5px solid #FFCDD2', background: '#FFF5F5', fontWeight: 600, fontSize: 13, cursor: 'pointer', color: '#C62828' }}
                        >
                          Cancel
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>
      )}

      {/* Detail Modal */}
      {detailModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.55)', display: 'flex', alignItems: 'flex-end', zIndex: 200 }}>
          <div style={{ background: 'white', width: '100%', borderRadius: '24px 24px 0 0', padding: 24, maxHeight: '85vh', overflowY: 'auto', animation: 'fadeIn 0.3s ease' }}>
            {/* Modal Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
              <h3 style={{ margin: 0, fontSize: 18, fontWeight: 800 }}>Booking Details</h3>
              <button onClick={() => setDetailModal(null)} style={{ background: '#f0f0f0', border: 'none', borderRadius: '50%', width: 32, height: 32, fontWeight: 700, cursor: 'pointer', fontSize: 16 }}>✕</button>
            </div>

            {/* User Card */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 14, padding: 16, background: '#FFF0F0', borderRadius: 14, marginBottom: 16 }}>
              <div style={{ width: 52, height: 52, borderRadius: '50%', background: '#C60000', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: 16 }}>
                {detailModal.avatar}
              </div>
              <div>
                <div style={{ fontWeight: 800, fontSize: 16 }}>{detailModal.user}</div>
                <div style={{ fontSize: 12, color: '#888', marginTop: 2 }}>📞 {detailModal.phone}</div>
                <div style={{ fontSize: 11, color: '#C60000', marginTop: 2, fontWeight: 600 }}>{detailModal.id}</div>
              </div>
            </div>

            {/* Booking Info */}
            {[
              ['Type', detailModal.type],
              ['Court', detailModal.court],
              ['Date', detailModal.date],
              ['Time', detailModal.time],
              ['Amount', detailModal.price],
            ].map(([label, val]) => (
              <div key={label} style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 0', borderBottom: '1px solid #f5f5f5' }}>
                <span style={{ color: '#888', fontSize: 13 }}>{label}</span>
                <span style={{ fontWeight: 700, fontSize: 13 }}>{val}</span>
              </div>
            ))}

            {/* Status */}
            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 0', borderBottom: '1px solid #f5f5f5' }}>
              <span style={{ color: '#888', fontSize: 13 }}>Status</span>
              <span style={{ fontWeight: 700, fontSize: 13, color: statusColor(detailModal.status).color }}>
                {detailModal.status}
              </span>
            </div>

            {/* Action Buttons in Modal */}
            <div style={{ display: 'flex', gap: 10, marginTop: 20 }}>
              {detailModal.status === 'Pending' && (
                <button
                  onClick={() => updateStatus(detailModal.id, 'Confirmed')}
                  style={{ flex: 1, padding: 14, borderRadius: 12, border: 'none', background: '#C60000', color: 'white', fontWeight: 700, fontSize: 14, cursor: 'pointer' }}
                >
                  ✓ Approve Booking
                </button>
              )}
              {detailModal.status === 'Waiting Payment' && (
                <button
                  onClick={() => updateStatus(detailModal.id, 'Confirmed')}
                  style={{ flex: 1, padding: 14, borderRadius: 12, border: 'none', background: '#F57F17', color: 'white', fontWeight: 700, fontSize: 14, cursor: 'pointer' }}
                >
                  Mark as Paid
                </button>
              )}
              {(detailModal.status === 'Confirmed' || detailModal.status === 'Pending') && (
                <button
                  onClick={() => updateStatus(detailModal.id, 'Cancelled')}
                  style={{ flex: 1, padding: 14, borderRadius: 12, border: '1.5px solid #FFCDD2', background: '#FFF5F5', color: '#C62828', fontWeight: 700, fontSize: 14, cursor: 'pointer' }}
                >
                  Cancel Booking
                </button>
              )}
              {detailModal.status === 'Cancelled' && (
                <button
                  onClick={() => updateStatus(detailModal.id, 'Confirmed')}
                  style={{ flex: 1, padding: 14, borderRadius: 12, border: 'none', background: '#2E7D32', color: 'white', fontWeight: 700, fontSize: 14, cursor: 'pointer' }}
                >
                  Restore Booking
                </button>
              )}
            </div>
            <button
              onClick={() => setDetailModal(null)}
              style={{ width: '100%', padding: 12, borderRadius: 12, border: '1px solid #eee', background: 'white', color: '#888', fontWeight: 600, fontSize: 13, cursor: 'pointer', marginTop: 10 }}
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

function ManagePrices({ courtPrices, setCourtPrices }) {
  const [form, setForm] = useState({ ...courtPrices });
  const [saved, setSaved] = useState(false);

  const handleSave = () => {
    setCourtPrices({ ...form });
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  };

  const Field = ({ label, fieldKey, prefix = '', suffix = '', type = 'number', hint }) => (
    <div style={{ marginBottom: 18 }}>
      <label style={{ fontSize: 11, fontWeight: 800, color: '#888', textTransform: 'uppercase', letterSpacing: 0.5, display: 'block', marginBottom: 6 }}>{label}</label>
      {hint && <p style={{ fontSize: 12, color: '#aaa', margin: '0 0 6px' }}>{hint}</p>}
      <div style={{ display: 'flex', alignItems: 'center', background: '#FAFAFA', border: '1.5px solid #E0E0E0', borderRadius: 12, overflow: 'hidden' }}>
        {prefix && <span style={{ padding: '0 12px', color: '#999', fontWeight: 700, fontSize: 14, background: '#F5F5F5', borderRight: '1px solid #E0E0E0', alignSelf: 'stretch', display: 'flex', alignItems: 'center' }}>{prefix}</span>}
        <input
          type={type}
          value={form[fieldKey]}
          onChange={e => setForm(prev => ({ ...prev, [fieldKey]: type === 'number' ? Number(e.target.value) : e.target.value }))}
          style={{ flex: 1, padding: '12px 14px', border: 'none', background: 'transparent', fontSize: 15, fontWeight: 700, outline: 'none', color: '#1A1A1A' }}
        />
        {suffix && <span style={{ padding: '0 12px', color: '#999', fontSize: 12 }}>{suffix}</span>}
      </div>
    </div>
  );

  return (
    <div style={{ padding: '0 16px 80px' }}>
      {saved && (
        <div style={{ background: '#2E7D32', color: 'white', borderRadius: 12, padding: '12px 16px', marginBottom: 20, fontWeight: 700, textAlign: 'center', animation: 'fadeIn 0.3s ease' }}>
          ✓ Prices saved! Customers will see updated rates.
        </div>
      )}

      <div style={{ background: 'white', borderRadius: 20, padding: 20, boxShadow: '0 2px 12px rgba(0,0,0,0.06)', marginBottom: 20 }}>
        <h3 style={{ margin: '0 0 16px', fontSize: 16, fontWeight: 800, display: 'flex', alignItems: 'center', gap: 8 }}>
          🏀 Court Rental Rates
        </h3>
        <Field label="Court 1 Name" fieldKey="courtName1" type="text" />
        <Field label="Court 2 Name" fieldKey="courtName2" type="text" />
        <Field label="Morning Rate (5AM – 11AM)" fieldKey="morningRate" prefix="₱" suffix="/ hour" hint="Applied to slots 5 AM through 11 AM" />
        <Field label="Afternoon/Evening Rate (3PM – 7PM)" fieldKey="afternoonRate" prefix="₱" suffix="/ hour" hint="Applied to slots 3 PM through 7 PM" />
      </div>

      <div style={{ background: 'white', borderRadius: 20, padding: 20, boxShadow: '0 2px 12px rgba(0,0,0,0.06)', marginBottom: 20 }}>
        <h3 style={{ margin: '0 0 16px', fontSize: 16, fontWeight: 800, display: 'flex', alignItems: 'center', gap: 8 }}>
          🏓 Open Play Settings
        </h3>
        <Field label="Open Play Rate" fieldKey="openPlayRate" prefix="₱" suffix="/ person" hint="Per player per session" />
        <Field label="Max Players per Session" fieldKey="maxPlayersOpenPlay" suffix="players" hint="Maximum players allowed in one session" />
      </div>

      <div style={{ background: 'white', borderRadius: 20, padding: 20, boxShadow: '0 2px 12px rgba(0,0,0,0.06)', marginBottom: 20 }}>
        <h3 style={{ margin: '0 0 16px', fontSize: 16, fontWeight: 800, display: 'flex', alignItems: 'center', gap: 8 }}>
          📝 Notes / Announcements
        </h3>
        <div style={{ marginBottom: 18 }}>
          <label style={{ fontSize: 11, fontWeight: 800, color: '#888', textTransform: 'uppercase', letterSpacing: 0.5, display: 'block', marginBottom: 6 }}>Message to players</label>
          <textarea
            value={form.notes}
            onChange={e => setForm(prev => ({ ...prev, notes: e.target.value }))}
            placeholder="E.g. Courts closed on holidays. Special rates on weekends."
            rows={3}
            style={{ width: '100%', padding: 12, border: '1.5px solid #E0E0E0', borderRadius: 12, fontSize: 13, fontFamily: 'inherit', outline: 'none', resize: 'none', color: '#333', boxSizing: 'border-box' }}
          />
        </div>
      </div>

      <div style={{ display: 'flex', gap: 10 }}>
        <button
          onClick={handleSave}
          style={{ flex: 1, background: '#C60000', color: 'white', border: 'none', padding: 16, borderRadius: 16, fontSize: 15, fontWeight: 800, cursor: 'pointer' }}
        >
          ✓ Save Prices
        </button>
        <button
          onClick={() => setForm({ ...courtPrices })}
          style={{ padding: '16px 20px', background: '#f5f5f5', color: '#666', border: 'none', borderRadius: 16, fontSize: 14, fontWeight: 700, cursor: 'pointer' }}
        >
          Reset
        </button>
      </div>
    </div>
  );
}

function BookingHub({ setView, addReservation, currentCustomer, courtPrices = {}, reservations = [] }) {
  const morningRate = courtPrices.morningRate || 200;
  const afternoonRate = courtPrices.afternoonRate || 280;
  const openPlayRate = courtPrices.openPlayRate || 150;
  const [mode, setMode] = useState('rental');
  const [selectedDay, setSelectedDay] = useState(0); // 0 = TODAY
  const [bookingModal, setBookingModal] = useState(null); // { time, court, price }
  const [joinModal, setJoinModal] = useState(false);
  const [confirmed, setConfirmed] = useState(false);
  const [joined, setJoined] = useState(false);

  const today = new Date();
  const days = Array.from({ length: 14 }, (_, i) => {
    const d = new Date(today);
    d.setDate(today.getDate() + i);
    return {
      name: i === 0 ? 'TODAY' : d.toLocaleDateString('en-US', { weekday: 'short' }).toUpperCase(),
      num: d.getDate(),
      full: d.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' }),
    };
  });

  const baseSlotData = [
    { time: '5 AM',  price: `PHP ${morningRate}` },
    { time: '6 AM',  price: `PHP ${morningRate}` },
    { time: '7 AM',  price: `PHP ${morningRate}` },
    { time: '8 AM',  price: `PHP ${morningRate}` },
    { time: '9 AM',  price: `PHP ${morningRate}` },
    { time: '10 AM', price: `PHP ${morningRate}` },
    { time: '11 AM', price: `PHP ${morningRate}` },
    { time: '3 PM',  price: `PHP ${afternoonRate}` },
    { time: '4 PM',  price: `PHP ${afternoonRate}` },
    { time: '5 PM',  price: `PHP ${afternoonRate}` },
    { time: '6 PM',  price: `PHP ${afternoonRate}` },
    { time: '7 PM',  price: `PHP ${afternoonRate}` },
  ];

  const getSlotStatus = (slotIdx, court) => {
    const d = new Date();
    d.setDate(d.getDate() + selectedDay);
    const dateStr = d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
    const timeStr = baseSlotData[slotIdx].time;
    const courtName = court === 'c1' ? 'Court 1' : 'Court 2';

    // Check if there is an active reservation for this date, time, and court
    const isBooked = reservations.some(r => 
      r.date === dateStr && 
      // r.time might be "9:00 AM", while timeStr is "9 AM". We need to handle this.
      (r.time.includes(timeStr.split(' ')[0]) && r.time.includes(timeStr.split(' ')[1])) &&
      r.court.includes(courtName) && 
      (r.status === 'Confirmed' || r.status === 'Pending' || r.status === 'Waiting Payment')
    );

    if (isBooked) return 'booked';
    return 'open';
  };

  const handleSlotClick = (slotIdx, court, status, time, price) => {
    if (status !== 'open') return;
    setBookingModal({ slotIdx, court, time, price });
  };

  const confirmBooking = () => {
    // Add to shared reservations
    const d = new Date();
    d.setDate(d.getDate() + selectedDay);
    const dateStr = d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
    const courtName = bookingModal.court === 'c1' ? 'Court 1' : 'Court 2';
    const name = currentCustomer?.fullname || 'Guest';
    const initials = name.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase();
    const newId = `PGO-${Date.now()}`;
    addReservation({
      id: newId,
      user: name,
      avatar: initials,
      court: courtName,
      date: dateStr,
      time: bookingModal.time,
      price: bookingModal.price,
      status: 'Confirmed',
      type: 'Court Rental',
      phone: currentCustomer?.phone || 'N/A',
      isOwn: true,
    });
    setBookingModal(null);
    setConfirmed(true);
    setTimeout(() => setConfirmed(false), 3000);
  };

  return (
    <div className="book-court-wrapper">
      {/* Header */}
      <div className="bc-header-blue">
        <button className="bc-back-btn" onClick={() => setView('home')}>&larr; Back</button>
        <h2 className="bc-date-title">{days[selectedDay].full}</h2>
        <div className="bc-calendar-strip">
          {days.map((d, i) => (
            <div
              key={i}
              className={`bc-cal-day ${selectedDay === i ? 'selected' : ''}`}
              onClick={() => setSelectedDay(i)}
            >
              <span className="bc-day-name">{d.name}</span>
              <span className="bc-day-num">{d.num}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Mode Toggle */}
      <div className="bc-mode-toggle">
        <button className={`bc-mode-btn ${mode === 'rental' ? 'active' : ''}`} onClick={() => setMode('rental')}>Court rental</button>
        <button className={`bc-mode-btn ${mode === 'open-play' ? 'active' : ''}`} onClick={() => setMode('open-play')}>Open play</button>
      </div>

      {/* Confirmed Toast */}
      {confirmed && (
        <div style={{
          background: '#C60000', color: 'white', padding: '12px 20px',
          textAlign: 'center', fontWeight: 700, fontSize: 14,
          animation: 'fadeIn 0.3s ease'
        }}>
          ✓ Court booked successfully!
        </div>
      )}
      {joined && (
        <div style={{
          background: '#2E7D32', color: 'white', padding: '12px 20px',
          textAlign: 'center', fontWeight: 700, fontSize: 14,
        }}>
          ✓ You have joined the session!
        </div>
      )}

      {/* Court Rental View */}
      {mode === 'rental' ? (
        <div className="bc-body">
          <div className="bc-court-headers">
            <div style={{ flex: 1 }}></div>
            <div className="bc-ch">COURT 1</div>
            <div className="bc-ch">COURT 2</div>
          </div>
          <div className="bc-legend">
            <span className="lg-title">LEGEND</span>
            <div className="lg-item"><div className="lg-color open"></div> Open</div>
            <div className="lg-item"><div className="lg-color booked"></div> Booked</div>
            <div className="lg-item"><div className="lg-color na"></div> N/A</div>
          </div>
          <div className="bc-slots">
            {baseSlotData.map((s, i) => {
              const c1Status = getSlotStatus(i, 'c1');
              const c2Status = getSlotStatus(i, 'c2');
              return (
                <div key={i} className="bc-slot-row">
                  <div className="bc-time-col">
                    <span className="bc-time">{s.time}</span>
                    <span className="bc-price">{s.price}</span>
                  </div>
                  <div className="bc-court-col">
                    <button
                      className={`bc-slot-btn ${c1Status === 'na' ? 'na' : c1Status}`}
                      onClick={() => handleSlotClick(i, 'c1', c1Status, s.time, s.price)}
                    >
                      {c1Status === 'na' ? 'N/A' : c1Status === 'booked' ? 'Booked' : 'Book'}
                    </button>
                  </div>
                  <div className="bc-court-col">
                    <button
                      className={`bc-slot-btn ${c2Status === 'na' ? 'na' : c2Status}`}
                      onClick={() => handleSlotClick(i, 'c2', c2Status, s.time, s.price)}
                    >
                      {c2Status === 'na' ? 'N/A' : c2Status === 'booked' ? 'Booked' : 'Book'}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      ) : (
        /* Open Play View */
        <div className="bc-open-play-view" style={{ padding: '20px', background: '#FAFAFA' }}>
          <div className="bc-op-card">
            <div className="bc-op-header">
              <div className="bc-op-title">Night Open Play (court 1 &amp; 2)</div>
              <div className="bc-op-price">
                PHP<br />
                <span style={{ fontSize: 20 }}>150</span><br />
                <span style={{ fontSize: 10, fontWeight: 500, color: '#888' }}>per person</span>
              </div>
            </div>
            <div className="bc-op-sub">
              <span>8 PM - 12 AM</span>
            </div>
            <div className="bc-op-progress-container">
              <div className="bc-op-progress-bar">
                <div className="bc-op-progress-fill" style={{ width: joined ? '27%' : '20%', transition: 'width 0.5s ease' }}></div>
              </div>
              <div className="bc-op-spots">{joined ? '11 spots left' : '12 spots left'}</div>
            </div>

            <div className="bc-op-section-title">CONFIRMED PLAYERS ({joined ? 12 : 11})</div>
            <div className="bc-op-players-list">
              {['Mark Dones','Byron Dones','Hermes Jr.','Shane','Lance Cornico','Gino','Flong','Ralph','Aira','Tep','Ella'].map(p => (
                <div key={p} className="bc-player"><div className="dot green"></div>{p}</div>
              ))}
              {joined && <div className="bc-player" style={{ background: '#FFF0F0', border: '1px solid #C60000' }}><div className="dot" style={{ background: '#C60000', width: 8, height: 8, borderRadius: '50%' }}></div>You</div>}
            </div>

            {!joined && (
              <>
                <div className="bc-op-section-title" style={{ marginTop: 20 }}>WAITING FOR PAYMENT (1)</div>
                <div className="bc-op-players-list">
                  <div className="bc-player"><div className="dot orange"></div>Neon</div>
                </div>
              </>
            )}

            {!joined ? (
              <button className="bc-op-join-btn" onClick={() => setJoinModal(true)}>Join This Session</button>
            ) : (
              <button className="bc-op-join-btn" style={{ background: '#2E7D32' }} onClick={() => setJoined(false)}>Leave Session</button>
            )}
          </div>
        </div>
      )}

      {/* Booking Confirmation Modal */}
      {bookingModal && (
        <div style={{
          position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)',
          display: 'flex', alignItems: 'flex-end', zIndex: 100
        }}>
          <div style={{
            background: 'white', width: '100%', borderRadius: '24px 24px 0 0',
            padding: 24, animation: 'fadeIn 0.3s ease'
          }}>
            <h3 style={{ margin: '0 0 4px', fontSize: 18, fontWeight: 800, color: '#1A1A1A' }}>Confirm Booking</h3>
            <p style={{ margin: '0 0 20px', color: '#888', fontSize: 13 }}>Review your court reservation details</p>

            <div style={{ background: '#FFF0F0', borderRadius: 12, padding: 16, marginBottom: 16 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                <span style={{ color: '#666', fontSize: 13 }}>Court</span>
                <span style={{ fontWeight: 700, fontSize: 13 }}>{bookingModal.court === 'c1' ? 'Court 1' : 'Court 2'}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                <span style={{ color: '#666', fontSize: 13 }}>Date</span>
                <span style={{ fontWeight: 700, fontSize: 13 }}>{days[selectedDay].full}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                <span style={{ color: '#666', fontSize: 13 }}>Time</span>
                <span style={{ fontWeight: 700, fontSize: 13 }}>{bookingModal.time}</span>
              </div>
              <div style={{ height: 1, background: '#eee', margin: '12px 0' }}></div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ fontWeight: 700 }}>Total</span>
                <span style={{ fontWeight: 800, color: '#C60000', fontSize: 16 }}>{bookingModal.price}</span>
              </div>
            </div>

            <button
              onClick={confirmBooking}
              style={{
                width: '100%', background: '#C60000', color: 'white',
                border: 'none', padding: 16, borderRadius: 12,
                fontWeight: 700, fontSize: 16, cursor: 'pointer', marginBottom: 12
              }}
            >
              Confirm &amp; Pay
            </button>
            <button
              onClick={() => setBookingModal(null)}
              style={{
                width: '100%', background: 'white', color: '#666',
                border: '1px solid #eee', padding: 14, borderRadius: 12,
                fontWeight: 600, fontSize: 14, cursor: 'pointer'
              }}
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Join Session Modal */}
      {joinModal && (
        <div style={{
          position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)',
          display: 'flex', alignItems: 'flex-end', zIndex: 100
        }}>
          <div style={{
            background: 'white', width: '100%', borderRadius: '24px 24px 0 0',
            padding: 24, animation: 'fadeIn 0.3s ease'
          }}>
            <h3 style={{ margin: '0 0 4px', fontSize: 18, fontWeight: 800 }}>Join Open Play</h3>
            <p style={{ margin: '0 0 20px', color: '#888', fontSize: 13 }}>Night Open Play • 8 PM - 12 AM</p>

            <div style={{ background: '#FFF0F0', borderRadius: 12, padding: 16, marginBottom: 16 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                <span style={{ color: '#666', fontSize: 13 }}>Date</span>
                <span style={{ fontWeight: 700, fontSize: 13 }}>{days[selectedDay].full}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                <span style={{ color: '#666', fontSize: 13 }}>Courts</span>
                <span style={{ fontWeight: 700, fontSize: 13 }}>Court 1 &amp; 2</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                <span style={{ color: '#666', fontSize: 13 }}>Spots Left</span>
                <span style={{ fontWeight: 700, fontSize: 13, color: '#C60000' }}>12 spots</span>
              </div>
              <div style={{ height: 1, background: '#eee', margin: '12px 0' }}></div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ fontWeight: 700 }}>Fee</span>
                <span style={{ fontWeight: 800, color: '#C60000', fontSize: 16 }}>PHP 150 / person</span>
              </div>
            </div>

            <button
              onClick={() => { setJoinModal(false); setJoined(true); }}
              style={{
                width: '100%', background: '#C60000', color: 'white',
                border: 'none', padding: 16, borderRadius: 12,
                fontWeight: 700, fontSize: 16, cursor: 'pointer', marginBottom: 12
              }}
            >
              Confirm &amp; Pay PHP 150
            </button>
            <button
              onClick={() => setJoinModal(false)}
              style={{
                width: '100%', background: 'white', color: '#666',
                border: '1px solid #eee', padding: 14, borderRadius: 12,
                fontWeight: 600, fontSize: 14, cursor: 'pointer'
              }}
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

