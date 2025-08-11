import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'

interface InstructorCardProps {
  instructor: {
    name: string
    experience?: string
  }
}

export default function InstructorCard({ instructor }: InstructorCardProps) {
  if (!instructor || !instructor.name) {
    return (
      <div className="text-center text-gray-500 py-4">
        <p>No instructor information available</p>
      </div>
    )
  }

  return (
    <div className="flex items-start space-x-4">
      <Avatar className="h-12 w-12 rounded-full bg-slate-200 flex items-center justify-center text-slate-700 font-semibold">
        <AvatarFallback>{instructor.name.charAt(0).toUpperCase()}</AvatarFallback>
      </Avatar>
      <div className="flex-1">
        <h3 className="text-xl font-semibold text-gray-900 mb-2">
          {instructor.name}
        </h3>
        {instructor.experience && (
          <p className="text-gray-600 mb-3 leading-relaxed">
            {instructor.experience}
          </p>
        )}
        <div className="flex items-center space-x-2">
          <Badge variant="secondary" className="bg-blue-100 text-blue-800">
            Instructor
          </Badge>
        </div>
      </div>
    </div>
  )
}
