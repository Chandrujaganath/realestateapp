/**
 * Common types used across the application
 */

/**
 * Base entity interface with common fields
 */
export interface BaseEntity {
  id: string;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Status types for various entities
 */
export type Status = 'active' | 'inactive' | 'pending' | 'completed' | 'cancelled' | 'rejected' | 'approved';

/**
 * Common address type
 */
export interface Address {
  street?: string;
  city: string;
  state?: string;
  zipCode?: string;
  country?: string;
  coordinates?: {
    latitude: number;
    longitude: number;
  };
}

/**
 * Pagination parameters
 */
export interface PaginationParams {
  page: number;
  limit: number;
}

/**
 * Pagination response
 */
export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

/**
 * Sort direction
 */
export type SortDirection = 'asc' | 'desc';

/**
 * Sort parameters
 */
export interface SortParams {
  field: string;
  direction: SortDirection;
}

/**
 * API response wrapper
 */
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
}

/**
 * Time slot format (for appointments, visits, etc.)
 */
export interface TimeSlot {
  id: string;
  startTime: string; // 24-hour format, e.g., "09:00"
  endTime: string; // 24-hour format, e.g., "10:00"
  isAvailable: boolean;
}

/**
 * Contact information
 */
export interface ContactInfo {
  name?: string;
  email?: string;
  phone?: string;
}

/**
 * File information
 */
export interface FileInfo {
  id: string;
  name: string;
  url: string;
  type: string;
  size: number;
  uploadedAt: Date;
  uploadedBy: string;
} 