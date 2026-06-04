import { useState } from 'react'
import './Login.css'

export default function Login({ 
  onBack, 
  onLogin, 
  onStallLogin, 
  onRiderLogin, 
  onAdminLogin, 
  onGamesLogin,
  customers = [], 
  stalls = [], 
  staff = [],
  riders = [], 
  onRegisterCustomer,
  onGuest
}) {
  const [activeTab, setActiveTab] = useState('login')
  const [role, setRole] = useState('customer')
  const [showRoleDropdown, setShowRoleDropdown] = useState(false)
  const [email, setEmail] = useState('')
  const [pass, setPass] = useState('')
  const [show, setShow] = useState(false)
  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  // Register Fields
  const [regName, setRegName] = useState('')
  const [regEmail, setRegEmail] = useState('')
  const [regPhone, setRegPhone] = useState('')
  const [regAddr, setRegAddr] = useState('')
  const [regPass, setRegPass] = useState('')
  const [regConfirmPass, setRegConfirmPass] = useState('')

  const handleLoginSubmit = (e) => {
    e?.preventDefault?.()
    setError('')

    const user = email.trim()
    const password = pass.trim()

    if (!user || !password) {
      setError('Please enter your email and password.')
      return
    }

    setIsLoading(true)
    setTimeout(() => {
      // 1. Admin Login
    if ((user.toLowerCase() === 'admin' || user.toLowerCase() === 'admin@pobla.go') && password === 'admin') {
      onAdminLogin?.()
      return
    }

    // 2. Games Manager Login
    if ((user.toLowerCase() === 'games' || user.toLowerCase() === 'games@pobla.go') && password === 'games') {
      onGamesLogin?.()
      setIsLoading(false)
      return
    }

    // 3. Customer Login
    const foundCust = customers.find(c => (c.email?.toLowerCase() === user.toLowerCase() || c.phone === user) && c.password === password)
    if (foundCust) {
      if (foundCust.status === 'suspended') {
        setError('This account has been suspended. Contact support.')
        setIsLoading(false)
        return
      }
      onLogin?.(foundCust)
      setIsLoading(false)
      return
    }

    // 4. Stall Login (Staff or Owner)
    const foundStaff = staff.find(s => s.email?.toLowerCase() === user.toLowerCase() && s.password === password)
    const foundStall = stalls.find(s => s.username?.toLowerCase() === user.toLowerCase() && s.password === password)
    
    if (foundStaff) {
      const stallObj = stalls.find(st => st.id === foundStaff.stall_id)
      if (stallObj?.status === 'suspended') {
        setError('Your stall has been suspended by Admin.')
      } else {
        onStallLogin?.({ ...stallObj, staffName: foundStaff.fullname, staffId: foundStaff.id })
      }
      setIsLoading(false)
      return
    } else if (foundStall) {
      if (foundStall.status === 'suspended') {
        setError('Your stall has been suspended by Admin.')
      } else {
        onStallLogin?.(foundStall)
      }
      setIsLoading(false)
      return
    }

    // 5. Rider Login
    const foundRider = riders.find(r => r.email?.toLowerCase() === user.toLowerCase() && r.password === password)
    if (foundRider) {
      if (foundRider.status === 'suspended') {
        setError('This rider account is suspended.')
      } else {
        onRiderLogin?.(foundRider)
      }
      setIsLoading(false)
      return
    }

    // If none match
    setError('Invalid email or password.')
    setIsLoading(false)
    }, 500)
  }

  const fillDemo = () => {
    setError('')
    if (role === 'customer') {
      setEmail('juan@pobla.go')
      setPass('pass')
    } else if (role === 'stall') {
      setEmail('burger@pobla.go')
      setPass('pass')
    } else if (role === 'rider') {
      setEmail('john@pobla.go')
      setPass('pass')
    } else if (role === 'game manager') {
      setEmail('games@pobla.go')
      setPass('games')
    } else {
      setEmail('admin@pobla.go')
      setPass('admin')
    }
  }

  const handleRegisterSubmit = async (e) => {
    e.preventDefault()
    setError('')

    if (!regName || !regEmail || !regPhone || !regAddr || !regPass || !regConfirmPass) {
      setError('Please fill in all fields.')
      return
    }

    if (regPass !== regConfirmPass) {
      setError('Passwords do not match.')
      return
    }

    const exists = customers.find(c => c.email?.toLowerCase() === regEmail.toLowerCase() || c.phone === regPhone)
    if (exists) {
      setError('Email or phone number already registered.')
      return
    }

    const newCust = {
      fullname: regName,
      email: regEmail.toLowerCase(),
      phone: regPhone,
      address: regAddr,
      password: regPass,
      status: 'active',
    }

    setIsLoading(true)
    try {
      if (onRegisterCustomer) {
        const savedUser = await onRegisterCustomer(newCust)
        onLogin?.(savedUser)
      }
    } catch (err) {
      setError(err.message || 'Failed to register account.')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="lg-page fade-in">
      {/* Header with back + role selector */}
      <div className="lg-header">
        <button className="lg-back" onClick={onBack} id="btn-login-back">
          <svg viewBox="0 0 24 24" fill="none" stroke="#333" strokeWidth="2.5" width="20" height="20">
            <line x1="19" y1="12" x2="5" y2="12"/>
            <polyline points="12 19 5 12 12 5"/>
          </svg>
        </button>

      </div>

      {/* Tabs */}
      <div className="lg-tabs">
        <button 
          className={`lg-tab ${activeTab === 'login' ? 'active' : ''}`} 
          onClick={() => { setActiveTab('login'); setError(''); }}
        >
          Login
        </button>
        <button 
          className={`lg-tab ${activeTab === 'register' ? 'active' : ''}`} 
          onClick={() => { setActiveTab('register'); setError(''); }}
        >
          Register
        </button>
      </div>

      {/* Scrollable form body */}
      <div className="lg-body">
        {error && <div className="lg-error">{error}</div>}


        {activeTab === 'login' ? (
          <form className="lg-form" onSubmit={handleLoginSubmit}>
            <div className="lg-field">
              <label className="lg-label">Email Address</label>
              <div className="lg-input-wrap">
                <input 
                  type="text" 
                  className="lg-input" 
                  placeholder="Enter your email" 
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  required
                />
                <span className="lg-input-icon">
                  <svg viewBox="0 0 24 24" fill="none" stroke="#ADB5BD" strokeWidth="2" width="18" height="18">
                    <rect x="2" y="4" width="20" height="16" rx="2"/>
                    <path d="M22 7l-10 6L2 7"/>
                  </svg>
                </span>
              </div>
            </div>

            <div className="lg-field">
              <label className="lg-label">Password</label>
              <div className="lg-input-wrap">
                <input 
                  type={show ? 'text' : 'password'} 
                  className="lg-input" 
                  placeholder="Enter your password" 
                  value={pass}
                  onChange={e => setPass(e.target.value)}
                  required
                />
                <button type="button" className="lg-input-icon clickable" onClick={() => setShow(!show)}>
                  <svg viewBox="0 0 24 24" fill="none" stroke="#ADB5BD" strokeWidth="2" width="18" height="18">
                    {show ? (
                      <>
                        <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
                        <circle cx="12" cy="12" r="3"/>
                      </>
                    ) : (
                      <>
                        <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94"/>
                        <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19"/>
                        <line x1="1" y1="1" x2="23" y2="23"/>
                      </>
                    )}
                  </svg>
                </button>
              </div>
            </div>

            <div className="lg-forgot-row">
              <button type="button" className="lg-forgot-btn">Forgot Password?</button>
            </div>

            <button type="submit" className="lg-submit-btn" disabled={isLoading} style={{opacity: isLoading ? 0.7 : 1}}>
              {isLoading ? 'Logging in...' : 'Login'}
            </button>
          </form>
        ) : (
          <form className="lg-form" onSubmit={handleRegisterSubmit}>
            <div className="lg-field">
              <label className="lg-label">Full Name</label>
              <input type="text" className="lg-input" placeholder="Enter your full name" 
                value={regName} onChange={e => setRegName(e.target.value)} required />
            </div>

            <div className="lg-field">
              <label className="lg-label">Email Address</label>
              <input type="email" className="lg-input" placeholder="Enter your email address" 
                value={regEmail} onChange={e => setRegEmail(e.target.value)} required />
            </div>

            <div className="lg-field">
              <label className="lg-label">Phone Number</label>
              <input type="tel" className="lg-input" placeholder="Enter phone number" 
                value={regPhone} onChange={e => setRegPhone(e.target.value)} required />
            </div>

            <div className="lg-field">
              <label className="lg-label">Address</label>
              <input type="text" className="lg-input" placeholder="Enter delivery address" 
                value={regAddr} onChange={e => setRegAddr(e.target.value)} required />
            </div>

            <div className="lg-field">
              <label className="lg-label">Password</label>
              <input type="password" className="lg-input" placeholder="Create password" 
                value={regPass} onChange={e => setRegPass(e.target.value)} required />
            </div>

            <div className="lg-field">
              <label className="lg-label">Confirm Password</label>
              <input type="password" className="lg-input" placeholder="Confirm password" 
                value={regConfirmPass} onChange={e => setRegConfirmPass(e.target.value)} required />
            </div>

            <button type="submit" className="lg-submit-btn" disabled={isLoading} style={{opacity: isLoading ? 0.7 : 1}}>
              {isLoading ? 'Registering... (Waking up server 😴)' : 'Register'}
            </button>
          </form>
        )}

        {/* Divider */}
        <div className="lg-divider">
          <div className="lg-divider-line" />
          <span className="lg-divider-text">or</span>
          <div className="lg-divider-line" />
        </div>

        {/* Social buttons — full width as per mockup */}
        <div className="lg-social-btns">
          <button className="lg-social-btn" type="button">
            <svg viewBox="0 0 24 24" width="20" height="20">
              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4"/>
              <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
              <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18A10.96 10.96 0 0 0 1 12c0 1.77.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05"/>
              <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
            </svg>
            <span>Continue with Google</span>
          </button>

          <button className="lg-social-btn" type="button">
            <svg viewBox="0 0 24 24" width="20" height="20">
              <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" fill="#1877F2"/>
            </svg>
            <span>Continue with Facebook</span>
          </button>
        </div>

      </div>
    </div>
  )
}
