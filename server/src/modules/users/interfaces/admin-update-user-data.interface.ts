import { UserRole } from '@prisma/client';

export interface AdminUpdateUserData {
  name?: string;
  phone?: string;
  avatar?: string;
  password?: string;
  role?: UserRole;
  isActive?: boolean;
  isEmailVerified?: boolean;
}
