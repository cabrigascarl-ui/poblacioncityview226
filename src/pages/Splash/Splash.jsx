import { useEffect } from 'react'
import { BrandMark } from '../../components/Logo'
import './Splash.css'

export default function Splash({ onStart }) {
  useEffect(() => {
    const timer = setTimeout(() => {
      onStart?.()
    }, 2800)
    return () => clearTimeout(timer)
  }, [onStart])

  return (
    <div className="sp" onClick={onStart} role="button" tabIndex={0} onKeyDown={e => e.key === 'Enter' && onStart?.()}>
      <div className="sp-content">
        <div className="sp-logo-wrap">
          <BrandMark size={120} color="#FF0000" />
        </div>
        <h1 className="sp-wordmark">
          <span className="sp-go">Poblacion</span>
        </h1>
        <p className="sp-exclusive">Everything You Love from</p>
        <p className="sp-city">Poblacion City View</p>
      </div>
    </div>
  )
}
