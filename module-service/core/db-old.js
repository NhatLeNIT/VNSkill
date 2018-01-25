var mysql = require('mysql');
var config = require('../config');

var database = mysql.createConnection(config.dbConfig);

database.connect();

module.exports.createConnection = database;

module.exports.insert =  (table, data, callback) => {
    var fieldList = '', valueList = '';

    for(var prop in data) {
        fieldList += ",`"+ prop +"`";
        valueList += ",'"+ data[prop] +"'";
    }

    fieldList = fieldList.slice(1);
    valueList = valueList.slice(1);

    var sql = `INSERT INTO \`${table}\`(${fieldList}) VALUES(${valueList})`;
    database.query(sql, callback);
}