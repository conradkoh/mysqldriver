import UUIDv4 from 'uuid/v4';
import { ConnectionProvider } from './ConnectionProvider';
import { DatabaseConfig } from './DatabaseConfig';
import { containsSpecialChars, query, QueryOptions } from '../lib/query';
import { selectRecordRaw, selectRecordRawCount } from '../lib/select';
import {
  prepareRecord,
  getTableNames,
  getTableInfo,
  SQLTableColumn,
} from '../lib/database';
import { insertRecordRaw } from '../lib/insert';
import { updateRecordsRaw } from '../lib/update';
import { deleteRecordRaw } from '../lib/delete';
import {
  getJSSchema,
  tableGetJSSchema,
  JSTableSchema,
} from '../lib/javascript';
export class DatabaseDriver {
  private config: DatabaseConfig;
  private provider: ConnectionProvider;
  constructor(cfg: DatabaseConfig) {
    this.config = cfg;
    this.provider = new ConnectionProvider(cfg);
  }
  generateId() {
    return UUIDv4();
  }
  /**
   * Insert records into the database
   * @param table_name The name of the table to insert the records into
   * @param record The record to be insert into the database
   */
  async insertRecord(table_name: string, record: any) {
    let connection = await this.provider.getConnection();
    let self = this;
    let { database } = self.config;
    let clean_record = await prepareRecord(
      connection,
      database,
      table_name,
      record
    );
    let res = await insertRecordRaw(connection, table_name, clean_record);
    return res;
  }
  /**
   * Get records from a table that match the where criteria
   * @param table_name
   * @param where The search criteria to do a match
   */
  async getRecords(
    table_name: string,
    where: any,
    order_by: Array<{ key: string; order: 'ASC' | 'DESC' }> = [],
    options?: QueryOptions
  ) {
    let connection = await this.provider.getConnection();
    return await selectRecordRaw(
      connection,
      table_name,
      where,
      order_by,
      options
    );
  }
  /**
   * Get records count from a table that match the where criteria
   * @param table_name
   * @param where The search criteria to do a match
   */
  async getRecordsCount(
    table_name: string,
    where: any,
    order_by: Array<{ key: string; order: 'ASC' | 'DESC' }> = [],
    options?: QueryOptions
  ) {
    let connection = await this.provider.getConnection();
    return await selectRecordRawCount(
      connection,
      table_name,
      where,
      order_by,
      options
    );
  }

  /**
   * Get record from a table that match the where criteria
   * @param table_name
   * @param where The search criteria to do a match
   */
  async getRecord(
    table_name: string,
    where: any,
    order_by: Array<{ key: string; order: 'ASC' | 'DESC' }> = []
  ) {
    let connection = await this.provider.getConnection();
    const result = await selectRecordRaw(
      connection,
      table_name,
      where,
      order_by,
      { limit: { offset: 0, page_size: 1 } }
    );
    if (result.length > 1) {
      throw new Error(`MySQLDriver.getRecord: More than one record found.`);
    }
    if (result.length === 0) {
      return undefined;
    }
    return result[0];
  }

  /**
   * Update records in a given table
   * @param table_name
   * @param properties The properties to be updated
   * @param where THe criteria to search
   */
  async updateRecords(table_name: string, properties: any, where: any) {
    let self = this;
    let connection = await this.provider.getConnection();

    let { database } = self.config;
    let clean_properties = await prepareRecord(
      connection,
      database,
      table_name,
      properties
    );
    return await updateRecordsRaw(
      connection,
      table_name,
      clean_properties,
      where
    );
  }
  /**
   * Delete records from a table that match there where criteria
   * @param table_name
   * @param where
   */
  async deleteRecords(table_name: string, where: any) {
    let self = this;
    let connection = await this.provider.getConnection();
    return await deleteRecordRaw(connection, table_name, where);
  }

  /**
   * Get a record via an sql query
   * @param sql
   * @param values
   */
  async getRecordSql(sql: string, values: Array<any>): Promise<Array<any>> {
    let self = this;
    let records = await self.getRecordsSql(sql, values);
    if (records.length > 1) {
      throw new Error(
        `MySQLDriver.getRecordSql: More than one record found for value.`
      );
    }
    if (records.length === 0) {
      return [];
    }

    return records[0];
  }
  /**
   * Gets records from the database via a provided sql statement
   * @param sql
   * @param values
   */
  async getRecordsSql(sql: string, values: Array<any>): Promise<Array<any>> {
    let connection = await this.provider.getConnection();
    return await query(connection, sql, values);
  }

  /**
   * Gets all tables in the current database
   */
  async getTableNames() {
    let connection = await this.provider.getConnection();
    const self = this;
    let { database } = self.config;
    const table_names = await getTableNames(connection, database);
    return table_names;
  }
  /**
   * Get the table information from the information schema
   * @param table_name
   */
  async getTableInfo(table_name: string): Promise<SQLTableColumn[]> {
    let connection = await this.provider.getConnection();
    let self = this;
    let { database } = self.config;
    let info = await getTableInfo(connection, database, table_name);
    return info;
  }

  /**
   * Get the field names for a given table
   * @param table_name
   */
  async getTableFieldNames(table_name: string): Promise<any[]> {
    let connection = await this.provider.getConnection();
    let self = this;
    let { database } = self.config;
    let info = await getTableInfo(connection, database, table_name);
    return info.map((field_info) => field_info.COLUMN_NAME);
  }
  /**
   * Query the database connection asynchronously
   * @param sql
   * @param values
   */
  async query(sql: string, values: Array<any> = []): Promise<Array<any>> {
    let connection = await this.provider.getConnection();
    return await query(connection, sql, values);
  }

  async closeConnection() {
    let connection = await this.provider.getConnection();
    if (connection) {
      await new Promise((resolve, reject) => {
        connection.end((err) => {
          err ? reject(err) : resolve();
        });
      });
    }
  }

  /**
   * Gets the schema of the database as an array of table schema objects
   */
  async getJSSchema(): Promise<JSTableSchema[]> {
    let connection = await this.provider.getConnection();
    let { database } = this.config;
    return await getJSSchema(connection, database);
  }
  /**
   *
   * @param table_name
   */
  async tableGetJSSchema(table_name: string): Promise<JSTableSchema> {
    let connection = await this.provider.getConnection();
    let { database } = this.config;
    return await tableGetJSSchema(connection, database, table_name);
  }
}
