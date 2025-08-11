import { Clock } from 'lucide-react'
import type { AgendaItem } from '@/utils/safeParse'

interface AgendaTimelineProps {
  agenda: AgendaItem[]
}

export default function AgendaTimeline({ agenda }: AgendaTimelineProps) {
  if (!agenda || agenda.length === 0) {
    return (
      <div className="text-center text-gray-500 py-4">
        <p>No agenda specified</p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {agenda.map((item, index) => (
        <div key={index} className="container rounded-xl border p-4 bg-white">
          <div className="flex items-start space-x-3">
            <div className="flex-shrink-0">
              <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
                <Clock className="h-5 w-5 text-blue-600" />
              </div>
            </div>
            <div className="flex-1">
              <div className="flex items-center space-x-2 mb-2">
                <span className="font-semibold text-blue-600">
                  {item.start} - {item.end}
                </span>
              </div>
              <h4 className="text-base font-medium text-gray-900 mb-1">
                {item.title}
              </h4>
              {item.desc && (
                <p className="text-sm text-slate-600">
                  {item.desc}
                </p>
              )}
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}
