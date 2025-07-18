import { Loader2 } from "lucide-react"

interface LoadingSpinnerProps {
  message?: string
  size?: "sm" | "md" | "lg"
}

export function LoadingSpinner({ message = "Loading...", size = "md" }: LoadingSpinnerProps) {
  const sizeClasses = {
    sm: "h-4 w-4",
    md: "h-8 w-8", 
    lg: "h-12 w-12"
  }

  return (
    <div className="flex items-center justify-center h-64">
      <Loader2 className={`${sizeClasses[size]} animate-spin text-slate-600`} />
      <span className="ml-2 text-slate-600">{message}</span>
    </div>
  )
} 