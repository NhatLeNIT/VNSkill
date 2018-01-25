var fs = require('fs');
var util = require('util');
var url = require('url');

var dbCon = require('../core/db');
var httpMsg = require('../core/httpMsg');
var helper = require('../core/helper');

dbCon.connect();


class AirlineController {
    storeAirlineCompany(request, response, requestBody) {
        // Get query params on url
        var urlObj = url.parse(request.url, true);
        var queryUrl = urlObj.query;

        // Check permission access
        var sql = util.format("SELECT `role` FROM `users` WHERE `api_token` = '%s' AND `role` = '%s'", queryUrl.token, 'ADMIN');
        dbCon.query(sql, (error, results) => {
            if (error) httpMsg.status422(request, response, error);
            else {
                // has access
                if (results.length) {
                    try {
                        if (!requestBody) throw new Error('Input not valid');
                        var data = JSON.parse(requestBody);

                        if (data) {
                            sql = 'INSERT INTO `airline` (airline_name, city_name) VALUES ';
                            sql += util.format("('%s','%s')", data.airline_name, data.city_name);
                            dbCon.query(sql, (error, results) => {
                                if (error) httpMsg.status422(request, response, error);
                                else {
                                    var data = {
                                        id: results.insertId,
                                        message: 'create success'
                                    }
                                    httpMsg.status200(request, response, data);
                                }
                            });
                        } else throw new Error('Input not valid');
                    } catch (error) {
                        httpMsg.status422(request, response, error);
                    }
                }
                // no access
                else {
                    httpMsg.status401(request, response, error);
                }
            }
        });

    }

    storeAirlineFlight(request, response, requestBody) {
        // Get query params on url
        var urlObj = url.parse(request.url, true);
        var queryUrl = urlObj.query;

        // Check permission access
        var sql = util.format("SELECT `role` FROM `users` WHERE `api_token` = '%s' AND `role` = '%s'", queryUrl.token, 'ADMIN');
        dbCon.query(sql, (error, results) => {
            if (error) httpMsg.status422(request, response, error);
            else {
                // has access
                if (results.length) {
                    try {
                        if (!requestBody) throw new Error('Input not valid');
                        var data = JSON.parse(requestBody);
                        // Validate data
                        if (!(helper.isValidDate(data.from_date) && helper.isValidDate(data.to_date) && helper.isValidTime(data.flight_time) && helper.isValidTime(data.arrival_time) && helper.isValidInteger(data.price)))
                            throw new Error('Invalid');
                        if (data) {
                            sql = 'INSERT INTO `flight` (`code`, `from_date`, `to_date`, `flight_time`, `arrival_time`, `from_city_name`, `to_city_name`, `airline_id`, `price`) VALUES ';
                            sql += util.format("('%s', '%s', '%s', '%s', '%s', '%s', '%s', %d, %d )", new Date().getTime(), data.from_date, data.to_date, data.flight_time, data.arrival_time, data.from_city_name, data.to_city_name, data.airline_id, data.price);

                            dbCon.query(sql, (error, results) => {
                                if (error) httpMsg.status422(request, response, error);
                                else {
                                    var data = {
                                        id: results.insertId,
                                        message: 'create success'
                                    }
                                    httpMsg.status200(request, response, data);
                                }
                            });
                        } else throw new Error('Input not valid');
                    } catch (error) {
                        httpMsg.status422(request, response, error);
                    }

                }
                // no access
                else {
                    httpMsg.status401(request, response, error);
                }
            }
        });
    }

    indexFlight(request, response, endpoint) {
        // Get query params on url
        var urlObj = url.parse(request.url, true);
        var queryUrl = urlObj.query;

        // Check permission access
        var sql = util.format("SELECT `role` FROM `users` WHERE `api_token` = '%s'", queryUrl.token);
        dbCon.query(sql, (error, results) => {
            if (error) httpMsg.status422(request, response, error);
            else {
                // has access
                if (results.length) {
                    try {
                        if (!endpoint) throw new Error('Input not valid');
                        var data = endpoint.split('/');
                        
                        // Validate data
                        if (!(helper.isValidDate(data[2])))
                            throw new Error('Invalid');
                        if (data) {
                          
                            while(data[3].search('%20') != -1) data[3] = data[3].replace('%20', ' ');
                            while(data[4].search('%20') != -1) data[4] = data[4].replace('%20', ' ');
                            sql = 'SELECT a.`id` as `flight_id`, `code` as `flight_code`, `flight_time` as `departure_time`, `arrival_time`, `airline_id`, `airline_name`, `from_date`,`from_city_name`, `to_city_name` FROM `flight` a, `airline` b WHERE a.`airline_id` = b.`id` AND ';
                            sql += util.format("`from_date` = '%s' AND `from_city_name` = '%s' AND `to_city_name` = '%s'", data[2], data[3], data[4]);

                            dbCon.query(sql, (error, results) => {
                                if (error) httpMsg.status422(request, response, error);
                                else {
                                    httpMsg.status200(request, response, results);
                                }
                            });
                        } else throw new Error('Input not valid');
                    } catch (error) {
                        httpMsg.status422(request, response, error);
                    }

                }
                // no access
                else {
                    httpMsg.status401(request, response, error);
                }
            }
        });
    }

    bookFlight(request, response, requestBody) {

    }

    updateFlight(request, response) {

    }

    destroyFlight(request, response) {

    }

}


module.exports = AirlineController;