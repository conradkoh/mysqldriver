import mysql from 'mysql';
export declare function makeTestConnectionConfig(): {
    host: string;
    database: string;
    password: string;
    user: string;
    charset: string;
};
export declare function makeDBConfig(): {
    database: string;
    createConnection: () => {
        destroy: () => void;
        on: (ev: any, cb: any) => mysql.Connection;
        query: (q: any, v: any, cb: any) => mysql.Query;
        end: (cb: any) => void;
        isDisconnected: () => boolean;
    };
};
//# sourceMappingURL=connection.d.ts.map