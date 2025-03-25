"use client"

import type React from "react"

import { useEffect, useRef } from "react"

interface FocusTrapProps {
  children: React.ReactNode
  active?: boolean
  returnFocusOnDeactivate?: boolean
}

export function FocusTrap({ children, active = true, returnFocusOnDeactivate = true }: FocusTrapProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const previousFocusRef = useRef<HTMLElement | null>(null)

  // Save the currently focused element when the trap becomes active
  useEffect(() => {
    if (active && returnFocusOnDeactivate) {
      previousFocusRef.current = document.activeElement as HTMLElement
    }
  }, [active, returnFocusOnDeactivate])

  // Return focus to the previously focused element when the trap is deactivated
  useEffect(() => {
    if (!active && returnFocusOnDeactivate && previousFocusRef.current) {
      previousFocusRef.current.focus()
    }
  }, [active, returnFocusOnDeactivate])

  // Handle focus trapping
  useEffect(() => {
    if (!active || !containerRef.current) return

    const container = containerRef.current

    // Find all focusable elements
    const focusableElements = container.querySelectorAll(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])',
    )

    if (focusableElements.length === 0) return

    const firstElement = focusableElements[0] as HTMLElement
    const lastElement = focusableElements[focusableElements.length - 1] as HTMLElement

    // Focus the first element when the trap becomes active
    firstElement.focus()

    // Handle tab key to keep focus within the container
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key !== "Tab") return

      if (e.shiftKey) {
        // If shift+tab and focus is on first element, move to last element
        if (document.activeElement === firstElement) {
          e.preventDefault()
          lastElement.focus()
        }
      } else {
        // If tab and focus is on last element, move to first element
        if (document.activeElement === lastElement) {
          e.preventDefault()
          firstElement.focus()
        }
      }
    }

    document.addEventListener("keydown", handleKeyDown)
    return () => {
      document.removeEventListener("keydown", handleKeyDown)
    }
  }, [active])

  return <div ref={containerRef}>{children}</div>
}

