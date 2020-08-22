import { DatabaseConnection } from '../classes/DatabaseConnection';
/**
 * INTERNAL: Insert records into the database without any processing
 * @param table_name The name of the table to insert the records into
 * @param record The record to be insert into the database
 */
export declare function insertRecordRaw(connection: DatabaseConnection, table_name: string, record: any): Promise<any>;
//# sourceMappingURL=insert.d.ts.map