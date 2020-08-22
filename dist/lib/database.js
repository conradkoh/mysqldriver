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
Object.defineProperty(exports, "__esModule", { value: true });
exports.getTableNames = exports.getTableInfo = exports.prepareRecord = void 0;
var query_1 = require("./query");
var ALIAS_COLUMN_NAME = 'COLUMN_NAME';
var ALIAS_DATA_TYPE = 'DATA_TYPE';
var ALIAS_COLUMN_KEY = 'COLUMN_KEY';
var ALIAS_CHARACTER_MAXIMUM_LENGTH = 'CHARACTER_MAXIMUM_LENGTH';
var ALIAS_IS_NULLABLE = 'IS_NULLABLE';
var ALIAS_COLUMN_DEFAULT = 'COLUMN_DEFAULT';
var ALIAS_TABLE_NAME = 'TABLE_NAME';
/**
 * Checks the record against the database schema and removes any irrelevant fields for insertion
 * @param database_name
 * @param table_name
 * @param record_raw
 */
function prepareRecord(connection, database_name, table_name, record_raw) {
    return __awaiter(this, void 0, void 0, function () {
        var error, prepared_record, table_info;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    if (!(typeof table_name === 'string')) {
                        error = new Error("MySQLDriver in function prepareRecord: Provided table name is not a string.");
                        error.table_name = table_name;
                        error.record_raw = record_raw;
                        throw error;
                    }
                    prepared_record = {};
                    return [4 /*yield*/, getTableInfo(connection, database_name, table_name)];
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
}
exports.prepareRecord = prepareRecord;
//INTERNAL FUNCTIONS
/**
 * Get the field
 * @param database_name
 * @param table_name
 */
function getTableInfo(connection, database_name, table_name) {
    return __awaiter(this, void 0, void 0, function () {
        var result;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, query_1.query(connection, "SELECT \n    `COLUMN_NAME` as '" + ALIAS_COLUMN_NAME + "', \n    `DATA_TYPE` AS '" + ALIAS_DATA_TYPE + "', \n    `COLUMN_KEY` AS '" + ALIAS_COLUMN_KEY + "', \n    `CHARACTER_MAXIMUM_LENGTH` as '" + ALIAS_CHARACTER_MAXIMUM_LENGTH + "',\n    `IS_NULLABLE` as '" + ALIAS_IS_NULLABLE + "',\n    `COLUMN_DEFAULT` as '" + ALIAS_COLUMN_DEFAULT + "'\n    FROM INFORMATION_SCHEMA.COLUMNS\n    WHERE `TABLE_NAME` = ? AND `TABLE_SCHEMA` = ?", [table_name, database_name])];
                case 1:
                    result = _a.sent();
                    if (result.length === 0) {
                        throw new Error("Table '" + table_name + "' does not exist on database '" + database_name + "'");
                    }
                    return [2 /*return*/, result];
            }
        });
    });
}
exports.getTableInfo = getTableInfo;
/**
 * Gets all table names in a given database
 * @param database_name
 */
function getTableNames(connection, database_name) {
    return __awaiter(this, void 0, void 0, function () {
        var tables, table_names;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, query_1.query(connection, "SELECT TABLE_NAME \n            FROM INFORMATION_SCHEMA.TABLES WHERE `TABLE_SCHEMA` = ?", [database_name])];
                case 1:
                    tables = _a.sent();
                    table_names = tables.map(function (table) { return table[ALIAS_TABLE_NAME]; });
                    return [2 /*return*/, table_names];
            }
        });
    });
}
exports.getTableNames = getTableNames;
//# sourceMappingURL=database.js.map