import { FirebaseError } from "firebase/app"
import { ToastActionElement } from "@/components/ui/toast"

export type ErrorWithMessage = {
  message: string
}

export type ErrorResponse = {
  title: string
  description: string
  variant?: "default" | "destructive"
  action?: ToastActionElement
}

/**
 * Type guard to check if an error has a message property
 */
export function isErrorWithMessage(error: unknown): error is ErrorWithMessage {
  return (
    typeof error === "object" &&
    error !== null &&
    "message" in error &&
    typeof (error as Record<string, unknown>).message === "string"
  )
}

/**
 * Get error message from unknown error
 */
export function getErrorMessage(error: unknown): string {
  if (isErrorWithMessage(error)) return error.message
  return String(error)
}

/**
 * Format Firebase error to user-friendly message
 */
export function formatFirebaseError(error: unknown): ErrorResponse {
  // Default error response
  const defaultError: ErrorResponse = {
    title: "Error",
    description: "An unexpected error occurred. Please try again.",
    variant: "destructive"
  }

  if (!isErrorWithMessage(error)) return defaultError

  // Handle Firebase errors
  if (error instanceof FirebaseError) {
    switch (error.code) {
      case "auth/user-not-found":
      case "auth/wrong-password":
        return {
          title: "Authentication Failed",
          description: "Invalid email or password. Please try again.",
          variant: "destructive"
        }
      case "auth/email-already-in-use":
        return {
          title: "Registration Failed",
          description: "This email is already in use. Please use a different email or try logging in.",
          variant: "destructive"
        }
      case "auth/weak-password":
        return {
          title: "Weak Password",
          description: "Your password is too weak. Please use a stronger password.",
          variant: "destructive"
        }
      case "auth/network-request-failed":
        return {
          title: "Network Error",
          description: "A network error occurred. Please check your connection and try again.",
          variant: "destructive"
        }
      case "permission-denied":
        return {
          title: "Access Denied",
          description: "You don't have permission to perform this action.",
          variant: "destructive"
        }
      default:
        return {
          title: "Error",
          description: error.message || defaultError.description,
          variant: "destructive"
        }
    }
  }

  return {
    title: "Error",
    description: error.message,
    variant: "destructive"
  }
}

/**
 * Format API errors to user-friendly message
 */
export function formatApiError(error: unknown): ErrorResponse {
  if (!isErrorWithMessage(error)) {
    return {
      title: "Error",
      description: "An unexpected error occurred. Please try again.",
      variant: "destructive"
    }
  }

  // Handle common API error patterns
  if (error.message.includes("Network Error") || error.message.includes("Failed to fetch")) {
    return {
      title: "Network Error",
      description: "Unable to connect to the server. Please check your internet connection.",
      variant: "destructive"
    }
  }

  if (error.message.includes("timeout") || error.message.includes("timed out")) {
    return {
      title: "Request Timeout",
      description: "The server took too long to respond. Please try again later.",
      variant: "destructive"
    }
  }

  return {
    title: "Error",
    description: error.message,
    variant: "destructive"
  }
} 