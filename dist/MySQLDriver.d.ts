import * as MySQL from 'mysql';
import { IConfig, ISQLTableColumn, IJSObjectInfo } from './Interfaces';
declare enum CONNECTION_STATUS {
    CONNECTED = "connected",
    CONNECTING = "connecting",
    DISCONNECTED = "disconnected"
}
declare class MySQLDriver {
    config: IConfig;
    connection?: MySQL.Connection | null;
    connection_status: CONNECTION_STATUS;
    constructor(config: IConfig);
    initConnection(): void;
    handleDisconnect(): void;
    /**
     * Get the database connection
     */
    getConnection(): Promise<MySQL.Connection>;
    /**
     * Create a new connection to the database
     */
    createConnection(): MySQL.Connection;
    _createConnection(): MySQL.Connection;
    generateId(): string;
    /**
     * Insert records into the database
     * @param table_name The name of the table to insert the records into
     * @param record The record to be insert into the database
     */
    insertRecord(table_name: string, record: any): Promise<any[]>;
    /**
     * Get records from a table that match the where criteria
     * @param table_name
     * @param where The search criteria to do a match
     */
    getRecords(table_name: string, where: any, order_by?: Array<{
        key: string;
        order: 'ASC' | 'DESC';
    }>, options?: QueryOptions): Promise<any[]>;
    /**
     * Get records count from a table that match the where criteria
     * @param table_name
     * @param where The search criteria to do a match
     */
    getRecordsCount(table_name: string, where: any, order_by?: Array<{
        key: string;
        order: 'ASC' | 'DESC';
    }>, options?: QueryOptions): Promise<any>;
    /**
     * Get record from a table that match the where criteria
     * @param table_name
     * @param where The search criteria to do a match
     */
    getRecord(table_name: string, where: any, order_by?: Array<{
        key: string;
        order: 'ASC' | 'DESC';
    }>): Promise<any>;
    /**
     * Update records in a given table
     * @param table_name
     * @param properties The properties to be updated
     * @param where THe criteria to search
     */
    updateRecords(table_name: string, properties: any, where: any): Promise<any[]>;
    /**
     * Delete records from a table that match there where criteria
     * @param table_name
     * @param where
     */
    deleteRecords(table_name: string, where: any): Promise<any[]>;
    /**
     * Get a record via an sql query
     * @param sql
     * @param values
     */
    getRecordSql(sql: string, values: Array<any>): Promise<Array<any>>;
    /**
     * Gets records from the database via a provided sql statement
     * @param sql
     * @param values
     */
    getRecordsSql(sql: string, values: Array<any>): Promise<Array<any>>;
    /**
     * Gets all tables in the current database
     */
    getTableNames(): Promise<any[]>;
    /**
     * Get the table information from the information schema
     * @param table_name
     */
    getTableInfo(table_name: string): Promise<ISQLTableColumn[]>;
    /**
     * Get the field names for a given table
     * @param table_name
     */
    getTableFieldNames(table_name: string): Promise<any[]>;
    /**
     * Query the database connection asynchronously
     * @param query
     * @param values
     */
    query(query: string, values?: Array<any>): Promise<Array<any>>;
    /**
     * Gets the schema of the database as an array of table schema objects
     */
    getJSSchema(): Promise<IJSObjectInfo[]>;
    /**
     *
     * @param table_name
     */
    tableGetJSSchema(table_name: string): Promise<IJSObjectInfo>;
    /**
     * Query the database
     * @param {MySQL.Connection} connection
     * @param query
     * @param values
     * @param callback
     */
    _query(connection: MySQL.Connection, query: string, values: Array<string>, callback: Function): void;
    closeConnection(): Promise<void>;
    /**
     * Get the field
     * @param database_name
     * @param table_name
     */
    _getTableInfo(database_name: string, table_name: string): Promise<ISQLTableColumn[]>;
    /**
     * Gets all table names in a given database
     * @param database_name
     */
    _getTableNames(database_name: string): Promise<any[]>;
    /**
     * Checks the record against the database schema and removes any irrelevant fields for insertion
     * @param database_name
     * @param table_name
     * @param record_raw
     */
    _prepareRecord(database_name: string, table_name: string, record_raw: any): Promise<any>;
    /**
     * INTERNAL: Insert records into the database without any processing
     * @param table_name The name of the table to insert the records into
     * @param record The record to be insert into the database
     */
    _insertRecordRaw(table_name: string, record: any): Promise<any[]>;
    /**
     * INTERNAL: Update records in a given table without any processing
     * @param table_name
     * @param properties The properties to be updated
     * @param where THe criteria to search
     */
    _updateRecordsRaw(table_name: string, properties: any, where: any): Promise<any[]>;
    /**
     * INTERNAL: Select records from a given table without any data processing
     * @param table_name
     * @param where
     */
    _selectRecordRaw(table_name: string, where: any, order_by: Array<{
        key: string;
        order: 'ASC' | 'DESC';
    }>, options?: QueryOptions): Promise<any[]>;
    /**
     * INTERNAL: Select count of records from a given table without any data processing
     * @param table_name
     * @param where
     */
    _selectRecordRawCount(table_name: string, where: any, order_by: Array<{
        key: string;
        order: 'ASC' | 'DESC';
    }>, options?: QueryOptions): Promise<any>;
    /**
     * INTERNAL: Delete records from a given table without any data processing
     * @param table_name
     * @param where
     */
    _deleteRecordRaw(table_name: string, where: any): Promise<any[]>;
    /**
     * Checks an array of values and ensures that it is not undefined
     * @param {Array<string>} values
     */
    _checkValues(values: Array<string>): Promise<void>;
}
declare type QueryOptions = {
    limit?: QueryLimitOptions;
    where?: QueryWhereOptions;
};
declare type QueryLimitOptions = {
    offset?: number;
    page_size: number;
};
declare type QueryWhereOptions = {
    operator?: 'AND' | 'OR';
    wildcard?: boolean;
    wildcardBefore?: boolean;
    wildcardAfter?: boolean;
};
export = MySQLDriver;
//# sourceMappingURL=MySQLDriver.d.ts.map