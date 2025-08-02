const LOG_LEVELS = {
    ERROR: "❌ ERROR",
    WARN: "⚠️  WARN",
    INFO: "ℹ️  INFO",
    DEBUG: "🐛 DEBUG",
};
class Logger {
    isProduction = process.env.NODE_ENV === "production";
    formatMessage(level, message, ...args) {
        const timestamp = new Date().toISOString();
        const formattedArgs = args.length > 0
            ? " " +
                args
                    .map((arg) => typeof arg === "object"
                    ? JSON.stringify(arg, null, 2)
                    : String(arg))
                    .join(" ")
            : "";
        return `[${timestamp}] ${level}: ${message}${formattedArgs}`;
    }
    error(message, ...args) {
        console.error(this.formatMessage(LOG_LEVELS.ERROR, message, ...args));
    }
    warn(message, ...args) {
        console.warn(this.formatMessage(LOG_LEVELS.WARN, message, ...args));
    }
    info(message, ...args) {
        console.info(this.formatMessage(LOG_LEVELS.INFO, message, ...args));
    }
    debug(message, ...args) {
        if (!this.isProduction) {
            console.log(this.formatMessage(LOG_LEVELS.DEBUG, message, ...args));
        }
    }
}
const logger = new Logger();
export default logger;
//# sourceMappingURL=logger.js.map