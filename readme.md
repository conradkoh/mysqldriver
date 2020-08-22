# MySQLDriver

## Sample usage

```Javascript
const MySQLDriver = require('mysqldriver');
const config = {
    host: '127.0.0.1',
    user: 'admin',
    password: 'password',
    database: 'mydatabase',
    port: 3306
}
const DB = MySQLDriver.connect(config);
const users = await DB.getRecords('user', { name: 'John Doe' }); // Gets all records who have name John Doe
```

## Setting up the test database

Execute the following statements

```
CREATE DATABASE mysqldriver_test;
CREATE USER 'testuser'@'%' IDENTIFIED WITH mysql_native_password BY 'P@ssw0rd';
GRANT ALL PRIVILEGES ON mysqldriver_test.* TO 'testuser'@'%';
FLUSH PRIVILEGES;
```

Create a configuration file `dbconfig.js`

```javascript
const config = {
  host: '127.0.0.1',
  database: 'mysqldriver_test',
  password: 'P@ssw0rd',
  user: 'testuser',
};
module.exports = config;
```
