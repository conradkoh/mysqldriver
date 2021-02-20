import mysql from 'mysql';

module.exports.makeTestConnectionConfig = function () {
  return {
    host: '127.0.0.1',
    database: 'mysqldriver_test',
    password: 'P@ssw0rd',
    user: 'testuser',
    charset: 'utf8mb4',
  };
};

module.exports.makeDBConfig = function () {
  let dbConfig = {
    database: 'mysqldriver_test',
    createConnection: () => {
      let conn = mysql.createConnection({
        host: '127.0.0.1',
        database: 'mysqldriver_test',
        password: 'P@ssw0rd',
        user: 'testuser',
        charset: 'utf8mb4',
      });
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
};
