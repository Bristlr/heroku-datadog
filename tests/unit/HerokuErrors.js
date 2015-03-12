var assert = require('assert');
var LogParser = require("../../lib/LogParser");


test("Given an H12 heroku error happens, log accordingly", function(done) {

	fakeIncrimentStats = {};
	fakeTimingStats = {};

	var logParser = new LogParser(new FakeStatsD());

	var log = "18:32:10.510 2015-01-04 18:32:10.006047+00:00 heroku router - - at=error code=H12 desc=\"Request timeout\" method=GET path=\"/\" host=app.name.here request_id=1234-1234-1234-1234 fwd=\"1.2.3.4\" dyno=web.4 connect=1ms service=30000ms status=503 bytes=0";
	logParser.parse(log);

	assert.equal(fakeIncrimentStats['app.name.here.HerokuError.H12'], 1);

	done();
});

test("Given an H10 heroku error occurs, log accordingly", function(done) {

	fakeIncrimentStats = {};
	fakeTimingStats = {};

	var logParser = new LogParser(new FakeStatsD());

	var log = "18:54:07.149 2015-01-18 18:54:06.583283+00:00 heroku router - - at=error code=H10 desc=\"App crashed\" method=GET path=\"/\" host=app.name.here request_id=1234-1234-1234-1234 fwd=\"1.2.3.4\" dyno= connect= service= status=503 bytes=";
	logParser.parse(log);

	assert.equal(fakeIncrimentStats['app.name.here.HerokuError.H10'], 1);

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