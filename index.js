var request = require('request');
var trickle = require('timetrickle');
var through2 = require('through2');

exports.API_URL = 'http://eztvapi.re';
exports.API_LIMIT_REQUESTS = 1;
exports.API_LIMIT_INTERVAL = 1000;

var limit = trickle(exports.API_LIMIT_REQUESTS, exports.API_LIMIT_INTERVAL);

function limitedRequest (uri, callback) {
	limit(function makeRequest () {
		request({
			uri: uri,
			json: true

		}, function (err, response, body) {
			if (err) { return callback(err); }
			if (response.statusCode !== 200) { return callback(new Error('Request failed')); }
			if (!body) { return callback(new Error('No content')); }

			callback(null, body);
		});
	});
}

exports.getShows = function (page, callback) {
	page = page || 1;
	var uri = exports.API_URL + '/shows/' + page;
	limitedRequest(uri, callback);
};

exports.getShow = function (showId, callback) {
	var uri = exports.API_URL + '/show/' + showId;
	limitedRequest(uri, callback);
};

exports.createShowsStream = function () {
	var stream = through2.obj(function (chunk, enc, next) {
		this.push(chunk);
		next();
	});

	var currentPage = 1;

	function fetchShows () {
		exports.getShows(currentPage, function (err, shows) {
			currentPage += 1;

			if (err) {
				return stream.end();
			}

			shows.forEach(function (show) {
				stream.write(show);
			});

			fetchShows();
		});
	}

	fetchShows();

	return stream;
};
