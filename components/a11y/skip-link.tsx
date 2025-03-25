"use client"

import { useState } from "react"

export function SkipToContent() {
  const [isFocused, setIsFocused] = useState(false)

  return (
    <a
      href="#main-content"
      className={`
        fixed top-2 left-2 p-3 bg-primary text-primary-foreground rounded 
        transition-transform duration-200 z-50
        ${isFocused ? "transform-none" : "-translate-y-16"}
      `}
      onFocus={() => setIsFocused(true)}
      onBlur={() => setIsFocused(false)}
    >
      Skip to content
    </a>
  )
}

