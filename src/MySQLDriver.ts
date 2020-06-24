import * as MySQL from 'mysql';
import UUIDv4 from 'uuid/v4';
import { IConfig, ISQLTableColumn, IJSObjectFieldInfo, IJSObjectInfo } from './Interfaces';
import { ALLOWED_OPERATORS } from './constants';
const ALIAS_COLUMN_NAME = 'COLUMN_NAME';
const ALIAS_DATA_TYPE = 'DATA_TYPE';
const ALIAS_COLUMN_KEY = 'COLUMN_KEY';
const ALIAS_CHARACTER_MAXIMUM_LENGTH = 'CHARACTER_MAXIMUM_LENGTH';
const ALIAS_IS_NULLABLE = 'IS_NULLABLE';
const ALIAS_COLUMN_DEFAULT = 'COLUMN_DEFAULT';
const INVALID_COLUMN_NAME_CHARS = '!#%&’()*+,-./:;<=>?@[]^~ "`\\';
const INVALID_COLUMN_NAME_CHARS_INDEX = INVALID_COLUMN_NAME_CHARS.split('').reduce((state: any, char: string) => {
    state[char] = 1;
    return state;
}, {});

const ALIAS_TABLE_NAME = 'TABLE_NAME';

enum CONNECTION_STATUS {
    CONNECTED = 'connected',
    CONNECTING = 'connecting',
    DISCONNECTED = 'disconnected',
}

class MySQLDriver {
    config: IConfig;
    connection?: MySQL.Connection | null;
    connection_status: CONNECTION_STATUS;
    constructor(config: IConfig) {
        this.config = config;
        this.config.port = config.port || 3306;
        this.connection_status = CONNECTION_STATUS.DISCONNECTED;
        this.initConnection();
    }
    initConnection() {
        this.connection = this.createConnection();
        this.connection_status = CONNECTION_STATUS.CONNECTED;
    }

    handleDisconnect() {
        if (this.connection) {
            this.connection.destroy();
        }
        this.connection = null;
        this.connection_status = CONNECTION_STATUS.DISCONNECTED;
        console.log('Database disconnected by server.');
    }
    /**
     * Get the database connection
     */
    async getConnection(): Promise<MySQL.Connection> {
        let wait = 500;
        if (this.connection_status === CONNECTION_STATUS.CONNECTED && this.connection) {
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
            this.initConnection();
        }
        return this.connection || this.createConnection();
    }
    /**
     * Create a new connection to the database
     */
    createConnection() {
        this.connection_status = CONNECTION_STATUS.CONNECTING;
        let conn = this._createConnection();
        conn.on('error', this.handleDisconnect.bind(this)); //Add the handler for disconnection on errors
        this.connection = conn;
        this.connection_status = CONNECTION_STATUS.CONNECTED;
        return conn;
    }

    _createConnection() {
        const { host, user, password, database, port, multipleStatements } = this.config;
        return MySQL.createConnection({
            host,
            user,
            password,
            database,
            port,
            multipleStatements,
        });
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
        let self = this;
        let { database } = self.config;
        let clean_record = await self._prepareRecord(database, table_name, record);
        return await self._insertRecordRaw(table_name, clean_record);
    }
    /**
     * Get records from a table that match the where criteria
     * @param table_name
     * @param where The search criteria to do a match
     */
    async getRecords(table_name: string, where: any, order_by: Array<{ key: string; order: 'ASC' | 'DESC' }> = [], options?: QueryOptions) {
        let self = this;
        return await self._selectRecordRaw(table_name, where, order_by, options);
    }
    /**
     * Get records count from a table that match the where criteria
     * @param table_name
     * @param where The search criteria to do a match
     */
    async getRecordsCount(table_name: string, where: any, order_by: Array<{ key: string; order: 'ASC' | 'DESC' }> = [], options?: QueryOptions) {
        let self = this;
        return await self._selectRecordRawCount(table_name, where, order_by, options);
    }

    /**
     * Get record from a table that match the where criteria
     * @param table_name
     * @param where The search criteria to do a match
     */
    async getRecord(table_name: string, where: any, order_by: Array<{ key: string; order: 'ASC' | 'DESC' }> = []) {
        let self = this;
        const result = await self._selectRecordRaw(table_name, where, order_by, { limit: { offset: 0, page_size: 1 } });
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
        let { database } = self.config;
        let clean_properties = await self._prepareRecord(database, table_name, properties);
        return await self._updateRecordsRaw(table_name, clean_properties, where);
    }
    /**
     * Delete records from a table that match there where criteria
     * @param table_name
     * @param where
     */
    async deleteRecords(table_name: string, where: any) {
        let self = this;
        return await self._deleteRecordRaw(table_name, where);
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
            throw new Error(`MySQLDriver.getRecordSql: More than one record found for value.`);
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
        let self = this;
        let records = await self.query(sql, values);
        return records;
    }

    /**
     * Gets all tables in the current database
     */
    async getTableNames() {
        const self = this;
        let { database } = self.config;
        const table_names = await self._getTableNames(database);
        return table_names;
    }
    /**
     * Get the table information from the information schema
     * @param table_name
     */
    async getTableInfo(table_name: string): Promise<ISQLTableColumn[]> {
        let self = this;
        let { database } = self.config;
        let info = await self._getTableInfo(database, table_name);
        return info;
    }

    /**
     * Get the field names for a given table
     * @param table_name
     */
    async getTableFieldNames(table_name: string): Promise<any[]> {
        let self = this;
        let { database } = self.config;
        let info = await self._getTableInfo(database, table_name);
        return info.map((field_info) => field_info.COLUMN_NAME);
    }
    /**
     * Query the database connection asynchronously
     * @param query
     * @param values
     */
    async query(query: string, values: Array<any> = []): Promise<Array<any>> {
        let self = this;
        this._checkValues(values);
        let connection = await this.getConnection();
        return new Promise<Array<any>>((resolve, reject) => {
            self._query(connection, query, values, function (err: any, rows: Array<any>) {
                if (err) {
                    let error: any = new Error(`MySQLDriver: query: SQL query error.`);
                    let data = {
                        err,
                        query,
                        values,
                    };
                    error.data = data;
                    if (err.code === 'ECONNREFUSED') {
                        self.handleDisconnect();
                    }
                    console.log(data);
                    reject(error);
                } else {
                    resolve(rows);
                }
            });
        });
    }

    /**
     * Gets the schema of the database as an array of table schema objects
     */
    async getJSSchema(): Promise<IJSObjectInfo[]> {
        const self = this;
        const tables = await self.getTableNames();
        const schema = tables.map(async (table_name: string) => {
            let table_schema = await self.tableGetJSSchema(table_name);
            return table_schema;
        });
        return await Promise.all(schema);
    }
    /**
     *
     * @param table_name
     */
    async tableGetJSSchema(table_name: string): Promise<IJSObjectInfo> {
        const self = this;
        const columns = await self.getTableInfo(table_name);
        let schema: IJSObjectInfo = {
            table_name: table_name,
            fields: [],
        };
        let fields: Array<IJSObjectFieldInfo> = [];
        columns.map((column: any) => {
            let field: IJSObjectFieldInfo = {
                column_name: column[ALIAS_COLUMN_NAME],
                data_type: column[ALIAS_DATA_TYPE],
                key: column[ALIAS_COLUMN_KEY],
                max_length: column[ALIAS_CHARACTER_MAXIMUM_LENGTH],
                is_nullable: column[ALIAS_IS_NULLABLE],
                default_value: column[ALIAS_COLUMN_DEFAULT],
            };
            fields.push(field);
        });
        schema.fields = fields;
        return schema;
    }
    /**
     * Query the database
     * @param {MySQL.Connection} connection
     * @param query
     * @param values
     * @param callback
     */
    _query(connection: MySQL.Connection, query: string, values: Array<string>, callback: Function) {
        let self = this;

        //Make the request
        connection.query(query, values, function (err, rows) {
            rows = rows ? JSON.parse(JSON.stringify(rows)) : [];
            callback(err, rows);
        });
    }
    async closeConnection() {
        let connection = await this.getConnection();
        if (connection) {
            await new Promise((resolve, reject) => {
                connection.end((err) => {
                    this.connection = null;
                    err ? reject(err) : resolve();
                });
            });
        }
    }

    //INTERNAL FUNCTIONS
    /**
     * Get the field
     * @param database_name
     * @param table_name
     */
    async _getTableInfo(database_name: string, table_name: string): Promise<ISQLTableColumn[]> {
        let self = this;
        let result: Array<ISQLTableColumn> = await self.query(
            `SELECT 
            \`COLUMN_NAME\` as '${ALIAS_COLUMN_NAME}', 
            \`DATA_TYPE\` AS '${ALIAS_DATA_TYPE}', 
            \`COLUMN_KEY\` AS '${ALIAS_COLUMN_KEY}', 
            \`CHARACTER_MAXIMUM_LENGTH\` as '${ALIAS_CHARACTER_MAXIMUM_LENGTH}',
            \`IS_NULLABLE\` as '${ALIAS_IS_NULLABLE}',
            \`COLUMN_DEFAULT\` as '${ALIAS_COLUMN_DEFAULT}'
            FROM INFORMATION_SCHEMA.COLUMNS
            WHERE \`TABLE_NAME\` = ? AND \`TABLE_SCHEMA\` = ?`,
            [table_name, database_name]
        );
        if (result.length === 0) {
            throw new Error(`Table '${table_name}' does not exist on database '${database_name}'`);
        }
        return result;
    }

    /**
     * Gets all table names in a given database
     * @param database_name
     */
    async _getTableNames(database_name: string): Promise<any[]> {
        let self = this;
        const tables: Array<any> = await self.query(
            `SELECT TABLE_NAME 
            FROM INFORMATION_SCHEMA.TABLES WHERE \`TABLE_SCHEMA\` = ?`,
            [database_name]
        );
        const table_names = tables.map((table) => table[ALIAS_TABLE_NAME]);
        return table_names;
    }
    /**
     * Checks the record against the database schema and removes any irrelevant fields for insertion
     * @param database_name
     * @param table_name
     * @param record_raw
     */
    async _prepareRecord(database_name: string, table_name: string, record_raw: any) {
        let self = this;
        if (!(typeof table_name === 'string')) {
            let error: any = new Error(`MySQLDriver in function _prepareRecord: Provided table name is not a string.`);
            error.table_name = table_name;
            error.record_raw = record_raw;
            throw error;
        }
        let prepared_record: any = {};
        let table_info = await self._getTableInfo(database_name, table_name);
        table_info.map((field) => {
            let key = field[ALIAS_COLUMN_NAME];
            if (key in record_raw && record_raw[key] !== undefined) {
                //Only add items that have been specified in the record, and are not undefined in value
                let value = record_raw[key];
                prepared_record[key] = value;
            }
        });
        return prepared_record;
    }
    /**
     * INTERNAL: Insert records into the database without any processing
     * @param table_name The name of the table to insert the records into
     * @param record The record to be insert into the database
     */
    async _insertRecordRaw(table_name: string, record: any) {
        const funcName = '_insertRecordRaw';
        const insert_sql = `INSERT INTO \`${table_name}\``;
        let params: any[] = [];
        const keys_sql = Object.keys(record)
            .map((key) => {
                if (_containsSpecialChars(key)) {
                    throw new Error(`${funcName}: Special character found in key: '${key}'`);
                }
                let escaped_key = `\`${key}\``;
                let value = record[key];
                params.push(value);
                return escaped_key;
            })
            .reduce((last, cur, index) => {
                return `${last}, ${cur}`;
            });
        const values_sql = Object.keys(record)
            .map((key) => {
                return '?';
            })
            .reduce((last, cur, index) => {
                return `${last}, ${cur}`;
            });
        return await this.query(`${insert_sql} (${keys_sql}) VALUES (${values_sql})`, params);
    }
    /**
     * INTERNAL: Update records in a given table without any processing
     * @param table_name
     * @param properties The properties to be updated
     * @param where THe criteria to search
     */
    async _updateRecordsRaw(table_name: string, properties: any, where: any) {
        const funcName = '_updateRecordsRaw';
        if (!where || Object.keys(where).length < 1) {
            var error = new Error(`DatabaseHelper: Cannot update record without where clause.`);
            throw error;
        }
        const update_sql = `UPDATE \`${table_name}\``;
        let params: any[] = [];
        const properties_sql = Object.keys(properties)
            .map((key) => {
                if (_containsSpecialChars(key)) {
                    throw new Error(`${funcName}: Special character found in key: '${key}'`);
                }
                var property = properties[key];
                params.push(property);
                return `\`${key}\` = ?`;
            })
            .reduce((last, cur, index) => {
                return `${last}, ${cur}`;
            });

        const where_sql = Object.keys(where)
            .map((key) => {
                if (_containsSpecialChars(key)) {
                    throw new Error(`${funcName}: Special character found in key: '${key}'`);
                }
                var value = where[key];
                params.push(value);
                return `\`${key}\` = ?`;
            })
            .reduce((last, cur, index) => {
                return `${last} AND ${cur}`;
            });

        return await this.query(`${update_sql} SET ${properties_sql} WHERE ${where_sql}`, params);
    }
    /**
     * INTERNAL: Select records from a given table without any data processing
     * @param table_name
     * @param where
     */
    async _selectRecordRaw(table_name: string, where: any = {}, order_by: Array<{ key: string; order: 'ASC' | 'DESC' }>, options?: QueryOptions) {
        const funcName = '_selectRecordRaw';
        const { sql, params, isResultEmpty } = _prepareSelectStatement(table_name, where, order_by, options);
        if (isResultEmpty) {
            return [];
        }
        return await this.query(sql, params);
    }

    /**
     * INTERNAL: Select count of records from a given table without any data processing
     * @param table_name
     * @param where
     */
    async _selectRecordRawCount(table_name: string, where: any = {}, order_by: Array<{ key: string; order: 'ASC' | 'DESC' }>, options?: QueryOptions) {
        const funcName = '_selectRecordRawCount';
        const { sql, params, isResultEmpty } = _prepareSelectStatement(table_name, where, order_by, options);
        if (isResultEmpty) {
            return 0;
        }
        let sql_count = `SELECT COUNT(*) as count from (
            (${sql}) as table_data)`;
        let records = await this.query(sql_count, params);
        return records[0].count;
    }
    /**
     * INTERNAL: Delete records from a given table without any data processing
     * @param table_name
     * @param where
     */
    async _deleteRecordRaw(table_name: string, where: any) {
        const funcName = '_deleteRecordRaw';
        const select_sql = `DELETE FROM \`${table_name}\``;
        let params: any[] = [];
        const conditions = Object.keys(where).map((key) => {
            if (_containsSpecialChars(key)) {
                throw new Error(`${funcName}: Special character found in key: '${key}'`);
            }
            let value = where[key];
            params.push(value);
            return `\`${key}\` = ?`;
        });
        if (conditions.length < 1) {
            throw new Error(`${funcName}: Unable to delete records without conditions`);
        }
        const where_sql = conditions.reduce((last, cur, index) => {
            return `${last} AND ${cur}`;
        });
        return await this.query(`${select_sql} WHERE ${where_sql}`, params);
    }
    /**
     * Checks an array of values and ensures that it is not undefined
     * @param {Array<string>} values
     */
    async _checkValues(values: Array<string>) {
        values.map((value) => {
            if (value === undefined) {
                throw new Error(`DB._checkValues: SQL prepared value cannot be undefined.`);
            }
        });
    }
}
/**
 * INTERNAL: Prepare select statement from options
 * @param table_name
 * @param where
 */
function _prepareSelectStatement(table_name: string, where: any = {}, order_by: Array<{ key: string; order: 'ASC' | 'DESC' }>, options?: QueryOptions) {
    const funcName = '_prepareSelectStatement';
    const select_sql = `SELECT * FROM \`${table_name}\``;
    let isResultEmpty = false;
    let params: any[] = [];

    //Validations
    let where_options = options?.where;
    let where_operator = where_options?.operator || 'AND';
    if (where_operator) {
        if (!ALLOWED_OPERATORS[where_operator]) {
            throw new Error(`${funcName}: Invalid operator '${where_operator}'`);
        }
    }
    //Construction
    const where_clause = Object.keys(where ? where : {})
        .map((key) => {
            if (_containsSpecialChars(key)) {
                throw new Error(`${funcName}: Special character found in key: '${key}'`);
            }
            let value = where[key];
            if (where_options?.wildcard || (where_options?.wildcardAfter && where_options.wildcardAfter)) {
                if (Array.isArray(value)) {
                    throw new Error(`${funcName}: Wildcard search not supported for arrays.`);
                }
                params.push(`%${value}%`);
                return `${key} LIKE ?`;
            } else if (where_options?.wildcardBefore) {
                if (Array.isArray(value)) {
                    throw new Error(`${funcName}: Wildcard search not supported for arrays.`);
                }
                params.push(`%${value}`);
                return `${key} LIKE ?`;
            } else if (where_options?.wildcardAfter) {
                if (Array.isArray(value)) {
                    throw new Error(`${funcName}: Wildcard search not supported for arrays.`);
                }
                params.push(`${value}%`);
                return `${key} LIKE ?`;
            } else {
                params.push(value);
                if (Array.isArray(value)) {
                    if (value.length === 0) {
                        isResultEmpty = true;
                    }
                    return `\`${key}\` IN (?)`;
                } else {
                    return `\`${key}\` = ?`;
                }
            }
        })
        .reduce((state, cur, idx) => {
            if (idx === 0) {
                state = `WHERE ${cur}`;
            } else {
                state += ` ${where_operator} ${cur}`;
            }
            return state;
        }, '');

    //Compute order by caluse
    const order_by_clause = (order_by ? order_by : [])
        .map((rule) => {
            let { key = '', order = '' } = rule || {};
            if (_containsSpecialChars(key)) {
                throw new Error(`${funcName}: Special character found in key: '${key}'`);
            }
            if (!key || !order || !(typeof order === 'string')) {
                throw new Error(`${funcName}: Invalid order by config provided [${key} : ${order}]`);
            }
            let property_name = key;
            let sort_order = order.trim().toUpperCase();
            //Check that sort_order is either ASC or DESC
            if (['ASC', 'DESC'].indexOf(sort_order) === -1) {
                throw new Error(`${funcName}: Invalid sort order provided - '${sort_order}`);
            }
            return `\`${property_name}\` ${sort_order}`;
        })
        .reduce((state, cur, idx) => {
            if (idx === 0) {
                state += `ORDER BY ${cur}`;
            } else {
                state += `,\n${cur}`;
            }
            return state;
        }, '');
    //Compute limit clause
    let { limit = undefined } = options || {};
    let limit_clause = '';
    if (limit) {
        let { offset, page_size } = limit;
        if (typeof offset !== 'number') {
            throw new Error(`${funcName}: offset in limit option must be a number.`);
        }
        if (typeof page_size !== 'number') {
            throw new Error(`${funcName}: page_size in limit option must be a number.`);
        }
        limit_clause += ` LIMIT ?, ?`;
        params.push(offset);
        params.push(page_size);
    }
    let sql = `${select_sql} ${where_clause} ${order_by_clause} ${limit_clause}`;
    return {
        sql,
        params,
        isResultEmpty,
    };
}

function _containsSpecialChars(str_val: string) {
    let found = false;
    for (let i = 0; i < str_val.length; i++) {
        let c = str_val[i];
        if (INVALID_COLUMN_NAME_CHARS_INDEX[c]) {
            found = true;
            break;
        }
    }
    return found;
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
