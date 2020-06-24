"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
var MySQL = __importStar(require("mysql"));
var v4_1 = __importDefault(require("uuid/v4"));
var constants_1 = require("./constants");
var ALIAS_COLUMN_NAME = 'COLUMN_NAME';
var ALIAS_DATA_TYPE = 'DATA_TYPE';
var ALIAS_COLUMN_KEY = 'COLUMN_KEY';
var ALIAS_CHARACTER_MAXIMUM_LENGTH = 'CHARACTER_MAXIMUM_LENGTH';
var ALIAS_IS_NULLABLE = 'IS_NULLABLE';
var ALIAS_COLUMN_DEFAULT = 'COLUMN_DEFAULT';
var INVALID_COLUMN_NAME_CHARS = '!#%&’()*+,-./:;<=>?@[]^~ "`\\';
var INVALID_COLUMN_NAME_CHARS_INDEX = INVALID_COLUMN_NAME_CHARS.split('').reduce(function (state, char) {
    state[char] = 1;
    return state;
}, {});
var ALIAS_TABLE_NAME = 'TABLE_NAME';
var CONNECTION_STATUS;
(function (CONNECTION_STATUS) {
    CONNECTION_STATUS["CONNECTED"] = "connected";
    CONNECTION_STATUS["CONNECTING"] = "connecting";
    CONNECTION_STATUS["DISCONNECTED"] = "disconnected";
})(CONNECTION_STATUS || (CONNECTION_STATUS = {}));
var MySQLDriver = /** @class */ (function () {
    function MySQLDriver(config) {
        this.config = config;
        this.config.port = config.port || 3306;
        this.connection_status = CONNECTION_STATUS.DISCONNECTED;
        this.initConnection();
    }
    MySQLDriver.prototype.initConnection = function () {
        this.connection = this.createConnection();
        this.connection_status = CONNECTION_STATUS.CONNECTED;
    };
    MySQLDriver.prototype.handleDisconnect = function () {
        if (this.connection) {
            this.connection.destroy();
        }
        this.connection = null;
        this.connection_status = CONNECTION_STATUS.DISCONNECTED;
        console.log('Database disconnected by server.');
    };
    /**
     * Get the database connection
     */
    MySQLDriver.prototype.getConnection = function () {
        return __awaiter(this, void 0, void 0, function () {
            var wait;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        wait = 500;
                        if (this.connection_status === CONNECTION_STATUS.CONNECTED && this.connection) {
                            return [2 /*return*/, this.connection];
                        }
                        _a.label = 1;
                    case 1:
                        if (!(this.connection_status === CONNECTION_STATUS.CONNECTING)) return [3 /*break*/, 3];
                        return [4 /*yield*/, new Promise(function (resolve, reject) {
                                //Wait for a short interval before checking again
                                setTimeout(function () {
                                    resolve();
                                }, wait);
                            })];
                    case 2:
                        _a.sent();
                        return [3 /*break*/, 1];
                    case 3:
                        if (this.connection_status === CONNECTION_STATUS.DISCONNECTED) {
                            this.initConnection();
                        }
                        return [2 /*return*/, this.connection || this.createConnection()];
                }
            });
        });
    };
    /**
     * Create a new connection to the database
     */
    MySQLDriver.prototype.createConnection = function () {
        this.connection_status = CONNECTION_STATUS.CONNECTING;
        var conn = this._createConnection();
        conn.on('error', this.handleDisconnect.bind(this)); //Add the handler for disconnection on errors
        this.connection = conn;
        this.connection_status = CONNECTION_STATUS.CONNECTED;
        return conn;
    };
    MySQLDriver.prototype._createConnection = function () {
        var _a = this.config, host = _a.host, user = _a.user, password = _a.password, database = _a.database, port = _a.port, multipleStatements = _a.multipleStatements;
        return MySQL.createConnection({
            host: host,
            user: user,
            password: password,
            database: database,
            port: port,
            multipleStatements: multipleStatements,
        });
    };
    MySQLDriver.prototype.generateId = function () {
        return v4_1.default();
    };
    /**
     * Insert records into the database
     * @param table_name The name of the table to insert the records into
     * @param record The record to be insert into the database
     */
    MySQLDriver.prototype.insertRecord = function (table_name, record) {
        return __awaiter(this, void 0, void 0, function () {
            var self, database, clean_record;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        self = this;
                        database = self.config.database;
                        return [4 /*yield*/, self._prepareRecord(database, table_name, record)];
                    case 1:
                        clean_record = _a.sent();
                        return [4 /*yield*/, self._insertRecordRaw(table_name, clean_record)];
                    case 2: return [2 /*return*/, _a.sent()];
                }
            });
        });
    };
    /**
     * Get records from a table that match the where criteria
     * @param table_name
     * @param where The search criteria to do a match
     */
    MySQLDriver.prototype.getRecords = function (table_name, where, order_by, options) {
        if (order_by === void 0) { order_by = []; }
        return __awaiter(this, void 0, void 0, function () {
            var self;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        self = this;
                        return [4 /*yield*/, self._selectRecordRaw(table_name, where, order_by, options)];
                    case 1: return [2 /*return*/, _a.sent()];
                }
            });
        });
    };
    /**
     * Get records count from a table that match the where criteria
     * @param table_name
     * @param where The search criteria to do a match
     */
    MySQLDriver.prototype.getRecordsCount = function (table_name, where, order_by, options) {
        if (order_by === void 0) { order_by = []; }
        return __awaiter(this, void 0, void 0, function () {
            var self;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        self = this;
                        return [4 /*yield*/, self._selectRecordRawCount(table_name, where, order_by, options)];
                    case 1: return [2 /*return*/, _a.sent()];
                }
            });
        });
    };
    /**
     * Get record from a table that match the where criteria
     * @param table_name
     * @param where The search criteria to do a match
     */
    MySQLDriver.prototype.getRecord = function (table_name, where, order_by) {
        if (order_by === void 0) { order_by = []; }
        return __awaiter(this, void 0, void 0, function () {
            var self, result;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        self = this;
                        return [4 /*yield*/, self._selectRecordRaw(table_name, where, order_by, { limit: { offset: 0, page_size: 1 } })];
                    case 1:
                        result = _a.sent();
                        if (result.length > 1) {
                            throw new Error("MySQLDriver.getRecord: More than one record found.");
                        }
                        if (result.length === 0) {
                            return [2 /*return*/, undefined];
                        }
                        return [2 /*return*/, result[0]];
                }
            });
        });
    };
    /**
     * Update records in a given table
     * @param table_name
     * @param properties The properties to be updated
     * @param where THe criteria to search
     */
    MySQLDriver.prototype.updateRecords = function (table_name, properties, where) {
        return __awaiter(this, void 0, void 0, function () {
            var self, database, clean_properties;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        self = this;
                        database = self.config.database;
                        return [4 /*yield*/, self._prepareRecord(database, table_name, properties)];
                    case 1:
                        clean_properties = _a.sent();
                        return [4 /*yield*/, self._updateRecordsRaw(table_name, clean_properties, where)];
                    case 2: return [2 /*return*/, _a.sent()];
                }
            });
        });
    };
    /**
     * Delete records from a table that match there where criteria
     * @param table_name
     * @param where
     */
    MySQLDriver.prototype.deleteRecords = function (table_name, where) {
        return __awaiter(this, void 0, void 0, function () {
            var self;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        self = this;
                        return [4 /*yield*/, self._deleteRecordRaw(table_name, where)];
                    case 1: return [2 /*return*/, _a.sent()];
                }
            });
        });
    };
    /**
     * Get a record via an sql query
     * @param sql
     * @param values
     */
    MySQLDriver.prototype.getRecordSql = function (sql, values) {
        return __awaiter(this, void 0, void 0, function () {
            var self, records;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        self = this;
                        return [4 /*yield*/, self.getRecordsSql(sql, values)];
                    case 1:
                        records = _a.sent();
                        if (records.length > 1) {
                            throw new Error("MySQLDriver.getRecordSql: More than one record found for value.");
                        }
                        if (records.length === 0) {
                            return [2 /*return*/, []];
                        }
                        return [2 /*return*/, records[0]];
                }
            });
        });
    };
    /**
     * Gets records from the database via a provided sql statement
     * @param sql
     * @param values
     */
    MySQLDriver.prototype.getRecordsSql = function (sql, values) {
        return __awaiter(this, void 0, void 0, function () {
            var self, records;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        self = this;
                        return [4 /*yield*/, self.query(sql, values)];
                    case 1:
                        records = _a.sent();
                        return [2 /*return*/, records];
                }
            });
        });
    };
    /**
     * Gets all tables in the current database
     */
    MySQLDriver.prototype.getTableNames = function () {
        return __awaiter(this, void 0, void 0, function () {
            var self, database, table_names;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        self = this;
                        database = self.config.database;
                        return [4 /*yield*/, self._getTableNames(database)];
                    case 1:
                        table_names = _a.sent();
                        return [2 /*return*/, table_names];
                }
            });
        });
    };
    /**
     * Get the table information from the information schema
     * @param table_name
     */
    MySQLDriver.prototype.getTableInfo = function (table_name) {
        return __awaiter(this, void 0, void 0, function () {
            var self, database, info;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        self = this;
                        database = self.config.database;
                        return [4 /*yield*/, self._getTableInfo(database, table_name)];
                    case 1:
                        info = _a.sent();
                        return [2 /*return*/, info];
                }
            });
        });
    };
    /**
     * Get the field names for a given table
     * @param table_name
     */
    MySQLDriver.prototype.getTableFieldNames = function (table_name) {
        return __awaiter(this, void 0, void 0, function () {
            var self, database, info;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        self = this;
                        database = self.config.database;
                        return [4 /*yield*/, self._getTableInfo(database, table_name)];
                    case 1:
                        info = _a.sent();
                        return [2 /*return*/, info.map(function (field_info) { return field_info.COLUMN_NAME; })];
                }
            });
        });
    };
    /**
     * Query the database connection asynchronously
     * @param query
     * @param values
     */
    MySQLDriver.prototype.query = function (query, values) {
        if (values === void 0) { values = []; }
        return __awaiter(this, void 0, void 0, function () {
            var self, connection;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        self = this;
                        this._checkValues(values);
                        return [4 /*yield*/, this.getConnection()];
                    case 1:
                        connection = _a.sent();
                        return [2 /*return*/, new Promise(function (resolve, reject) {
                                self._query(connection, query, values, function (err, rows) {
                                    if (err) {
                                        var error = new Error("MySQLDriver: query: SQL query error.");
                                        var data = {
                                            err: err,
                                            query: query,
                                            values: values,
                                        };
                                        error.data = data;
                                        if (err.code === 'ECONNREFUSED') {
                                            self.handleDisconnect();
                                        }
                                        console.log(data);
                                        reject(error);
                                    }
                                    else {
                                        resolve(rows);
                                    }
                                });
                            })];
                }
            });
        });
    };
    /**
     * Gets the schema of the database as an array of table schema objects
     */
    MySQLDriver.prototype.getJSSchema = function () {
        return __awaiter(this, void 0, void 0, function () {
            var self, tables, schema;
            var _this = this;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        self = this;
                        return [4 /*yield*/, self.getTableNames()];
                    case 1:
                        tables = _a.sent();
                        schema = tables.map(function (table_name) { return __awaiter(_this, void 0, void 0, function () {
                            var table_schema;
                            return __generator(this, function (_a) {
                                switch (_a.label) {
                                    case 0: return [4 /*yield*/, self.tableGetJSSchema(table_name)];
                                    case 1:
                                        table_schema = _a.sent();
                                        return [2 /*return*/, table_schema];
                                }
                            });
                        }); });
                        return [4 /*yield*/, Promise.all(schema)];
                    case 2: return [2 /*return*/, _a.sent()];
                }
            });
        });
    };
    /**
     *
     * @param table_name
     */
    MySQLDriver.prototype.tableGetJSSchema = function (table_name) {
        return __awaiter(this, void 0, void 0, function () {
            var self, columns, schema, fields;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        self = this;
                        return [4 /*yield*/, self.getTableInfo(table_name)];
                    case 1:
                        columns = _a.sent();
                        schema = {
                            table_name: table_name,
                            fields: [],
                        };
                        fields = [];
                        columns.map(function (column) {
                            var field = {
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
                        return [2 /*return*/, schema];
                }
            });
        });
    };
    /**
     * Query the database
     * @param {MySQL.Connection} connection
     * @param query
     * @param values
     * @param callback
     */
    MySQLDriver.prototype._query = function (connection, query, values, callback) {
        var self = this;
        //Make the request
        connection.query(query, values, function (err, rows) {
            rows = rows ? JSON.parse(JSON.stringify(rows)) : [];
            callback(err, rows);
        });
    };
    MySQLDriver.prototype.closeConnection = function () {
        return __awaiter(this, void 0, void 0, function () {
            var connection;
            var _this = this;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.getConnection()];
                    case 1:
                        connection = _a.sent();
                        if (!connection) return [3 /*break*/, 3];
                        return [4 /*yield*/, new Promise(function (resolve, reject) {
                                connection.end(function (err) {
                                    _this.connection = null;
                                    err ? reject(err) : resolve();
                                });
                            })];
                    case 2:
                        _a.sent();
                        _a.label = 3;
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    //INTERNAL FUNCTIONS
    /**
     * Get the field
     * @param database_name
     * @param table_name
     */
    MySQLDriver.prototype._getTableInfo = function (database_name, table_name) {
        return __awaiter(this, void 0, void 0, function () {
            var self, result;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        self = this;
                        return [4 /*yield*/, self.query("SELECT \n            `COLUMN_NAME` as '" + ALIAS_COLUMN_NAME + "', \n            `DATA_TYPE` AS '" + ALIAS_DATA_TYPE + "', \n            `COLUMN_KEY` AS '" + ALIAS_COLUMN_KEY + "', \n            `CHARACTER_MAXIMUM_LENGTH` as '" + ALIAS_CHARACTER_MAXIMUM_LENGTH + "',\n            `IS_NULLABLE` as '" + ALIAS_IS_NULLABLE + "',\n            `COLUMN_DEFAULT` as '" + ALIAS_COLUMN_DEFAULT + "'\n            FROM INFORMATION_SCHEMA.COLUMNS\n            WHERE `TABLE_NAME` = ? AND `TABLE_SCHEMA` = ?", [table_name, database_name])];
                    case 1:
                        result = _a.sent();
                        if (result.length === 0) {
                            throw new Error("Table '" + table_name + "' does not exist on database '" + database_name + "'");
                        }
                        return [2 /*return*/, result];
                }
            });
        });
    };
    /**
     * Gets all table names in a given database
     * @param database_name
     */
    MySQLDriver.prototype._getTableNames = function (database_name) {
        return __awaiter(this, void 0, void 0, function () {
            var self, tables, table_names;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        self = this;
                        return [4 /*yield*/, self.query("SELECT TABLE_NAME \n            FROM INFORMATION_SCHEMA.TABLES WHERE `TABLE_SCHEMA` = ?", [database_name])];
                    case 1:
                        tables = _a.sent();
                        table_names = tables.map(function (table) { return table[ALIAS_TABLE_NAME]; });
                        return [2 /*return*/, table_names];
                }
            });
        });
    };
    /**
     * Checks the record against the database schema and removes any irrelevant fields for insertion
     * @param database_name
     * @param table_name
     * @param record_raw
     */
    MySQLDriver.prototype._prepareRecord = function (database_name, table_name, record_raw) {
        return __awaiter(this, void 0, void 0, function () {
            var self, error, prepared_record, table_info;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        self = this;
                        if (!(typeof table_name === 'string')) {
                            error = new Error("MySQLDriver in function _prepareRecord: Provided table name is not a string.");
                            error.table_name = table_name;
                            error.record_raw = record_raw;
                            throw error;
                        }
                        prepared_record = {};
                        return [4 /*yield*/, self._getTableInfo(database_name, table_name)];
                    case 1:
                        table_info = _a.sent();
                        table_info.map(function (field) {
                            var key = field[ALIAS_COLUMN_NAME];
                            if (key in record_raw && record_raw[key] !== undefined) {
                                //Only add items that have been specified in the record, and are not undefined in value
                                var value = record_raw[key];
                                prepared_record[key] = value;
                            }
                        });
                        return [2 /*return*/, prepared_record];
                }
            });
        });
    };
    /**
     * INTERNAL: Insert records into the database without any processing
     * @param table_name The name of the table to insert the records into
     * @param record The record to be insert into the database
     */
    MySQLDriver.prototype._insertRecordRaw = function (table_name, record) {
        return __awaiter(this, void 0, void 0, function () {
            var funcName, insert_sql, params, keys_sql, values_sql;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        funcName = '_insertRecordRaw';
                        insert_sql = "INSERT INTO `" + table_name + "`";
                        params = [];
                        keys_sql = Object.keys(record)
                            .map(function (key) {
                            if (_containsSpecialChars(key)) {
                                throw new Error(funcName + ": Special character found in key: '" + key + "'");
                            }
                            var escaped_key = "`" + key + "`";
                            var value = record[key];
                            params.push(value);
                            return escaped_key;
                        })
                            .reduce(function (last, cur, index) {
                            return last + ", " + cur;
                        });
                        values_sql = Object.keys(record)
                            .map(function (key) {
                            return '?';
                        })
                            .reduce(function (last, cur, index) {
                            return last + ", " + cur;
                        });
                        return [4 /*yield*/, this.query(insert_sql + " (" + keys_sql + ") VALUES (" + values_sql + ")", params)];
                    case 1: return [2 /*return*/, _a.sent()];
                }
            });
        });
    };
    /**
     * INTERNAL: Update records in a given table without any processing
     * @param table_name
     * @param properties The properties to be updated
     * @param where THe criteria to search
     */
    MySQLDriver.prototype._updateRecordsRaw = function (table_name, properties, where) {
        return __awaiter(this, void 0, void 0, function () {
            var funcName, error, update_sql, params, properties_sql, where_sql;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        funcName = '_updateRecordsRaw';
                        if (!where || Object.keys(where).length < 1) {
                            error = new Error("DatabaseHelper: Cannot update record without where clause.");
                            throw error;
                        }
                        update_sql = "UPDATE `" + table_name + "`";
                        params = [];
                        properties_sql = Object.keys(properties)
                            .map(function (key) {
                            if (_containsSpecialChars(key)) {
                                throw new Error(funcName + ": Special character found in key: '" + key + "'");
                            }
                            var property = properties[key];
                            params.push(property);
                            return "`" + key + "` = ?";
                        })
                            .reduce(function (last, cur, index) {
                            return last + ", " + cur;
                        });
                        where_sql = Object.keys(where)
                            .map(function (key) {
                            if (_containsSpecialChars(key)) {
                                throw new Error(funcName + ": Special character found in key: '" + key + "'");
                            }
                            var value = where[key];
                            params.push(value);
                            return "`" + key + "` = ?";
                        })
                            .reduce(function (last, cur, index) {
                            return last + " AND " + cur;
                        });
                        return [4 /*yield*/, this.query(update_sql + " SET " + properties_sql + " WHERE " + where_sql, params)];
                    case 1: return [2 /*return*/, _a.sent()];
                }
            });
        });
    };
    /**
     * INTERNAL: Select records from a given table without any data processing
     * @param table_name
     * @param where
     */
    MySQLDriver.prototype._selectRecordRaw = function (table_name, where, order_by, options) {
        if (where === void 0) { where = {}; }
        return __awaiter(this, void 0, void 0, function () {
            var funcName, _a, sql, params, isResultEmpty;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        funcName = '_selectRecordRaw';
                        _a = _prepareSelectStatement(table_name, where, order_by, options), sql = _a.sql, params = _a.params, isResultEmpty = _a.isResultEmpty;
                        if (isResultEmpty) {
                            return [2 /*return*/, []];
                        }
                        return [4 /*yield*/, this.query(sql, params)];
                    case 1: return [2 /*return*/, _b.sent()];
                }
            });
        });
    };
    /**
     * INTERNAL: Select count of records from a given table without any data processing
     * @param table_name
     * @param where
     */
    MySQLDriver.prototype._selectRecordRawCount = function (table_name, where, order_by, options) {
        if (where === void 0) { where = {}; }
        return __awaiter(this, void 0, void 0, function () {
            var funcName, _a, sql, params, isResultEmpty, sql_count, records;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        funcName = '_selectRecordRawCount';
                        _a = _prepareSelectStatement(table_name, where, order_by, options), sql = _a.sql, params = _a.params, isResultEmpty = _a.isResultEmpty;
                        if (isResultEmpty) {
                            return [2 /*return*/, 0];
                        }
                        sql_count = "SELECT COUNT(*) as count from (\n            (" + sql + ") as table_data)";
                        return [4 /*yield*/, this.query(sql_count, params)];
                    case 1:
                        records = _b.sent();
                        return [2 /*return*/, records[0].count];
                }
            });
        });
    };
    /**
     * INTERNAL: Delete records from a given table without any data processing
     * @param table_name
     * @param where
     */
    MySQLDriver.prototype._deleteRecordRaw = function (table_name, where) {
        return __awaiter(this, void 0, void 0, function () {
            var funcName, select_sql, params, conditions, where_sql;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        funcName = '_deleteRecordRaw';
                        select_sql = "DELETE FROM `" + table_name + "`";
                        params = [];
                        conditions = Object.keys(where).map(function (key) {
                            if (_containsSpecialChars(key)) {
                                throw new Error(funcName + ": Special character found in key: '" + key + "'");
                            }
                            var value = where[key];
                            params.push(value);
                            return "`" + key + "` = ?";
                        });
                        if (conditions.length < 1) {
                            throw new Error(funcName + ": Unable to delete records without conditions");
                        }
                        where_sql = conditions.reduce(function (last, cur, index) {
                            return last + " AND " + cur;
                        });
                        return [4 /*yield*/, this.query(select_sql + " WHERE " + where_sql, params)];
                    case 1: return [2 /*return*/, _a.sent()];
                }
            });
        });
    };
    /**
     * Checks an array of values and ensures that it is not undefined
     * @param {Array<string>} values
     */
    MySQLDriver.prototype._checkValues = function (values) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                values.map(function (value) {
                    if (value === undefined) {
                        throw new Error("DB._checkValues: SQL prepared value cannot be undefined.");
                    }
                });
                return [2 /*return*/];
            });
        });
    };
    return MySQLDriver;
}());
/**
 * INTERNAL: Prepare select statement from options
 * @param table_name
 * @param where
 */
function _prepareSelectStatement(table_name, where, order_by, options) {
    if (where === void 0) { where = {}; }
    var funcName = '_prepareSelectStatement';
    var select_sql = "SELECT * FROM `" + table_name + "`";
    var isResultEmpty = false;
    var params = [];
    //Validations
    var where_options = options === null || options === void 0 ? void 0 : options.where;
    var where_operator = (where_options === null || where_options === void 0 ? void 0 : where_options.operator) || 'AND';
    if (where_operator) {
        if (!constants_1.ALLOWED_OPERATORS[where_operator]) {
            throw new Error(funcName + ": Invalid operator '" + where_operator + "'");
        }
    }
    //Construction
    var where_clause = Object.keys(where ? where : {})
        .map(function (key) {
        if (_containsSpecialChars(key)) {
            throw new Error(funcName + ": Special character found in key: '" + key + "'");
        }
        var value = where[key];
        if ((where_options === null || where_options === void 0 ? void 0 : where_options.wildcard) || ((where_options === null || where_options === void 0 ? void 0 : where_options.wildcardAfter) && where_options.wildcardAfter)) {
            if (Array.isArray(value)) {
                throw new Error(funcName + ": Wildcard search not supported for arrays.");
            }
            params.push("%" + value + "%");
            return key + " LIKE ?";
        }
        else if (where_options === null || where_options === void 0 ? void 0 : where_options.wildcardBefore) {
            if (Array.isArray(value)) {
                throw new Error(funcName + ": Wildcard search not supported for arrays.");
            }
            params.push("%" + value);
            return key + " LIKE ?";
        }
        else if (where_options === null || where_options === void 0 ? void 0 : where_options.wildcardAfter) {
            if (Array.isArray(value)) {
                throw new Error(funcName + ": Wildcard search not supported for arrays.");
            }
            params.push(value + "%");
            return key + " LIKE ?";
        }
        else {
            params.push(value);
            if (Array.isArray(value)) {
                if (value.length === 0) {
                    isResultEmpty = true;
                }
                return "`" + key + "` IN (?)";
            }
            else {
                return "`" + key + "` = ?";
            }
        }
    })
        .reduce(function (state, cur, idx) {
        if (idx === 0) {
            state = "WHERE " + cur;
        }
        else {
            state += " " + where_operator + " " + cur;
        }
        return state;
    }, '');
    //Compute order by caluse
    var order_by_clause = (order_by ? order_by : [])
        .map(function (rule) {
        var _a = rule || {}, _b = _a.key, key = _b === void 0 ? '' : _b, _c = _a.order, order = _c === void 0 ? '' : _c;
        if (_containsSpecialChars(key)) {
            throw new Error(funcName + ": Special character found in key: '" + key + "'");
        }
        if (!key || !order || !(typeof order === 'string')) {
            throw new Error(funcName + ": Invalid order by config provided [" + key + " : " + order + "]");
        }
        var property_name = key;
        var sort_order = order.trim().toUpperCase();
        //Check that sort_order is either ASC or DESC
        if (['ASC', 'DESC'].indexOf(sort_order) === -1) {
            throw new Error(funcName + ": Invalid sort order provided - '" + sort_order);
        }
        return "`" + property_name + "` " + sort_order;
    })
        .reduce(function (state, cur, idx) {
        if (idx === 0) {
            state += "ORDER BY " + cur;
        }
        else {
            state += ",\n" + cur;
        }
        return state;
    }, '');
    //Compute limit clause
    var _a = (options || {}).limit, limit = _a === void 0 ? undefined : _a;
    var limit_clause = '';
    if (limit) {
        var offset = limit.offset, page_size = limit.page_size;
        if (typeof offset !== 'number') {
            throw new Error(funcName + ": offset in limit option must be a number.");
        }
        if (typeof page_size !== 'number') {
            throw new Error(funcName + ": page_size in limit option must be a number.");
        }
        limit_clause += " LIMIT ?, ?";
        params.push(offset);
        params.push(page_size);
    }
    var sql = select_sql + " " + where_clause + " " + order_by_clause + " " + limit_clause;
    return {
        sql: sql,
        params: params,
        isResultEmpty: isResultEmpty,
    };
}
function _containsSpecialChars(str_val) {
    var found = false;
    for (var i = 0; i < str_val.length; i++) {
        var c = str_val[i];
        if (INVALID_COLUMN_NAME_CHARS_INDEX[c]) {
            found = true;
            break;
        }
    }
    return found;
}
module.exports = MySQLDriver;
//# sourceMappingURL=MySQLDriver.js.map