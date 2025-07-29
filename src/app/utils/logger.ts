interface LogLevel {
  ERROR: string;
  WARN: string;
  INFO: string;
  DEBUG: string;
}

const LOG_LEVELS: LogLevel = {
  ERROR: "❌ ERROR",
  WARN: "⚠️  WARN",
  INFO: "ℹ️  INFO",
  DEBUG: "🐛 DEBUG",
};

class Logger {
  private isProduction = process.env.NODE_ENV === "production";

  private formatMessage(
    level: string,
    message: string,
    ...args: unknown[]
  ): string {
    const timestamp = new Date().toISOString();
    const formattedArgs =
      args.length > 0
        ? " " +
          args
            .map((arg) =>
              typeof arg === "object"
                ? JSON.stringify(arg, null, 2)
                : String(arg)
            )
            .join(" ")
        : "";

    return `[${timestamp}] ${level}: ${message}${formattedArgs}`;
  }

  error(message: string, ...args: unknown[]): void {
    console.error(this.formatMessage(LOG_LEVELS.ERROR, message, ...args));
  }

  warn(message: string, ...args: unknown[]): void {
    console.warn(this.formatMessage(LOG_LEVELS.WARN, message, ...args));
  }

  info(message: string, ...args: unknown[]): void {
    console.info(this.formatMessage(LOG_LEVELS.INFO, message, ...args));
  }

  debug(message: string, ...args: unknown[]): void {
    if (!this.isProduction) {
      console.log(this.formatMessage(LOG_LEVELS.DEBUG, message, ...args));
    }
  }
}

const logger = new Logger();

export default logger;
