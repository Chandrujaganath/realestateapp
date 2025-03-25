'use client';

import React from 'react';
import { CameraOff, RefreshCw } from 'lucide-react';
import { useState, useEffect, useRef } from 'react';

import { Button } from '@/components/ui/button';
import { toast } from '@/hooks/use-toast';

// Define component props
interface QRScannerProps {
  onScan: (data: string) => void;
  onError?: (error: Error) => void;
  width?: number;
  height?: number;
  scanInterval?: number;
  showControls?: boolean;
}

export default function QRScanner({
  onScan,
  onError,
  width = 300,
  height = 300,
  scanInterval = 500,
  showControls = true,
}: QRScannerProps) {
  // State for video stream
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [scanning, setScanning] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [jsQR, setJsQR] = useState<any>(null);
  const [hasCamera, setHasCamera] = useState(true);

  // Refs for the video and canvas elements
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const scanIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Load jsQR dynamically
  useEffect(() => {
    const _loadJsQR = async () => {
      try {
        const _jsQRModule = await import('jsqr');
        setJsQR(() => _jsQRModule.default);
      } catch (err) {
        console.error('Failed to load jsQR:', err);
        setError('Failed to load QR scanner library');
        if (onError) onError(new Error('Failed to load QR scanner library'));
      }
    };

    _loadJsQR();

    return () => {
      // Clean up on unmount
      if (scanIntervalRef.current) {
        clearInterval(scanIntervalRef.current);
      }
    };
  }, [onError]);

  // Initialize camera when jsQR is loaded
  useEffect(() => {
    if (!jsQR) return;

    startCamera();

    return () => {
      stopCamera();
    };
  }, [jsQR]);

  // Start the camera
  const startCamera = async () => {
    try {
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        throw new Error('Camera access not supported by your browser');
      }

      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment' },
      });

      setStream(mediaStream);
      setHasCamera(true);
      setError(null);

      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
        videoRef.current
          .play()
          .then(() => {
            setScanning(true);
            _startScanning();
          })
          .catch((err) => {
            console.error('Error playing video:', err);
            setError('Failed to start video stream');
            if (onError) onError(err);
          });
      }
    } catch (err: any) {
      console.error('Error accessing camera:', err);
      setHasCamera(false);
      setError(err.message || 'Failed to access camera');
      if (onError) onError(err);
    }
  };

  // Stop the camera
  const stopCamera = () => {
    if (stream) {
      stream.getTracks().forEach((_track) => _track.stop());
      setStream(null);
    }

    if (scanIntervalRef.current) {
      clearInterval(scanIntervalRef.current);
      scanIntervalRef.current = null;
    }

    setScanning(false);
  };

  // Start scanning for QR codes
  const _startScanning = () => {
    if (!jsQR || !videoRef.current || !canvasRef.current) return;

    if (scanIntervalRef.current) {
      clearInterval(scanIntervalRef.current);
    }

    scanIntervalRef.current = setInterval(() => {
      const video = videoRef.current;
      const canvas = canvasRef.current;

      if (!video || !canvas || video.paused || video.ended) return;

      const context = canvas.getContext('2d');
      if (!context) return;

      const videoWidth = video.videoWidth;
      const videoHeight = video.videoHeight;

      if (videoWidth === 0 || videoHeight === 0) return;

      // Set canvas dimensions to match video
      canvas.width = videoWidth;
      canvas.height = videoHeight;

      // Draw video frame to canvas
      context.drawImage(video, 0, 0, videoWidth, videoHeight);

      // Get image data for QR code detection
      const imageData = context.getImageData(0, 0, videoWidth, videoHeight);

      // Detect QR code
      const code = jsQR(imageData.data, imageData.width, imageData.height, {
        inversionAttempts: 'dontInvert',
      });

      if (code) {
        // QR code detected
        onScan(code.data);

        // Highlight the found QR code for visual feedback
        context.beginPath();
        context.moveTo(code.location.topLeftCorner.x, code.location.topLeftCorner.y);
        context.lineTo(code.location.topRightCorner.x, code.location.topRightCorner.y);
        context.lineTo(code.location.bottomRightCorner.x, code.location.bottomRightCorner.y);
        context.lineTo(code.location.bottomLeftCorner.x, code.location.bottomLeftCorner.y);
        context.lineTo(code.location.topLeftCorner.x, code.location.topLeftCorner.y);
        context.lineWidth = 4;
        context.strokeStyle = '#FF3B58';
        context.stroke();
      }
    }, scanInterval);
  };

  // Restart the camera
  const handleRestart = () => {
    stopCamera();
    startCamera();
  };

  return (
    <div className="qr-scanner flex flex-col items-center">
      {hasCamera ? (
        <>
          <div className="relative overflow-hidden rounded-lg" style={{ width, height }}>
            <video
              ref={videoRef}
              className="h-full w-full object-cover"
              playsInline
              muted
              style={{
                display: scanning ? 'block' : 'none',
                maxWidth: '100%',
                maxHeight: '100%',
              }}
            />
            <canvas ref={canvasRef} className="absolute top-0 left-0 h-full w-full hidden" />

            {error && (
              <div className="absolute inset-0 flex items-center justify-center bg-black/70 text-white p-4 text-center">
                <div>
                  <p className="mb-2">{error}</p>
                  <Button
                    variant="outline"
                    onClick={handleRestart}
                    className="text-white border-white hover:bg-white/20"
                  >
                    <RefreshCw className="h-4 w-4 mr-2" />
                    Retry
                  </Button>
                </div>
              </div>
            )}

            {/* Scanning indicator */}
            {scanning && !error && (
              <div className="absolute top-2 left-2 bg-black/50 text-white text-xs px-2 py-1 rounded-full">
                Scanning...
              </div>
            )}

            {/* Overlay with scanning area */}
            <div className="absolute inset-0 pointer-events-none">
              <div className="absolute inset-0 border-[20px] border-black/50 box-border rounded-lg"></div>
              <div className="absolute inset-[20px] border border-white/70 box-border rounded-sm"></div>
            </div>
          </div>

          {showControls && (
            <div className="mt-4">
              <Button variant="outline" onClick={handleRestart} className="text-center">
                <RefreshCw className="h-4 w-4 mr-2" />
                Reset Camera
              </Button>
            </div>
          )}
        </>
      ) : (
        <div
          className="flex flex-col items-center justify-center bg-muted p-4 rounded-lg text-center"
          style={{ width, height }}
        >
          <CameraOff className="h-10 w-10 text-muted-foreground mb-3" />
          <h3 className="font-medium mb-2">Camera Not Available</h3>
          <p className="text-sm text-muted-foreground mb-4">
            {error || 'Unable to access camera for QR scanning'}
          </p>
          <Button variant="outline" onClick={handleRestart}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Try Again
          </Button>
        </div>
      )}
    </div>
  );
}
