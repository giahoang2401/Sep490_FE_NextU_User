"use client"

import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { QrCode, Copy, CheckCircle, Clock, CreditCard } from "lucide-react"

interface PaymentModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  packageData: any
  onPaymentSuccess: () => void
}

export function PaymentModal({ open, onOpenChange, packageData, onPaymentSuccess }: PaymentModalProps) {
  const [paymentStep, setPaymentStep] = useState<"details" | "qr" | "success">("details")
  const [timeLeft, setTimeLeft] = useState(900) // 15 minutes in seconds
  const [qrCode, setQrCode] = useState("")

  useEffect(() => {
    if (paymentStep === "qr" && timeLeft > 0) {
      const timer = setInterval(() => {
        setTimeLeft((prev) => prev - 1)
      }, 1000)
      return () => clearInterval(timer)
    }
  }, [paymentStep, timeLeft])

  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60)
    const remainingSeconds = seconds % 60
    return `${minutes}:${remainingSeconds.toString().padStart(2, "0")}`
  }

  const generateQRCode = () => {
    // Generate QR code data (in real app, this would come from payment provider)
    const qrData = `nextU_payment_${packageData?.id}_${Date.now()}`
    setQrCode(qrData)
    setPaymentStep("qr")
  }

  const simulatePaymentSuccess = () => {
    setTimeout(() => {
      setPaymentStep("success")
      setTimeout(() => {
        onPaymentSuccess()
        setPaymentStep("details")
        setTimeLeft(900)
      }, 2000)
    }, 3000)
  }

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
  }

  if (!packageData) return null

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Payment</DialogTitle>
        </DialogHeader>

        {paymentStep === "details" && (
          <div className="space-y-6">
            {/* Package Details */}
            <Card className="border-0 bg-slate-50">
              <CardContent className="p-4">
                <h3 className="font-semibold text-slate-800 mb-2">{packageData.packageName}</h3>
                <p className="text-slate-600 capitalize mb-2">{packageData.location.replace("-", " ")}</p>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-slate-600">
                    Duration: {packageData.duration} month{packageData.duration > 1 ? "s" : ""}
                  </span>
                  <Badge className="bg-green-500">Approved</Badge>
                </div>
              </CardContent>
            </Card>

            {/* Price Breakdown */}
            <div className="space-y-3">
              <h4 className="font-semibold text-slate-800">Price Breakdown</h4>
              <div className="space-y-2">
                <div className="flex justify-between text-slate-600">
                  <span>
                    Package fee ({packageData.duration} month{packageData.duration > 1 ? "s" : ""})
                  </span>
                  <span>₫{packageData.totalPrice.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-slate-600">
                  <span>Processing fee</span>
                  <span>₫0</span>
                </div>
                <Separator />
                <div className="flex justify-between font-semibold text-slate-800 text-lg">
                  <span>Total</span>
                  <span>₫{packageData.totalPrice.toLocaleString()}</span>
                </div>
              </div>
            </div>

            <Button className="w-full rounded-full bg-slate-800 hover:bg-slate-700" onClick={generateQRCode}>
              <QrCode className="h-4 w-4 mr-2" />
              Generate QR Code
            </Button>
          </div>
        )}

        {paymentStep === "qr" && (
          <div className="space-y-6 text-center">
            {/* Timer */}
            <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
              <div className="flex items-center justify-center gap-2 text-orange-700">
                <Clock className="h-5 w-5" />
                <span className="font-medium">Time remaining: {formatTime(timeLeft)}</span>
              </div>
            </div>

            {/* QR Code */}
            <div className="bg-white p-8 rounded-2xl border-2 border-slate-200">
              <div className="w-48 h-48 bg-slate-100 rounded-lg mx-auto flex items-center justify-center mb-4">
                <QrCode className="h-24 w-24 text-slate-400" />
              </div>
              <p className="text-sm text-slate-600 mb-2">Scan with your banking app</p>
              <div className="bg-slate-50 p-2 rounded text-xs font-mono break-all">{qrCode}</div>
            </div>

            {/* Payment Instructions */}
            <div className="text-left space-y-3">
              <h4 className="font-semibold text-slate-800">Payment Instructions:</h4>
              <ol className="text-sm text-slate-600 space-y-1 list-decimal list-inside">
                <li>Open your banking app</li>
                <li>Scan the QR code above</li>
                <li>Verify the amount: ₫{packageData.totalPrice.toLocaleString()}</li>
                <li>Complete the payment</li>
              </ol>
            </div>

            {/* Bank Details */}
            <Card className="border-0 bg-slate-50 text-left">
              <CardContent className="p-4 space-y-2">
                <h5 className="font-semibold text-slate-800">Bank Transfer Details:</h5>
                <div className="space-y-1 text-sm">
                  <div className="flex justify-between">
                    <span className="text-slate-600">Bank:</span>
                    <span className="font-medium">Vietcombank</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-600">Account:</span>
                    <div className="flex items-center gap-2">
                      <span className="font-medium">1234567890</span>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-6 w-6 p-0"
                        onClick={() => copyToClipboard("1234567890")}
                      >
                        <Copy className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-600">Name:</span>
                    <span className="font-medium">Next Universe Co., Ltd</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-600">Amount:</span>
                    <span className="font-medium">₫{packageData.totalPrice.toLocaleString()}</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Simulate Payment Button (for demo) */}
            <Button variant="outline" className="w-full rounded-full" onClick={simulatePaymentSuccess}>
              <CreditCard className="h-4 w-4 mr-2" />
              Simulate Payment (Demo)
            </Button>
          </div>
        )}

        {paymentStep === "success" && (
          <div className="space-y-6 text-center">
            <div className="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center mx-auto">
              <CheckCircle className="h-8 w-8 text-white" />
            </div>
            <div>
              <h3 className="text-xl font-semibold text-slate-800 mb-2">Payment Successful!</h3>
              <p className="text-slate-600">Your payment has been processed successfully. Welcome to Next Universe!</p>
            </div>
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <p className="text-green-800 text-sm">
                You will receive a confirmation email shortly with your package details and access information.
              </p>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}
