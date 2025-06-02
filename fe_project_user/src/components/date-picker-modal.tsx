"use client"

import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import { useState } from "react"
import { AlertTriangle } from "lucide-react"

interface DatePickerModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onDatesSelect: (dates: { moveIn: Date | null; moveOut: Date | null }) => void
}

export function DatePickerModal({ open, onOpenChange, onDatesSelect }: DatePickerModalProps) {
  const [moveInDate, setMoveInDate] = useState<Date | undefined>()
  const [moveOutDate, setMoveOutDate] = useState<Date | undefined>()

  const handleConfirm = () => {
    onDatesSelect({
      moveIn: moveInDate || null,
      moveOut: moveOutDate || null,
    })
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Select Your Stay Dates</DialogTitle>
        </DialogHeader>

        <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
          <div className="flex items-center gap-2 text-red-700">
            <AlertTriangle className="h-5 w-5" />
            <span className="font-medium">Important Notice</span>
          </div>
          <p className="text-red-600 text-sm mt-1">Host only allows move-ins within the next 30 days</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h3 className="font-semibold text-slate-800 mb-3">Move-in Date</h3>
            <Calendar
              mode="single"
              selected={moveInDate}
              onSelect={setMoveInDate}
              disabled={(date) => date < new Date() || date > new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)}
              className="rounded-md border"
            />
          </div>
          <div>
            <h3 className="font-semibold text-slate-800 mb-3">Move-out Date</h3>
            <Calendar
              mode="single"
              selected={moveOutDate}
              onSelect={setMoveOutDate}
              disabled={(date) => !moveInDate || date <= moveInDate}
              className="rounded-md border"
            />
          </div>
        </div>

        <div className="flex gap-3 pt-4">
          <Button variant="outline" onClick={() => onOpenChange(false)} className="flex-1 rounded-full">
            Cancel
          </Button>
          <Button
            onClick={handleConfirm}
            disabled={!moveInDate || !moveOutDate}
            className="flex-1 rounded-full bg-slate-800 hover:bg-slate-700"
          >
            Confirm Dates
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
