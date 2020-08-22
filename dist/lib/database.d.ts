import { DatabaseConnection } from '../classes/DatabaseConnection';
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