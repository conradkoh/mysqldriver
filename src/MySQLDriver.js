var MySQL = require("mysql");
const ALIAS_COLUMN_NAME = "COLUMN_NAME";
const ALIAS_DATA_TYPE = "DATA_TYPE";
const ALIAS_COLUMN_KEY = "COLUMN_KEY";
const ALIAS_CHARACTER_MAXIMUM_LENGTH = "CHARACTER_MAXIMUM_LENGTH";
const ALIAS_IS_NULLABLE = "IS_NULLABLE";
const ALIAS_COLUMN_DEFAULT = "COLUMN_DEFAULT";

const ALIAS_TABLE_NAME = 'TABLE_NAME';

class MySQLDriver {
    constructor(host, user, password, database, port) {
        this.host = host;
        this.user = user;
        this.database = database;
        this.port = port;
        this.connection = MySQL.createConnection({
            host,
            user,
            password,
            database,
            port
        });
    }
    /**
     * Insert records into the database
     * @param {string} table_name The name of the table to insert the records into
     * @param {object} record The record to be insert into the database
     * @return {object}
     */
    async insertRecord(table_name, record) {
        let self = this;
        let clean_record = await self._prepareRecord(self.database, record);
        return await self._insertRecordRaw(table_name, clean_record);
    }
    /**
     * Get records from a table that match the where criteria
     * @param {string} table_name
     * @param {object} where The search criteria to do a match
     * @return {Array}
     */
    async getRecords(table_name, where) {
        let self = this;
        return await self._selectRecordRaw(table_name, where);
    }
    /**
     * Update records in a given table
     * @param {string} table_name 
     * @param {object} properties The properties to be updated
     * @param {object} where THe criteria to search
     * @return {object}
     */
    async updateRecords(table_name, properties, where) {
        let self = this;
        let clean_properties = await self._prepareRecord(self.database, table_name, properties);
        return await self._updateRecordsRaw(table_name, clean_properties, where);
    }
    /**
     * Delete records from a table that match there where criteria
     * @param {string} table_name 
     * @param {object} where 
     * @return {object}
     */
    async deleteRecords(table_name, where) {
        return await self._deleteRecordRaw(table_name, where);
    }

    /**
     * Get a record via an sql query
     * @param {string} sql 
     * @param {Array} values 
     * @return {object}
     */
    async getRecordSql(sql, values) {
        let self = this;
        let records = self.getRecordsSql(sql, values);
        if (records.length > 1) {
            throw new Error(`MySQLDriver.getRecordSql: More than one record found for value.`);
        }
        if (records.length === 0) {
            return null;
        }

        return records[0];
    }
    /**
     * Gets records from the database via a provided sql statement
     * @param {string} sql 
     * @param {Array} values 
     * @return {Array}
     */
    async getRecordsSql(sql, values) {
        let self = this;
        let records = await self.query(sql, values);
        return records;
    }

    /**
     * Gets all tables in the current database
     * @return {Array}
     */
    async getTableNames() {
        const self = this;
        const table_names = await self._getTableNames(self.database);
        return table_names;

    }
    /**
     * Get the table information from the information schema
     * @param {string} table_name 
     * @return {Array}
     */
    async getTableInfo(table_name) {
        let self = this;
        let info = await self._getTableInfo(self.database, table_name);
        return info;
    }
    /**
     * Query the database connection asynchronously
     * @param {*} query 
     * @param {Array} values 
     * @return {Array}
     */
    async query(query, values = []) {
        let self = this;
        this._checkValues(values);
        return new Promise((resolve, reject) => {
            self._query(query, values, function (err, rows) {
                if (err) {
                    let error = new Error(`MySQLDriver: query: SQL query error.`);
                    let data = {
                        err,
                        query,
                        values
                    };
                    error.data = data;
                    console.log(data);
                    reject(error);
                } else {
                    resolve(rows);
                }
            })
        })
    }

    /**
     * Gets the schema of the database as an array of table schema objects
     * @returns {Array<{table_name: string, fields: Array<{column_name: string, data_type: string, key: string, max_length: string, is_nullable: string, default_value: string}>}>}
     */
    async getJSSchema() {
        const self = this;
        const tables = await self.getTableNames();
        const schema = tables.map(
            async (table_name) => {
                let table_schema = await self.tableGetJSSchema(table_name);
                return table_schema;
            }
        )
        return await Promise.all(schema);
    }
    /**
     * 
     * @param {string} table_name 
     * @return {{ fields: Object }}
     */
    async tableGetJSSchema(table_name) {
        const self = this;
        const columns = await self.getTableInfo(table_name);
        let schema = {
            table_name: table_name,
            fields: undefined
        };
        let fields = [];
        columns.map(
            column => {
                let field = {
                    column_name: column[ALIAS_COLUMN_NAME],
                    data_type: column[ALIAS_DATA_TYPE],
                    key: column[ALIAS_COLUMN_KEY],
                    max_length: column[ALIAS_CHARACTER_MAXIMUM_LENGTH],
                    is_nullable: column[ALIAS_IS_NULLABLE],
                    default_value: column[ALIAS_COLUMN_DEFAULT]
                };
                fields.push(field);
            }
        )
        schema.fields = fields;
        return schema;


    }

    /**
     * Query the database
     * @param {*} query 
     * @param {*} values 
     * @param {*} callback 
     */
    _query(query, values, callback) {
        let self = this;
        self.connection.query(query, values, function (err, rows) {
            rows = rows ? JSON.parse(JSON.stringify(rows)) : [];
            callback(err, rows, this.sql);
        });
    }
    async closeConnection() {
        let self = this;
        return new Promise((resolve, reject) => {
            self.connection.end((err) => {
                if (err) {
                    reject(err);
                } else {
                    resolve();
                }
            })
        })
    }

    //INTERNAL FUNCTIONS
    /**
     * Get the field
     * @param {string} database_name 
     * @param {Array} table_name 
     */
    async _getTableInfo(database_name, table_name) {
        let self = this;
        return await self.query(`SELECT 
            \`COLUMN_NAME\` as '${ALIAS_COLUMN_NAME}', 
            \`DATA_TYPE\` AS '${ALIAS_DATA_TYPE}', 
            \`COLUMN_KEY\` AS '${ALIAS_COLUMN_KEY}', 
            \`CHARACTER_MAXIMUM_LENGTH\` as '${ALIAS_CHARACTER_MAXIMUM_LENGTH}',
            \`IS_NULLABLE\` as '${ALIAS_IS_NULLABLE}',
            \`COLUMN_DEFAULT\` as '${ALIAS_COLUMN_DEFAULT}'
            FROM INFORMATION_SCHEMA.COLUMNS
            WHERE \`TABLE_NAME\` = ? AND \`TABLE_SCHEMA\` = ?`, [table_name, database_name]);
    }

    /**
     * Gets all table names in a given database
     * @param {*} database_name 
     * @returns {Array}
     */
    async _getTableNames(database_name) {
        let self = this;
        const tables = await self.query(`SELECT TABLE_NAME 
            FROM INFORMATION_SCHEMA.TABLES WHERE \`TABLE_SCHEMA\` = ?`, [database_name]);
        const table_names = tables.map(
            table => table[ALIAS_TABLE_NAME]
        )
        return table_names;
    }
    /**
     * Checks the record against the database schema and removes any irrelevant fields for insertion
     * @param {*} database_name 
     * @param {*} table_name 
     * @param {*} record_raw 
     */
    async _prepareRecord(database_name, table_name, record_raw) {
        let self = this;
        if (!typeof table_name === 'string') {
            let error = new Error(`MySQLDriver in function _prepareRecord: Provided table name is not a string.`);
            error.table_name = table_name;
            error.record_raw = record_raw;
            throw error;
        }
        let prepared_record = {};
        let table_info = await self._getTableInfo(database_name, table_name);
        table_info.map(field => {
            let key = field[ALIAS_COLUMN_NAME];
            if (key in record_raw) { //Only add items that have been specified in the record
                let value = record_raw[key];
                prepared_record[key] = value;
            }
        })
        return prepared_record;
    }
    /**
     * INTERNAL: Insert records into the database without any processing
     * @param {string} table_name The name of the table to insert the records into
     * @param {object} record The record to be insert into the database
     */
    async _insertRecordRaw(table_name, record) {
        let self = this;
        const insert_sql = `INSERT INTO \`${table_name}\``;
        let params = [];
        const keys_sql = Object.keys(record).map(key => {
            let escaped_key = key.replace(/`/g, key);
            let value = record[key];
            params.push(value);
            return escaped_key;
        }).reduce((last, cur, index) => {
            return `${last}, ${cur}`;
        });
        const values_sql = Object.keys(record).map(key => {
            return '?';
        }).reduce((last, cur, index) => {
            return `${last}, ${cur}`;
        });
        return await self.query(`${insert_sql} (${keys_sql}) VALUES (${values_sql})`, params);
    }
    /**
     * INTERNAL: Update records in a given table without any processing
     * @param {string} table_name 
     * @param {object} properties The properties to be updated
     * @param {object} where THe criteria to search
     */
    async _updateRecordsRaw(table_name, properties, where) {
        let self = this;
        if (!where || Object.keys(where).length < 1) {
            var error = new Error(`MySQLDriver: Cannot update record without where clause.`);
            error.table_name = table_name;
            error.properties = properties;
            error.where = where;
            throw error;
        }
        const update_sql = `UPDATE \`${table_name}\``;
        let params = [];
        const properties_sql = Object.keys(properties).map(key => {
            var property = properties[key];
            params.push(property);
            return `\`${key}\` = ?`;
        }).reduce((last, cur, index) => {
            return `${last}, ${cur}`;
        });
        const where_sql = Object.keys(where).map(key => {
            var value = where[key];
            params.push(value);
            return `\`${key}\` = ?`;
        }).reduce((last, cur, index) => {
            return `${last} AND ${cur}`;
        });
        return await self.query(`${update_sql} SET ${properties_sql} WHERE ${where_sql}`, params);
    }
    /**
     * INTERNAL: Select records from a given table without any data processing
     * @param {string} table_name 
     * @param {object} where 
     */
    async _selectRecordRaw(table_name, where = {}) {
        let self = this;
        const select_sql = `SELECT * FROM \`${table_name}\``;
        let params = [];
        if (Object.keys(where).length === 0) {
            //Handles the case where there is no where clause
            return await self.query(`${select_sql}`);
        } else {
            //Proceed to generate where clause if exists
            const where_sql = Object.keys(where).map(key => {
                let value = where[key];
                params.push(value);
                return `\`${key}\` = ?`;
            }).reduce((last, cur, index) => {
                return `${last} AND ${cur}`
            });
            return await self.query(`${select_sql} WHERE ${where_sql}`, params);
        }
    }
    /**
     * INTERNAL: Delete records from a given table without any data processing
     * @param {*} table_name 
     * @param {*} where 
     */
    async _deleteRecordRaw(table_name, where) {
        let self = this;
        const select_sql = `DELETE FROM \`${table_name}\``;
        let params = [];
        const where_sql = Object.keys(where).map(key => {
            let value = where[key];
            params.push(value);
            return `\`${key}\` = ?`;
        }).reduce((last, cur, index) => {
            return `${last} AND ${cur}`
        });
        return await self.query(`${select_sql} WHERE ${where_sql}`, params);
    }
    /**
     * Checks an array of values and ensures that it is not undefined
     * @param {Array<string>} values 
     */
    async _checkValues(values) {
        values.map(
            value => {
                if (value === undefined) {
                    throw new Error(`DB._checkValues: SQL prepared value cannot be undefined.`);
                }
            }
        );
    }
}

module.exports = MySQLDriver;