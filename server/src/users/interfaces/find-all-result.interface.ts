import { User } from '@prisma/client';

export interface FindAllResult {
  data: User[];
  total: number;
  page: number;
  limit: number;
}
