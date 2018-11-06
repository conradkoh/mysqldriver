# MySQLDriver
## Sample usage
``` Javascript
const MySQLDriver = require('mysqldriver');
const DB = new MySQLDriver('127.0.0.1', 'root', 'password', 'my_database', 3306);
const users = await DB.getRecords('user', { name: 'John Doe' }); // Gets all records who have name John Doe
```