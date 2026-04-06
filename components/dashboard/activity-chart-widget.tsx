'use client'

import { Card, CardContent } from '@/components/ui/card'
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts'
import { TrendingUp } from 'lucide-react'

interface ActivityDay {
  date: string
  entries: number
  points: number
}

export function ActivityChartWidget({ data }: { data: ActivityDay[] }) {
  if (data.length < 2) return null

  return (
    <Card>
      <CardContent className="p-5">
        <h3 className="text-[10px] font-black uppercase tracking-[0.15em] text-text-muted flex items-center gap-2 mb-4">
          <TrendingUp size={12} />
          Activite — 14 derniers jours
        </h3>
        <ResponsiveContainer width="100%" height={180}>
          <AreaChart data={data}>
            <defs>
              <linearGradient id="greenGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#00ff87" stopOpacity={0.3} />
                <stop offset="100%" stopColor="#00ff87" stopOpacity={0} />
              </linearGradient>
            </defs>
            <XAxis dataKey="date" tick={{ fill: '#666', fontSize: 9 }} tickFormatter={(v: string) => v.slice(5)} />
            <YAxis tick={{ fill: '#666', fontSize: 9 }} width={30} />
            <Tooltip contentStyle={{ background: '#141414', border: '1px solid #222', borderRadius: 12, color: '#fff', fontSize: 12 }} />
            <Area type="monotone" dataKey="entries" stroke="#00ff87" strokeWidth={2} fill="url(#greenGrad)" />
          </AreaChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  )
}
