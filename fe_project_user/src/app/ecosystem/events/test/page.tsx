'use client'

import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Checkbox } from '@/components/ui/checkbox'
import { Label } from '@/components/ui/label'

export default function TestPage() {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="text-center max-w-md">
        <h1 className="text-2xl font-bold mb-4">Test Page</h1>
        <p className="mb-4">Testing new components</p>
        
        {/* Test Radio Group */}
        <div className="mb-6 p-4 bg-white rounded-lg">
          <h3 className="font-semibold mb-3">Test Radio Group</h3>
          <RadioGroup defaultValue="option-1">
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="option-1" id="option-1" />
              <Label htmlFor="option-1">Option 1</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="option-2" id="option-2" />
              <Label htmlFor="option-2">Option 2</Label>
            </div>
          </RadioGroup>
        </div>

        {/* Test Checkbox */}
        <div className="mb-6 p-4 bg-white rounded-lg">
          <h3 className="font-semibold mb-3">Test Checkbox</h3>
          <div className="flex items-center space-x-2">
            <Checkbox id="test-checkbox" />
            <Label htmlFor="test-checkbox">Test checkbox</Label>
          </div>
        </div>

        <div className="space-y-2">
          <Link href="/ecosystem/events">
            <Button>Go to Events List</Button>
          </Link>
          <br />
          <Link href="/ecosystem/events/52af6109-728c-496b-b5d9-046296cd1a2e">
            <Button variant="outline">Test Event Detail (ID: 52af6109-728c-496b-b5d9-046296cd1a2e)</Button>
          </Link>
        </div>
      </div>
    </div>
  )
} 