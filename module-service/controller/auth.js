var url = require('url');
var util = require('util');

var database = require('../core/db');
var httpMsg = require('../core/httpMsg');

class Auth {

    login(request, response, requestBody) {
        try {
            if (!requestBody) throw new Error('Input not valid');
            var data = JSON.parse(requestBody);

            if (data) {
                var sql = util.format("SELECT `id`, `username` FROM `users` WHERE username = '%s' AND password = md5('%s')", data.username, data.password);
                
                database.query(sql, (error, results) => {
                    var rsObj = results[0];
                    if (error) httpMsg.status422(request, response, error);
                    else {
                        if (results.length) {
                            var sql = util.format("UPDATE `users` SET `api_token` = md5('%s') WHERE `id` = %d", rsObj.username + new Date().getTime(), rsObj.id);
                            database.query(sql, (error, results) => {
                                if (error) httpMsg.status422(request, response, error);
                                else {
                                    sql = util.format("SELECT `api_token`, `role` FROM `users` WHERE id = %d", rsObj.id);
                                    database.query(sql, (error, results) => {
                                        if (error) httpMsg.status422(request, response, error);
                                        else {
                                            var data = {
                                                token: results[0].api_token,
                                                role: results[0].role
                                            }
                                            httpMsg.status200(request, response, data);
                                        }
                                    })
                                }
                            })
                        }
                    }
                });
            } else throw new Error('Input not valid');
        } catch (error) {
            httpMsg.status422(request, response, error);
        }
    }

    logout(request, response) {
        // Get query params on url
        var urlObj = url.parse(request.url, true);
        var queryUrl = urlObj.query;
        try {
            if (!queryUrl) throw new Error('Input not valid');

            var sql = util.format("UPDATE `users` SET `api_token` = %s WHERE `api_token` = '%s'", 'null', queryUrl.token);
            database.query(sql, (error, results) => {
                if (error) httpMsg.status401(request, response, error);
                else {
                    if (results.affectedRows) {
                        var data = {
                            message: 'logout success'
                        };
                        httpMsg.status200(request, response, data);
                    } else httpMsg.status401(request, response, error);
                }
            });
        } catch (error) {
            httpMsg.status401(request, response, error);
        }
    }

}

module.exports.Auth = Auth;

module.exports.guard = (request, role, callback) => {
    // Get query params on url
    var urlObj = url.parse(request.url, true);
    var queryUrl = urlObj.query;
       var sql = util.format("SELECT `role` FROM `users` WHERE `api_token` = '%s'", queryUrl.token);
       if(role === 'ADMIN')
           sql += util.format(" AND `role` = '%s'", role);
       
       database.query(sql, callback);
}