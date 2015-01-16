var request = require('request');
var trickle = require('timetrickle');
var through2 = require('through2');
var extend = require('object-assign');

exports = module.exports = eztvapi;

var defaults = {
	apiUrl: 'http://eztvapi.re',
	apiLimitRequests: 1,
	apiLimitInterval: 1000
};

function eztvapi (options) {

	options = extend({}, defaults, options);

	var limit = trickle(options.apiLimitRequests, options.apiLimitInterval);

	function limitedRequest (uri, callback) {
		limit(function makeRequest () {
			request({
				uri: uri,
				json: true

			}, function (err, response, body) {
				if (err) { return callback(err); }
				if (response.statusCode !== 200) { return callback(new Error('Request failed')); }
				if (!body) { return callback(new Error('No content')); }
				if (Array.isArray(body) && !body.length) { return callback(new Error('Empty')); }

				callback(null, body);
			});
		});
	}

	return {

		getShows: function (page, callback) {
			page = page || 1;
			var uri = options.apiUrl + '/shows/' + page;
			limitedRequest(uri, callback);
		},

		getShow: function (showId, callback) {
			var uri = options.apiUrl + '/show/' + showId;
			limitedRequest(uri, callback);
		},

		createShowsStream: function () {
			var self = this;

			var stream = through2.obj(function (chunk, enc, next) {
				this.push(chunk);
				next();
			});

			var currentPage = 1;

			function fetchShows () {
				self.getShows(currentPage, function (err, shows) {
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
		}

	};
}
