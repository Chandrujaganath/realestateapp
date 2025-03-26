'use client';

import {
  collection,
  doc,
  _getDoc,
  getDocs,
  _setDoc,
  _updateDoc,
  _deleteDoc,
  query,
  where,
  _orderBy,
  _limit,
  Timestamp,
  _serverTimestamp,
  CollectionReference,
  Query,
} from 'firebase/firestore';
import { Firestore } from 'firebase/firestore';
import { _httpsCallable } from 'firebase/functions';
import { Functions } from 'firebase/functions';
import type React from 'react';
import { createContext, useContext, useState, useEffect, useCallback } from 'react';

import { useAuth } from '@/hooks/use-auth';
import { db } from '@/lib/firebase';
import { _functions } from '@/lib/firebase';
import type {
  AdminUser,
  SystemTemplate,
  SystemSettings,
  AuditLog,
  SuperAdminDashboardStats,
} from '@/types/super-admin';

interface SuperAdminContextType {
  // Admin Management
  admins: AdminUser[];
  loadingAdmins: boolean;
  getAdmins: () => Promise<AdminUser[]>;
  createAdmin: (adminData: Omit<AdminUser, 'id' | 'createdAt' | 'isActive'>) => Promise<AdminUser>;
  updateAdmin: (adminId: string, data: Partial<AdminUser>) => Promise<void>;
  deactivateAdmin: (adminId: string) => Promise<void>;
  reactivateAdmin: (adminId: string) => Promise<void>;

  // System Templates
  templates: SystemTemplate[];
  loadingTemplates: boolean;
  getTemplates: (type?: SystemTemplate['type']) => Promise<SystemTemplate[]>;
  createTemplate: (
    templateData: Omit<SystemTemplate, 'id' | 'createdAt' | 'updatedAt' | 'createdBy'>
  ) => Promise<SystemTemplate>;
  updateTemplate: (templateId: string, data: Partial<SystemTemplate>) => Promise<void>;
  deleteTemplate: (templateId: string) => Promise<void>;

  // System Settings
  settings: SystemSettings | null;
  loadingSettings: boolean;
  getSettings: () => Promise<SystemSettings>;
  updateSettings: (data: Partial<SystemSettings>) => Promise<void>;

  // Audit Logs
  auditLogs: AuditLog[];
  loadingAuditLogs: boolean;
  getAuditLogs: (filters?: {
    actionType?: string;
    performedBy?: string;
    resourceType?: string;
    dateRange?: { start: Date; end: Date };
  }) => Promise<AuditLog[]>;
  createAuditLog: (logData: Omit<AuditLog, 'id' | 'timestamp'>) => Promise<void>;

  // Dashboard Stats
  dashboardStats: SuperAdminDashboardStats | null;
  loadingDashboardStats: boolean;
  getDashboardStats: () => Promise<SuperAdminDashboardStats>;

  // Override Actions
  overrideAction: (
    actionType: string,
    resourceType: string,
    resourceId: string,
    newData: any
  ) => Promise<void>;
}

const SuperAdminContext = createContext<SuperAdminContextType | undefined>(undefined);

export const SuperAdminProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const [admins, setAdmins] = useState<AdminUser[]>([]);
  const [loadingAdmins, setLoadingAdmins] = useState(false);
  const [templates, setTemplates] = useState<SystemTemplate[]>([]);
  const [loadingTemplates, setLoadingTemplates] = useState(false);
  const [settings, setSettings] = useState<SystemSettings | null>(null);
  const [loadingSettings, setLoadingSettings] = useState(false);
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);
  const [loadingAuditLogs, setLoadingAuditLogs] = useState(false);
  const [dashboardStats, setDashboardStats] = useState<SuperAdminDashboardStats | null>(null);
  const [loadingDashboardStats, setLoadingDashboardStats] = useState(false);

  // Admin Management
  const getAdmins = useCallback(async (): Promise<AdminUser[]> => {
    setLoadingAdmins(true);
    try {
      if (!db) throw new Error('Firestore not initialized');

      const _adminQuery = query(collection(db as Firestore, 'users'), where('role', '==', 'Admin'));
      const _snapshot = await getDocs(adminQuery);
      const adminList: AdminUser[] = [];

      snapshot.forEach((doc) => {
        const data = doc.data();
        adminList.push({
          id: doc.id,
          name: data.name,
          email: data.email,
          role: data.role,
          isActive: data.isActive,
          createdAt: data.createdAt.toDate(),
          lastLogin: data.lastLogin ? data.lastLogin.toDate() : undefined,
        });
      });

      setAdmins(adminList);
      return adminList;
    } catch (error) {
      console.error('Error fetching admins:', error);
      throw error;
    } finally {
      setLoadingAdmins(false);
    }
  }, []);

  const createAdmin = async (
    adminData: Omit<AdminUser, 'id' | 'createdAt' | 'isActive'>
  ): Promise<AdminUser> => {
    try {
      // Mock implementation
      const newAdmin = {
        id: `admin-${Date.now()}`,
        ...adminData,
        isActive: true,
        createdAt: new Date(),
      };

      setAdmins((prevAdmins) => [...prevAdmins, newAdmin]);
      return newAdmin;
    } catch (error) {
      console.error('Error creating admin:', error);
      throw error;
    }
  };

  const updateAdmin = async (adminId: string, data: Partial<AdminUser>): Promise<void> => {
    try {
      // Mock implementation
      setAdmins((prevAdmins) =>
        prevAdmins.map((admin) => (admin.id === adminId ? { ...admin, ...data } : admin))
      );
    } catch (error) {
      console.error('Error updating admin:', error);
      throw error;
    }
  };

  const deactivateAdmin = async (adminId: string): Promise<void> => {
    try {
      // Mock implementation
      setAdmins((prevAdmins) =>
        prevAdmins.map((admin) => (admin.id === adminId ? { ...admin, isActive: false } : admin))
      );
    } catch (error) {
      console.error('Error deactivating admin:', error);
      throw error;
    }
  };

  const reactivateAdmin = async (adminId: string): Promise<void> => {
    try {
      // Mock implementation
      setAdmins((prevAdmins) =>
        prevAdmins.map((admin) => (admin.id === adminId ? { ...admin, isActive: true } : admin))
      );
    } catch (error) {
      console.error('Error reactivating admin:', error);
      throw error;
    }
  };

  // System Templates
  const getTemplates = async (type?: SystemTemplate['type']): Promise<SystemTemplate[]> => {
    setLoadingTemplates(true);
    try {
      // Mock implementation
      const mockTemplates: SystemTemplate[] = [];
      setTemplates(mockTemplates);
      return mockTemplates;
    } catch (error) {
      console.error('Error fetching templates:', error);
      throw error;
    } finally {
      setLoadingTemplates(false);
    }
  };

  const createTemplate = async (
    templateData: Omit<SystemTemplate, 'id' | 'createdAt' | 'updatedAt' | 'createdBy'>
  ): Promise<SystemTemplate> => {
    try {
      // Mock implementation
      const now = new Date();
      const newTemplate: SystemTemplate = {
        id: `template-${Date.now()}`,
        ...templateData,
        createdBy: user?.uid || '',
        createdAt: now,
        updatedAt: now,
      };

      setTemplates((prevTemplates) => [...prevTemplates, newTemplate]);
      return newTemplate;
    } catch (error) {
      console.error('Error creating template:', error);
      throw error;
    }
  };

  const updateTemplate = async (
    templateId: string,
    data: Partial<SystemTemplate>
  ): Promise<void> => {
    try {
      // Mock implementation
      setTemplates((prevTemplates) =>
        prevTemplates.map((template) =>
          template.id === templateId ? { ...template, ...data, updatedAt: new Date() } : template
        )
      );
    } catch (error) {
      console.error('Error updating template:', error);
      throw error;
    }
  };

  const deleteTemplate = async (templateId: string): Promise<void> => {
    try {
      // Mock implementation
      setTemplates((prevTemplates) =>
        prevTemplates.filter((template) => template.id !== templateId)
      );
    } catch (error) {
      console.error('Error deleting template:', error);
      throw error;
    }
  };

  // System Settings
  const getSettings = useCallback(async (): Promise<SystemSettings> => {
    setLoadingSettings(true);
    try {
      // Mock implementation
      const mockSettings: SystemSettings = {
        id: 'global',
        maxBookingsPerDay: 10,
        defaultGeofenceRadius: 100,
        announcementDefaults: {
          duration: 7,
          priority: 'medium',
        },
        updatedBy: user?.uid || '',
        updatedAt: new Date(),
      };

      setSettings(mockSettings);
      return mockSettings;
    } catch (error) {
      console.error('Error fetching settings:', error);
      throw error;
    } finally {
      setLoadingSettings(false);
    }
  }, [user?.uid]);

  const updateSettings = async (data: Partial<SystemSettings>): Promise<void> => {
    try {
      // Mock implementation
      if (settings) {
        setSettings({
          ...settings,
          ...data,
          updatedBy: user?.uid || '',
          updatedAt: new Date(),
        });
      }
    } catch (error) {
      console.error('Error updating settings:', error);
      throw error;
    }
  };

  // Audit Logs
  const getAuditLogs = async (_filters?: {
    actionType?: string;
    performedBy?: string;
    resourceType?: string;
    dateRange?: { start: Date; end: Date };
  }): Promise<AuditLog[]> => {
    setLoadingAuditLogs(true);
    try {
      // Mock implementation
      const mockLogs: AuditLog[] = [];
      setAuditLogs(mockLogs);
      return mockLogs;
    } catch (error) {
      console.error('Error fetching audit logs:', error);
      throw error;
    } finally {
      setLoadingAuditLogs(false);
    }
  };

  const createAuditLog = async (logData: Omit<AuditLog, 'id' | 'timestamp'>): Promise<void> => {
    try {
      // Mock implementation - no need to update state as audit logs are typically fetched fresh
      console.log('Audit log created:', logData);
    } catch (error) {
      console.error('Error creating audit log:', error);
      throw error;
    }
  };

  // Dashboard Stats
  const getDashboardStats = useCallback(async (): Promise<SuperAdminDashboardStats> => {
    setLoadingDashboardStats(true);
    try {
      // Mock dashboard stats
      const mockStats: SuperAdminDashboardStats = {
        userCounts: {
          total: 25,
          byRole: {
            Guest: 5,
            Client: 10,
            Manager: 5,
            Admin: 3,
            SuperAdmin: 2,
          },
        },
        projectStats: {
          total: 8,
          activePlots: 45,
          soldPlots: 32,
          pendingVisits: 12,
        },
        recentActivities: Array(5)
          .fill(null)
          .map((_, i) => ({
            id: `mock-activity-${i}`,
            actionType: [
              'CREATE_PROJECT',
              'UPDATE_ADMIN',
              'DELETE_ANNOUNCEMENT',
              'APPROVE_VISIT',
              'CREATE_ADMIN',
            ][i],
            performedBy: {
              id: 'mock-admin-id',
              name: 'Mock Admin',
              role: 'SuperAdmin',
            },
            targetResource: {
              type: ['project', 'user', 'announcement', 'visit', 'user'][i],
              id: `mock-resource-${i}`,
              name: `Mock Resource ${i}`,
            },
            details: {},
            timestamp: new Date(Date.now() - i * 86400000), // i days ago
          })),
      };

      setDashboardStats(mockStats);
      return mockStats;
    } catch (error) {
      console.error('Error fetching dashboard stats:', error);

      // Return minimal data to prevent UI errors
      const errorFallbackStats: SuperAdminDashboardStats = {
        userCounts: {
          total: 0,
          byRole: {
            Guest: 0,
            Client: 0,
            Manager: 0,
            Admin: 0,
            SuperAdmin: 0,
          },
        },
        projectStats: {
          total: 0,
          activePlots: 0,
          soldPlots: 0,
          pendingVisits: 0,
        },
        recentActivities: [],
      };

      setDashboardStats(errorFallbackStats);
      return errorFallbackStats;
    } finally {
      setLoadingDashboardStats(false);
    }
  }, []);

  // Override Actions
  const overrideAction = async (
    actionType: string,
    resourceType: string,
    resourceId: string,
    newData: any
  ): Promise<void> => {
    try {
      // Mock implementation
      console.log(`Override action: ${actionType} on ${resourceType}:${resourceId}`, newData);
    } catch (error) {
      console.error('Error overriding action:', error);
      throw error;
    }
  };

  // Load initial data
  useEffect(() => {
    if (user && user.role === 'SuperAdmin') {
      getSettings().catch(console.error);
    }
  }, [user, getSettings]);

  const value = {
    // Admin Management
    admins,
    loadingAdmins,
    getAdmins,
    createAdmin,
    updateAdmin,
    deactivateAdmin,
    reactivateAdmin,

    // System Templates
    templates,
    loadingTemplates,
    getTemplates,
    createTemplate,
    updateTemplate,
    deleteTemplate,

    // System Settings
    settings,
    loadingSettings,
    getSettings,
    updateSettings,

    // Audit Logs
    auditLogs,
    loadingAuditLogs,
    getAuditLogs,
    createAuditLog,

    // Dashboard Stats
    dashboardStats,
    loadingDashboardStats,
    getDashboardStats,

    // Override Actions
    overrideAction,
  };

  return <SuperAdminContext.Provider value={value}>{children}</SuperAdminContext.Provider>;
};

export const _useSuperAdmin = () => {
  const context = useContext(SuperAdminContext);
  if (context === undefined) {
    throw new Error('useSuperAdmin must be used within a SuperAdminProvider');
  }
  return context;
};
