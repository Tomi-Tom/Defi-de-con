export const POINTS = {
  DAILY_ENTRY: 10,
  FIRST_ENTRY: 5,
  STREAK_3: 15,
  STREAK_7: 30,
  STREAK_14: 50,
  STREAK_30: 100,
} as const

export const STREAK_MILESTONES = [
  { days: 3, points: POINTS.STREAK_3, action: 'streak_3' },
  { days: 7, points: POINTS.STREAK_7, action: 'streak_7' },
  { days: 14, points: POINTS.STREAK_14, action: 'streak_14' },
  { days: 30, points: POINTS.STREAK_30, action: 'streak_30' },
] as const
