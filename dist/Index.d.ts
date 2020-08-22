import { ConnectionProvider } from './classes/ConnectionProvider';
import { DatabaseDriver } from './classes/DatabaseDriver';
interface Config {
    host: string;
    database: string;
    password: string;
    user: string;
    multipleStatements?: boolean;
}
declare function connect(config: Config): DatabaseDriver;
export { ConnectionProvider, DatabaseDriver, connect };
//# sourceMappingURL=index.d.ts.map