export interface UpdateUserData {
  name?: string;
  phone?: string;
  avatar?: string;
  password?: string;
  isEmailVerified?: boolean;
  emailVerificationToken?: string | null;
  emailVerificationExpires?: Date | null;
  refreshTokenHash?: string | null;
  passwordResetToken?: string | null;
  passwordResetExpires?: Date | null;
}
