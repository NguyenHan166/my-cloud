import { Injectable, Logger, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Redis from 'ioredis';

@Injectable()
export class RedisCacheService implements OnModuleInit, OnModuleDestroy {
    private readonly logger = new Logger(RedisCacheService.name);
    private client: Redis;
    private readonly defaultTtl: number;

    constructor(private readonly configService: ConfigService) {
        const host = this.configService.get<string>('redis.host') || 'localhost';
        const port = this.configService.get<number>('redis.port') || 6379;
        const password = this.configService.get<string>('redis.password');
        this.defaultTtl = (this.configService.get<number>('redis.ttl') || 300) * 1000; // ms

        this.client = new Redis({
            host,
            port,
            password,
            retryStrategy: (times) => {
                if (times > 3) {
                    this.logger.error('Redis connection failed after 3 retries');
                    return null; // Stop retrying
                }
                return Math.min(times * 200, 1000); // Retry with backoff
            },
        });

        this.logger.log(`Redis client created for ${host}:${port}`);
    }

    async onModuleInit() {
        try {
            await this.client.ping();
            this.logger.log('✅ Redis connected successfully');
        } catch (error) {
            this.logger.error(`❌ Redis connection failed: ${error}`);
        }
    }

    async onModuleDestroy() {
        await this.client.quit();
        this.logger.log('Redis connection closed');
    }

    /**
     * Get value from cache
     */
    async get<T>(key: string): Promise<T | null> {
        try {
            const value = await this.client.get(key);
            if (!value) return null;
            return JSON.parse(value) as T;
        } catch (error) {
            this.logger.error(`Cache get error for ${key}: ${error}`);
            return null;
        }
    }

    /**
     * Set value in cache
     */
    async set(key: string, value: any, ttlMs?: number): Promise<void> {
        try {
            const ttl = ttlMs || this.defaultTtl;
            await this.client.set(key, JSON.stringify(value), 'PX', ttl);
        } catch (error) {
            this.logger.error(`Cache set error for ${key}: ${error}`);
        }
    }

    /**
     * Delete a key
     */
    async del(key: string): Promise<void> {
        try {
            await this.client.del(key);
        } catch (error) {
            this.logger.error(`Cache del error for ${key}: ${error}`);
        }
    }

    /**
     * Delete keys by pattern
     */
    async delByPattern(pattern: string): Promise<void> {
        try {
            const keys = await this.client.keys(pattern);
            if (keys.length > 0) {
                await this.client.del(...keys);
            }
        } catch (error) {
            this.logger.error(`Cache delByPattern error for ${pattern}: ${error}`);
        }
    }

    /**
     * Get all keys (for debugging)
     */
    async keys(pattern: string = '*'): Promise<string[]> {
        try {
            return await this.client.keys(pattern);
        } catch (error) {
            this.logger.error(`Cache keys error: ${error}`);
            return [];
        }
    }

    /**
     * Check if connected
     */
    isConnected(): boolean {
        return this.client.status === 'ready';
    }

    /**
     * Get the underlying Redis client (for advanced usage)
     */
    getClient(): Redis {
        return this.client;
    }
}
