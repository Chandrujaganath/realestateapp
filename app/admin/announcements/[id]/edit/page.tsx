'use client';

import { BellRing } from 'lucide-react';
import { useParams, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

import { AnnouncementForm } from '@/components/admin/announcement-form';
import { PageHeader } from '@/components/page-header';
import { Skeleton } from '@/components/ui/skeleton';
import { useAnnouncements } from '@/hooks/use-announcements';
import { Announcement } from '@/types/announcement';

export default function EditAnnouncementPage() {
  const _params = useParams();
  const _router = useRouter();
  const { fetchAnnouncementById } = useAnnouncements();
  const [announcement, setAnnouncement] = useState<Announcement | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const announcementId = _params?.id as string;

  useEffect(() => {
    const _loadAnnouncement = async () => {
      if (!announcementId) {
        setError('No announcement ID provided');
        setIsLoading(false);
        return;
      }

      try {
        const data = await fetchAnnouncementById(announcementId);
        if (!data) {
          setError('Announcement not found');
          setIsLoading(false);
          return;
        }

        setAnnouncement(data);
      } catch (err) {
        console.error('Error loading announcement:', err);
        setError('Failed to load announcement data');
      } finally {
        setIsLoading(false);
      }
    };

    _loadAnnouncement();
  }, [announcementId, fetchAnnouncementById]);

  if (isLoading) {
    return (
      <div className="space-y-6">
        <PageHeader
          title="Edit Announcement"
          description="Loading announcement details..."
          icon={<BellRing className="h-6 w-6" />}
        />
        <div className="space-y-4">
          <Skeleton className="h-8 w-64" />
          <Skeleton className="h-24 w-full" />
          <Skeleton className="h-12 w-full" />
          <Skeleton className="h-12 w-full" />
          <Skeleton className="h-32 w-full" />
        </div>
      </div>
    );
  }

  if (error || !announcement) {
    return (
      <div className="space-y-6">
        <PageHeader
          title="Error"
          description={error || 'Could not load announcement'}
          icon={<BellRing className="h-6 w-6" />}
        />
        <div className="flex justify-center">
          <button
            onClick={() => _router.back()}
            className="px-4 py-2 bg-primary text-primary-foreground rounded"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Edit Announcement"
        description="Update an existing announcement"
        icon={<BellRing className="h-6 w-6" />}
      />
      <AnnouncementForm mode="edit" announcement={announcement} />
    </div>
  );
}
