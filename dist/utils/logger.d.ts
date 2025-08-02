declare class Logger {
    private isProduction;
    private formatMessage;
    error(message: string, ...args: unknown[]): void;
    warn(message: string, ...args: unknown[]): void;
    info(message: string, ...args: unknown[]): void;
    debug(message: string, ...args: unknown[]): void;
}
declare const logger: Logger;
export default logger;
//# sourceMappingURL=logger.d.ts.map