"use strict";
var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (Object.prototype.hasOwnProperty.call(b, p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
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
    var _a;
    if (!config.host) {
        throw new MissingConfigParamException('host', config.host);
    }
    if (!config.database) {
        throw new MissingConfigParamException('database', config.database);
    }
    if (!config.user) {
        throw new MissingConfigParamException('user', config.user);
    }
    if (!config.port) {
        config.port = 3306;
    }
    if (config.requireSsl) {
        if (!((_a = config === null || config === void 0 ? void 0 : config.ssl) === null || _a === void 0 ? void 0 : _a.ca)) {
            throw new MissingConfigParamException('ssl ca', '<secret>');
        }
    }
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
var MissingConfigParamException = /** @class */ (function (_super) {
    __extends(MissingConfigParamException, _super);
    function MissingConfigParamException(key, value) {
        return _super.call(this, "MySQLDriver: Missing config: " + key + " has value " + value) || this;
    }
    return MissingConfigParamException;
}(Error));
//# sourceMappingURL=index.js.map