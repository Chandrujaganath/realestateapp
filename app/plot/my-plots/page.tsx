'use client';

import { Building2, MapPin, Camera } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { useState, useEffect } from 'react';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import type { Plot } from '@/contexts/auth-context';
import { useAuth } from '@/hooks/use-auth';

export default function MyPlotsPage() {
  const { user, getUserOwnedPlots } = useAuth();
  const [ownedPlots, setOwnedPlots] = useState<Plot[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const _fetchPlots = async () => {
      try {
        const _plots = await getUserOwnedPlots();
        setOwnedPlots(plots);
      } catch (error) {
        console.error('Error fetching plots:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchPlots();
  }, [getUserOwnedPlots]);

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[50vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold mb-2">My Properties</h1>
          <p className="text-muted-foreground">Manage and view your owned plots and properties</p>
        </div>

        <Link href="/project">
          <Button>
            <Building2 className="mr-2 h-4 w-4" />
            Browse More Properties
          </Button>
        </Link>
      </div>

      {ownedPlots.length === 0 ? (
        <Card className="glass-card">
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Building2 className="h-12 w-12 text-muted-foreground mb-4" />
            <p className="text-muted-foreground mb-6">You don't own any properties yet</p>
            <Link href="/project">
              <Button>Browse Available Properties</Button>
            </Link>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {ownedPlots.map((plot) => (
            <Card key={plot.id} className="glass-card overflow-hidden">
              <div className="relative h-48">
                <Image
                  src={`/placeholder.svg?height=400&width=600&text=${encodeURIComponent(plot.projectName)}`}
                  alt={plot.projectName}
                  fill
                  className="object-cover"
                />
                <div className="absolute top-2 right-2">
                  <span
                    className={`text-xs px-2 py-1 rounded-full ${
                      plot.status === 'completed'
                        ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400'
                        : 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400'
                    }`}
                  >
                    {plot.status === 'completed' ? 'Completed' : 'Under Development'}
                  </span>
                </div>
              </div>
              <CardHeader>
                <CardTitle>
                  {plot.projectName} - Plot {plot.number}
                </CardTitle>
                <CardDescription className="flex items-center gap-1">
                  <MapPin className="h-3 w-3" />
                  {plot.location}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <p className="text-muted-foreground">Size</p>
                      <p className="font-medium">{plot.size}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Purchase Date</p>
                      <p className="font-medium">{plot.purchaseDate?.toLocaleDateString()}</p>
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-2">
                    <Link href={`/plot/${plot.id}`}>
                      <Button variant="outline" className="glass-button">
                        <Building2 className="mr-2 h-4 w-4" />
                        View Details
                      </Button>
                    </Link>
                    <Link href={`/cctv/client/${plot.id}`}>
                      <Button variant="outline" className="glass-button">
                        <Camera className="mr-2 h-4 w-4" />
                        CCTV Feed
                      </Button>
                    </Link>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
