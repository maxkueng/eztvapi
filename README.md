eztvapi
=======

A client for the [Popcorn TV Shows API][popcornapi] (eztvapi.re).

## Installation

```sh
npm install eztvapi --save
```

## API

To see what the result of each function looks like check out the [Popcorn API dosc][popcornapi-docs].

### eztvapi([options])

Create a new object instance of the API client.

The client has build-in rate limiting functionality. By default it limits API calls to one request per second. You can change it by passing it the right options.

```js
var eztvapi = require('eztvapi');

var eztv = eztvapi({
  apiLimitRequests: 10,    // 10 requests
  apiLimitInterval: 60000  // per minute
});
```

#### `options`

 - `apiUrl` *(optional; default: eztvapi.re)*: The base URL of the API.
 - `apiLimitRequests` *(optional; default: 1)*: The maximum number of requests per a given interval.
 - `apiLimitInterval` *(optional; default: 1000)*: The duration in milliseconds

### eztv.getShows(page, callback)

Get a list of TV shows (paginated, 50 per page).

```js
var eztv = require('eztvapi')();
var page = 1;

eztv.getShows(page, function (err, shows) {
  if (err) { return console.log('No such page or something went wrong'); }

  console.log(shows);
});
```

### stream = eztv.createShowsStream()

Create a stream that emits every show.

```js
var eztv = require('eztvapi')();

var stream = eztv.createShowsStream();

stream.on('data', function (show) {
  console.log(show);
});

stream.on('end', function () {
  console.log('All done');
});

```

### eztv.getShow(imdb_id, callback)

Get information about a show including episodes and seasons by its IMDB ID (`imdb_id`).

```js
var eztv = require('eztvapi')();
var imdbId = 'tt0944947';

eztv.getShow(imdbId, function (err, show) {
  if (err) { return console.log('No such show or something'); }

  console.log(show.title);
  // Game of Thrones
});

```

## License

MIT


[popcornapi]: https://github.com/popcorn-official/popcorn-api
[popcornapi-docs]: https://github.com/popcorn-official/popcorn-api/blob/master/README.md
