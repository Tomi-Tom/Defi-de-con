import { Card, CardContent } from '@/components/ui/card'

interface DailyQuoteWidgetProps {
  text: string
  author: string | null
}

export function DailyQuoteWidget({ text, author }: DailyQuoteWidgetProps) {
  return (
    <Card>
      <CardContent className="p-4">
        <p className="text-sm italic text-text-secondary leading-relaxed">"{text}"</p>
        {author && <p className="text-xs text-text-muted mt-2 font-semibold">— {author}</p>}
      </CardContent>
    </Card>
  )
}
