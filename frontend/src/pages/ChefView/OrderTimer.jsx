import { useEffect, useState } from 'react'

export default function OrderTimer({ createdAt, estimatedTime }) {
  const [elapsed, setElapsed] = useState(0)

  useEffect(() => {
    const interval = setInterval(() => {
      setElapsed((prev) => prev + 1)
    }, 1000)

    return () => clearInterval(interval)
  }, [])

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  const timePercentage =
    estimatedTime && estimatedTime > 0
      ? Math.min((elapsed / (estimatedTime * 60)) * 100, 100)
      : 0

  return (
    <div className="order-timer">
      <div className="timer-progress">
        <div
          className="timer-bar"
          style={{ width: `${timePercentage}%` }}
        ></div>
      </div>
      <p className="timer-text">{formatTime(elapsed)}</p>
    </div>
  )
}
