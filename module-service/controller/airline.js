var util = require('util');
var url = require('url');

var database = require('../core/db');
var httpMsg = require('../core/httpMsg');
var helper = require('../core/helper');
var auth = require('../controller/auth');

class AirlineController {
    storeAirlineCompany(request, response, requestBody) {

        auth.guard(request, 'ADMIN', (error, results) => {
            if (error) httpMsg.status422(request, response, error);
            else {
                // has access
                if (results.length) {
                    try {
                        if (!requestBody) throw new Error('Input not valid');
                        var data = JSON.parse(requestBody);

                        if (data) {
                            var dataInsert = {
                                airline_name: data.airline_name,
                                city_name: data.city_name
                            }

                            database.insert('airline', dataInsert, (error, results) => {
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
        auth.guard(request, 'ADMIN', (error, results) => {
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
                            var dataInsert = {
                                code: new Date().getTime(),
                                from_date: data.from_date,
                                to_date: data.to_date,
                                flight_time: data.flight_time,
                                arrival_time: data.arrival_time,
                                from_city_name: data.from_city_name,
                                to_city_name: data.to_city_name,
                                airline_id: data.airline_id,
                                price: data.price

                            };

                            database.insert('flight', dataInsert, (error, results) => {
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
        auth.guard(request, 'USER', (error, results) => {
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

                            while (data[3].search('%20') != -1) data[3] = data[3].replace('%20', ' ');
                            while (data[4].search('%20') != -1) data[4] = data[4].replace('%20', ' ');

                            sql = 'SELECT a.`id` as `flight_id`, `code` as `flight_code`, `flight_time` as `departure_time`, `arrival_time`, `airline_id`, `airline_name`, `from_date`,`from_city_name`, `to_city_name` FROM `flight` a, `airline` b WHERE a.`airline_id` = b.`id` AND ';
                            sql += util.format("`from_date` = '%s' AND `from_city_name` = '%s' AND `to_city_name` = '%s'", data[2], data[3], data[4]);

                            database.query(sql, (error, results) => {
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
        auth.guard(request, 'USER', (error, results) => {
            if (error) httpMsg.status422(request, response, error);
            else {
                // has access
                if (results.length) {
                    try {
                        if (!requestBody) throw new Error('Input not valid');
                        var data = JSON.parse(requestBody);
                        // Validate data
                        if (!(helper.isValidDate(data.from_date) && helper.isValidTime(data.from_time) && helper.isValidInteger(data.total_adults) && helper.isValidInteger(data.total_children)))
                            throw new Error('Invalid');
                        if (data.flight_type === 'return flight' && !(helper.isValidDate(data.return_date) && helper.isValidTime(data.return_time)))
                            throw new Error('Invalid');

                        if (data) {
                            var dataInsert = {
                                flight_type: data.flight_type,
                                from_date: data.from_date,
                                from_time: data.from_time,
                                from_city_name: data.from_city_name,
                                to_city_name: data.to_city_name,
                                flight_class: data.flight_class,
                                total_adults: data.total_adults,
                                total_children: data.total_children
                            };
                            if (data.flight_type === 'return flight') {
                                dataInsert.return_date = data.return_date;
                                dataInsert.return_time = data.return_time;
                            }

                            database.insert('flight_book', dataInsert, (error, results) => {
                                if (error) httpMsg.status422(request, response, error);
                                else {
                                    var bookId = results.insertId;
                                    var passengers = data.passengers;

                                    for (const passenger of passengers) {
                                        var dataInsertPassenger = {
                                            first_name: passenger.first_name,
                                            last_name: passenger.last_name,
                                        }
                                        database.insert('customer', dataInsertPassenger, (error, results) => {
                                            if (error) httpMsg.status422(request, response, error);
                                            else {
                                                var passengerId = results.insertId;

                                                var dataInsertBookDetail = {
                                                    flight_book_id: bookId,
                                                    customer_id: passengerId
                                                }

                                                database.insert('flight_book_detail', dataInsertBookDetail, (error, results) => {
                                                    if (error) httpMsg.status422(request, response, error);
                                                })
                                            }

                                        });
                                    }
                                    dataInsert.flight_book_id = bookId;
                                    dataInsert.passengers = data.passengers;
                                    httpMsg.status200(request, response, dataInsert);
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

    updateFlight(request, response, endpoint, requestBody) {
        auth.guard(request, 'ADMIN', (error, results) => {
            if (error) httpMsg.status400(request, response, error);
            else {
                // has access
                if (results.length) {
                    try {
                        if (!endpoint) throw new Error('Input not valid');
                        var dataEndpoint = endpoint.split('/');
                        var flightId = dataEndpoint[2];

                        var sql = util.format("SELECT 1 FROM `flight` WHERE `id` = %d", flightId);
                        database.query(sql, (error, results) => {
                            if (results.length) {
                                if (!requestBody) httpMsg.status400(request, response, 'Input invalid');

                                var data = JSON.parse(requestBody);

                                if (data) {
                                    try {
                                        // Validate data
                                        if (data.from_date && !helper.isValidDate(data.from_date)) throw new Error('Input invalid 1');
                                        if (data.to_date && !helper.isValidDate(data.to_date)) throw new Error('Input invalid 2');
                                        if (data.flight_time && !helper.isValidTime(data.flight_time)) throw new Error('Input invalid 3');
                                        if (data.arrival_time && !helper.isValidTime(data.arrival_time)) throw new Error('Input invalid 4');
                                        if (data.price && !helper.isValidInteger(data.price)) throw new Error('Input invalid 5');

                                        var dataUpdate = {};
                                        if (data.from_date) dataUpdate.from_date = data.from_date;
                                        if (data.to_date) dataUpdate.to_date = data.to_date;
                                        if (data.flight_time) dataUpdate.flight_time = data.flight_time;
                                        if (data.arrival_time) dataUpdate.arrival_time = data.arrival_time;
                                        if (data.from_city_name) dataUpdate.from_city_name = data.from_city_name;
                                        if (data.to_city_name) dataUpdate.to_city_name = data.to_city_name;
                                        if (data.airline_id) dataUpdate.airline_id = data.airline_id;
                                        if (data.price) dataUpdate.price = data.price;

                                        var condition = {
                                            id: flightId
                                        }
                                        database.update('flight', dataUpdate, condition, (error, results) => {
                                            if (error) httpMsg.status400(request, response, error);
                                            else {
                                                var data = {
                                                    message: 'update success'
                                                }
                                                httpMsg.status200(request, response, data);
                                            }
                                        });
                                    } catch (error) {
                                        httpMsg.status400(request, response, error);
                                    }


                                } else httpMsg.status400(request, response, 'Input empty');
                            } else httpMsg.status400(request, response, 'id not exist');
                        })


                    } catch (error) {
                        httpMsg.status400(request, response, error);
                    }

                }
                // no access
                else {
                    httpMsg.status401(request, response, error);
                }
            }
        });
    }

    destroyFlight(request, response, endpoint) {
        auth.guard(request, 'ADMIN', (error, results) => {
            if (error) httpMsg.status400(request, response, error);
            else {
                // has access
                if (results.length) {
                    try {
                        if (!endpoint) throw new Error('Input not valid');
                        var dataEndpoint = endpoint.split('/');
                        var flightId = dataEndpoint[2];

                        var sql = util.format("SELECT 1 FROM `flight` WHERE `id` = '%s'", flightId);
                        database.query(sql, (error, results) => {
                            if (results.length) {
                                var condition = {
                                    id: flightId
                                }
                                database.delete('flight', condition, (error, results) => {
                                    if (error) httpMsg.status400(request, response, error);
                                    else {
                                        var data = {
                                            message: 'delete success'
                                        }
                                        httpMsg.status200(request, response, data);
                                    }
                                })
                            } else httpMsg.status400(request, response, 'id not exist');
                        })


                    } catch (error) {
                        httpMsg.status400(request, response, error);
                    }

                }
                // no access
                else {
                    httpMsg.status401(request, response, error);
                }
            }
        });
    }

}


module.exports = AirlineController;