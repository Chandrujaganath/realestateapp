'use client';

import {
  Building2,
  MapPin,
  Calendar,
  Map,
  Camera,
  FileText,
  DollarSign,
  ArrowLeft,
  Check,
} from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { useState, useEffect } from 'react';

import BackButton from '@/components/back-button';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';
import type { Plot } from '@/context/auth-context';
import { useAuth } from '@/hooks/use-auth';

export default function PlotDetailPage({ params }: { params: { id: string } }) {
  const { user, getUserOwnedPlots, submitSellRequest } = useAuth();
  const [plot, setPlot] = useState<Plot | null>(null);
  const [loading, setLoading] = useState(true);
  const [isOwner, setIsOwner] = useState(false);
  const [sellReason, setSellReason] = useState('');
  const [isSellDialogOpen, setIsSellDialogOpen] = useState(false);
  const [isSubmittingSell, setIsSubmittingSell] = useState(false);
  const [sellSuccess, setSellSuccess] = useState(false);

  useEffect(() => {
    const _fetchPlot = async () => {
      try {
        // In a real implementation, fetch plot details from Firestore
        // For now, we'll check if it's in the user's owned plots
        const _ownedPlots = await getUserOwnedPlots();
        const foundPlot = ownedPlots.find((p) => p.id === params.id);

        if (foundPlot) {
          setPlot(foundPlot);
          setIsOwner(true);
        } else {
          // If not found in owned plots, fetch as a regular plot
          // This would be a Firestore query in a real implementation
          setPlot({
            id: params.id,
            projectId: 'project-1',
            projectName: 'Sunrise Gardens',
            number: '101',
            status: 'available',
            size: '1200 sq ft',
            price: 750000,
            location: 'East Suburb, City',
            description: 'Corner plot with garden view',
          });
          setIsOwner(false);
        }
      } catch (error) {
        console.error('Error fetching plot:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchPlot();
  }, [getUserOwnedPlots, params.id]);

  const handleSellRequest = async () => {
    if (!plot || !sellReason || !submitSellRequest) return;

    setIsSubmittingSell(true);

    try {
      await submitSellRequest(plot.id, sellReason);
      setSellSuccess(true);

      // Close dialog after a delay
      setTimeout(() => {
        setIsSellDialogOpen(false);
        setSellSuccess(false);
      }, 2000);
    } catch (error) {
      console.error('Error submitting sell request:', error);
    } finally {
      setIsSubmittingSell(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[50vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!plot) {
    return (
      <div className="space-y-8">
        <BackButton href="/plot/my-plots" label="Back to Plots" />
        <div>
          <h1 className="text-3xl font-bold mb-2">Plot Not Found</h1>
          <p className="text-muted-foreground">The requested plot could not be found.</p>
        </div>

        <div className="flex justify-center">
          <Link href="/plot/my-plots">
            <Button>View My Plots</Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <BackButton
        href={isOwner ? '/plot/my-plots' : '/project'}
        label={`Back to ${isOwner ? 'My Plots' : 'Projects'}`}
      />

      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold mb-2">
            {plot.projectName} - Plot {plot.number}
          </h1>
          <p className="text-muted-foreground flex items-center gap-1">
            <MapPin className="h-4 w-4" />
            {plot.location}
          </p>
        </div>

        <div className="flex gap-4">
          {isOwner ? (
            <>
              <Link href={`/cctv/client/${plot.id}`}>
                <Button variant="outline" className="glass-button">
                  <Camera className="mr-2 h-4 w-4" />
                  View CCTV
                </Button>
              </Link>

              <Dialog open={isSellDialogOpen} onOpenChange={setIsSellDialogOpen}>
                <DialogTrigger asChild>
                  <Button>
                    <DollarSign className="mr-2 h-4 w-4" />
                    Sell Plot
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-[425px]">
                  <DialogHeader>
                    <DialogTitle>Sell Request</DialogTitle>
                    <DialogDescription>
                      Submit a request to sell your plot. Our team will contact you to discuss the
                      process.
                    </DialogDescription>
                  </DialogHeader>

                  {sellSuccess ? (
                    <div className="flex flex-col items-center justify-center py-4">
                      <div className="bg-green-100 dark:bg-green-900/30 rounded-full p-3 mb-4">
                        <Check className="h-6 w-6 text-green-600 dark:text-green-400" />
                      </div>
                      <h3 className="text-lg font-medium mb-2">Request Submitted!</h3>
                      <p className="text-center text-muted-foreground">
                        Your sell request has been submitted successfully. Our team will contact you
                        soon.
                      </p>
                    </div>
                  ) : (
                    <>
                      <div className="grid gap-4 py-4">
                        <div className="space-y-2">
                          <label className="text-sm font-medium">Reason for Selling</label>
                          <Textarea
                            placeholder="Please provide any details that might help us with your selling process..."
                            value={sellReason}
                            onChange={(e) => setSellReason(e.target.value)}
                            rows={5}
                            className="resize-none"
                          />
                        </div>
                      </div>
                      <DialogFooter>
                        <Button
                          type="submit"
                          onClick={handleSellRequest}
                          disabled={!sellReason || isSubmittingSell}
                        >
                          {isSubmittingSell ? (
                            <span className="flex items-center gap-2">
                              <span className="h-4 w-4 animate-spin rounded-full border-2 border-background border-t-transparent"></span>
                              Submitting...
                            </span>
                          ) : (
                            'Submit Request'
                          )}
                        </Button>
                      </DialogFooter>
                    </>
                  )}
                </DialogContent>
              </Dialog>
            </>
          ) : (
            user?.role !== 'guest' && (
              <Link href={`/visit/book?project=${plot.projectId}&plot=${plot.id}`}>
                <Button>
                  <Calendar className="mr-2 h-4 w-4" />
                  Schedule a Visit
                </Button>
              </Link>
            )
          )}
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        <div className="md:col-span-2">
          <div className="relative h-80 rounded-xl overflow-hidden">
            <Image
              src={`/placeholder.svg?height=600&width=800&text=${encodeURIComponent(`${plot.projectName} - Plot ${plot.number}`)}`}
              alt={`${plot.projectName} - Plot ${plot.number}`}
              fill
              className="object-cover"
            />
          </div>

          <div className="grid grid-cols-2 gap-4 mt-4">
            <div className="relative h-40 rounded-xl overflow-hidden">
              <Image
                src={`/placeholder.svg?height=400&width=600&text=${encodeURIComponent(`${plot.projectName} - View 2`)}`}
                alt={`${plot.projectName} - View 2`}
                fill
                className="object-cover"
              />
            </div>
            <div className="relative h-40 rounded-xl overflow-hidden">
              <Image
                src={`/placeholder.svg?height=400&width=600&text=${encodeURIComponent(`${plot.projectName} - View 3`)}`}
                alt={`${plot.projectName} - View 3`}
                fill
                className="object-cover"
              />
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <Card className="glass-card">
            <CardHeader>
              <CardTitle>Plot Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-2">
                <Map className="h-4 w-4 text-primary" />
                <div>
                  <p className="text-sm font-medium">Size</p>
                  <p className="text-sm text-muted-foreground">{plot.size}</p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <DollarSign className="h-4 w-4 text-primary" />
                <div>
                  <p className="text-sm font-medium">Price</p>
                  <p className="text-sm text-muted-foreground">${plot.price?.toLocaleString()}</p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <Building2 className="h-4 w-4 text-primary" />
                <div>
                  <p className="text-sm font-medium">Status</p>
                  <p className="text-sm text-muted-foreground capitalize">
                    {plot.status.replace('_', ' ')}
                  </p>
                </div>
              </div>

              {isOwner && plot.purchaseDate && (
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-primary" />
                  <div>
                    <p className="text-sm font-medium">Purchase Date</p>
                    <p className="text-sm text-muted-foreground">
                      {plot.purchaseDate.toLocaleDateString()}
                    </p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {isOwner && (
            <Card className="glass-card">
              <CardHeader>
                <CardTitle>Owner Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Link href={`/cctv/client/${plot.id}`}>
                  <Button className="w-full justify-start">
                    <Camera className="mr-2 h-4 w-4" />
                    View CCTV Feed
                  </Button>
                </Link>

                <Link href="/dashboard/client/visitor-qr">
                  <Button variant="outline" className="w-full justify-start glass-button">
                    <Calendar className="mr-2 h-4 w-4" />
                    Generate Visitor Pass
                  </Button>
                </Link>

                <Dialog>
                  <DialogTrigger asChild>
                    <Button variant="outline" className="w-full justify-start glass-button">
                      <DollarSign className="mr-2 h-4 w-4" />
                      Sell This Plot
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="sm:max-w-[425px]">
                    <DialogHeader>
                      <DialogTitle>Sell Request</DialogTitle>
                      <DialogDescription>
                        Submit a request to sell your plot. Our team will contact you to discuss the
                        process.
                      </DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                      <div className="space-y-2">
                        <label className="text-sm font-medium">Reason for Selling</label>
                        <Textarea
                          placeholder="Please provide any details that might help us with your selling process..."
                          value={sellReason}
                          onChange={(e) => setSellReason(e.target.value)}
                          rows={5}
                          className="resize-none"
                        />
                      </div>
                    </div>
                    <DialogFooter>
                      <Button
                        type="submit"
                        onClick={handleSellRequest}
                        disabled={!sellReason || isSubmittingSell}
                      >
                        {isSubmittingSell ? 'Submitting...' : 'Submit Request'}
                      </Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      <Tabs defaultValue="overview">
        <TabsList className="glass">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="location">Location</TabsTrigger>
          <TabsTrigger value="documents">Documents</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="mt-6">
          <Card className="glass-card">
            <CardHeader>
              <CardTitle>Plot Overview</CardTitle>
            </CardHeader>
            <CardContent>
              <p>{plot.description || 'No description available.'}</p>

              <div className="mt-6 grid gap-6 md:grid-cols-2">
                <div>
                  <h3 className="text-lg font-semibold mb-2">Plot Features</h3>
                  <ul className="list-disc list-inside space-y-1 text-muted-foreground">
                    <li>Corner location with dual access</li>
                    <li>Pre-approved building plans</li>
                    <li>All utilities connected</li>
                    <li>Level terrain</li>
                    <li>Landscaping ready</li>
                  </ul>
                </div>

                <div>
                  <h3 className="text-lg font-semibold mb-2">Neighborhood</h3>
                  <ul className="list-disc list-inside space-y-1 text-muted-foreground">
                    <li>Close to schools and parks</li>
                    <li>Shopping centers within 5 minutes</li>
                    <li>Public transportation nearby</li>
                    <li>Low crime rate area</li>
                    <li>Community amenities</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="location" className="mt-6">
          <Card className="glass-card">
            <CardHeader>
              <CardTitle>Location Information</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="relative h-80 rounded-lg overflow-hidden mb-6">
                <Image
                  src="/placeholder.svg?height=600&width=800&text=Location%20Map"
                  alt="Location Map"
                  fill
                  className="object-cover"
                />
              </div>

              <div className="grid gap-6 md:grid-cols-2">
                <div>
                  <h3 className="text-lg font-semibold mb-2">Address</h3>
                  <p className="text-muted-foreground">{plot.location}</p>

                  <h3 className="text-lg font-semibold mt-4 mb-2">Nearby Amenities</h3>
                  <ul className="list-disc list-inside space-y-1 text-muted-foreground">
                    <li>Schools: 0.5 miles</li>
                    <li>Shopping: 1.2 miles</li>
                    <li>Parks: 0.3 miles</li>
                    <li>Hospital: 3.5 miles</li>
                    <li>Public Transport: 0.2 miles</li>
                  </ul>
                </div>

                <div>
                  <h3 className="text-lg font-semibold mb-2">Neighborhood</h3>
                  <p className="text-muted-foreground mb-4">
                    Located in a peaceful residential area with excellent connectivity to major
                    highways and public transportation. The neighborhood features tree-lined
                    streets, parks, and a strong sense of community.
                  </p>

                  <h3 className="text-lg font-semibold mb-2">Commute Times</h3>
                  <ul className="list-disc list-inside space-y-1 text-muted-foreground">
                    <li>Downtown: 15 minutes</li>
                    <li>Airport: 25 minutes</li>
                    <li>Business District: 10 minutes</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="documents" className="mt-6">
          <Card className="glass-card">
            <CardHeader>
              <CardTitle>Documents & Files</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-3 border rounded-md">
                  <div className="flex items-center gap-3">
                    <FileText className="h-5 w-5 text-primary" />
                    <div>
                      <p className="font-medium">Plot Layout</p>
                      <p className="text-sm text-muted-foreground">PDF, 2.4 MB</p>
                    </div>
                  </div>
                  <Button variant="outline" size="sm" className="glass-button">
                    Download
                  </Button>
                </div>

                <div className="flex items-center justify-between p-3 border rounded-md">
                  <div className="flex items-center gap-3">
                    <FileText className="h-5 w-5 text-primary" />
                    <div>
                      <p className="font-medium">Building Guidelines</p>
                      <p className="text-sm text-muted-foreground">PDF, 1.8 MB</p>
                    </div>
                  </div>
                  <Button variant="outline" size="sm" className="glass-button">
                    Download
                  </Button>
                </div>

                {isOwner && (
                  <>
                    <div className="flex items-center justify-between p-3 border rounded-md">
                      <div className="flex items-center gap-3">
                        <FileText className="h-5 w-5 text-primary" />
                        <div>
                          <p className="font-medium">Purchase Agreement</p>
                          <p className="text-sm text-muted-foreground">PDF, 3.2 MB</p>
                        </div>
                      </div>
                      <Button variant="outline" size="sm" className="glass-button">
                        Download
                      </Button>
                    </div>

                    <div className="flex items-center justify-between p-3 border rounded-md">
                      <div className="flex items-center gap-3">
                        <FileText className="h-5 w-5 text-primary" />
                        <div>
                          <p className="font-medium">Property Tax Records</p>
                          <p className="text-sm text-muted-foreground">PDF, 1.1 MB</p>
                        </div>
                      </div>
                      <Button variant="outline" size="sm" className="glass-button">
                        Download
                      </Button>
                    </div>
                  </>
                )}

                <div className="flex items-center justify-between p-3 border rounded-md">
                  <div className="flex items-center gap-3">
                    <FileText className="h-5 w-5 text-primary" />
                    <div>
                      <p className="font-medium">Project Brochure</p>
                      <p className="text-sm text-muted-foreground">PDF, 5.7 MB</p>
                    </div>
                  </div>
                  <Button variant="outline" size="sm" className="glass-button">
                    Download
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
