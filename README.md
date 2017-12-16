eztvapi
=======

[![Build Status](https://travis-ci.org/maxkueng/eztvapi.svg)](https://travis-ci.org/maxkueng/eztvapi)
[![Codebeat badge](https://codebeat.co/badges/89f4273a-fd98-46cb-a2ff-59f8ce2dc03c)](https://codebeat.co/projects/github-com-maxkueng-eztvapi-master)
[![Codacy Badge](https://api.codacy.com/project/badge/Grade/9906a56a9c5c4825af2e26bb1f88e384)](https://www.codacy.com/app/maxkueng/eztvapi?utm_source=github.com&amp;utm_medium=referral&amp;utm_content=maxkueng/eztvapi&amp;utm_campaign=Badge_Grade)
[![Maintainability](https://api.codeclimate.com/v1/badges/1c3e73fc1b904ad5f298/maintainability)](https://codeclimate.com/github/maxkueng/eztvapi/maintainability)
[![Coverage Status](https://coveralls.io/repos/maxkueng/eztvapi/badge.svg?branch=master&service=github)](https://coveralls.io/github/maxkueng/eztvapi?branch=master)

A Node.js client for the [Popcorn API][popcornapi-docs] used in PopcornTime.

 - [Features](#features)
 - [Installation](#installation)
 - [Example](#example)
 - [Documentation](#documentation)
   - [Types](#types)
   - [API](#api)
 - [License](#license)

## Features

 - Promise-based API
 - Built-in rate limiting
 - Flow typed
 - Easy to use

## Installation

```sh
npm install --save eztvapi
```

## Example

Here's an example how to fetch all the shows with all the episodes.

```js
import * as eztvapi from 'eztvapi';

const client = eztvapi.createClient();

async function getAllShows() {
  let allShows = [];
  async function fetchShows(page) {
    const shows = await client.getShows(page);
    allShows = [
      ...allShows,
      ...shows,
    ];

    if (!shows.length) {
      return allShows;
    }

    return fetchShows(page + 1);
  }

  const shows = await fetchShows(1);
  return Promise.all(shows.map(show => client.getShow(show.id)));
}

const shows = await getAllShows();

```

## Documentation

### Types

#### ShowStatus

```
ShowStatus = 'returning_series' | 'in_production' | 'planned' | 'canceled' | 'ended' | 'unknown';
```

#### ShowRating

```
ShowRating = {
  percentage: number;
  watching: number;
  votes: number;
  loved: number;
  hated: number;
};
```

#### ShowImageSet

```
ShowImageSet = {
  poster: ?string;
  fanart: ?string;
  banner: ?string;
};
```

#### Torrent

```
Torrent = {
  provider: ?string;
  peers: number;
  seeds: number;
  url: ?string;
};
```

#### Torrents

```
Torrents = { [key: string]: Torrent };
```

#### Episode

```
Episode = {
  tvdbId: ?string;
  title: ?string;
  episode: number;
  season: number;
  firstAired: ?Date;
  dateBased: boolean;
  overview: ?string;
  torrents: ?Torrents;
};
```

#### ShowStub

```
ShowStub = {
  id: string;
  imdbId: ?string;
  tvdbId: ?string;
  title: string;
  slug: string;
  year: ?number;
  seasons: ?number;
  images: ShowImageSet;
  rating: ?ShowRating;
};
```

#### Show

```
Show = {
  id: string;
  imdbId: ?string;
  tvdbId: ?string;
  title: string;
  slug: string;
  year: ?number;
  synopsis: ?string;
  runtime: ?number;
  country: ?string;
  network: ?string;
  airDay: ?string;
  airTime: ?string;
  status: ShowStatus;
  seasons: ?number;
  lastUpdated: ?Date;
  episodes: Array<Episode>;
  genres: Array<string>;
  images: ShowImageSet;
  rating: ?ShowRating;
};
```

#### EztvApiClient

```
EztvApiClient = {
  getShows: (pageNumber?: number) => Promise<Array<ShowStub>>;
  getShow: (id: string) => Promise<?Show>;
};
```

#### EztvApiClientOptions

```
EztvApiClientOptions = {
  endpoint?: string;
  rateLimitRequests?: number;
  rateLimitInterval?: number;
};
```

### API

#### client = eztvapi.createClient(options?: [EztvApiClientOptions](#eztvapioptions)): [EztvApiClient](#eztvapiclient)

Create a new API client.

**Arguments**

 - **`options`**
   - `endpoint` _(string; optional; default: https://api-fetch.website/tv)_: HTTP or HTTPS endpoint of the API
   - `rateLimitRequests` _(number; optional; default: 1)_ Rate limit number of requests per interval
   - `rateLimitInterval` _(number; optional; default: 1000)_ Rate limit interval

**Returns**

Returns a new [EztvApiClient](#eztvapiclient) instance.

**Example**

```js
// client with 1000 requests per minute rate limit
const client = eztvapi.createClient({
  rateLimitRequests: 1000,
  rateLimitInterval: 60 * 1000,
});
```

#### shows = await client.getShows(pageNumber?: number): Promise<Array<[ShowStub](#showstub)>>

**Arguments**

 - `pageNumber` _(number; optional; default: 1)_: Number of the requested page

**Returns**

A `Promise` that resolves with an array of [ShowStub](#showstub). Note that if
the there are no entries on a given page it will return an empty array and not
throw.

**Example**

```js
const shows = await client.getShows(6);
console.log(shows.map(show => show.title));
```

#### show = await client.getShow(id: string): Promise<?[Show](#show)>

Get detailed information about a TV show including the list of episodes and
magnet links.

**Arguments**

 - `id` _(string; required)_: The ID of the requested show

**Returns**

A `Promise` that resolves with a [Show](#show) object. Note that if the show
could not be found it resolves with `null` and does not throw.

**Example**

```js
const show = await client.getShow('tt0944947');
if (show) {
  console.log(show.title);
}
```

## License

Copyright (c) 2015 - 2017 Max Kueng

MIT License

[popcornapi-docs]: https://github.com/popcorn-official/popcorn-api/blob/master/README.md
