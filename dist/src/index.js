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
Object.defineProperty(exports, "__esModule", { value: true });
exports.connect = exports.DatabaseDriver = exports.ConnectionProvider = void 0;
var ConnectionProvider_1 = require("./classes/ConnectionProvider");
Object.defineProperty(exports, "ConnectionProvider", { enumerable: true, get: function () { return ConnectionProvider_1.ConnectionProvider; } });
var DatabaseDriver_1 = require("./classes/DatabaseDriver");
Object.defineProperty(exports, "DatabaseDriver", { enumerable: true, get: function () { return DatabaseDriver_1.DatabaseDriver; } });
var serverless_mysql_1 = __importDefault(require("serverless-mysql"));
function connect(config) {
    var _this = this;
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
                end: function (cb) {
                    var terminateConnection = function () { return __awaiter(_this, void 0, void 0, function () {
                        return __generator(this, function (_a) {
                            switch (_a.label) {
                                case 0: return [4 /*yield*/, conn.end()];
                                case 1:
                                    _a.sent();
                                    return [4 /*yield*/, conn.quit()];
                                case 2:
                                    _a.sent();
                                    return [2 /*return*/];
                            }
                        });
                    }); };
                    return terminateConnection().then(function () { return cb(null); });
                },
                isDisconnected: function () {
                    return false;
                },
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