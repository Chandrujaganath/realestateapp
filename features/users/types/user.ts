import { BaseEntity } from '@/types/common';

/**
 * User roles
 */
export type UserRole = 'user' | 'client' | 'guest' | 'admin' | 'superadmin' | 'manager';

/**
 * Account status options
 */
export type AccountStatus = 'active' | 'pending' | 'suspended' | 'inactive';

/**
 * User model
 */
export interface User {
  id: string;
  email: string;
  displayName: string | null;
  role: string;
  phoneNumber: string | null;
  photoURL: string | null;
  createdAt: Date;
  metadata: Record<string, any>;
  disabled: boolean;
  accountStatus?: string;
  updatedAt: Date;
}

/**
 * Client user with additional client-specific fields
 */
export interface ClientUser extends User {
  role: 'client';
  ownedPlots?: string[];
  permanentQrCodeUrl?: string | null;
  city?: string;
}

/**
 * Manager user with additional manager-specific fields
 */
export interface ManagerUser extends User {
  role: 'manager';
  assignedProjects?: string[];
  lastTaskAssignedAt?: Date;
  isOnLeave?: boolean;
  leaveEndDate?: Date | null;
  city?: string;
  currentLocation?: {
    latitude: number;
    longitude: number;
    timestamp: Date;
  };
  clockedInAt?: Date | null;
  clockedOutAt?: Date | null;
}

/**
 * Guest user with additional guest-specific fields
 */
export interface GuestUser extends User {
  role: 'guest';
  expiryDate?: Date | null;
  invitedBy?: string;
  visitPurpose?: string;
}

/**
 * Admin user
 */
export interface AdminUser extends User {
  role: 'admin' | 'superadmin';
  permissions?: string[];
  lastActionAt?: Date;
}

/**
 * User creation payload
 */
export interface CreateUserPayload {
  email: string;
  displayName?: string;
  role?: UserRole;
  phoneNumber?: string;
  photoURL?: string;
  password?: string;
  metadata?: Record<string, any>;
}

/**
 * User update payload
 */
export interface UpdateUserPayload {
  displayName?: string;
  role?: UserRole;
  phoneNumber?: string;
  photoURL?: string;
  metadata?: Record<string, any>;
  disabled?: boolean;
}

/**
 * Leave request for managers
 */
export interface LeaveRequest extends BaseEntity {
  managerId: string;
  managerName: string;
  startDate: Date;
  endDate: Date;
  reason: string;
  status: 'pending' | 'approved' | 'rejected';
  approvedAt?: Date;
  approvedBy?: string;
  rejectedAt?: Date;
  rejectedBy?: string;
  rejectionReason?: string;
}

/**
 * Manager attendance record
 */
export interface AttendanceRecord extends BaseEntity {
  managerId: string;
  date: Date;
  clockInTime: Date;
  clockOutTime?: Date;
  totalHours?: number;
  location?: {
    latitude: number;
    longitude: number;
  };
  notes?: string;
}
