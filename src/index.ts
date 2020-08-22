import { ConnectionProvider } from './classes/ConnectionProvider';
import { DatabaseDriver } from './classes/DatabaseDriver';
import { DatabaseConfig } from './interfaces/DatabaseConfig';
import serverlessMySQL from 'serverless-mysql';
interface Config {
  host: string;
  database: string;
  password: string;
  user: string;
  multipleStatements?: boolean;
}
function connect(config: Config) {
  let dbCfg: DatabaseConfig = {
    database: config.database,
    createConnection: () => {
      let conn = serverlessMySQL({
        config: config,
      });
      return {
        destroy: () => conn.quit(),
        on: (ev, cb) => {},
        query: (q, v, cb) => {
          conn
            .query(q, v)
            .then((r) => {
              let data: any = r;
              return { data, err: null };
            })
            .catch((err) => ({ err, data: null }))
            .then((result) => {
              let { err, data } = result;
              cb(err, data);
            });
        },
        end: (cb) => conn.end().then(() => cb(null)),
        isDisconnected: false,
      };
    },
  };
  return new DatabaseDriver(dbCfg);
}
export { ConnectionProvider, DatabaseDriver, connect };
