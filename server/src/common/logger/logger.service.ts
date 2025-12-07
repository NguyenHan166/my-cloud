import { Injectable, LoggerService, Scope } from '@nestjs/common';

@Injectable({ scope: Scope.TRANSIENT })
export class CustomLogger implements LoggerService {
  private contextName?: string;

  private readonly colorCodes = {
    reset: '\x1b[0m',
    bright: '\x1b[1m',
    dim: '\x1b[2m',
    red: '\x1b[31m',
    green: '\x1b[32m',
    yellow: '\x1b[33m',
    blue: '\x1b[34m',
    magenta: '\x1b[35m',
    cyan: '\x1b[36m',
    white: '\x1b[37m',
    bgRed: '\x1b[41m',
    bgYellow: '\x1b[43m',
  };

  setContext(context: string): this {
    this.contextName = context;
    return this;
  }

  private formatTimestamp(): string {
    return new Date().toISOString();
  }

  private formatContext(context?: string): string {
    const ctx = context || this.contextName;
    return ctx ? `[${ctx}]` : '';
  }

  log(message: string, context?: string): void {
    const formattedMessage = `${this.colorCodes.green}[LOG]${this.colorCodes.reset} ${this.colorCodes.dim}${this.formatTimestamp()}${this.colorCodes.reset} ${this.colorCodes.cyan}${this.formatContext(context)}${this.colorCodes.reset} ${message}`;
    console.log(formattedMessage);
  }

  error(message: string, stack?: string, context?: string): void {
    const formattedMessage = `${this.colorCodes.bgRed}${this.colorCodes.white}[ERROR]${this.colorCodes.reset} ${this.colorCodes.dim}${this.formatTimestamp()}${this.colorCodes.reset} ${this.colorCodes.cyan}${this.formatContext(context)}${this.colorCodes.reset} ${this.colorCodes.red}${message}${this.colorCodes.reset}`;
    console.error(formattedMessage);
    if (stack) {
      console.error(`${this.colorCodes.dim}${stack}${this.colorCodes.reset}`);
    }
  }

  warn(message: string, context?: string): void {
    const formattedMessage = `${this.colorCodes.bgYellow}[WARN]${this.colorCodes.reset} ${this.colorCodes.dim}${this.formatTimestamp()}${this.colorCodes.reset} ${this.colorCodes.cyan}${this.formatContext(context)}${this.colorCodes.reset} ${this.colorCodes.yellow}${message}${this.colorCodes.reset}`;
    console.warn(formattedMessage);
  }

  debug(message: string, context?: string): void {
    const formattedMessage = `${this.colorCodes.magenta}[DEBUG]${this.colorCodes.reset} ${this.colorCodes.dim}${this.formatTimestamp()}${this.colorCodes.reset} ${this.colorCodes.cyan}${this.formatContext(context)}${this.colorCodes.reset} ${message}`;
    console.debug(formattedMessage);
  }

  verbose(message: string, context?: string): void {
    const formattedMessage = `${this.colorCodes.blue}[VERBOSE]${this.colorCodes.reset} ${this.colorCodes.dim}${this.formatTimestamp()}${this.colorCodes.reset} ${this.colorCodes.cyan}${this.formatContext(context)}${this.colorCodes.reset} ${message}`;
    console.log(formattedMessage);
  }

  /**
   * Log với metadata object
   */
  logWithMeta(message: string, meta: Record<string, unknown>, context?: string): void {
    this.log(message, context);
    console.log(`${this.colorCodes.dim}${JSON.stringify(meta, null, 2)}${this.colorCodes.reset}`);
  }

  /**
   * Log error với metadata object
   */
  errorWithMeta(message: string, meta: Record<string, unknown>, stack?: string, context?: string): void {
    this.error(message, stack, context);
    console.error(`${this.colorCodes.dim}${JSON.stringify(meta, null, 2)}${this.colorCodes.reset}`);
  }

  /**
   * Factory method để tạo logger với context
   */
  static create(context: string): CustomLogger {
    const logger = new CustomLogger();
    logger.setContext(context);
    return logger;
  }
}
