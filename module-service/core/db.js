var mysql = require('mysql');
var config = require('../config');

var database = mysql.createConnection(config.dbConfig);

database.connect();

module.exports.createConnection = database;

module.exports.query = (sql, callback) => {
    database.query(sql, callback);
}

module.exports.insert = (table, data, callback) => {
    var fieldList = '',
        valueList = '';

    for (const key in data) {
        fieldList += ",`" + key + "`";
        valueList += ",'" + data[key] + "'";
    }

    fieldList = fieldList.slice(1);
    valueList = valueList.slice(1);

    var sql = `INSERT INTO \`${table}\`(${fieldList}) VALUES(${valueList})`;
    console.log(sql);
    database.query(sql, callback);
}

module.exports.update = (table, data, condition, callback) => {
    var dataSet = '',
        where = '';
    for (const key in data) {
        dataSet += `, \`${key}\` = '${data[key]}' `;
    }

    for (const key in condition) {
        where += `AND \`${key}\` = '${condition[key]}' `;
    }

    dataSet = dataSet.slice(1);
    where = where.slice(3);

    var sql = `UPDATE \`${table}\` SET ${dataSet} WHERE ${where}`;
   
    database.query(sql, callback);
}

module.exports.delete = (table, condition, callback) => {
    var where = '';

    for (const key in condition) {
        where += `AND \`${key}\` = '${condition[key]}' `;
    }

    where = where.slice(3);
    var sql = `DELETE FROM \`${table}\` WHERE ${where}`;
    database.query(sql, callback);
}