/// <reference types="node" />
import tls from 'tls';
export interface ConnectionConfig {
    host?: string;
    database?: string;
    password?: string;
    user?: string;
    port?: number;
    multipleStatements?: boolean;
    requireSsl?: boolean;
    ssl?: tls.SecureContextOptions & {
        rejectUnauthorized?: boolean;
    };
    charset?: string;
}
//# sourceMappingURL=ConnectionConfig.d.ts.map