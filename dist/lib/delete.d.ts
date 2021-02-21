import { DatabaseConnection } from '../interfaces/DatabaseConnection';
/**
 * INTERNAL: Delete records from a given table without any data processing
 * @param table_name
 * @param where
 */
export declare function deleteRecordRaw(connection: DatabaseConnection, table_name: string, where: any): Promise<any>;
//# sourceMappingURL=delete.d.ts.map