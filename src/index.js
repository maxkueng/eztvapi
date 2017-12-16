/* @flow */

import axios from 'axios';
import wyt from 'wyt';

export const SHOW_STATUS_RETURNING_SERIES = 'returning_series';
export const SHOW_STATUS_IN_PRODUCTION = 'in_production';
export const SHOW_STATUS_PLANNED = 'planned';
export const SHOW_STATUS_CANCELED = 'canceled';
export const SHOW_STATUS_ENDED = 'ended';
export const SHOW_STATUS_UNKNOWN = 'unknown';

type ShowStatus =
  | 'returning_series'
  | 'in_production'
  | 'planned'
  | 'canceled'
  | 'ended'
  | 'unknown'
  ;

type ShowRating = {
  percentage: number;
  watching: number;
  votes: number;
  loved: number;
  hated: number;
};

type ShowImageSet = {
  poster: ?string;
  fanart: ?string;
  banner: ?string;
};

type Torrent = {
  provider: ?string;
  peers: number;
  seeds: number;
  url: ?string;
};

type Torrents = { [key: string]: Torrent };

type Episode = {
  tvdbId: ?string;
  title: ?string;
  episode: number;
  season: number;
  firstAired: ?Date;
  dateBased: boolean;
  overview: ?string;
  torrents: ?Torrents;
};

type ShowStub = {
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

type Show = {
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

type EztvApiClient = {
  getShows: (pageNumber?: number) => Promise<Array<ShowStub>>;
  getShow: (id: string) => Promise<?Show>;
};

type EztvApiClientOptions = {
  endpoint?: string;
  rateLimitRequests?: number;
  rateLimitInterval?: number;
};

function toArray(value: ?any | ?Array<any>): Array<any> {
  if (!value) {
    return [];
  }
  if (Array.isArray(value)) {
    return value;
  }
  return [value];
}

function asMaybeString(value: mixed): ?string {
  if (typeof value === 'string' && value.length) {
    return value;
  }
  return null;
}

function asString(value: mixed): string {
  if (typeof value === 'string') {
    return String(value);
  }
  throw new Error('Expected value to be string');
}

function asMaybeInteger(value: ?mixed): ?number {
  const int = Number.parseInt(String(value), 10);
  if (!Number.isNaN(int)) {
    return int;
  }
  return null;
}

function asInteger(value: mixed): number {
  const int = asMaybeInteger(value);
  if (typeof int !== 'undefined' && int !== null) {
    return int;
  }
  throw new Error('Expected value to be integer');
}

function asMaybeDate(value: mixed): ?Date {
  if (typeof value === 'string' || typeof value === 'number') {
    const d = new Date(value);
    if (Number.isNaN(d.getMonth())) {
      throw new Error('Expected value to be a date');
    }
    return d;
  }
  return null;
}

function unmarshalShowStatus(status): ShowStatus {
  switch (status) {
    case 'returning series':
      return SHOW_STATUS_RETURNING_SERIES;
    case 'in production':
      return SHOW_STATUS_IN_PRODUCTION;
    case 'planned':
      return SHOW_STATUS_PLANNED;
    case 'canceled':
      return SHOW_STATUS_CANCELED;
    case 'ended':
      return SHOW_STATUS_ENDED;
    default:
      return SHOW_STATUS_UNKNOWN;
  }
}

function unmarshalImageSet(data: Object): ShowImageSet {
  const images: ShowImageSet = {
    poster: asMaybeString(data && data.poster),
    fanart: asMaybeString(data && data.fanart),
    banner: asMaybeString(data && data.banner),
  };
  return images;
}

function unmarshalMaybeShowRating(data: Object): ?ShowRating {
  const rating: ?ShowRating = (data && {
    percentage: asInteger(data.percentage),
    watching: asInteger(data.watching),
    votes: asInteger(data.votes),
    loved: asInteger(data.loved),
    hated: asInteger(data.hated),
  }) || null;
  return rating;
}

function unmarshalShowStub(data: Object): ShowStub {
  return {
    // eslint-disable-next-line no-underscore-dangle
    id: asString(data._id),
    imdbId: asMaybeString(data.imdb_id),
    tvdbId: asMaybeString(data.tvdb_id),
    title: asString(data.title),
    slug: asString(data.slug),
    year: asMaybeInteger(data.year),
    seasons: asMaybeInteger(data.num_seasons),
    images: unmarshalImageSet(data.images),
    rating: unmarshalMaybeShowRating(data.rating),
  };
}

function unmarshalTorrent(data: Object): Torrent {
  return {
    provider: asMaybeString(data.provider),
    peers: asMaybeInteger(data.peers) || 0,
    seeds: asMaybeInteger(data.seeds) || 0,
    url: asMaybeString(data.url),
  };
}

function unmarshalMaybeTorrents(data: Object): ?Torrents {
  if (typeof data !== 'object') {
    return null;
  }

  // eslint-disable-next-line arrow-body-style
  return Object.keys(data).reduce((torrents, resolution) => {
    const torrent = data[resolution];
    if (!torrent) {
      return torrents;
    }
    return {
      ...torrents,
      [resolution]: unmarshalTorrent(torrent),
    };
  }, {});
}

function unmarshalEpisode(data: Object): Episode {
  return {
    tvdbId: asMaybeString(String(data.tvdb_id)),
    firstAired: asMaybeDate(data.first_aired * 1000),
    dateBased: !!data.date_based,
    overview: asMaybeString(data.overview),
    title: asMaybeString(data.title),
    episode: asInteger(data.episode),
    season: asInteger(data.season),
    torrents: unmarshalMaybeTorrents(data.torrents),
  };
}

function unmarshalShow(data: Object): Show {
  return {
    // eslint-disable-next-line no-underscore-dangle
    id: asString(data._id),
    imdbId: asMaybeString(data.imdb_id),
    tvdbId: asMaybeString(data.tvdb_id),
    title: asString(data.title),
    slug: asString(data.slug),
    year: asMaybeInteger(data.year),
    synopsis: asMaybeString(data.synopsis),
    runtime: asMaybeInteger(Number(data.runtime)),
    country: asMaybeString(data.country),
    network: asMaybeString(data.network),
    airDay: asMaybeString(data.air_day),
    airTime: asMaybeString(data.air_time),
    status: unmarshalShowStatus(data.status),
    seasons: asMaybeInteger(data.num_seasons),
    lastUpdated: asMaybeDate(Number(data.last_updated)),
    episodes: toArray(data.episodes).map(unmarshalEpisode),
    genres: toArray(data.genres).map(genre => String(genre)),
    images: unmarshalImageSet(data.images),
    rating: unmarshalMaybeShowRating(data.rating),
  };
}

const defaultOptions: EztvApiClientOptions = {
  endpoint: 'https://api-fetch.website/tv',
  rateLimitRequests: 1,
  rateLimitInterval: 1000,
};

export function createClient(options?: EztvApiClientOptions = {}): EztvApiClient {
  const opts = {
    ...defaultOptions,
    ...options,
  };

  const rateLimit = wyt(opts.rateLimitRequests, opts.rateLimitInterval);

  async function request(pathname): Promise<any> {
    await rateLimit();
    const response = await axios({
      validateStatus: () => true,
      headers: {
        'User-Agent': 'Gozilla/13.37 (Linux x86_64) Lazerfox/42',
      },
      method: 'GET',
      url: `${opts.endpoint}${pathname}`,
    });

    return response.data;
  }

  async function getShows(pageNumber?: number = 1): Promise<Array<ShowStub>> {
    const data = await request(`/shows/${pageNumber}`);
    if (!Array.isArray(data)) {
      throw new Error('Invalid response');
    }

    return data.map(unmarshalShowStub);
  }

  async function getShow(id: string): Promise<?Show> {
    const data = await request(`/show/${id}`);
    if (typeof data !== 'object') {
      return null;
    }

    return unmarshalShow(data);
  }

  const client: EztvApiClient = {
    getShows,
    getShow,
  };

  return client;
}
