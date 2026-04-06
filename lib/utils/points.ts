export const POINTS = {
  DAILY_ENTRY: 10,
  STREAK_DAILY_BONUS: 1,  // +1 per entry when streak >= 3 days
  FIRST_ENTRY: 5,         // deprecated — kept for type compat
  STREAK_3: 15,
  STREAK_7: 30,
  STREAK_14: 50,
  STREAK_30: 100,
  GOAL_MISSED_PENALTY: -3,   // per field where goal not met
  GOAL_CATCHUP_BONUS: 5,     // when user exceeds goal (catching up deficit)
  GOAL_PERFECT_BONUS: 2,     // all goals met exactly or exceeded
} as const

export const STREAK_MILESTONES = [
  { days: 3, points: POINTS.STREAK_3, action: 'streak_3' },
  { days: 7, points: POINTS.STREAK_7, action: 'streak_7' },
  { days: 14, points: POINTS.STREAK_14, action: 'streak_14' },
  { days: 30, points: POINTS.STREAK_30, action: 'streak_30' },
] as const
