import { CheckCircle } from 'lucide-react'

interface RequirementsChipsProps {
  notes: string[]
}

export default function RequirementsChips({ notes }: RequirementsChipsProps) {
  if (!notes || notes.length === 0) {
    return (
      <div className="text-center text-gray-500 py-4">
        <p>No requirements specified</p>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
      {notes.map((note, index) => (
        <div key={index} className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
          <CheckCircle className="h-4 w-4 text-green-500 flex-shrink-0" />
          <span className="text-gray-700">{note}</span>
        </div>
      ))}
    </div>
  )
}
