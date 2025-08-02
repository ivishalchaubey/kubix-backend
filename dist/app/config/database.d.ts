declare class Database {
    private static instance;
    private isConnected;
    private constructor();
    static getInstance(): Database;
    connect(): Promise<void>;
    disconnect(): Promise<void>;
    isDbConnected(): boolean;
}
export default Database;
//# sourceMappingURL=database.d.ts.map