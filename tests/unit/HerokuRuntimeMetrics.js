var assert = require('assert');
var LogParser = require("../../lib/LogParser");


test("Given a load average, save it", function(done) {

	fakeIncrimentStats = {};
	fakeTimingStats = {};

	var logParser = new LogParser(new FakeStatsD());

	var log = "source=web.1 dyno=heroku.2808254.1234-1234-1234-1234 sample#load_avg_1m=2.46 sample#load_avg_5m=1.06 sample#load_avg_15m=0.99";
	logParser.parse(log);

	assert.equal(fakeTimingStats['web.1.load_avg_1m'], 2.46);

	done();
});

test("Given a load average, save it", function(done) {

	fakeIncrimentStats = {};
	fakeTimingStats = {};

	var logParser = new LogParser(new FakeStatsD());

	var log = "source=web.9 dyno=heroku.30579139.1234-1234-1234-1234 sample#load_avg_1m=0.08 sample#load_avg_5m=0.08";
	logParser.parse(log);

	assert.equal(fakeTimingStats['web.9.load_avg_1m'], 0.08);

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