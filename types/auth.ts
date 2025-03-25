export type UserRole = "guest" | "client" | "manager" | "admin" | "superadmin";

export interface UserData {
  uid: string;
  email: string | null;
  role: UserRole;
  displayName?: string | null;
  photoURL?: string | null;
  phone?: string;
  accountStatus?: string;
  expiryDate?: Date | null;
  permanentQrCodeUrl?: string | null;
  ownedPlots?: string[];
  city?: string;
  assignedProjects?: string[];
  lastTaskAssignedAt?: Date;
  isOnLeave?: boolean;
  leaveEndDate?: Date | null;
}

// Export other shared types here 