import { Card, CardContent } from '@/components/ui/card'
import { Quote } from 'lucide-react'

interface DailyQuoteWidgetProps {
  text: string
  author: string | null
}

export function DailyQuoteWidget({ text, author }: DailyQuoteWidgetProps) {
  return (
    <Card>
      <CardContent className="p-5">
        <div className="w-8 h-8 rounded-xl bg-accent-green/10 flex items-center justify-center mb-3">
          <Quote size={14} className="text-accent-green" />
        </div>
        <p className="text-sm italic text-text-secondary leading-relaxed font-medium">{text}</p>
        {author && <p className="text-xs text-accent-green/60 mt-3 font-bold">— {author}</p>}
      </CardContent>
    </Card>
  )
}
