import * as MySQL from 'mysql';
import UUIDv4 from 'uuid/v4';
import {
  IConfig,
  ISQLTableColumn,
  IJSObjectFieldInfo,
  IJSObjectInfo,
} from './Interfaces';
import { ALLOWED_OPERATORS } from './constants';
import { IConnection } from './interfaces/IConnection';
import { containsSpecialChars, query } from './lib/query';
import { selectRecordRaw, selectRecordRawCount } from './lib/select';
import { prepareRecord, getTableNames, getTableInfo } from './lib/database';
import { insertRecordRaw } from './lib/insert';
import { updateRecordsRaw } from './lib/update';
import { deleteRecordRaw } from './lib/delete';
import { getJSSchema, tableGetJSSchema } from './lib/javascript';
const ALIAS_COLUMN_NAME = 'COLUMN_NAME';
const ALIAS_DATA_TYPE = 'DATA_TYPE';
const ALIAS_COLUMN_KEY = 'COLUMN_KEY';
const ALIAS_CHARACTER_MAXIMUM_LENGTH = 'CHARACTER_MAXIMUM_LENGTH';
const ALIAS_IS_NULLABLE = 'IS_NULLABLE';
const ALIAS_COLUMN_DEFAULT = 'COLUMN_DEFAULT';

enum CONNECTION_STATUS {
  CONNECTED = 'connected',
  CONNECTING = 'connecting',
  DISCONNECTED = 'disconnected',
}

class MySQLDriver {
  config: IConfig;
  _createConnection: () => IConnection;
  querySelect: (query: string, values: any[]) => Promise<any[]>;
  connection: IConnection;
  connection_status: CONNECTION_STATUS;
  constructor(config: IConfig) {
    this.config = config;
    this._createConnection = config.createConnection;
    // this.config.port = config.port || 3306;
    this.connection_status = CONNECTION_STATUS.DISCONNECTED;
    let { conn, querySelect } = this._prepareConnection();
    conn.on('error', this.handleDisconnect.bind(this)); //Add the handler for disconnection on errors
    this.connection = conn;
    this.querySelect = querySelect;
  }

  handleDisconnect() {
    if (this.connection) {
      this.connection.destroy();
    }
    this.connection_status = CONNECTION_STATUS.DISCONNECTED;
    console.log('Database disconnected by server.');
  }
  /**
   * Get the database connection
   */
  async getConnection(): Promise<IConnection> {
    let wait = 500;
    if (
      this.connection_status === CONNECTION_STATUS.CONNECTED &&
      this.connection
    ) {
      return this.connection;
    }
    while (this.connection_status === CONNECTION_STATUS.CONNECTING) {
      await new Promise((resolve, reject) => {
        //Wait for a short interval before checking again
        setTimeout(() => {
          resolve();
        }, wait);
      });
    }
    if (this.connection_status === CONNECTION_STATUS.DISCONNECTED) {
      let { conn, querySelect } = this._prepareConnection();
      this.querySelect = querySelect;
      return conn;
    }
    return this.connection;
  }

  _prepareConnection() {
    let conn = this._createConnection();
    let querySelect = async (query: string, values: any[]) => {
      let result = await this.config.querySelect(conn, query, values);
      return result;
    };
    return {
      conn,
      querySelect,
    };
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
    let connection = await this.getConnection();
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
    let connection = await this.getConnection();
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
    let connection = await this.getConnection();
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
    let connection = await this.getConnection();
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
    let connection = await this.getConnection();

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
    let connection = await this.getConnection();
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
    let connection = await this.getConnection();
    return await query(connection, sql, values);
  }

  /**
   * Gets all tables in the current database
   */
  async getTableNames() {
    let connection = await this.getConnection();
    const self = this;
    let { database } = self.config;
    const table_names = await getTableNames(connection, database);
    return table_names;
  }
  /**
   * Get the table information from the information schema
   * @param table_name
   */
  async getTableInfo(table_name: string): Promise<ISQLTableColumn[]> {
    let connection = await this.getConnection();
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
    let connection = await this.getConnection();
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
    let connection = await this.getConnection();
    return await query(connection, sql, values);
  }

  async closeConnection() {
    let connection = await this.getConnection();
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
  async getJSSchema(): Promise<IJSObjectInfo[]> {
    let connection = await this.getConnection();
    let { database } = this.config;
    return await getJSSchema(connection, database);
  }
  /**
   *
   * @param table_name
   */
  async tableGetJSSchema(table_name: string): Promise<IJSObjectInfo> {
    let connection = await this.getConnection();
    let { database } = this.config;
    return await tableGetJSSchema(connection, database, table_name);
  }
}
type QueryOptions = {
  limit?: QueryLimitOptions;
  where?: QueryWhereOptions;
};
type QueryLimitOptions = {
  offset?: number;
  page_size: number;
};
type QueryWhereOptions = {
  operator?: 'AND' | 'OR';
  wildcard?: boolean;
  wildcardBefore?: boolean;
  wildcardAfter?: boolean;
};
export = MySQLDriver;
