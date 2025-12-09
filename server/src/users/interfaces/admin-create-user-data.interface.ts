import { UserRole } from '@prisma/client';

export interface AdminCreateUserData {
  email: string;
  password: string;
  name?: string;
  phone?: string;
  avatar?: string;
  role?: UserRole;
  isActive?: boolean;
  isEmailVerified?: boolean;
}
