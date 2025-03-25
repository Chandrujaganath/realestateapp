"use client"

import { useEffect } from "react"

import { useState } from "react"

import type React from "react"

// Utility for accessibility testing in development

// Check for common accessibility issues
export function checkAccessibility(element: HTMLElement): string[] {
  const issues: string[] = []

  // Check for images without alt text
  const images = element.querySelectorAll("img")
  images.forEach((img, index) => {
    if (!img.hasAttribute("alt")) {
      issues.push(`Image #${index + 1} is missing alt text`)
    }
  })

  // Check for buttons without accessible names
  const buttons = element.querySelectorAll("button")
  buttons.forEach((button, index) => {
    if (!button.textContent && !button.getAttribute("aria-label") && !button.getAttribute("title")) {
      issues.push(`Button #${index + 1} is missing an accessible name`)
    }
  })

  // Check for form elements without labels
  const formElements = element.querySelectorAll("input, select, textarea")
  formElements.forEach((el, index) => {
    const input = el as HTMLInputElement
    const id = input.id

    if (id) {
      const label = element.querySelector(`label[for="${id}"]`)
      if (!label && !input.getAttribute("aria-label") && !input.getAttribute("aria-labelledby")) {
        issues.push(`Form element #${index + 1} (${input.type || el.tagName.toLowerCase()}) is missing a label`)
      }
    } else {
      issues.push(
        `Form element #${index + 1} (${input.type || el.tagName.toLowerCase()}) is missing an id for label association`,
      )
    }
  })

  // Check for proper heading hierarchy
  const headings = element.querySelectorAll("h1, h2, h3, h4, h5, h6")
  let lastLevel = 0
  headings.forEach((heading, index) => {
    const level = Number.parseInt(heading.tagName.charAt(1))

    if (index === 0 && level !== 1) {
      issues.push(`First heading is not an h1`)
    }

    if (index > 0 && level > lastLevel + 1) {
      issues.push(`Heading hierarchy skips from h${lastLevel} to h${level}`)
    }

    lastLevel = level
  })

  return issues
}

// Hook for accessibility testing in development
export function useA11yTesting(elementRef: React.RefObject<HTMLElement>) {
  const [issues, setIssues] = useState<string[]>([])

  useEffect(() => {
    // Only run in development
    if (process.env.NODE_ENV !== "development") return

    const element = elementRef.current
    if (!element) return

    // Check for accessibility issues
    const foundIssues = checkAccessibility(element)
    setIssues(foundIssues)

    // Log issues to console
    if (foundIssues.length > 0) {
      console.group("Accessibility Issues")
      foundIssues.forEach((issue) => console.warn(issue))
      console.groupEnd()
    }
  }, [elementRef])

  return issues
}

