"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ChevronDown, ChevronUp } from "lucide-react"
import { useState } from "react"

interface ServiceFAQProps {
  serviceKey: string
}

const faqData = {
  residents: [
    {
      question: "What's included in the rent?",
      answer:
        "All utilities, high-speed internet, cleaning service, access to common areas, and community events are included in your monthly rent.",
    },
    {
      question: "Is there a minimum stay requirement?",
      answer:
        "Yes, we require a minimum stay of 3 months to ensure community stability and allow you to fully experience our ecosystem.",
    },
    {
      question: "Can I have guests over?",
      answer:
        "Yes, guests are welcome with prior notice. Overnight guests can stay up to 3 nights per month in shared spaces.",
    },
    {
      question: "What about parking?",
      answer:
        "Parking is available for an additional fee. We also provide bike storage and are located near public transportation.",
    },
  ],
  coworking: [
    {
      question: "What are the operating hours?",
      answer:
        "Our coworking space is open 24/7 for dedicated desk and private office members. Hot desk access is available from 8 AM to 8 PM.",
    },
    {
      question: "Is there a meeting room booking system?",
      answer:
        "Yes, you can book meeting rooms through our app or website. Different membership levels have different booking allowances.",
    },
    {
      question: "Do you provide printing services?",
      answer:
        "Yes, we have high-quality printers, scanners, and copying services available. Basic printing is included, with charges for high-volume usage.",
    },
    {
      question: "Can I register my business address here?",
      answer: "Yes, private office members can use our address for business registration and mail handling services.",
    },
  ],
}

export function ServiceFAQ({ serviceKey }: ServiceFAQProps) {
  const [expandedFAQ, setExpandedFAQ] = useState<number | null>(null)
  const faqs = faqData[serviceKey as keyof typeof faqData] || []

  if (faqs.length === 0) return null

  const toggleFAQ = (index: number) => {
    setExpandedFAQ(expandedFAQ === index ? null : index)
  }

  return (
    <div className="mb-16">
      <div className="text-center mb-12">
        <h2 className="text-3xl font-bold text-slate-800 mb-4">Frequently Asked Questions</h2>
        <p className="text-lg text-slate-600 max-w-2xl mx-auto">
          Find answers to common questions about our services and policies.
        </p>
      </div>

      <div className="max-w-3xl mx-auto space-y-4">
        {faqs.map((faq, index) => (
          <Card key={index} className="rounded-2xl border-0 shadow-lg bg-white/80 backdrop-blur-sm overflow-hidden">
            <CardHeader className="cursor-pointer hover:bg-slate-50 transition-colors" onClick={() => toggleFAQ(index)}>
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg text-slate-800">{faq.question}</CardTitle>
                {expandedFAQ === index ? (
                  <ChevronUp className="h-5 w-5 text-slate-400" />
                ) : (
                  <ChevronDown className="h-5 w-5 text-slate-400" />
                )}
              </div>
            </CardHeader>
            {expandedFAQ === index && (
              <CardContent className="pt-0 pb-6">
                <p className="text-slate-600 leading-relaxed">{faq.answer}</p>
              </CardContent>
            )}
          </Card>
        ))}
      </div>
    </div>
  )
}
