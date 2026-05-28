import { useState, useEffect } from 'react'
import './PaymentGateway.css'

export default function PaymentGateway({ amount, method, onSuccess, onCancel }) {
  const [step, setStep] = useState('init') // init, login, otp, pin, processing, success
  const [mobile, setMobile] = useState('')
  const [otp, setOtp] = useState('')
  const [pin, setPin] = useState('')

  useEffect(() => {
    // Simulate secure connection delay
    if (step === 'init') {
      const t = setTimeout(() => setStep('login'), 2000)
      return () => clearTimeout(t)
    }
    if (step === 'processing') {
      const t = setTimeout(() => setStep('success'), 2000)
      return () => clearTimeout(t)
    }
    if (step === 'success') {
      const t = setTimeout(() => onSuccess(), 1500)
      return () => clearTimeout(t)
    }
  }, [step, onSuccess])

  const isGcash = method === 'GCash'
  const isMaya = method === 'PayMaya'
  const themeColor = isGcash ? '#005CEE' : isMaya ? '#12C288' : '#212529'
  const logoText = isGcash ? 'GCash' : isMaya ? 'Maya' : 'Card Payment'

  const handleNext = () => {
    if (step === 'login') {
      if (mobile.length < 10) return alert('Please enter a valid mobile number')
      setStep('otp')
    } else if (step === 'otp') {
      if (otp.length < 6) return alert('Please enter the 6-digit OTP')
      setStep('pin')
    } else if (step === 'pin') {
      if (pin.length < 4) return alert('Please enter your PIN')
      setStep('processing')
    }
  }

  return (
    <div className="pgw-overlay fade-in">
      <div className="pgw-container slide-up">
        
        {/* Header */}
        <div className="pgw-header">
          <div className="pgw-close" onClick={onCancel}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="20" height="20">
              <line x1="18" y1="6" x2="6" y2="18"/>
              <line x1="6" y1="6" x2="18" y2="18"/>
            </svg>
          </div>
          <div className="pgw-brand" style={{ color: themeColor }}>
            {logoText} <span className="pgw-secure">Secure</span>
          </div>
        </div>

        {/* Content */}
        <div className="pgw-body">
          {step === 'init' && (
            <div className="pgw-state center">
              <div className="pgw-spinner" style={{ borderTopColor: themeColor }}></div>
              <p>Connecting to {logoText} securely...</p>
              <span className="pgw-powered">Powered by PayMongo</span>
            </div>
          )}

          {step === 'login' && (
            <div className="pgw-state slide-left">
              <div className="pgw-merchant-info">
                <div className="pgw-m-avatar">P</div>
                <div className="pgw-m-details">
                  <p className="pgw-m-name">PoblaGo Delivery</p>
                  <p className="pgw-m-amount">₱{Number(amount).toFixed(2)}</p>
                </div>
              </div>
              <h2 className="pgw-title">Login to {logoText}</h2>
              <p className="pgw-subtitle">Enter your mobile number to proceed with the payment.</p>
              <div className="pgw-input-group">
                <span className="pgw-prefix">+63</span>
                <input 
                  type="number" 
                  placeholder="912 345 6789" 
                  value={mobile} 
                  onChange={e => setMobile(e.target.value)}
                  autoFocus
                />
              </div>
              <button className="pgw-btn" style={{ background: themeColor }} onClick={handleNext}>Next</button>
            </div>
          )}

          {step === 'otp' && (
            <div className="pgw-state slide-left">
              <h2 className="pgw-title">Authentication</h2>
              <p className="pgw-subtitle">We've sent a 6-digit authentication code to your registered mobile number.</p>
              <input 
                type="number" 
                className="pgw-input-solo" 
                placeholder="• • • • • •" 
                maxLength="6"
                value={otp} 
                onChange={e => setOtp(e.target.value.slice(0, 6))}
                autoFocus
              />
              <button className="pgw-btn" style={{ background: themeColor }} onClick={handleNext}>Submit OTP</button>
            </div>
          )}

          {step === 'pin' && (
            <div className="pgw-state slide-left">
              <h2 className="pgw-title">Enter your MPIN</h2>
              <p className="pgw-subtitle">Never share your MPIN with anyone.</p>
              <input 
                type="password" 
                className="pgw-input-solo pgw-pin" 
                placeholder="• • • •" 
                maxLength="4"
                value={pin} 
                onChange={e => setPin(e.target.value.slice(0, 4))}
                autoFocus
              />
              <button className="pgw-btn" style={{ background: themeColor }} onClick={handleNext}>Pay ₱{Number(amount).toFixed(2)}</button>
            </div>
          )}

          {step === 'processing' && (
            <div className="pgw-state center">
              <div className="pgw-spinner" style={{ borderTopColor: themeColor }}></div>
              <p>Processing your payment...</p>
              <p className="pgw-dont-close">Please do not close this window.</p>
            </div>
          )}

          {step === 'success' && (
            <div className="pgw-state center scale-in">
              <div className="pgw-success-icon" style={{ background: themeColor }}>
                <svg viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3" width="32" height="32">
                  <polyline points="20 6 9 17 4 12"/>
                </svg>
              </div>
              <h2 className="pgw-title" style={{ marginTop: 16 }}>Payment Successful!</h2>
              <p className="pgw-subtitle">₱{Number(amount).toFixed(2)} has been paid to PoblaGo.</p>
            </div>
          )}

        </div>
      </div>
    </div>
  )
}
