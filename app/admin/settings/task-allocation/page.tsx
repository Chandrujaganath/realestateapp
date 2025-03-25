"use client"

import { useState } from "react"
import { useAuth } from '@/contexts/auth-context'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export default function TaskAllocationSettings() {
  const auth = useAuth()
  const [loading, setLoading] = useState(false)

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Task Allocation Settings</h1>
        <p className="text-muted-foreground">Configure how tasks are allocated to managers</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Task Distribution Settings</CardTitle>
        </CardHeader>
        <CardContent>
          <p>Configure task allocation settings here.</p>
        </CardContent>
      </Card>
    </div>
  )
}


