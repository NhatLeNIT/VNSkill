var util = require('util');
var url = require('url');

var database = require('../core/db');
var httpMsg = require('../core/httpMsg');
var helper = require('../core/helper');
var auth = require('./auth');

class TransactionController {

    store(request, response, requestBody) {
        auth.guard(request, 'ADMIN', (error, results) => {
            if (error) httpMsg.status422(request, response, error);
            else {
                // has access
                if (results.length) {
                    try {
                        if (!requestBody) throw new Error('Input invalid');
                        var data = JSON.parse(requestBody);

                        if (!helper.isValidEmail(data.email)) throw new Error('Input invalid');

                        if (data) {
                            var dataInsert = {
                                title: data.title,
                                first_name: data.first_name,
                                last_name: data.last_name,
                                email: data.email,
                                phone: data.phone,
                                payment_method: data.payment_method
                            }

                            if (data.payment_method === 'credit card') {
                                dataInsert.card_name = data.card_name,
                                    dataInsert.card_number = data.card_number,
                                    dataInsert.ccv = data.ccv
                            }

                            database.insert('transaction', dataInsert, (error, results) => {
                                if (error) httpMsg.status422(request, response, error);
                                else {
                                    var data = {
                                        transaction_id: results.insertId,
                                        payment_status: 'create success'
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
}

module.exports = TransactionController;