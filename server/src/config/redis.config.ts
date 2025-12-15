import { registerAs } from '@nestjs/config';

export interface RedisConfig {
    url: string;
    host: string;
    port: number;
    password: string | undefined;
    ttl: number; // Default TTL in seconds
}

export const redisConfig = registerAs('redis', (): RedisConfig => {
    const url = process.env.REDIS_URL || 'redis://localhost:6379';

    // Parse URL to extract components
    let host = 'localhost';
    let port = 6379;
    let password: string | undefined;

    try {
        const parsed = new URL(url);
        host = parsed.hostname || 'localhost';
        port = parseInt(parsed.port, 10) || 6379;
        password = parsed.password || undefined;
    } catch {
        // Use defaults if URL parsing fails
    }

    return {
        url,
        host,
        port,
        password,
        ttl: parseInt(process.env.REDIS_TTL || '300', 10), // Default 5 minutes
    };
});
