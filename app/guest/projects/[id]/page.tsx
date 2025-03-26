'use client';

import { doc, getDoc } from 'firebase/firestore';
import { ArrowLeft, MapPin, Calendar, Phone } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';

import { PageTransition } from '@/components/ui/page-transition';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { ErrorBoundary } from '@/components/error-boundary';
import { ScheduleVisitButton } from '@/components/guest/schedule-visit-button';
import { GuestBottomNav } from '@/components/navigation/guest-bottom-nav';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { LazyGridWrapper } from '@/features/projects/components/lazy-grid-wrapper';
import { GridCell, GridData } from '@/features/projects/types/grid';
import { useToast } from '@/hooks/use-toast';
import { formatFirebaseError } from '@/lib/error-handling';
import { db } from '@/lib/firebase';
import { _formatDate } from '@/lib/utils';

export default function GuestProjectPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const { toast } = useToast();
  const [project, setProject] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [selectedPlot, setSelectedPlot] = useState<GridCell | null>(null);

  useEffect(() => {
    const _fetchProject = async () => {
      try {
        const _docRef = doc(db, 'projects', params.id);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
          setProject({
            id: docSnap.id,
            ...docSnap.data(),
          });
        } else {
          toast({
            title: 'Project not found',
            description: 'The requested project could not be found.',
            variant: 'destructive',
          });
          router.push('/guest/projects');
        }
      } catch (error) {
        console.error('Error fetching project:', error);
        const errorResponse = formatFirebaseError(error);
        toast({
          title: errorResponse.title,
          description: errorResponse.description,
          variant: errorResponse.variant,
        });
      } finally {
        setLoading(false);
      }
    };

    fetchProject();
  }, [params.id, router, toast]);

  const _handlePlotSelect = (plotCell: GridCell) => {
    setSelectedPlot(plotCell);

    // Show toast with plot details
    if (plotCell.status === 'available') {
      toast({
        title: `Plot ${plotCell.plotNumber} is available`,
        description: 'You can schedule a visit to view this plot.',
        variant: 'default',
      });
    } else if (plotCell.status === 'sold') {
      toast({
        title: `Plot ${plotCell.plotNumber} is already sold`,
        description: 'Please select an available plot.',
        variant: 'destructive',
      });
    } else if (plotCell.status === 'reserved') {
      toast({
        title: `Plot ${plotCell.plotNumber} is currently reserved`,
        description: 'This plot may become available soon. Please check later.',
        variant: 'default',
      });
    }
  };

  if (loading) {
    return (
      <div className="max-w-screen-xl mx-auto p-4 pb-20">
        <div className="flex justify-center items-center h-64">
          <LoadingSpinner size="lg" />
        </div>
      </div>
    );
  }

  if (!project) {
    return (
      <div className="max-w-screen-xl mx-auto p-4 pb-20">
        <Card>
          <CardContent className="p-8 text-center">
            <p className="text-muted-foreground">Project not found</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <ErrorBoundary>
      <PageTransition>
        <div className="max-w-screen-xl mx-auto p-4 pb-20">
          <div className="flex items-center mb-6">
            <Button
              variant="ghost"
              onClick={() => router.push('/guest/projects')}
              className="p-0 h-auto"
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Projects
            </Button>
          </div>

          <Card className="mb-6">
            <CardHeader>
              <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4">
                <div>
                  <CardTitle className="text-2xl">{project.name}</CardTitle>
                  <CardDescription className="flex items-center mt-1">
                    <MapPin className="h-4 w-4 mr-1" />
                    {project.city}
                    {project.address ? `, ${project.address}` : ''}
                  </CardDescription>
                </div>
                <ScheduleVisitButton
                  projectId={params.id}
                  selectedPlot={selectedPlot?.plotNumber}
                />
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                <div className="flex flex-col">
                  <span className="text-sm text-muted-foreground">Available Plots</span>
                  <span>
                    {project.availablePlots || 0} / {project.totalPlots || 0}
                  </span>
                </div>
                {project.visitingHours && (
                  <div className="flex flex-col">
                    <span className="text-sm text-muted-foreground flex items-center">
                      <Calendar className="h-3 w-3 mr-1" />
                      Visiting Hours
                    </span>
                    <span>{project.visitingHours}</span>
                  </div>
                )}
                {project.contactNumber && (
                  <div className="flex flex-col">
                    <span className="text-sm text-muted-foreground flex items-center">
                      <Phone className="h-3 w-3 mr-1" />
                      Contact
                    </span>
                    <span>{project.contactNumber}</span>
                  </div>
                )}
              </div>

              <Alert className="mb-6">
                <AlertTitle>Interested in this project?</AlertTitle>
                <AlertDescription>
                  Select a plot on the map below to view details, or schedule a visit to see the
                  property in person.
                </AlertDescription>
              </Alert>

              <Separator className="my-6" />

              <div className="mb-6">
                <h3 className="text-lg font-medium mb-2">About this Project</h3>
                <p className="text-muted-foreground">
                  {project.description || 'No description provided.'}
                </p>
              </div>

              {project.amenities && project.amenities.length > 0 && (
                <div className="mb-6">
                  <h3 className="text-lg font-medium mb-2">Amenities</h3>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                    {project.amenities.map((_amenity: string, _index: number) => (
                      <div key={index} className="flex items-center">
                        <div className="w-2 h-2 bg-primary rounded-full mr-2"></div>
                        <span className="text-sm">{amenity}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {selectedPlot && selectedPlot.status === 'available' && (
            <Card className="mb-6 border-primary">
              <CardContent className="p-6">
                <div className="flex justify-between items-center">
                  <div>
                    <h3 className="text-lg font-medium">Plot {selectedPlot.plotNumber}</h3>
                    <p className="text-sm text-muted-foreground">
                      {selectedPlot.size && `Size: ${selectedPlot.size}`}
                      {selectedPlot.price && ` • Price: ₹${selectedPlot.price.toLocaleString()}`}
                    </p>
                    {selectedPlot.notes && <p className="text-sm mt-2">{selectedPlot.notes}</p>}
                  </div>
                  <ScheduleVisitButton
                    projectId={params.id}
                    selectedPlot={selectedPlot.plotNumber}
                    variant="default"
                  />
                </div>
              </CardContent>
            </Card>
          )}

          {project.gridLayout && (
            <LazyGridWrapper
              projectId={params.id}
              gridData={project.gridLayout as GridData}
              onPlotSelect={handlePlotSelect}
            />
          )}

          <GuestBottomNav />
        </div>
      </PageTransition>
    </ErrorBoundary>
  );
}
