var http = require('http');
var url = require('url');

var config = require('../config');
var httpMsg = require('./httpMsg');

var AuthController = require('../controller/auth').Auth;
var AirlineController = require('../controller/airline');
var HotelController = require('../controller/hotel');
var TransactionController = require('../controller/transaction');

http.createServer((request, response) => {
    // Get version api
    var prefix = request.url.split('/')[1];

    // Pattern for get endpoint
    var patternGetVersion = /^\/v[0-9]+/ig;
    var endpoint;
    if (patternGetVersion.test(request.url)) {
        endpoint = request.url.slice(patternGetVersion.lastIndex);

        // If url has params
        var patternEndPoint = /^\/[^\?]+/ig;
        if (patternEndPoint.test(endpoint)) {
            endpoint = endpoint.slice(0, patternEndPoint.lastIndex);
        }
    }



    // Version 1
    if (prefix === 'v1') {
        // Object Initialization
        var auth = new AuthController();
        var airline = new AirlineController();
        var hotel = new HotelController();
        var transaction = new TransactionController();

        // Check method request
        switch (request.method) {
            case 'GET':
                if (endpoint === '/' || endpoint === '') {
                    response.end();
                } else if (endpoint === '/auth/logout') {
                    auth.logout(request, response);
                } else if (endpoint.match(/^\/flight(\/[^\?]*){3}/)) {
                    airline.indexFlight(request, response, endpoint);
                } else if (endpoint.match(/^\/hotel\/[^\?]+/)) {
                    hotel.index(request, response, endpoint);
                } else
                    httpMsg.status404(request, response);
                break;
            case 'POST':
                var requestBody = '';
                if (endpoint === '/auth/login') {
                    request.on('data', (data) => {
                        requestBody += data;
                    });

                    request.on('end', () => {
                        auth.login(request, response, requestBody);
                    });
                } else if (endpoint === '/airline') {
                    request.on('data', (data) => {
                        requestBody += data;
                    });

                    request.on('end', () => {
                        airline.storeAirlineCompany(request, response, requestBody);
                    });

                } else if (endpoint === '/flight') {
                    request.on('data', (data) => {
                        requestBody += data;
                    });

                    request.on('end', () => {
                        airline.storeAirlineFlight(request, response, requestBody);
                    });

                } else if (endpoint === '/flight-book') {
                    request.on('data', (data) => {
                        requestBody += data;
                    });

                    request.on('end', () => {
                        airline.bookFlight(request, response, requestBody);
                    });

                } else if (endpoint === '/hotel') {
                    request.on('data', (data) => {
                        requestBody += data;
                    });

                    request.on('end', () => {
                        hotel.store(request, response, requestBody);
                    });

                } else if (endpoint === '/hotel-book') {
                    request.on('data', (data) => {
                        requestBody += data;
                    });

                    request.on('end', () => {
                        hotel.book(request, response, requestBody);
                    });

                } else if (endpoint === '/transaction') {
                    request.on('data', (data) => {
                        requestBody += data;
                    });

                    request.on('end', () => {
                        transaction.store(request, response, requestBody);
                    });

                } else httpMsg.status404(request, response);
                break;
            case 'PUT':
                var requestBody = '';
                if (endpoint.match(/^\/flight\/[^\?]+/)) {
                    request.on('data', (data) => {
                        requestBody += data;
                    });
                    request.on('end', () => {
                        airline.updateFlight(request, response, endpoint, requestBody);
                    });

                } else if (endpoint.match(/^\/hotel\/[^\?]+/)) {
                    request.on('data', (data) => {
                        requestBody += data;
                    });
                    request.on('end', () => {
                        hotel.update(request, response, requestBody, endpoint);
                    });

                } else httpMsg.status404(request, response);
                break;
            case 'DELETE':
                if (endpoint.match(/^\/flight\/[^\?]+/)) {
                    airline.destroyFlight(request, response, endpoint);
                } else if (endpoint.match(/^\/hotel\/[^\?]+/)) {
                    hotel.destroy(request, response, endpoint);
                } else httpMsg.status404(request, response);
                break;
            default:
                httpMsg.status405(request, response);;
        }
    }

}).listen(config.webPort, () => {
    console.log('Started listening at: ' + config.webPort);
})