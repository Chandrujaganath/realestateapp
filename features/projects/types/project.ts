import { Address, BaseEntity, Status } from '@/types/common';

/**
 * Project status type
 */
export type ProjectStatus = Extract<Status, 'active' | 'inactive' | 'completed' | 'pending'>;

/**
 * Project type
 */
export interface Project extends BaseEntity {
  name: string;
  description?: string;
  location: string;
  address?: Address;
  startDate: Date;
  endDate?: Date;
  status: ProjectStatus;
  managerId?: string;
  clientId?: string;
  totalPlots: number;
  availablePlots: number;
  soldPlots: number;
  reservedPlots: number;
  coverImage?: string;
  images?: string[];
  features?: string[];
  amenities?: string[];
  metadata?: Record<string, any>;
}

/**
 * Plot status type
 */
export type PlotStatus = 'available' | 'reserved' | 'sold' | 'pending';

/**
 * Plot type
 */
export interface Plot extends BaseEntity {
  projectId: string;
  plotNumber: string;
  area: number;
  areaUnit: 'sqft' | 'sqm' | 'acre' | 'hectare';
  price: number;
  status: PlotStatus;
  ownerId?: string;
  description?: string;
  images?: string[];
  features?: string[];
  dimensions?: {
    length: number;
    width: number;
  };
  location?: {
    latitude: number;
    longitude: number;
  };
  boundaries?: {
    north: string;
    south: string;
    east: string;
    west: string;
  };
  documents?: {
    id: string;
    name: string;
    url: string;
    type: string;
  }[];
}

/**
 * Project creation payload
 */
export interface CreateProjectPayload {
  name: string;
  description?: string;
  location: string;
  address?: Address;
  startDate: Date;
  endDate?: Date;
  managerId?: string;
  status?: ProjectStatus;
  totalPlots?: number;
  coverImage?: string;
  images?: string[];
  features?: string[];
  amenities?: string[];
}

/**
 * Project update payload
 */
export interface UpdateProjectPayload {
  name?: string;
  description?: string;
  location?: string;
  address?: Address;
  startDate?: Date;
  endDate?: Date;
  managerId?: string;
  status?: ProjectStatus;
  coverImage?: string;
  images?: string[];
  features?: string[];
  amenities?: string[];
  totalPlots?: number;
  availablePlots?: number;
  soldPlots?: number;
  reservedPlots?: number;
}

/**
 * Plot creation payload
 */
export interface CreatePlotPayload {
  projectId: string;
  plotNumber: string;
  area: number;
  areaUnit: 'sqft' | 'sqm' | 'acre' | 'hectare';
  price: number;
  status?: PlotStatus;
  description?: string;
  images?: string[];
  features?: string[];
  dimensions?: {
    length: number;
    width: number;
  };
  location?: {
    latitude: number;
    longitude: number;
  };
  boundaries?: {
    north: string;
    south: string;
    east: string;
    west: string;
  };
}

/**
 * Plot update payload
 */
export interface UpdatePlotPayload {
  plotNumber?: string;
  area?: number;
  areaUnit?: 'sqft' | 'sqm' | 'acre' | 'hectare';
  price?: number;
  status?: PlotStatus;
  ownerId?: string;
  description?: string;
  images?: string[];
  features?: string[];
  dimensions?: {
    length: number;
    width: number;
  };
  location?: {
    latitude: number;
    longitude: number;
  };
  boundaries?: {
    north: string;
    south: string;
    east: string;
    west: string;
  };
}
