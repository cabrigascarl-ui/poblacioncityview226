/**
 * PoblaGO brand mark — Premium Minimalist "P" with inner cloche and speed lines
 */
export function BrandMark({ size = 80, color = '#FF0000' }) {
  return (
    <svg viewBox="0 0 100 100" width={size} height={size} fill="none" xmlns="http://www.w3.org/2000/svg">
      {/* Speed lines on the left */}
      <path d="M 18 30 L 36 30" stroke={color} strokeWidth="5.5" strokeLinecap="round"/>
      <path d="M 12 45 L 30 45" stroke={color} strokeWidth="5.5" strokeLinecap="round"/>
      <path d="M 22 60 L 38 60" stroke={color} strokeWidth="5.5" strokeLinecap="round"/>
      
      {/* The elegant 'P' shape: swoosh from bottom left, curving into a smooth bowl */}
      <path 
        d="M 30 85 
           C 42 80, 50 68, 50 50 
           C 50 28, 48 15, 62 15 
           C 82 15, 92 25, 92 40 
           C 92 55, 82 65, 62 65 
           L 50 65" 
        stroke={color} 
        strokeWidth="9" 
        strokeLinecap="round" 
        strokeLinejoin="round"
      />

      {/* Food Cloche perfectly centered inside the 'P' bowl */}
      {/* Dome */}
      <path d="M 60 48 C 60 33, 80 33, 80 48" stroke={color} strokeWidth="4.5" strokeLinecap="round"/>
      {/* Plate */}
      <path d="M 56 48 L 84 48" stroke={color} strokeWidth="4.5" strokeLinecap="round"/>
      {/* Knob */}
      <circle cx="70" cy="30.5" r="3" fill={color}/>
    </svg>
  )
}

export function BrandWordmark({ className = '' }) {
  return (
    <h1 className={`brand-wordmark ${className}`}>
      <span className="brand-go">Poblacion</span>
    </h1>
  )
}
