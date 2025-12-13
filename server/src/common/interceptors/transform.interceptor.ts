import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { ApiResponse } from '../interfaces/api-response.interface';

/**
 * Recursively convert BigInt values to Number and Date values to ISO strings for JSON serialization
 */
function serializeBigInt(obj: unknown): unknown {
  if (obj === null || obj === undefined) {
    return obj;
  }

  if (typeof obj === 'bigint') {
    // Convert to number if within safe range, otherwise string
    return Number(obj);
  }

  // Convert Date objects to ISO strings
  if (obj instanceof Date) {
    return obj.toISOString();
  }

  if (Array.isArray(obj)) {
    return obj.map(serializeBigInt);
  }

  if (typeof obj === 'object') {
    const result: Record<string, unknown> = {};
    for (const key of Object.keys(obj)) {
      result[key] = serializeBigInt((obj as Record<string, unknown>)[key]);
    }
    return result;
  }

  return obj;
}

@Injectable()
export class TransformInterceptor<T> implements NestInterceptor<
  T,
  ApiResponse<T>
> {
  intercept(
    context: ExecutionContext,
    next: CallHandler,
  ): Observable<ApiResponse<T>> {
    return next.handle().pipe(
      map((data) => {
        // Check if data has a message property (for action responses)
        let message: string | undefined;
        let responseData = data;

        if (data && typeof data === 'object' && 'message' in data) {
          message = (data as { message?: string }).message;
          // If data only has message, keep data as is (e.g., delete response)
          // If data has other properties, they become the actual data
        }

        return {
          success: true as const,
          data: serializeBigInt(responseData) as T,
          ...(message && { message }),
          timestamp: new Date().toISOString(),
        };
      }),
    );
  }
}
