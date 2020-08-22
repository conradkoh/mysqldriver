export declare class ConnectionProvider {
    private cfg;
    private connectionStatus;
    private timeoutDelay;
    private connection;
    constructor(cfg: DatabaseConfig);
    private handleDisconnect;
    getConnection(): Promise<DatabaseConnection>;
}
export interface DatabaseConfig {
    createConnection: () => DatabaseConnection;
}
export interface DatabaseConnection {
    destroy(): void;
    on(event: ConnectionEvent, handler: Function): void;
    query(query: string, values: any[], callback: (err: Error | null, rows: any[]) => void): void;
    end(callback: (err: Error | null) => void): void;
}
export declare type ConnectionEvent = 'error' | null;
//# sourceMappingURL=Database.d.ts.map