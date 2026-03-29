import { useState, useEffect, useCallback } from 'react'

export default function RestTimer({ duration = 60, onComplete, onSkip }) {
  const [timeLeft, setTimeLeft] = useState(duration)
  const [isPaused, setIsPaused] = useState(false)

  useEffect(() => {
    setTimeLeft(duration)
    setIsPaused(false)
  }, [duration])

  useEffect(() => {
    if (isPaused || timeLeft <= 0) {
      if (timeLeft <= 0) {
        try { navigator.vibrate?.([200, 100, 200]) } catch(e) {}
        onComplete?.()
      }
      return
    }
    const interval = setInterval(() => {
      setTimeLeft(t => {
        if (t <= 1) {
          clearInterval(interval)
          return 0
        }
        return t - 1
      })
    }, 1000)
    return () => clearInterval(interval)
  }, [isPaused, timeLeft, onComplete])

  const progress = ((duration - timeLeft) / duration) * 100
  const radius = 70
  const circumference = 2 * Math.PI * radius
  const offset = circumference - (progress / 100) * circumference

  const minutes = Math.floor(timeLeft / 60)
  const seconds = timeLeft % 60

  return (
    <div className="flex flex-col items-center gap-6 animate-fade-in">
      <h3 className="text-lg font-semibold text-text-secondary">Temps de repos</h3>

      <div className="relative w-48 h-48">
        <svg className="w-full h-full transform -rotate-90" viewBox="0 0 160 160">
          <circle
            cx="80" cy="80" r={radius}
            stroke="rgba(139, 92, 246, 0.1)"
            strokeWidth="8"
            fill="none"
          />
          <circle
            cx="80" cy="80" r={radius}
            stroke="url(#timerGradient)"
            strokeWidth="8"
            fill="none"
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            style={{ transition: 'stroke-dashoffset 1s linear' }}
          />
          <defs>
            <linearGradient id="timerGradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#8b5cf6" />
              <stop offset="100%" stopColor="#06b6d4" />
            </linearGradient>
          </defs>
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-4xl font-bold text-text-primary tabular-nums">
            {minutes}:{seconds.toString().padStart(2, '0')}
          </span>
          <span className="text-xs text-text-muted mt-1">restant</span>
        </div>
      </div>

      <div className="flex gap-3">
        <button
          onClick={() => setIsPaused(!isPaused)}
          className="px-5 py-2.5 rounded-xl glass text-sm font-medium text-text-primary hover:bg-bg-card-hover transition-colors"
        >
          {isPaused ? '▶ Reprendre' : '⏸ Pause'}
        </button>
        <button
          onClick={onSkip}
          className="px-5 py-2.5 rounded-xl bg-primary/20 text-primary text-sm font-medium hover:bg-primary/30 transition-colors"
        >
          Passer ⏭
        </button>
      </div>
    </div>
  )
}
