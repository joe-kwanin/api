/*
* Primary file for the API
*/

// Dependencies
const url = require('url');
const http = require('http');
const https = require('https');
const stringDecoder = require('string_decoder').StringDecoder;
const fs = require('fs');
let config = require('./lib/cong');
let _data = require('./lib/data');
let handlers = require('./lib/handlers');
let helpers = require('./lib/helpers');

// TESTING
// @TODO delete thiss
//_data.delete('test','newFile',function(err){
//    console.log('This was the error ', err);
//});

// instatiate http server 
let httpserver = http.createServer(function(req, res){
    unifiedServer(req, res)
   });

// Start the Server, and have it listen on port 3000
httpserver.listen(config.httpPort, function(){
   console.log("The server is listening on port "+config.httpPort+" in "+config.envName+" mode"); 
});

httpsServerOptions = {
    'key':fs.readFileSync('./https/key.pem'),
    'cert':fs.readFileSync('./https/cert.pem')
};
// instatiate https server 
let httpsserver = http.createServer(httpsServerOptions, function(req, res){
    unifiedServer(req, res)
   });

// Start the Server, and have it listen on port 3000
httpsserver.listen(config.httpsPort, function(){
   console.log("The server is listening on port "+config.httpsPort+" in "+config.envName+" mode"); 
});

// All the server logic for both http and https
let unifiedServer = function(req, res){
    // Get the URL and parse it
    let parsedUrl = url.parse(req.url, true);
    
    // Get path
    let path = parsedUrl.pathname;
    let trimmedPath = path.replace(/^\/+|\/+$/g,'');
    
    // Get the Http method
    let method = req.method.toLowerCase();

    // Get the query string as an object
    let queryStringObject = parsedUrl.query;

    // Get the headers as an object
    let headers = req.headers;

    // Get the payload, if any
    let decoder = new stringDecoder('utf-8');
    let buffer = '';
    req.on('data', function(data){
        buffer += decoder.write(data);
    });
    req.on('end', function(){
        buffer += decoder.end();

        // choose the handler the request should go to
        let chosenHandler = typeof(router[trimmedPath]) !== 'undefined' ? router[trimmedPath] : handlers.notFound;

        // construct the data object to send to the handler
        let data = {
            'trimmedPath' : trimmedPath,
            'queryStringObject': queryStringObject,
            'method': method,
            'headers': headers,
            'payload': helpers.parsedJSONtoObject(buffer)
        }

        // route the request to the handler specified in the router
        chosenHandler(data, function(statusCode, payload){
            // Use the status code called back by the handler or default 200
            statusCode = typeof(statusCode) == 'number' ? statusCode : 200;

            // Use the payload called back by the handler or default
            payload = typeof(payload) == 'object' ? payload : {};

            // Convert payload to a string
            let payloadString = JSON.stringify(payload);

            // return a response
            res.setHeader('Content-Type', 'applicatio/json');
            res.writeHead(statusCode);
            res.end(payloadString);

             // Log the request path
         console.log('request received with these payloads: ',payloadString);
         console.log('request received with status code: ',statusCode);
        });

         // Send the response
         

        
    });


};


//Router that can incoming requests to their handlers 
let router = {
    'sample': handlers.sample,
    'ping': handlers.ping,
    'users': handlers.users,
    'tokens': handlers.tokens
}