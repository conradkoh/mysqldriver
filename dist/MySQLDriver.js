"use strict";
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
var v4_1 = __importDefault(require("uuid/v4"));
var query_1 = require("./lib/query");
var select_1 = require("./lib/select");
var database_1 = require("./lib/database");
var insert_1 = require("./lib/insert");
var update_1 = require("./lib/update");
var delete_1 = require("./lib/delete");
var javascript_1 = require("./lib/javascript");
var ALIAS_COLUMN_NAME = 'COLUMN_NAME';
var ALIAS_DATA_TYPE = 'DATA_TYPE';
var ALIAS_COLUMN_KEY = 'COLUMN_KEY';
var ALIAS_CHARACTER_MAXIMUM_LENGTH = 'CHARACTER_MAXIMUM_LENGTH';
var ALIAS_IS_NULLABLE = 'IS_NULLABLE';
var ALIAS_COLUMN_DEFAULT = 'COLUMN_DEFAULT';
var CONNECTION_STATUS;
(function (CONNECTION_STATUS) {
    CONNECTION_STATUS["CONNECTED"] = "connected";
    CONNECTION_STATUS["CONNECTING"] = "connecting";
    CONNECTION_STATUS["DISCONNECTED"] = "disconnected";
})(CONNECTION_STATUS || (CONNECTION_STATUS = {}));
var MySQLDriver = /** @class */ (function () {
    function MySQLDriver(config) {
        this.config = config;
        this._createConnection = config.createConnection;
        // this.config.port = config.port || 3306;
        this.connection_status = CONNECTION_STATUS.DISCONNECTED;
        var _a = this._prepareConnection(), conn = _a.conn, querySelect = _a.querySelect;
        conn.on('error', this.handleDisconnect.bind(this)); //Add the handler for disconnection on errors
        this.connection = conn;
        this.querySelect = querySelect;
    }
    MySQLDriver.prototype.handleDisconnect = function () {
        if (this.connection) {
            this.connection.destroy();
        }
        this.connection_status = CONNECTION_STATUS.DISCONNECTED;
        console.log('Database disconnected by server.');
    };
    /**
     * Get the database connection
     */
    MySQLDriver.prototype.getConnection = function () {
        return __awaiter(this, void 0, void 0, function () {
            var wait, _a, conn, querySelect;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        wait = 500;
                        if (this.connection_status === CONNECTION_STATUS.CONNECTED &&
                            this.connection) {
                            return [2 /*return*/, this.connection];
                        }
                        _b.label = 1;
                    case 1:
                        if (!(this.connection_status === CONNECTION_STATUS.CONNECTING)) return [3 /*break*/, 3];
                        return [4 /*yield*/, new Promise(function (resolve, reject) {
                                //Wait for a short interval before checking again
                                setTimeout(function () {
                                    resolve();
                                }, wait);
                            })];
                    case 2:
                        _b.sent();
                        return [3 /*break*/, 1];
                    case 3:
                        if (this.connection_status === CONNECTION_STATUS.DISCONNECTED) {
                            _a = this._prepareConnection(), conn = _a.conn, querySelect = _a.querySelect;
                            this.querySelect = querySelect;
                            return [2 /*return*/, conn];
                        }
                        return [2 /*return*/, this.connection];
                }
            });
        });
    };
    MySQLDriver.prototype._prepareConnection = function () {
        var _this = this;
        var conn = this._createConnection();
        var querySelect = function (query, values) { return __awaiter(_this, void 0, void 0, function () {
            var result;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.config.querySelect(conn, query, values)];
                    case 1:
                        result = _a.sent();
                        return [2 /*return*/, result];
                }
            });
        }); };
        return {
            conn: conn,
            querySelect: querySelect,
        };
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
            var connection, self, database, clean_record, res;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.getConnection()];
                    case 1:
                        connection = _a.sent();
                        self = this;
                        database = self.config.database;
                        return [4 /*yield*/, database_1.prepareRecord(connection, database, table_name, record)];
                    case 2:
                        clean_record = _a.sent();
                        return [4 /*yield*/, insert_1.insertRecordRaw(connection, table_name, clean_record)];
                    case 3:
                        res = _a.sent();
                        return [2 /*return*/, res];
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
            var connection;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.getConnection()];
                    case 1:
                        connection = _a.sent();
                        return [4 /*yield*/, select_1.selectRecordRaw(connection, table_name, where, order_by, options)];
                    case 2: return [2 /*return*/, _a.sent()];
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
            var connection;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.getConnection()];
                    case 1:
                        connection = _a.sent();
                        return [4 /*yield*/, select_1.selectRecordRawCount(connection, table_name, where, order_by, options)];
                    case 2: return [2 /*return*/, _a.sent()];
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
            var connection, result;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.getConnection()];
                    case 1:
                        connection = _a.sent();
                        return [4 /*yield*/, select_1.selectRecordRaw(connection, table_name, where, order_by, { limit: { offset: 0, page_size: 1 } })];
                    case 2:
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
            var self, connection, database, clean_properties;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        self = this;
                        return [4 /*yield*/, this.getConnection()];
                    case 1:
                        connection = _a.sent();
                        database = self.config.database;
                        return [4 /*yield*/, database_1.prepareRecord(connection, database, table_name, properties)];
                    case 2:
                        clean_properties = _a.sent();
                        return [4 /*yield*/, update_1.updateRecordsRaw(connection, table_name, clean_properties, where)];
                    case 3: return [2 /*return*/, _a.sent()];
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
            var self, connection;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        self = this;
                        return [4 /*yield*/, this.getConnection()];
                    case 1:
                        connection = _a.sent();
                        return [4 /*yield*/, delete_1.deleteRecordRaw(connection, table_name, where)];
                    case 2: return [2 /*return*/, _a.sent()];
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
            var connection;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.getConnection()];
                    case 1:
                        connection = _a.sent();
                        return [4 /*yield*/, query_1.query(connection, sql, values)];
                    case 2: return [2 /*return*/, _a.sent()];
                }
            });
        });
    };
    /**
     * Gets all tables in the current database
     */
    MySQLDriver.prototype.getTableNames = function () {
        return __awaiter(this, void 0, void 0, function () {
            var connection, self, database, table_names;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.getConnection()];
                    case 1:
                        connection = _a.sent();
                        self = this;
                        database = self.config.database;
                        return [4 /*yield*/, database_1.getTableNames(connection, database)];
                    case 2:
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
            var connection, self, database, info;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.getConnection()];
                    case 1:
                        connection = _a.sent();
                        self = this;
                        database = self.config.database;
                        return [4 /*yield*/, database_1.getTableInfo(connection, database, table_name)];
                    case 2:
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
            var connection, self, database, info;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.getConnection()];
                    case 1:
                        connection = _a.sent();
                        self = this;
                        database = self.config.database;
                        return [4 /*yield*/, database_1.getTableInfo(connection, database, table_name)];
                    case 2:
                        info = _a.sent();
                        return [2 /*return*/, info.map(function (field_info) { return field_info.COLUMN_NAME; })];
                }
            });
        });
    };
    /**
     * Query the database connection asynchronously
     * @param sql
     * @param values
     */
    MySQLDriver.prototype.query = function (sql, values) {
        if (values === void 0) { values = []; }
        return __awaiter(this, void 0, void 0, function () {
            var connection;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.getConnection()];
                    case 1:
                        connection = _a.sent();
                        return [4 /*yield*/, query_1.query(connection, sql, values)];
                    case 2: return [2 /*return*/, _a.sent()];
                }
            });
        });
    };
    MySQLDriver.prototype.closeConnection = function () {
        return __awaiter(this, void 0, void 0, function () {
            var connection;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.getConnection()];
                    case 1:
                        connection = _a.sent();
                        if (!connection) return [3 /*break*/, 3];
                        return [4 /*yield*/, new Promise(function (resolve, reject) {
                                connection.end(function (err) {
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
    /**
     * Gets the schema of the database as an array of table schema objects
     */
    MySQLDriver.prototype.getJSSchema = function () {
        return __awaiter(this, void 0, void 0, function () {
            var connection, database;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.getConnection()];
                    case 1:
                        connection = _a.sent();
                        database = this.config.database;
                        return [4 /*yield*/, javascript_1.getJSSchema(connection, database)];
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
            var connection, database;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.getConnection()];
                    case 1:
                        connection = _a.sent();
                        database = this.config.database;
                        return [4 /*yield*/, javascript_1.tableGetJSSchema(connection, database, table_name)];
                    case 2: return [2 /*return*/, _a.sent()];
                }
            });
        });
    };
    return MySQLDriver;
}());
module.exports = MySQLDriver;
//# sourceMappingURL=MySQLDriver.js.map