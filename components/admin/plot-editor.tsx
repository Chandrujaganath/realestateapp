"use client"

import type React from "react"

import { useState, useEffect, useRef } from "react"
import { useToast } from "@/hooks/use-toast"

interface Plot {
  id: string
  number: string
  status: "available" | "sold" | "reserved"
  price?: number
  size?: string
  coordinates: { x: number; y: number; width: number; height: number }
}

interface PlotEditorProps {
  projectId: string
  initialPlots: Plot[]
}

export function PlotEditor({ projectId, initialPlots }: PlotEditorProps) {
  const { toast } = useToast()
  const [plots, setPlots] = useState<Plot[]>(initialPlots)
  const [selectedPlot, setSelectedPlot] = useState<Plot | null>(null)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [isEditMode, setIsEditMode] = useState(false)
  const [saving, setSaving] = useState(false)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [canvasSize, setCanvasSize] = useState({ width: 800, height: 600 })
  const [activeTab, setActiveTab] = useState<'visual' | 'list'>('visual')

  // New plot form state
  const [formData, setFormData] = useState({
    number: '',
    status: 'available',
    price: '',
    size: '',
    x: '',
    y: '',
    width: '',
    height: '',
  })

  useEffect(() => {
    if (activeTab === 'visual') {
      drawCanvas()
    }
  }, [plots, activeTab])

  const drawCanvas = () => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height)

    // Draw grid
    ctx.strokeStyle = '#e5e7eb'
    ctx.lineWidth = 1

    // Draw vertical grid lines
    for (let x = 0; x <= canvas.width; x += 50) {
      ctx.beginPath()
      ctx.moveTo(x, 0)
      ctx.lineTo(x, canvas.height)
      ctx.stroke()
    }

    // Draw horizontal grid lines
    for (let y = 0; y <= canvas.height; y += 50) {
      ctx.beginPath()
      ctx.moveTo(0, y)
      ctx.lineTo(canvas.width, y)
      ctx.stroke()
    }

    // Draw plots
    plots.forEach(plot => {
      const { x, y, width, height } = plot.coordinates

      // Set color based on status
      switch (plot.status) {
        case 'available':
          ctx.fillStyle = 'rgba(34, 197, 94, 0.2)' // green with opacity
          ctx.strokeStyle = 'rgb(34, 197, 94)'
          break
        case 'sold':
          ctx.fillStyle = 'rgba(239, 68, 68, 0.2)' // red with opacity
          ctx.strokeStyle = 'rgb(239, 68, 68)'
          break
        case 'reserved':
          ctx.fillStyle = 'rgba(234, 179, 8, 0.2)' // yellow with opacity
          ctx.strokeStyle = 'rgb(234, 179, 8)'
          break
        default:
          ctx.fillStyle = 'rgba(107, 114, 128, 0.2)' // gray with opacity
          ctx.strokeStyle = 'rgb(107, 114, 128)'
      }

      // Draw rectangle
      ctx.fillRect(x, y, width, height)
      ctx.lineWidth = 2
      ctx.strokeRect(x, y, width, height)

      // Draw plot number
      ctx.fillStyle = '#000'
      ctx.font = '14px Arial'
      ctx.textAlign = 'center'
      ctx.textBaseline = 'middle'
      ctx.fillText(plot.number, x + width / 2, y + height / 2)
    })
  }

  const handleCanvasClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current
    if (!canvas) return

    const rect = canvas.getBoundingClientRect()
    const x = e.clientX - rect.left
    const y = e.clientY - rect.top

    // Check if click is inside any plot
    const clickedPlot = plots.find(plot => {
      const { x: plotX, y: plotY, width, height } = plot.coordinates
      return x >= plotX && x <= plotX + width && y >= plotY && y <= plotY + height
    })

    if (clickedPlot) {
      setSelectedPlot(clickedPlot)
      setFormData({
        number: clickedPlot.number,
        status: clickedPlot.status,
        price: clickedPlot.price?.toString() || '',
        size: clickedPlot.size || '',
        x: clickedPlot.coordinates.x.toString(),
        y: clickedPlot.coordinates.y.toString(),
        width: clickedPlot.coordinates.width.toString(),
        height: clickedPlot.coordinates.height.toString(),
      })
      setIsEditMode(true)
      setIsDialogOpen(true)
    }
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const handleSelectChange = (name: string, value: string) => {
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const handleAddPlot = () => {
    setSelectedPlot(null)
    setFormData({
      number: '',
      status: 'available',
      price: '',
      size: '',
      x: '',
      y: '',
      width: '100',
      height: '100',
    })
    setIsEditMode(false)
    setIsDialogOpen(true)
  }

  const handleSavePlot = () => {
    // Validate form
    if (!formData.number || !formData.x || !formData.y || !formData.width || !formData.height) {
      toast({
        title: 'Validation Error',
        description: 'Please fill in all required fields.',
        variant: 'destructive',
      })
      return
    }

    const newPlot: Plot = {
      id: selectedPlot?.id || `plot-${Date.now()}`,
      number: formData.number,
      status: formData.status as 'available' | 'sold' | 'reserved',
      price: formData.price ? Number.parseFloat(formData.price) : undefined,
      size: formData.size || undefined,
      coordinates: {
        x: Number.parseInt(formData.x),
        y: Number.parseInt(formData.y),
        width: Number.parseInt(formData.width),
        height: Number.parseInt(formData.height),
      },
    }

    if (isEditMode) {
      // Update existing plot
      setPlots(plots.map(plot => plot.id === newPlot.id ? newPlot : plot))
    } else {
      // Add new plot
      setPlots([...plots, newPlot])
    }

    setIsDialogOpen(false)
  }
}

