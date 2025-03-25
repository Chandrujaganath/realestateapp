"use client"

import type React from "react"

import { AlertCircle, AlertTriangle, XCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"

interface ErrorAlertProps {
  title: string
  description: string
  variant?: "default" | "destructive" | "warning"
  action?: React.ReactNode
}

export function ErrorAlert({ title, description, variant = "default", action }: ErrorAlertProps) {
  const getIcon = () => {
    switch (variant) {
      case "destructive":
        return <XCircle className="h-4 w-4" />
      case "warning":
        return <AlertTriangle className="h-4 w-4" />
      default:
        return <AlertCircle className="h-4 w-4" />
    }
  }

  return (
    <Alert variant={variant}>
      {getIcon()}
      <AlertTitle>{title}</AlertTitle>
      <AlertDescription>{description}</AlertDescription>
      {action && <div className="mt-2">{action}</div>}
    </Alert>
  )
}

interface ErrorStateProps {
  title: string
  description: string
  retryAction?: () => void
}

export function ErrorState({ title, description, retryAction }: ErrorStateProps) {
  return (
    <div className="flex flex-col items-center justify-center p-6 text-center">
      <XCircle className="h-12 w-12 text-destructive mb-4" />
      <h2 className="text-2xl font-bold mb-2">{title}</h2>
      <p className="text-muted-foreground mb-4 max-w-md">{description}</p>
      {retryAction && <Button onClick={retryAction}>Try Again</Button>}
    </div>
  )
}

