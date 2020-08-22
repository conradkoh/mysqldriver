import { DatabaseConnection } from './DatabaseConnection';
export interface DatabaseConfig {
    database: string;
    createConnection: () => DatabaseConnection;
}
//# sourceMappingURL=DatabaseConfig.d.ts.map