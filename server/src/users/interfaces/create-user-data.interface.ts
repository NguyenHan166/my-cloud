export interface CreateUserData {
  email: string;
  password: string;
  name?: string;
  phone?: string;
  avatar?: string;
  isEmailVerified?: boolean;
  emailVerificationToken?: string;
  emailVerificationExpires?: Date;
}
