export interface FindAllParams {
  page: number;
  limit: number;
  search?: string;
  isActive?: boolean;
  isEmailVerified?: boolean;
  sortBy: string;
  sortOrder: 'asc' | 'desc';
}
