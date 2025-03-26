import { BaseEntity, TimeSlot } from '@/types/common';

/**
 * Visit status type
 */
export type VisitStatus = 'pending' | 'approved' | 'completed' | 'cancelled' | 'rejected';

/**
 * Visit interface
 */
export interface Visit extends BaseEntity {
  clientId: string;
  clientName: string;
  clientEmail: string;
  clientPhone?: string;
  projectId?: string;
  projectName?: string;
  plotId?: string;
  plotNumber?: string;
  visitDate: Date;
  timeSlot: string;
  status: VisitStatus;
  notes?: string;
  managerId?: string;
  approvedAt?: Date;
  approvedBy?: string;
  completedAt?: Date;
  rejectedAt?: Date;
  rejectedBy?: string;
  rejectionReason?: string;
  qrCodeUrl?: string;
  visitPurpose?: string;
}

/**
 * Guest visit interface
 */
export interface GuestVisit extends Visit {
  hostId: string;
  hostName: string;
  relationship?: string;
  validUntil: Date;
}

/**
 * Visit request payload
 */
export interface VisitRequestPayload {
  projectId?: string;
  plotId?: string;
  visitDate: Date;
  timeSlot: string;
  notes?: string;
  visitPurpose?: string;
}

/**
 * Visit approval payload
 */
export interface VisitApprovalPayload {
  visitId: string;
  managerId: string;
}

/**
 * Visit rejection payload
 */
export interface VisitRejectionPayload {
  visitId: string;
  reason: string;
  rejectedBy: string;
}

/**
 * Available time slots response
 */
export interface AvailableTimeSlotsResponse {
  date: Date;
  timeSlots: TimeSlot[];
}

/**
 * QR code generation payload
 */
export interface QRCodeGenerationPayload {
  visitId: string;
  validForHours: number;
}

/**
 * QR code verification payload
 */
export interface QRCodeVerificationPayload {
  qrData: {
    type: string;
    id: string;
    token?: string;
  };
}

/**
 * QR code verification response
 */
export interface QRCodeVerificationResponse {
  valid: boolean;
  visit?: Visit;
  error?: string;
}
