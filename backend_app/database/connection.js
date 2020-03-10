var mysql = require('mysql');

// set env for now
process.env.NODE_ENV = "development";

var isDevelopment = process.env.NODE_ENV && process.env.NODE_ENV === 'development' ? true : false; 


var isDevelopment = process.env.NODE_ENV && process.env.NODE_ENV === 'development' ? true : false;

const DB_PORT = process.env.MYSQL_PORT || 3306;
const DB_HOST = process.env.MYSQL_HOST || 'localhost';
const DB_USER = process.env.MYSQL_USER || 'root';
const DB_PW = process.env.MYSQL_PW || '';
const DB = process.env.DATABASE_NAME || 'messenger_app_backend';

var getCredentials = (isDevelopment) => {

  if(isDevelopment) {
    return {
      host: DB_HOST,
      port: DB_PORT,
      user: DB_USER,
      password: DB_PW,
      database: DB,
    }
  } else {

    return {
      host: 'localhost',
      user: 'root',
      password: 'r00tMsql73p@s',
      database: 'doctor_achen'
    }
  }
};

var connection = mysql.createConnection(getCredentials(isDevelopment));

connection.connect(function (err) {
  if (err) return console.error(err);
  console.log("Successfully connected to MySQL DB");
});

module.exports = connection; 