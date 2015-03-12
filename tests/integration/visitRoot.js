/*jshint expr: true*/
var expect = require('chai').expect,
	assert = require('assert'),
	Browser = require('zombie');

require('chai').should();

var browser = new Browser({
	site: "http://localhost:3000"
});

describe('Given I visit the root', function(done) {
	it("I get a 401 because I have not used the right username and password", function(done) {
		browser.visit("/", function() {
			expect(browser.statusCode).to.equal(401);
			done();
		});
	});
});

describe('Given I visit the root with the username and password', function(done) {
	it("I get a 200 and everything is fine", function() {
		browser.authenticate().basic("username", "password");
		browser.visit("/", function() {
			expect(browser.statusCode).to.equal(200);

		});
	});
});