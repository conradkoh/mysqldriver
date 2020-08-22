import { DatabaseConfig } from '../interfaces/DatabaseConfig';
import { DatabaseConnection } from '../interfaces/DatabaseConnection';
export declare class ConnectionProvider {
    private cfg;
    private timeoutDelay;
    private connection;
    constructor(cfg: DatabaseConfig);
    private handleDisconnect;
    getConnection(): Promise<DatabaseConnection>;
}
export declare type ConnectionEvent = 'error' | null;
//# sourceMappingURL=ConnectionProvider.d.ts.map