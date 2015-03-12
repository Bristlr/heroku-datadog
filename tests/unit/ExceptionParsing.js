var assert = require('assert');
var LogParser = require("../../lib/LogParser");

test("Given an exception happens, record the event", function(done) {

	fakeIncrimentStats = {};
	fakeTimingStats = {};

	var logParser = new LogParser(new FakeStatsD());

	var log = "243 <158>1 19:11:53.748 2015-01-18 19:11:53.448561+00:00 app web.11 - - NetworkingError: Can't set headers after they are sent. at ClientRequest.OutgoingMessage.setHeader (http.js:690:11) at Object.wrappedRequest (/app/node_modules/newrelic/lib/instrumentation/core/http.js:262:21) at Object.<anonymous> (/app/node_modules/newrelic/node_modules/continuation-local-storage/context.js:74:17) at Object.wrapSegmentInvocation [as request] (/app/node_modules/newrelic/lib/transaction/tracer/index.js:259:63) at handleRequest (/app/node_modules/aws-sdk/lib/http/node.js:43:23) at executeSend (/app/node_modules/aws-sdk/lib/event_listeners.js:213:29) at Request.SEND (/app/node_modules/aws-sdk/lib/event_listeners.js:228:9) at Request.callListeners (/app/node_modules/aws-sdk/lib/sequential_executor.js:97:18) at Request.emit (/app/node_modules/aws-sdk/lib/sequential_executor.js:77:10) at Request.emit (/app/node_modules/aws-sdk/lib/request.js:604:14) Exception Context";

	logParser.parse(log);

	assert.equal(fakeIncrimentStats['Exception'], 1);
	assert.equal(fakeIncrimentStats['Exception.NetworkingError'], 1);

	done();
});

test("Given an exception happens, record the event", function(done) {

	fakeIncrimentStats = {};
	fakeTimingStats = {};

	var logParser = new LogParser(new FakeStatsD());

	var log = "243 <158>1 19:11:53.748 2015-01-18 19:11:53.448561+00:00 app web.1 - - TypeError: Cannot read property '1' of null ";

	logParser.parse(log);

	assert.equal(fakeIncrimentStats['Exception'], 1);
	assert.equal(fakeIncrimentStats['Exception.TypeError'], 1);

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