module.exports.status404 = (request, response) => {
    response.writeHead(404, {
        'Content-Type': 'application/json'
    });
    response.write('Resource not found');
    response.end();
}

module.exports.status405 = (request, response) => {
    response.writeHead(405, {
        'Content-Type': 'application/json'
    });
    response.write('Method not supported');
    response.end();
}

module.exports.status401 = (request, response, error) => {
    response.writeHead(401, {
        'Content-Type': 'application/json'
    });
    response.write(JSON.stringify({
        Message: 'Unauthorized user'
    }));
    response.end();
}

module.exports.status422 = (request, response, error) => {
    response.writeHead(422, {
        'Content-Type': 'application/json'
    });
    response.write(JSON.stringify({
        Message: 'Data cannot be processed ' + error
    }));
    response.end();
}

module.exports.status400 = (request, response, error) => {
    response.writeHead(400, {
        'Content-Type': 'application/json'
    });

    if (request.method === 'PUT') {
        response.write(JSON.stringify({
            Message: 'Data cannot be updated ' + error
        }));
    } else if (request.method === 'DELETE') {
        response.write(JSON.stringify({
            Message: 'Data cannot be deleted ' + error
        }));
    }
    response.end();
}

module.exports.status200 = (request, response, data) => {
    response.writeHead(200, {
        'Content-Type': 'application/json'
    });
    response.write(JSON.stringify(data));
    response.end();
}