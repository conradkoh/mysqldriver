import { DatabaseConnection } from '../classes/DatabaseConnection';
export declare const ALIAS_COLUMN_NAME = "COLUMN_NAME";
export declare const ALIAS_DATA_TYPE = "DATA_TYPE";
export declare const ALIAS_COLUMN_KEY = "COLUMN_KEY";
export declare const ALIAS_CHARACTER_MAXIMUM_LENGTH = "CHARACTER_MAXIMUM_LENGTH";
export declare const ALIAS_IS_NULLABLE = "IS_NULLABLE";
export declare const ALIAS_COLUMN_DEFAULT = "COLUMN_DEFAULT";
export declare const ALIAS_TABLE_NAME = "TABLE_NAME";
/**
 * Checks the record against the database schema and removes any irrelevant fields for insertion
 * @param database_name
 * @param table_name
 * @param record_raw
 */
export declare function prepareRecord(connection: DatabaseConnection, database_name: string, table_name: string, record_raw: any): Promise<any>;
/**
 * Get the field
 * @param database_name
 * @param table_name
 */
export declare function getTableInfo(connection: DatabaseConnection, database_name: string, table_name: string): Promise<SQLTableColumn[]>;
/**
 * Gets all table names in a given database
 * @param database_name
 */
export declare function getTableNames(connection: DatabaseConnection, database_name: string): Promise<any[]>;
export interface SQLTableColumn {
    COLUMN_NAME: string;
    DATA_TYPE: string;
    COLUMN_KEY: string;
    CHARACTER_MAXIMUM_LENGTH: number;
    IS_NULLABLE: number;
    COLUMN_DEFAULT?: string;
}
//# sourceMappingURL=database.d.ts.map