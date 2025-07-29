interface LogLevel {
    ERROR: 0;
    WARN: 1;
    INFO: 2;
    DEBUG: 3;
}

const LOG_LEVELS: LogLevel = {
    ERROR: 0,
    WARN: 1,
    INFO: 2,
    DEBUG: 3,
};

class Logger {
    private logLevel: number;

    constructor() {
        const level = process.env.LOG_LEVEL?.toUpperCase() || 'INFO';
        this.logLevel = LOG_LEVELS[level as keyof LogLevel] ?? LOG_LEVELS.INFO;
    }

    private formatMessage(level: string, message: string, meta?: any): string {
        const timestamp = new Date().toISOString();
        const metaStr = meta ? ` ${JSON.stringify(meta)}` : '';
        return `[${timestamp}] ${level}: ${message}${metaStr}`;
    }

    private shouldLog(level: number): boolean {
        return level <= this.logLevel;
    }

    error(message: string, meta?: any): void {
        if (this.shouldLog(LOG_LEVELS.ERROR)) {
            console.error(this.formatMessage('ERROR', message, meta));
        }
    }

    warn(message: string, meta?: any): void {
        if (this.shouldLog(LOG_LEVELS.WARN)) {
            console.warn(this.formatMessage('WARN', message, meta));
        }
    }

    info(message: string, meta?: any): void {
        if (this.shouldLog(LOG_LEVELS.INFO)) {
            console.info(this.formatMessage('INFO', message, meta));
        }
    }

    debug(message: string, meta?: any): void {
        if (this.shouldLog(LOG_LEVELS.DEBUG)) {
            console.debug(this.formatMessage('DEBUG', message, meta));
        }
    }

    // HTTP request logging
    http(method: string, url: string, statusCode: number, responseTime: number, userAgent?: string): void {
        const message = `${method} ${url} ${statusCode} - ${responseTime}ms`;
        const meta = userAgent ? { userAgent } : undefined;
        
        if (statusCode >= 500) {
            this.error(message, meta);
        } else if (statusCode >= 400) {
            this.warn(message, meta);
        } else {
            this.info(message, meta);
        }
    }
}

export const logger = new Logger();
