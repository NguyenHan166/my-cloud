import {
  Injectable,
  OnModuleInit,
  OnModuleDestroy,
  Logger,
} from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { Pool } from 'pg';

@Injectable()
export class PrismaService
  extends PrismaClient
  implements OnModuleInit, OnModuleDestroy
{
  private readonly logger = new Logger(PrismaService.name);
  private pool: Pool;

  constructor() {
    const connectionString = process.env.DATABASE_URL;
    if (!connectionString) {
      throw new Error('DATABASE_URL environment variable is not set');
    }

    // Parse connection string to extract host and schema
    const url = new URL(connectionString);
    const schema = url.searchParams.get('schema') || 'public';
    const isLocalhost =
      url.hostname === 'localhost' || url.hostname === '127.0.0.1';

    console.log(
      `[PrismaService] Connecting to database at ${url.hostname} (localhost: ${isLocalhost})`,
    );

    // Configure pool based on connection type
    const poolConfig: any = {
      connectionString,
      // Higher limits for local, lower for cloud (Supabase pooler)
      max: isLocalhost ? 10 : 5,
      min: isLocalhost ? 2 : 1,
      idleTimeoutMillis: isLocalhost ? 30000 : 10000,
      connectionTimeoutMillis: 5000,
    };

    // Only enable SSL for non-localhost connections (cloud databases)
    if (!isLocalhost) {
      poolConfig.ssl = {
        rejectUnauthorized: false, // Required for Supabase pooler with self-signed cert
      };
    }

    const pool = new Pool(poolConfig);

    // Use PrismaPg schema option for custom schema support
    const adapter = new PrismaPg(pool, { schema });

    super({
      adapter,
      log:
        process.env.NODE_ENV !== 'production'
          ? ['warn', 'error']
          : ['warn', 'error'],
      errorFormat: 'pretty',
    });

    this.pool = pool;
  }

  async onModuleInit() {
    this.logger.log('Connecting to database...');
    await this.$connect();
    this.logger.log('Database connected successfully');
  }

  async onModuleDestroy() {
    this.logger.log('Disconnecting from database...');
    await this.$disconnect();
    await this.pool.end();
    this.logger.log('Database disconnected');
  }

  /**
   * Clean database - useful for testing
   * WARNING: This will delete all data!
   */
  async cleanDatabase() {
    if (process.env.NODE_ENV === 'production') {
      throw new Error('Cannot clean database in production!');
    }

    const models = Reflect.ownKeys(this).filter(
      (key) =>
        typeof key === 'string' && !key.startsWith('_') && !key.startsWith('$'),
    );

    return Promise.all(
      models.map((modelKey) => {
        const model = this[modelKey as keyof this];
        if (model && typeof model === 'object' && 'deleteMany' in model) {
          return (model as { deleteMany: () => Promise<unknown> }).deleteMany();
        }
        return Promise.resolve();
      }),
    );
  }
}
