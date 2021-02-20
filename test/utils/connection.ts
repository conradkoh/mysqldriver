import mysql from 'mysql';

export function makeTestConnectionConfig() {
  return {
    host: '127.0.0.1',
    database: 'mysqldriver_test',
    password: 'P@ssw0rd',
    user: 'testuser',
    charset: 'utf8mb4',
  };
}

export function makeDBConfig() {
  let dbConfig = {
    database: 'mysqldriver_test',
    createConnection: () => {
      let conn = mysql.createConnection(makeTestConnectionConfig());
      return {
        destroy: () => conn.destroy(),
        on: (ev, cb) => conn.on(ev, cb),
        query: (q, v, cb) => conn.query(q, v, cb),
        end: (cb) => conn.end(cb),
        isDisconnected:
          conn.state == 'disconnected' || conn.state == 'protocol_error',
      };
    },
  };
  return dbConfig;
}
