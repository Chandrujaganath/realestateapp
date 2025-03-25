"use client"

import type React from "react"

import { useState, type FormEvent } from "react"
import { useAnalytics } from "@/lib/analytics"
import { useOnlineStatus } from "@/lib/offline"
import { createOfflineQueue } from "@/lib/offline"

// Interface for form state
interface FormState<T> {
  values: T
  errors: Partial<Record<keyof T, string>>
  touched: Partial<Record<keyof T, boolean>>
  isSubmitting: boolean
  isSubmitted: boolean
  submitCount: number
}

// Interface for form handlers
interface FormHandlers<T> {
  handleChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => void
  handleBlur: (e: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => void
  handleSubmit: (e: FormEvent<HTMLFormElement>) => void
  setFieldValue: (field: keyof T, value: any) => void
  setFieldError: (field: keyof T, error: string) => void
  resetForm: () => void
}

// Options for the form hook
interface FormOptions<T> {
  initialValues: T
  validate?: (values: T) => Partial<Record<keyof T, string>>
  onSubmit: (values: T, formHelpers: { resetForm: () => void }) => Promise<void> | void
  formName?: string // For analytics tracking
  offlineSupport?: boolean // Whether to queue the submission when offline
}

// Custom hook for form handling
export function useForm<T extends Record<string, any>>(options: FormOptions<T>): [FormState<T>, FormHandlers<T>] {
  const { initialValues, validate, onSubmit, formName, offlineSupport = false } = options
  const analytics = useAnalytics()
  const isOnline = useOnlineStatus()
  const offlineQueue = createOfflineQueue()

  // Form state
  const [formState, setFormState] = useState<FormState<T>>({
    values: initialValues,
    errors: {},
    touched: {},
    isSubmitting: false,
    isSubmitted: false,
    submitCount: 0,
  })

  // Validate form values
  const validateForm = (values: T) => {
    if (!validate) return {}
    return validate(values)
  }

  // Reset form to initial state
  const resetForm = () => {
    setFormState({
      values: initialValues,
      errors: {},
      touched: {},
      isSubmitting: false,
      isSubmitted: false,
      submitCount: 0,
    })
  }

  // Handle input change
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target

    // Handle different input types
    let parsedValue: any = value
    if (type === "number") {
      parsedValue = value === "" ? "" : Number(value)
    } else if (type === "checkbox") {
      parsedValue = (e.target as HTMLInputElement).checked
    }

    setFormState((prev) => ({
      ...prev,
      values: {
        ...prev.values,
        [name]: parsedValue,
      },
      touched: {
        ...prev.touched,
        [name]: true,
      },
    }))
  }

  // Handle input blur
  const handleBlur = (e: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name } = e.target

    setFormState((prev) => {
      const errors = validateForm(prev.values)

      return {
        ...prev,
        touched: {
          ...prev.touched,
          [name]: true,
        },
        errors,
      }
    })
  }

  // Set field value programmatically
  const setFieldValue = (field: keyof T, value: any) => {
    setFormState((prev) => ({
      ...prev,
      values: {
        ...prev.values,
        [field]: value,
      },
      touched: {
        ...prev.touched,
        [field]: true,
      },
    }))
  }

  // Set field error programmatically
  const setFieldError = (field: keyof T, error: string) => {
    setFormState((prev) => ({
      ...prev,
      errors: {
        ...prev.errors,
        [field]: error,
      },
    }))
  }

  // Handle form submission
  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()

    const errors = validateForm(formState.values)
    const hasErrors = Object.keys(errors).length > 0

    setFormState((prev) => ({
      ...prev,
      errors,
      touched: Object.keys(prev.values).reduce(
        (acc, key) => {
          acc[key as keyof T] = true
          return acc
        },
        {} as Partial<Record<keyof T, boolean>>,
      ),
      isSubmitted: true,
      submitCount: prev.submitCount + 1,
    }))

    if (hasErrors) {
      // Track form validation failure
      if (formName) {
        analytics.trackFormSubmit(formName, false, {
          reason: "validation_error",
          errors: Object.keys(errors),
        })
      }
      return
    }

    setFormState((prev) => ({
      ...prev,
      isSubmitting: true,
    }))

    try {
      // If offline and offline support is enabled, queue the submission
      if (!isOnline && offlineSupport) {
        offlineQueue.enqueue("formSubmit", {
          formName,
          values: formState.values,
        })

        // Track offline form submission
        if (formName) {
          analytics.trackFormSubmit(formName, true, { offline: true })
        }

        setFormState((prev) => ({
          ...prev,
          isSubmitting: false,
        }))

        return
      }

      // Otherwise, submit normally
      await onSubmit(formState.values, { resetForm })

      // Track successful form submission
      if (formName) {
        analytics.trackFormSubmit(formName, true)
      }
    } catch (error) {
      console.error("Form submission error:", error)

      // Track form submission error
      if (formName) {
        analytics.trackFormSubmit(formName, false, {
          reason: "submission_error",
          error: error instanceof Error ? error.message : String(error),
        })
      }
    } finally {
      setFormState((prev) => ({
        ...prev,
        isSubmitting: false,
      }))
    }
  }

  return [
    formState,
    {
      handleChange,
      handleBlur,
      handleSubmit,
      setFieldValue,
      setFieldError,
      resetForm,
    },
  ]
}

