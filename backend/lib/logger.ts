type LogLevel = 'info' | 'warn' | 'error' | 'debug';

class Logger {
    private log(level: LogLevel, message: string, ...args: any[]) {
        const timestamp = new Date().toISOString();
        const prefix = `[${timestamp}] [${level.toUpperCase()}]`;

        if (process.env.NODE_ENV === 'development') {
            console[level === 'error' ? 'error' : 'log'](prefix, message, ...args);
        } else {
            // In production, send to logging service (e.g., Sentry, LogRocket)
            console[level === 'error' ? 'error' : 'log'](prefix, message);
        }
    }

    info(message: string, ...args: any[]) {
        this.log('info', message, ...args);
    }

    warn(message: string, ...args: any[]) {
        this.log('warn', message, ...args);
    }

    error(message: string, ...args: any[]) {
        this.log('error', message, ...args);
    }

    debug(message: string, ...args: any[]) {
        if (process.env.NODE_ENV === 'development') {
            this.log('debug', message, ...args);
        }
    }
}

export const logger = new Logger();
