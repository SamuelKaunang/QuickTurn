/**
 * Logger utility for safe logging
 * In production, all logs are suppressed to prevent data exposure
 * Only enable logging in development mode
 */

const isDevelopment = process.env.NODE_ENV === 'development';

export const logger = {
    log: (...args) => {
        if (isDevelopment) {
            console.log(...args);
        }
    },
    error: (...args) => {
        if (isDevelopment) {
            console.error(...args);
        }
    },
    warn: (...args) => {
        if (isDevelopment) {
            console.warn(...args);
        }
    },
    info: (...args) => {
        if (isDevelopment) {
            console.info(...args);
        }
    },
    debug: (...args) => {
        if (isDevelopment) {
            console.debug(...args);
        }
    }
};

export default logger;
