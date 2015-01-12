eztvapi
=======

A client for the [Popcorn TV Shows API][popcornapi] (eztvapi.re).

## Installation

```sh
npm install eztvapi --save
```

## Usage

### Global settings

The client has build-in rate limiting functionality. By default it limits API calls to one request per second. You can change it by altering the exposed settings.

Change it to 10 requests per minute, for example:

```js
var eztv = require('eztvapi');

eztv.API_LIMIT_REQUESTS = 10;    // 10 requests
eztv.API_LIMIT_INTERVAL = 60000; // per 60000 milliseconds (1 minute)
```

### Get TV Shows

Get a list of TV shows (paginated, 50 per page).

```js
var eztv = require('eztvapi');
var page = 1;

eztv.getShows(page, function (err, shows) {
  if (err) { return console.log('No such page or something went wrong'); }

  console.log(shows);
});
```

### Get a Stream of All TV Shows

Create a stream that emits every show.

```js
var eztv = require('eztvapi');

var stream = eztv.createShowsStream();

stream.on('data', function (show) {
  console.log(show);
});

stream.on('end', function () {
  console.log('All done');
});

```

### Get Information about a Show

Get information about a show including episodes and seasons by its IMDB ID (`imdb_id`).

```js
var eztv = require('eztvapi');
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
