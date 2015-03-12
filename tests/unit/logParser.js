var assert = require('assert');
var LogParser = require("../../lib/LogParser");

test("A log can be parsed and the logParsed stats is incrimented", function(done) {

	fakeIncrimentStats = {};
	fakeTimingStats = {};

	var logParser = new LogParser(new FakeStatsD());
	logParser.parse("");

	assert.equal(fakeIncrimentStats['logsParsed'], 1);
	assert.equal(fakeTimingStats['app.url.here.serviceTime'], undefined);
	done();
});


test("Given a 200 request, save the request of the service time", function(done) {

	fakeIncrimentStats = {};
	fakeTimingStats = {};

	var logParser = new LogParser(new FakeStatsD());

	var log = "243 <158>1 2015-01-05T14:49:04.214912+00:00 host heroku router - at=info method=GET path=\"/\" host=app.url.here request_id=123456789-987654322 fwd=\"1.2.3.4\" dyno=web.1 connect=1ms service=23ms status=200 bytes=290";

	logParser.parse(log);

	assert.equal(fakeIncrimentStats['app.url.here.status.2xx'], 1);
	assert.equal(fakeTimingStats['app.url.here.serviceTime'], 23);

	done();
});


test("Given a 200 request from a different host, save the request of the service time", function(done) {

	fakeIncrimentStats = {};
	fakeTimingStats = {};

	var logParser = new LogParser(new FakeStatsD());

	var log = "243 <158>1 2015-01-05T14:49:04.214912+00:00 host heroku router - at=info method=GET path=\"/\" host=i.bristlr.com request_id=123456789-987654322 fwd=\"1.2.3.4\" dyno=web.1 connect=1ms service=23ms status=200 bytes=290";

	logParser.parse(log);

	assert.equal(fakeIncrimentStats['i.bristlr.com.status.2xx'], 1);
	assert.equal(fakeTimingStats['i.bristlr.com.serviceTime'], 23);

	done();
});



test("Given a 500 request, save the request of the service time", function(done) {

	fakeIncrimentStats = {};
	fakeTimingStats = {};

	var logParser = new LogParser(new FakeStatsD());

	var log = "243 <158>1 2015-01-05T14:49:04.214912+00:00 host heroku router - at=info method=GET path=\"/\" host=app.url.here request_id=123456789-987654322 fwd=\"1.2.3.4\" dyno=web.1 connect=1ms service=30000ms status=500 bytes=290";

	logParser.parse(log);

	assert.equal(fakeIncrimentStats['app.url.here.status.500'], 1);
	assert.equal(fakeTimingStats['app.url.here.serviceTime'], 30000);

	done();
});

test("Given a 503 request, save the request of the service time", function(done) {

	fakeIncrimentStats = {};
	fakeTimingStats = {};

	var logParser = new LogParser(new FakeStatsD());

	var log = "243 <158>1 2015-01-05T14:49:04.214912+00:00 host heroku router - at=info method=GET path=\"/\" host=app.url.here request_id=123456789-987654322 fwd=\"1.2.3.4\" dyno=web.1 connect=1ms service=400ms status=503 bytes=290";

	logParser.parse(log);

	assert.equal(fakeIncrimentStats['app.url.here.status.5xx'], 1);
	assert.equal(fakeTimingStats['app.url.here.serviceTime'], 400);

	done();
});

test("Given a 503 request occurs and is a Request Interruption from the client side, we dont care", function(done) {

	fakeIncrimentStats = {};
	fakeTimingStats = {};

	var logParser = new LogParser(new FakeStatsD());

	var log = "243 <158>1 2015-01-07T14:11:50.006739+00:00 heroku router - - sock=client at=error code=H18 desc=\"Request Interrupted\" method=GET path=\"/\" host=app.url.here request_id=123456789-0987654321 fwd=\"1.2.3.4\" dyno=web.2 connect=4ms service=1245ms status=503 bytes=13340";

	logParser.parse(log);

	assert.equal(fakeIncrimentStats['app.url.here.status.5xx'], undefined);
	assert.equal(fakeTimingStats['app.url.here.serviceTime'], undefined);
	assert.equal(fakeIncrimentStats['app.url.here.HerokuError.H18'], 1);

	done();
});

test("Given a custom count metric, incriment accordingly", function(done) {

	fakeIncrimentStats = {};
	fakeTimingStats = {};

	var logParser = new LogParser(new FakeStatsD());

	var log = "243 <158>1 count#this.is.to.be.counted=1";

	logParser.parse(log);

	assert.equal(fakeIncrimentStats['this.is.to.be.counted'], 1);

	done();
});

test("Given a custom measure metric in ms, incriment accordingly", function(done) {

	fakeIncrimentStats = {};
	fakeTimingStats = {};

	var logParser = new LogParser(new FakeStatsD());

	var log = "243 <158>1 measure#this.is.to.be.measured=45ms";

	logParser.parse(log);

	assert.equal(fakeTimingStats['this.is.to.be.measured'], 45);

	done();
});

test("Given a custom measure metric in units, incriment accordingly", function(done) {

	fakeIncrimentStats = {};
	fakeTimingStats = {};

	var logParser = new LogParser(new FakeStatsD());

	var log = "17:35:23.826 2015-01-04 17:35:23.533869+00:00 app web.2 - - measure#memwatchweb.2.min=19387856";

	logParser.parse(log);

	assert.equal(fakeTimingStats['memwatchweb.2.min'], 19387856);

	done();
});


var fakeIncrimentStats = {},
	fakeTimingStats = {};

var FakeStatsD = function() {
	
	function increment(stat) {
		if (!fakeIncrimentStats[stat]) {
			fakeIncrimentStats[stat] = 0;
		}

		fakeIncrimentStats[stat]++;
	}
	
	function timing(stat, value) {
		if (!fakeTimingStats[stat]) {
			fakeTimingStats[stat] = 0;
		}

		fakeTimingStats[stat] = value;
	}

	return {
		increment: increment,
		timing: timing
	};
};