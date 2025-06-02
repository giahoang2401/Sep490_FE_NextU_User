"use client"

import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useState } from "react"

interface DurationModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onDurationSelect: (duration: string) => void
}

const presetDurations = [
  { label: "1 month", value: "1" },
  { label: "2 months", value: "2" },
  { label: "3 months", value: "3" },
  { label: "6 months", value: "6" },
  { label: "9 months", value: "9" },
  { label: "12 months", value: "12" },
]

export function DurationModal({ open, onOpenChange, onDurationSelect }: DurationModalProps) {
  const [selectedDuration, setSelectedDuration] = useState("")
  const [customDuration, setCustomDuration] = useState("")
  const [isCustom, setIsCustom] = useState(false)

  const handlePresetSelect = (duration: string) => {
    setSelectedDuration(duration)
    setIsCustom(false)
    setCustomDuration("")
  }

  const handleCustomSelect = () => {
    setIsCustom(true)
    setSelectedDuration("")
  }

  const handleConfirm = () => {
    const duration = isCustom ? customDuration : selectedDuration
    if (duration) {
      onDurationSelect(`${duration} month${Number.parseInt(duration) > 1 ? "s" : ""}`)
      onOpenChange(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Select Stay Duration</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            {presetDurations.map((duration) => (
              <Button
                key={duration.value}
                variant={selectedDuration === duration.value ? "default" : "outline"}
                className="rounded-full"
                onClick={() => handlePresetSelect(duration.value)}
              >
                {duration.label}
              </Button>
            ))}
          </div>

          <div className="border-t pt-4">
            <Button
              variant={isCustom ? "default" : "outline"}
              className="w-full rounded-full mb-3"
              onClick={handleCustomSelect}
            >
              Custom Duration
            </Button>

            {isCustom && (
              <div className="space-y-2">
                <Label htmlFor="custom-duration">Number of months</Label>
                <Input
                  id="custom-duration"
                  type="number"
                  min="1"
                  max="24"
                  value={customDuration}
                  onChange={(e) => setCustomDuration(e.target.value)}
                  placeholder="Enter number of months"
                  className="rounded-full"
                />
              </div>
            )}
          </div>
        </div>

        <div className="flex gap-3 pt-4">
          <Button variant="outline" onClick={() => onOpenChange(false)} className="flex-1 rounded-full">
            Cancel
          </Button>
          <Button
            onClick={handleConfirm}
            disabled={!selectedDuration && !customDuration}
            className="flex-1 rounded-full bg-slate-800 hover:bg-slate-700"
          >
            Confirm Duration
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
