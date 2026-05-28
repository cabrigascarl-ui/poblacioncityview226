import { BrandMark } from '../../components/Logo'
import './GetStarted.css'

export default function GetStarted({ onLogin, onRegister, onGuest }) {
  return (
    <div className="gs-container">
      <div className="gs-content">
        {/* Top section — Logo + Branding */}
        <div className="gs-top">
          <div className="gs-logo-wrap">
            <BrandMark size={90} color="#FF0000" />
          </div>
          <h1 className="gs-wordmark">
            <span className="gs-go">Poblacion</span>
          </h1>
          <p className="gs-exclusive">Everything You Love from</p>
          <p className="gs-city">Poblacion City View</p>
        </div>

        {/* Bottom section — Action Buttons */}
        <div className="gs-actions">
          <button className="gs-btn-base gs-btn-login" onClick={onLogin} id="btn-gs-login">
            Login
          </button>

          <button className="gs-btn-base gs-btn-register" onClick={onRegister} id="btn-gs-register">
            Register
          </button>
        </div>
      </div>
    </div>
  )
}
