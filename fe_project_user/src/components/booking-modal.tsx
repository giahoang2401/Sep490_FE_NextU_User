"use client"

import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { Calendar, Clock, MapPin, AlertCircle } from "lucide-react"

interface BookingModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  roomData: {
    name: string
    price: number
  }
  selectedDates: {
    moveIn: Date | null
    moveOut: Date | null
  }
  duration: string
}

export function BookingModal({ open, onOpenChange, roomData, selectedDates, duration }: BookingModalProps) {
  const serviceFee = 50000
  const total = roomData.price + serviceFee

  const handleBookingRequest = () => {
    // Handle booking request logic here
    alert("Booking request sent! Our team will review and contact you soon.")
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Booking Confirmation</DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Room Summary */}
          <Card className="border-0 bg-slate-50">
            <CardContent className="p-4">
              <h3 className="font-semibold text-slate-800 mb-2">{roomData.name}</h3>
              <div className="flex items-center gap-2 text-slate-600 text-sm">
                <MapPin className="h-4 w-4" />
                <span>City Center Location</span>
              </div>
            </CardContent>
          </Card>

          {/* Stay Details */}
          <div className="space-y-3">
            <h4 className="font-semibold text-slate-800">Stay Details</h4>

            {selectedDates.moveIn && selectedDates.moveOut && (
              <div className="flex items-center gap-3 text-slate-600">
                <Calendar className="h-4 w-4" />
                <span>
                  {selectedDates.moveIn.toLocaleDateString()} - {selectedDates.moveOut.toLocaleDateString()}
                </span>
              </div>
            )}

            {duration && (
              <div className="flex items-center gap-3 text-slate-600">
                <Clock className="h-4 w-4" />
                <span>{duration}</span>
              </div>
            )}
          </div>

          {/* Price Breakdown */}
          <div className="space-y-3">
            <h4 className="font-semibold text-slate-800">Price Breakdown</h4>
            <div className="space-y-2">
              <div className="flex justify-between text-slate-600">
                <span>Nightly rate</span>
                <span>₫{roomData.price.toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-slate-600">
                <span>Service fee</span>
                <span>₫{serviceFee.toLocaleString()}</span>
              </div>
              <Separator />
              <div className="flex justify-between font-semibold text-slate-800">
                <span>Total per night</span>
                <span>₫{total.toLocaleString()}</span>
              </div>
            </div>
          </div>

          {/* Important Notice */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex items-start gap-2">
              <AlertCircle className="h-5 w-5 text-blue-600 mt-0.5" />
              <div className="text-blue-800">
                <p className="font-medium mb-1">Manual Review Process</p>
                <p className="text-sm">
                  Your booking request will be reviewed manually by our staff. We'll contact you within 24 hours to
                  confirm availability and next steps.
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="flex gap-3 pt-4">
          <Button variant="outline" onClick={() => onOpenChange(false)} className="flex-1 rounded-full">
            Cancel
          </Button>
          <Button onClick={handleBookingRequest} className="flex-1 rounded-full bg-slate-800 hover:bg-slate-700">
            Send Booking Request
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
