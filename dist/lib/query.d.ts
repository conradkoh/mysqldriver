import { DatabaseConnection } from '../classes/DatabaseConnection';
/**
 * Query a connection with data
 * @param connection
 * @param query
 * @param values
 */
export declare function query(connection: DatabaseConnection, query: string, values?: Array<any>): Promise<any>;
export declare function containsSpecialChars(str_val: string): boolean;
export declare type QueryOptions = {
    limit?: QueryLimitOptions;
    where?: QueryWhereOptions;
};
export declare type QueryLimitOptions = {
    offset?: number;
    page_size: number;
};
export declare type QueryWhereOptions = {
    operator?: 'AND' | 'OR';
    wildcard?: boolean;
    wildcardBefore?: boolean;
    wildcardAfter?: boolean;
};
//# sourceMappingURL=query.d.ts.map