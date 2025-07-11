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

  const handleConfirm = () => {
    onDatesSelect({
      moveIn: moveInDate || null,
      moveOut: null,
    })
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl p-0 bg-white">
        <div className="px-8 pt-10 pb-8 flex flex-col items-center">
          <div className="flex flex-col items-center w-full mb-8">
            <span className="block w-12 h-0.5 bg-gray-200 mb-6" />
            <h2 className="text-3xl font-bold tracking-tight text-gray-900 text-center">When are you planning on moving?</h2>
          </div>
          <div className="flex justify-center w-full mb-10">
            <Calendar
              mode="single"
              selected={moveInDate}
              onSelect={setMoveInDate}
              className="rounded-md border-0 text-lg w-full"
              disabled={date => date < new Date(new Date().setDate(new Date().getDate() + 1))}
            />
          </div>
          <div className="flex justify-center w-full">
            <Button
              onClick={handleConfirm}
              disabled={!moveInDate}
              className="rounded-full bg-black hover:bg-gray-800 text-white px-10 py-2 text-lg font-semibold shadow min-w-[220px]"
            >
              Confirm Date
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
