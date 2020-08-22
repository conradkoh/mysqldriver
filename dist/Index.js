"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.connect = exports.DatabaseDriver = exports.ConnectionProvider = void 0;
var ConnectionProvider_1 = require("./classes/ConnectionProvider");
Object.defineProperty(exports, "ConnectionProvider", { enumerable: true, get: function () { return ConnectionProvider_1.ConnectionProvider; } });
var DatabaseDriver_1 = require("./classes/DatabaseDriver");
Object.defineProperty(exports, "DatabaseDriver", { enumerable: true, get: function () { return DatabaseDriver_1.DatabaseDriver; } });
var serverless_mysql_1 = __importDefault(require("serverless-mysql"));
function connect(config) {
    var dbCfg = {
        database: config.database,
        createConnection: function () {
            var conn = serverless_mysql_1.default({
                config: config,
            });
            return {
                destroy: function () { return conn.quit(); },
                on: function (ev, cb) { },
                query: function (q, v, cb) {
                    conn
                        .query(q, v)
                        .then(function (r) {
                        var data = r;
                        return { data: data, err: null };
                    })
                        .catch(function (err) { return ({ err: err, data: null }); })
                        .then(function (result) {
                        var err = result.err, data = result.data;
                        cb(err, data);
                    });
                },
                end: function (cb) { return conn.end().then(function () { return cb(null); }); },
                isDisconnected: false,
            };
        },
    };
    return new DatabaseDriver_1.DatabaseDriver(dbCfg);
}
exports.connect = connect;
//# sourceMappingURL=index.js.map