var util = require('util');
var url = require('url');

var database = require('../core/db');
var httpMsg = require('../core/httpMsg');
var helper = require('../core/helper');
var auth = require('./auth');

class HotelController {

    store(request, response, requestBody) {
        auth.guard(request, 'ADMIN', (error, results) => {
            if (error) httpMsg.status422(request, response, error);
            else {
                // has access
                if (results.length) {
                    try {
                        if (!requestBody) throw new Error('Input empty');
                        var data = JSON.parse(requestBody);

                        if (data) {
                            var room_types = data.room_types;
                            var images = data.images;

                            // Validate data
                            if (!helper.isValidInteger(data.capacity)) throw new Error('Data invalid');
                            for (const room_type of room_types) {
                                if (!helper.isValidInteger(room_type.price)) throw new Error('Data invalid');
                            }


                            var dataInsert = {
                                name: data.name,
                                city_name: data.city_name,
                                description: data.description,
                                capacity: data.capacity
                            }

                            database.insert('hotel', dataInsert, (error, results) => {
                                if (error) httpMsg.status422(request, response, error);
                                else {
                                    var hotelId = results.insertId;
                                    for (const room_type of room_types) {
                                        var dataRoomTypeInsert = {
                                            name: room_type.name,
                                            price: room_type.price,
                                            hotel_id: hotelId
                                        }

                                        database.insert('room_type', dataRoomTypeInsert, (error, results) => {
                                            if (error) httpMsg.status422(request, response, error);
                                        });
                                    }

                                    for (const image of images) {
                                        var dataImageInsert = {
                                            url: image.url,
                                            hotel_id: hotelId
                                        }

                                        database.insert('hotel_image', dataImageInsert, (error, results) => {
                                            if (error) httpMsg.status422(request, response, error);
                                        });
                                    }

                                    var data = {
                                        message: 'create success'
                                    }

                                    httpMsg.status200(request, response, data);
                                }
                            });

                        } else throw new Error('Object empty');
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

    index(request, response, endpoint) {
        auth.guard(request, 'USER', (error, results) => {
            if (error) httpMsg.status422(request, response, error);
            else {
                // has access
                if (results.length) {
                    try {
                        if (!endpoint) throw new Error('Empty endpoint');
                        var data = endpoint.split('/');
                        var cityName = data[2];

                        while (cityName.search('%20') != -1) cityName = cityName.replace('%20', ' ');
                        var sql = util.format("SELECT a.`id` as `hotel_id`, a.`name` as `hotel_name`, `city_name`, `description`, `capacity`, b.`url`, c.`name`, c.`price` FROM `hotel` a, `hotel_image` b, `room_type` c WHERE `city_name` = '%s' AND b.`hotel_id` = a.`id` AND c.`hotel_id` = a.`id`", cityName);


                        database.query(sql, (error, results) => {
                            if (error) httpMsg.status422(request, response, error);
                            else {
                                // has data
                                if (results.length) {
                                    var length = results.length;
                                    var dataResult = [];

                                    var preHotelId = 0; // lưu id hotel lần trước
                                    var dataTemp = {
                                        images: [],
                                        room_types: []
                                    };

                                    for (let i = 0; i < length; i++) {

                                        if (preHotelId != results[i].hotel_id) {
                                            preHotelId = results[i].hotel_id;

                                            dataTemp = {
                                                hotel_id: results[i].hotel_id,
                                                hotel_name: results[i].hotel_name,
                                                city_name: results[i].city_name,
                                                description: results[i].description,
                                                capacity: results[i].capacity,
                                                images: [],
                                                room_types: []
                                            }

                                            // Xu ly them vao data result
                                            dataResult.push(dataTemp);
                                        } else {
                                            // Xu ly image
                                            var isExistImage = false;
                                            for (const temp of dataTemp.images) {
                                                if (temp.url === results[i].url) isExistImage = true;
                                            }
                                            if (!isExistImage)
                                                dataTemp.images.push({
                                                    url: results[i].url
                                                });

                                            // Xu ly room_type
                                            var isExistRoomType = false;
                                            for (const temp of dataTemp.room_types) {
                                                if (temp.name === results[i].name) isExistRoomType = true;
                                            }
                                            if (!isExistRoomType)
                                                dataTemp.room_types.push({
                                                    name: results[i].name,
                                                    price: results[i].price
                                                });
                                        }

                                    }
                                    httpMsg.status200(request, response, dataResult);

                                } else {
                                    httpMsg.status200(request, response, {});
                                }
                            }
                        });
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

    book(request, response, requestBody) {
        auth.guard(request, 'USER', (error, results) => {
            if (error) httpMsg.status422(request, response, error);
            else {
                // has access
                if (results.length) {
                    try {
                        if (!requestBody) throw new Error('Input empty');
                        var data = JSON.parse(requestBody);

                        if (data) {
                            var guests = data.guests;

                            // Validate data
                            if (!(helper.isValidDate(data.check_in_date) && helper.isValidDate(data.check_out_date) && helper.isValidInteger(data.total_guests) && helper.isValidInteger(data.total_rooms))) throw new Error('Data invalid');

                            var dataInsert = {
                                check_in_date: data.check_in_date,
                                check_out_date: data.check_out_date,
                                hotel_id: data.hotel_id,
                                total_guests: data.total_guests,
                                total_rooms: data.total_rooms,
                                room_type: data.room_type
                            }

                            database.insert('hotel_book', dataInsert, (error, results) => {
                                if (error) httpMsg.status422(request, response, error);
                                else {
                                    var bookId = results.insertId;
                                    for (const guest of guests) {
                                        var dataGuestInsert = {
                                            first_name: guest.first_name,
                                            last_name: guest.last_name,
                                        }

                                        database.insert('customer', dataGuestInsert, (error, results) => {
                                            if (error) httpMsg.status422(request, response, error);
                                            else {
                                                var guestId = results.insertId;

                                                var dataInsertBookDetail = {
                                                    hotel_book_id: bookId,
                                                    customer_id: guestId
                                                }

                                                database.insert('hotel_book_detail', dataInsertBookDetail, (error, results) => {
                                                    if (error) httpMsg.status422(request, response, error);
                                                })
                                            }
                                        });
                                    }

                                    dataInsert.hotel_book_id = bookId;
                                    dataInsert.guests = guests;
                                    httpMsg.status200(request, response, dataInsert);
                                }
                            });

                        } else throw new Error('Object empty');
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

    update(request, response, requestBody, endpoint) {
        auth.guard(request, 'ADMIN', (error, results) => {
            if (error) httpMsg.status422(request, response, error);
            else {
                // has access
                if (results.length) {
                    try {
                        if (!endpoint) throw new Error('Input not valid');
                        var dataEndpoint = endpoint.split('/');
                        var hotelId = dataEndpoint[2];

                        var sql = util.format("SELECT 1 FROM `hotel` WHERE `id` = %d", hotelId);
                        database.query(sql, (error, results) => {
                            if (results.length) {
                                if (!requestBody) httpMsg.status400(request, response, 'Input invalid');

                                var data = JSON.parse(requestBody);

                                if (data) {
                                    try {
                                        // Validate data
                                        if (data.capacity && !helper.isValidInteger(data.capacity)) throw new Error('Input invalid ');

                                        var dataUpdate = {};
                                        if (data.hotel_name) dataUpdate.name = data.hotel_name;
                                        if (data.city_name) dataUpdate.city_name = data.city_name;
                                        if (data.description) dataUpdate.description = data.description;
                                        if (data.capacity) dataUpdate.capacity = data.capacity;
                                        if (data.room_types) var room_types = data.room_types;
                                        if (data.images) var images = data.images;


                                        var condition = {
                                            id: hotelId
                                        }

                                        var conditionDelete = {
                                            hotel_id: hotelId
                                        }
                                        database.delete('room_type', conditionDelete, (error, results) => {
                                            if (error) httpMsg.status400(request, response, error);
                                        });

                                        database.delete('hotel_image', conditionDelete, (error, results) => {
                                            if (error) httpMsg.status400(request, response, error);
                                        });

                                        for (const room_type of room_types) {
                                            var dataRoomTypeInsert = {
                                                name: room_type.name,
                                                price: room_type.price,
                                                hotel_id: hotelId
                                            }

                                            database.insert('room_type', dataRoomTypeInsert, (error, results) => {
                                                if (error) httpMsg.status400(request, response, error);
                                            });
                                        }

                                        for (const image of images) {
                                            var dataImageInsert = {
                                                url: image.url,
                                                hotel_id: hotelId
                                            }

                                            database.insert('hotel_image', dataImageInsert, (error, results) => {
                                                if (error) httpMsg.status400(request, response, error);
                                            });
                                        }

                                        database.update('hotel', dataUpdate, condition, (error, results) => {
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

                        });
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

    destroy(request, response, endpoint) {
        auth.guard(request, 'ADMIN', (error, results) => {
            if (error) httpMsg.status400(request, response, error);
            else {
                // has access
                if (results.length) {
                    try {
                        if (!endpoint) throw new Error('Input invalid');
                        var dataEndpoint = endpoint.split('/');
                        var hotelId = dataEndpoint[2];

                        var sql = util.format("SELECT 1 FROM `hotel` WHERE `id` = '%s'", hotelId);
                        database.query(sql, (error, results) => {
                            if (results.length) {
                                var condition = {
                                    id: hotelId
                                }
                                var conditionDelete = {
                                    hotel_id: hotelId
                                }
                                database.delete('room_type', conditionDelete, (error, results) => {
                                    if (error) httpMsg.status400(request, response, error);
                                });

                                database.delete('hotel_image', conditionDelete, (error, results) => {
                                    if (error) httpMsg.status400(request, response, error);
                                });
                                
                                database.delete('hotel', condition, (error, results) => {
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

module.exports = HotelController;