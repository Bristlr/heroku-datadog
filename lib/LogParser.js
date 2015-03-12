var StatsD = require('node-dogstatsd').StatsD;
var statsD = new StatsD('localhost', 8125);

module.exports = function(injectedStatsD) {

	var dogStatsD = injectedStatsD || statsD;

	function parse(log) {
		parseStatus(log);
		parseException(log);
		parseCount(log);
		parseMeasure(log);
		parseHerokuError(log);
		parseRuntimeLoad(log);

		dogStatsD.increment('logsParsed');
	}

	function parseStatus(log) {
		var statusMatch = log.match(/status=([0-9]*)/);

		if (statusMatch) {

			var status = statusMatch[1];

			if ((status == "503") && (log.indexOf("code=H18") > -1) && (log.indexOf("sock=client") > -1)) {
				return;
			}

			if (status != "500") {
				status = status.charAt(0) + "xx";
			}

			var service = 0;
			if (log.match(/service=([0-9]*)ms/)) service = Number(log.match(/service=([0-9]*)ms/)[1]);

			var host = "";
			if (log.match(/host=([a-zA-Z\.]*)/)) host = log.match(/host=([a-zA-Z\.]*)/)[1];

			dogStatsD.timing(host + '.serviceTime', service);
			dogStatsD.increment(host + '.status.' + status);

		}
	}

	function parseCount(log) {
		var countMatch = log.match(/count#([a-zA-Z0-9\.]*)=([0-9]*)/);

		if (countMatch) {
			dogStatsD.increment(countMatch[1]);
		}
	}

	function parseMeasure(log) {
		var measureMatch = log.match(/measure#([a-zA-Z0-9\.]*)=([0-9]*)/);

		if (measureMatch) {
			dogStatsD.timing(measureMatch[1], measureMatch[2]);
		}
	}

	function parseException(log) {
		var measureMatch = log.match(/Error: /);

		if (measureMatch) {

			var exceptionType = "Unknown";
			if (log.match(/ - ([a-zA-Z]*):/)) exceptionType = log.match(/ - ([a-zA-Z]*):/)[1];

			dogStatsD.increment("Exception");
			dogStatsD.increment("Exception." + exceptionType);
			console.log("Error: ", log);
		}
	}

	function parseHerokuError(log) {
		var herokuErrorMatch = log.match(/at=error/);

		if (herokuErrorMatch) {

			var errorCode = "xx";
			if (log.match(/code=H([0-9]*)/)) errorCode = Number(log.match(/code=H([0-9]*)/)[1]);

			var host = "";
			if (log.match(/host=([a-zA-Z\.]*)/)) host = log.match(/host=([a-zA-Z\.]*)/)[1];

			dogStatsD.increment(host + ".HerokuError.H" + errorCode);


			// We don't care about client-side socket hangups
			if ((log.indexOf("code=H18") > -1) && (log.indexOf("sock=client") > -1)) {
				return;
			}
			console.log("Heroku Error: ", log);

		}
	}



	function parseRuntimeLoad(log) {
		var measureMatch = log.match(/sample#load_avg_1m=([0-9\.]*)/);

		if (measureMatch) {

			var dynoNumber = log.match(/source=web.([0-9]*)/)[1];

			dogStatsD.timing("web." + dynoNumber + ".load_avg_1m", measureMatch[1]);
		}
	}

	return {
		parse: parse
	};
};