"use client"

import { useState, useRef, useEffect } from "react"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Camera, Check, X, RefreshCw } from "lucide-react"
import { httpsCallable } from "firebase/functions"
import { functions } from "@/lib/firebase"
import { toast } from "@/hooks/use-toast"

export function QRCodeScanner() {
  const [scanning, setScanning] = useState(false)
  const [scanResult, setScanResult] = useState<any>(null)
  const [error, setError] = useState<string | null>(null)
  const [scanType, setScanType] = useState<"entry" | "exit">("entry")
  const [loading, setLoading] = useState(false)
  const videoRef = useRef<HTMLVideoElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const scanIntervalRef = useRef<NodeJS.Timeout | null>(null)

  // Import QR code scanner library dynamically
  useEffect(() => {
    if (scanning) {
      import("jsqr")
        .then((jsQR) => {
          startScanner(jsQR.default)
        })
        .catch((err) => {
          console.error("Failed to load jsQR:", err)
          setError("Failed to load QR scanner")
          setScanning(false)
        })
    } else {
      if (scanIntervalRef.current) {
        clearInterval(scanIntervalRef.current)
        scanIntervalRef.current = null
      }

      // Stop camera stream
      if (videoRef.current && videoRef.current.srcObject) {
        const stream = videoRef.current.srcObject as MediaStream
        stream.getTracks().forEach((track) => track.stop())
        videoRef.current.srcObject = null
      }
    }

    return () => {
      if (scanIntervalRef.current) {
        clearInterval(scanIntervalRef.current)
      }

      // Clean up camera stream
      if (videoRef.current && videoRef.current.srcObject) {
        const stream = videoRef.current.srcObject as MediaStream
        stream.getTracks().forEach((track) => track.stop())
      }
    }
  }, [scanning])

  const startScanner = async (jsQR: any) => {
    try {
      const constraints = {
        video: {
          facingMode: "environment",
        },
      }

      const stream = await navigator.mediaDevices.getUserMedia(constraints)

      if (videoRef.current) {
        videoRef.current.srcObject = stream
        videoRef.current.play()
      }

      scanIntervalRef.current = setInterval(() => {
        if (videoRef.current && canvasRef.current) {
          const canvas = canvasRef.current
          const video = videoRef.current

          if (video.readyState === video.HAVE_ENOUGH_DATA) {
            const ctx = canvas.getContext("2d")
            if (!ctx) return

            canvas.height = video.videoHeight
            canvas.width = video.videoWidth

            ctx.drawImage(video, 0, 0, canvas.width, canvas.height)
            const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height)

            const code = jsQR(imageData.data, imageData.width, imageData.height, {
              inversionAttempts: "dontInvert",
            })

            if (code) {
              // QR code detected
              clearInterval(scanIntervalRef.current!)
              scanIntervalRef.current = null
              setScanning(false)

              try {
                // Try to parse the QR data
                const qrData = code.data
                verifyQRCode(qrData)
              } catch (err) {
                console.error("Invalid QR code format:", err)
                setError("Invalid QR code format")
              }
            }
          }
        }
      }, 100)
    } catch (err) {
      console.error("Error accessing camera:", err)
      setError("Could not access camera. Please check permissions.")
      setScanning(false)
    }
  }

  const verifyQRCode = async (qrData: string) => {
    try {
      setLoading(true)

      // Call the Cloud Function to verify the QR code
      const verifyQRCodeFn = httpsCallable(functions, "verifyQRCode")

      const result = await verifyQRCodeFn({
        qrData,
        scanType,
        gateId: "manual-scan",
      })

      setScanResult(result.data)

      toast({
        title: "Success",
        description: `${scanType === "entry" ? "Entry" : "Exit"} recorded successfully`,
        variant: "default",
      })
    } catch (err: any) {
      console.error("Error verifying QR code:", err)
      setError(err.message || "Failed to verify QR code")
    } finally {
      setLoading(false)
    }
  }

  const resetScanner = () => {
    setScanResult(null)
    setError(null)
  }

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle>QR Code Scanner</CardTitle>
        <CardDescription>Scan visitor QR codes for entry and exit</CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="entry" value={scanType} onValueChange={(value) => setScanType(value as "entry" | "exit")}>
          <TabsList className="grid grid-cols-2 mb-4">
            <TabsTrigger value="entry">Entry</TabsTrigger>
            <TabsTrigger value="exit">Exit</TabsTrigger>
          </TabsList>
        </Tabs>

        {error && (
          <Alert variant="destructive" className="mb-4">
            <X className="h-4 w-4" />
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {scanResult && (
          <Alert className="mb-4">
            <Check className="h-4 w-4" />
            <AlertTitle>Success</AlertTitle>
            <AlertDescription>
              {scanResult.message}
              <div className="mt-2 text-sm">
                <p>
                  <strong>Guest:</strong> {scanResult.guestName}
                </p>
                <p>
                  <strong>Project:</strong> {scanResult.projectName}
                </p>
                <p>
                  <strong>Visit Date:</strong> {new Date(scanResult.visitDate).toLocaleDateString()}
                </p>
              </div>
            </AlertDescription>
          </Alert>
        )}

        <div className="relative">
          {scanning ? (
            <>
              <video ref={videoRef} className="w-full h-64 bg-black rounded-lg object-cover" playsInline />
              <canvas ref={canvasRef} className="absolute top-0 left-0 w-full h-full hidden" />
              <div className="absolute inset-0 border-2 border-dashed border-primary/50 rounded-lg pointer-events-none" />
            </>
          ) : (
            <div className="w-full h-64 bg-muted rounded-lg flex items-center justify-center">
              <Camera className="h-12 w-12 text-muted-foreground opacity-50" />
            </div>
          )}
        </div>
      </CardContent>
      <CardFooter className="flex justify-center">
        {!scanning && !scanResult && !loading && (
          <Button onClick={() => setScanning(true)}>
            <Camera className="mr-2 h-4 w-4" />
            Start Scanning
          </Button>
        )}

        {scanning && (
          <Button variant="outline" onClick={() => setScanning(false)}>
            Cancel
          </Button>
        )}

        {(scanResult || error) && (
          <Button onClick={resetScanner}>
            <RefreshCw className="mr-2 h-4 w-4" />
            Scan Again
          </Button>
        )}

        {loading && (
          <Button disabled>
            <div className="animate-spin mr-2 h-4 w-4 border-2 border-current border-t-transparent rounded-full" />
            Processing...
          </Button>
        )}
      </CardFooter>
    </Card>
  )
}

