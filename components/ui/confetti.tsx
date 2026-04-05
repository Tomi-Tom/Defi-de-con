'use client'

import confetti from 'canvas-confetti'

export function fireConfetti(type: 'success' | 'milestone' = 'success') {
  if (type === 'milestone') {
    confetti({
      particleCount: 150,
      spread: 100,
      origin: { y: 0.6 },
      colors: ['#FFD700', '#FFA500', '#FF6B00', '#00ff87'],
    })
  } else {
    confetti({
      particleCount: 80,
      spread: 70,
      origin: { y: 0.7 },
      colors: ['#00ff87', '#00b85c', '#ffffff'],
    })
  }
}
