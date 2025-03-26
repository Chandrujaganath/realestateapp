'use client';

import { Camera, Check, X, MapPin, Clock, User, RefreshCw, CalendarClock } from 'lucide-react';
import dynamic from 'next/dynamic';
import { useState } from 'react';

import BackButton from '@/components/back-button';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useAuth } from '@/hooks/use-auth';
import { toast } from '@/hooks/use-toast';

// Dynamically import QR scanner to avoid SSR issues
const QRScanner = dynamic(() => import('@/components/qr-scanner'), {
  ssr: false,
});

export default function ScanQrPage() {
  const { user, verifyQrCode } = useAuth();
  const [activeTab, setActiveTab] = useState<'plot' | 'visit'>('visit');
  const [scanning, setScanning] = useState(false);
  const [scanResult, setScanResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleScan = async (data: string) => {
    if (!data) return;

    try {
      setLoading(true);
      setScanning(false);

      // The data should be a JSON string with a format like:
      // { type: 'visit|plot', id: 'xyz123', token: 'abc123' }
      const qrData = JSON.parse(data);

      if (!qrData.type || !qrData.id) {
        throw new Error('Invalid QR code format');
      }

      // Process the QR code based on type
      if (qrData.type === activeTab) {
        // Verify with the backend
        if (verifyQrCode) {
          const _result = await verifyQrCode(qrData);
          setScanResult(result);
          toast({
            title: 'Success',
            description: `${activeTab === 'plot' ? 'Plot' : 'Visit'} QR code verified successfully`,
          });
        } else {
          // Mock success for now
          setScanResult({
            success: true,
            type: qrData.type,
            id: qrData.id,
            data: {
              name: qrData.type === 'plot' ? 'Plot #123 - Sunrise Gardens' : 'Visit for John Doe',
              date: new Date().toISOString(),
              status: 'verified',
            },
          });
          toast({
            title: 'Success',
            description: `${activeTab === 'plot' ? 'Plot' : 'Visit'} QR code verified successfully`,
          });
        }
      } else {
        throw new Error(`Expected ${activeTab} QR code but received ${qrData.type} QR code`);
      }
    } catch (err: any) {
      console.error('Error processing QR code:', err);
      setError(err.message || 'Failed to process QR code');
      toast({
        title: 'Error',
        description: err.message || 'Failed to process QR code',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleError = (err: any) => {
    console.error('QR Scan Error:', err);
    setError('Failed to scan QR code. Please try again.');
  };

  const resetScanner = () => {
    setScanResult(null);
    setError(null);
  };

  return (
    <div className="space-y-8">
      <BackButton href="/dashboard/manager" label="Back to Dashboard" />

      <div>
        <h1 className="text-3xl font-bold mb-2">QR Code Scanner</h1>
        <p className="text-muted-foreground">Scan visitor passes or plot QR codes</p>
      </div>

      <Tabs
        defaultValue="visit"
        value={activeTab}
        onValueChange={(value) => {
          setActiveTab(value as 'plot' | 'visit');
          resetScanner();
        }}
      >
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="visit">Visitor Passes</TabsTrigger>
          <TabsTrigger value="plot">Plot QR Codes</TabsTrigger>
        </TabsList>

        <TabsContent value="visit" className="space-y-4 mt-4">
          <Card className="glass-card">
            <CardHeader>
              <CardTitle>Scan Visitor Pass</CardTitle>
              <CardDescription>Verify visitor access or mark attendance</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {error && (
                <Alert variant="destructive">
                  <X className="h-4 w-4" />
                  <AlertTitle>Error</AlertTitle>
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              {scanResult && activeTab === 'visit' && (
                <Alert>
                  <Check className="h-4 w-4" />
                  <AlertTitle>Visit Verified</AlertTitle>
                  <AlertDescription>
                    <div className="mt-2 grid gap-2">
                      <div className="flex items-center gap-2">
                        <User className="h-4 w-4 text-muted-foreground" />
                        <p className="text-sm">
                          <span className="font-medium">Visitor:</span>{' '}
                          {scanResult.data?.name || 'Unknown'}
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <Clock className="h-4 w-4 text-muted-foreground" />
                        <p className="text-sm">
                          <span className="font-medium">Time:</span>{' '}
                          {new Date(scanResult.data?.date || Date.now()).toLocaleTimeString()}
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <CalendarClock className="h-4 w-4 text-muted-foreground" />
                        <p className="text-sm">
                          <span className="font-medium">Status:</span>{' '}
                          {scanResult.data?.status || 'Unknown'}
                        </p>
                      </div>
                    </div>
                  </AlertDescription>
                </Alert>
              )}

              <div className="flex flex-col items-center justify-center">
                {!scanning && !scanResult && (
                  <div className="text-center p-8">
                    <Camera className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <p className="text-muted-foreground mb-4">Ready to scan visitor QR codes</p>
                    <Button onClick={() => setScanning(true)}>
                      <Camera className="mr-2 h-4 w-4" />
                      Start Scanning
                    </Button>
                  </div>
                )}

                {scanning && (
                  <div className="w-full max-w-sm">
                    <div className="relative rounded-lg overflow-hidden">
                      <QRScanner
                        onScan={handleScan}
                        onError={handleError}
                        width={300}
                        height={300}
                      />
                      <div className="absolute inset-0 border-2 border-dashed border-primary/50 rounded-lg pointer-events-none" />
                    </div>
                    <Button
                      variant="outline"
                      className="mt-4 w-full"
                      onClick={() => setScanning(false)}
                    >
                      Cancel Scanning
                    </Button>
                  </div>
                )}

                {scanResult && (
                  <Button onClick={resetScanner} className="mt-4">
                    <RefreshCw className="mr-2 h-4 w-4" />
                    Scan Another Code
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="plot" className="space-y-4 mt-4">
          <Card className="glass-card">
            <CardHeader>
              <CardTitle>Scan Plot QR Code</CardTitle>
              <CardDescription>Verify plot details or check ownership</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {error && (
                <Alert variant="destructive">
                  <X className="h-4 w-4" />
                  <AlertTitle>Error</AlertTitle>
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              {scanResult && activeTab === 'plot' && (
                <Alert>
                  <Check className="h-4 w-4" />
                  <AlertTitle>Plot Verified</AlertTitle>
                  <AlertDescription>
                    <div className="mt-2 grid gap-2">
                      <div className="flex items-center gap-2">
                        <MapPin className="h-4 w-4 text-muted-foreground" />
                        <p className="text-sm">
                          <span className="font-medium">Plot:</span>{' '}
                          {scanResult.data?.name || 'Unknown'}
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <User className="h-4 w-4 text-muted-foreground" />
                        <p className="text-sm">
                          <span className="font-medium">Owner:</span>{' '}
                          {scanResult.data?.owner || 'Not assigned'}
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <Clock className="h-4 w-4 text-muted-foreground" />
                        <p className="text-sm">
                          <span className="font-medium">Status:</span>{' '}
                          {scanResult.data?.status || 'Unknown'}
                        </p>
                      </div>
                    </div>
                  </AlertDescription>
                </Alert>
              )}

              <div className="flex flex-col items-center justify-center">
                {!scanning && !scanResult && (
                  <div className="text-center p-8">
                    <Camera className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <p className="text-muted-foreground mb-4">Ready to scan plot QR codes</p>
                    <Button onClick={() => setScanning(true)}>
                      <Camera className="mr-2 h-4 w-4" />
                      Start Scanning
                    </Button>
                  </div>
                )}

                {scanning && (
                  <div className="w-full max-w-sm">
                    <div className="relative rounded-lg overflow-hidden">
                      <QRScanner
                        onScan={handleScan}
                        onError={handleError}
                        width={300}
                        height={300}
                      />
                      <div className="absolute inset-0 border-2 border-dashed border-primary/50 rounded-lg pointer-events-none" />
                    </div>
                    <Button
                      variant="outline"
                      className="mt-4 w-full"
                      onClick={() => setScanning(false)}
                    >
                      Cancel Scanning
                    </Button>
                  </div>
                )}

                {scanResult && (
                  <Button onClick={resetScanner} className="mt-4">
                    <RefreshCw className="mr-2 h-4 w-4" />
                    Scan Another Code
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
