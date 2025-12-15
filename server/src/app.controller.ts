import { Controller, Get } from '@nestjs/common';
import { RedisCacheService } from './modules/redis';
import { QueueService } from './modules/queue';
import { AppService } from './app.service';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';

@ApiTags('app')
@Controller()
export class AppController {
  constructor(
    private readonly appService: AppService,
    private readonly cache: RedisCacheService,
    private readonly queueService: QueueService,
  ) { }

  @Get()
  @ApiOperation({ summary: 'Health check' })
  @ApiResponse({
    status: 200,
    description: 'Server is running.',
  })
  getHello(): string {
    return this.appService.getHello();
  }

  @Get('cache-test')
  @ApiOperation({ summary: 'Test Redis cache connection' })
  @ApiResponse({ status: 200, description: 'Cache test result' })
  async testCache() {
    const testKey = 'test:connection';
    const testValue = { timestamp: new Date().toISOString(), status: 'ok' };

    try {
      // Set a test value
      await this.cache.set(testKey, testValue, 60000); // 1 minute TTL

      // Get it back
      const retrieved = await this.cache.get(testKey);

      // Get all keys
      const allKeys = await this.cache.keys('*');

      return {
        success: true,
        message: 'Redis cache is working!',
        testKey,
        setValue: testValue,
        retrievedValue: retrieved,
        match: JSON.stringify(testValue) === JSON.stringify(retrieved),
        allKeys,
        isConnected: this.cache.isConnected(),
      };
    } catch (error) {
      return {
        success: false,
        message: 'Redis cache error',
        error: error instanceof Error ? error.message : String(error),
        stack: error instanceof Error ? error.stack : undefined,
      };
    }
  }

  @Get('queue-stats')
  @ApiOperation({ summary: 'Get background job queue statistics' })
  @ApiResponse({ status: 200, description: 'Queue statistics' })
  async getQueueStats() {
    const stats = await this.queueService.getStats();
    return {
      success: true,
      message: 'Queue statistics',
      stats,
    };
  }
}

