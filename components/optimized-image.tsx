"use client"

import Image from "next/image"
import { useState } from "react"
import { cn } from "@/lib/utils"

interface OptimizedImageProps {
  src: string
  alt: string
  width: number
  height: number
  className?: string
  priority?: boolean
}

export function OptimizedImage({ src, alt, width, height, className, priority = false }: OptimizedImageProps) {
  const [isLoading, setIsLoading] = useState(true)

  return (
    <div className={cn("overflow-hidden relative", isLoading ? "bg-gray-200 animate-pulse" : "", className)}>
      <Image
        src={src || "/placeholder.svg"}
        alt={alt}
        width={width}
        height={height}
        className={cn("duration-700 ease-in-out", isLoading ? "scale-110 blur-sm" : "scale-100 blur-0")}
        onLoadingComplete={() => setIsLoading(false)}
        priority={priority}
      />
    </div>
  )
}

