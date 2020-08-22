import { IConnection } from './IConnection';
export interface IConfig {
    createConnection: () => IConnection;
    querySelect: (conn: any, query: string, values: any[]) => Promise<any[]>;
    database: string;
}
//# sourceMappingURL=IConfig.d.ts.map