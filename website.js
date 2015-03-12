console.log("Starting Log monitor");

// Express
console.log("Express starting");
var express = require("express"),
	app = express(),
	auth = require('basic-auth');

app.use(function(req, res, next) {
	var user = auth(req);

	if (user === undefined || user['name'] !== process.env.BASIC_AUTH_USERNAME || user['pass'] !== process.env.BASIC_AUTH_PASSWORD) {
		res.statusCode = 401;
		res.setHeader('WWW-Authenticate', 'Basic realm="MyRealmName"');
		res.end('Unauthorized');
	} else {
		next();
	}
});

// custom body parser
app.use(function(req, res, next) {
	var data = "";
	req.on('data', function(chunk) {
		data += chunk
	})
	req.on('end', function() {
		req.body = data;
		next();
	});
});

// An end point so you can make sure the server is ok
app.get('/', function(request, response) {
	response.send("Hello");
});

// An end point to actually send logs to
var LogParser = require("./lib/LogParser");
var logParser = new LogParser();

app.post('/logs', function(request, response) {
	response.send(200);
	
	if (request.get('content-type') == 'application/logplex-1') {

		var logArray = request.body.split("\n");
		logArray.pop();
		logArray.forEach(logParser.parse);

	} else {
		console.log("Not Logplex");
	}
});


// Start the server
console.log("Starting the server");
var port = process.env.PORT || 3000;
app.listen(port, function() {
	console.log("Listening on " + port);
});