import { useState, useEffect, useCallback } from 'react';
import { toast } from 'sonner';

import { useAuth } from './use-auth';
import { Announcement, AnnouncementFormData } from '@/types/announcement';

export function useAnnouncements() {
  const { user } = useAuth();
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchAnnouncements = useCallback(async () => {
    if (!user) return;

    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/announcements');

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to fetch announcements');
      }

      const data = await response.json();

      // Process announcements data
      const _processedAnnouncements = data.announcements.map((announcement: any) => ({
        ...announcement,
        createdAt: announcement.createdAt ? new Date(announcement.createdAt) : new Date(),
        expiresAt: announcement.expiresAt ? new Date(announcement.expiresAt) : undefined,
        updatedAt: announcement.updatedAt ? new Date(announcement.updatedAt) : undefined,
      }));

      setAnnouncements(processedAnnouncements);
    } catch (err) {
      console.error('Error fetching announcements:', err);
      setError(err instanceof Error ? err.message : 'An unknown error occurred');
      toast.error('Failed to load announcements');
    } finally {
      setIsLoading(false);
    }
  }, [user]);

  const fetchAnnouncementById = async (id: string) => {
    if (!user) return null;

    try {
      const response = await fetch(`/api/announcements/${id}`);

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to fetch announcement');
      }

      const data = await response.json();

      // Process announcement data
      const announcement = {
        ...data.announcement,
        createdAt: data.announcement.createdAt ? new Date(data.announcement.createdAt) : new Date(),
        expiresAt: data.announcement.expiresAt ? new Date(data.announcement.expiresAt) : undefined,
        updatedAt: data.announcement.updatedAt ? new Date(data.announcement.updatedAt) : undefined,
      };

      return announcement;
    } catch (err) {
      console.error('Error fetching announcement:', err);
      toast.error('Failed to load announcement');
      return null;
    }
  };

  const createAnnouncement = async (formData: AnnouncementFormData) => {
    if (!user) return null;

    try {
      const response = await fetch('/api/announcements', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to create announcement');
      }

      const data = await response.json();
      toast.success('Announcement created successfully');
      return data.id;
    } catch (err) {
      console.error('Error creating announcement:', err);
      toast.error(err instanceof Error ? err.message : 'Failed to create announcement');
      return null;
    }
  };

  const updateAnnouncement = async (id: string, formData: Partial<AnnouncementFormData>) => {
    if (!user) return false;

    try {
      const response = await fetch(`/api/announcements/${id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to update announcement');
      }

      toast.success('Announcement updated successfully');
      return true;
    } catch (err) {
      console.error('Error updating announcement:', err);
      toast.error(err instanceof Error ? err.message : 'Failed to update announcement');
      return false;
    }
  };

  const deleteAnnouncement = async (id: string) => {
    if (!user) return false;

    try {
      const response = await fetch(`/api/announcements/${id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to delete announcement');
      }

      // Update local state
      setAnnouncements((_prev) => prev.filter((_a) => a.id !== id));

      toast.success('Announcement deleted successfully');
      return true;
    } catch (err) {
      console.error('Error deleting announcement:', err);
      toast.error(err instanceof Error ? err.message : 'Failed to delete announcement');
      return false;
    }
  };

  useEffect(() => {
    if (user) {
      fetchAnnouncements();
    }
  }, [user, fetchAnnouncements]);

  return {
    announcements,
    isLoading,
    error,
    fetchAnnouncements,
    fetchAnnouncementById,
    createAnnouncement,
    updateAnnouncement,
    deleteAnnouncement,
  };
}
