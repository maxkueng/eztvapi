import * as path from 'path';
import nock from 'nock';
import test from 'ava';
import * as eztvapi from '../build';

function mock() {
  return nock('https://api-fetch.website/tv')
    .defaultReplyHeaders({
      'content-type': 'application/json; charset=UTF-8',
    });
}

test('client.getShows() first page', async (t) => {
  mock()
    .get('/shows/1')
    .replyWithFile(200, path.join(__dirname, '/fixtures/shows1.json'));

  const client = eztvapi.createClient();
  const shows = await client.getShows(1);
  t.is(shows.length, 50);
});

test('client.getShows() specific page', async (t) => {
  mock()
    .get('/shows/2')
    .replyWithFile(200, path.join(__dirname, '/fixtures/shows2.json'));

  const client = eztvapi.createClient();
  const shows = await client.getShows(2);
  t.is(shows.length, 50);
});

test('client.getShows() empty page', async (t) => {
  mock()
    .get('/shows/3')
    .replyWithFile(200, path.join(__dirname, '/fixtures/shows3.json'));

  const client = eztvapi.createClient();
  const shows = await client.getShows(3);
  t.is(shows.length, 0);
});


test('client.getShow()', async (t) => {
  mock()
    .get('/show/tt0944947')
    .replyWithFile(200, path.join(__dirname, '/fixtures/showtt0944947.json'));

  const client = eztvapi.createClient();
  const show = await client.getShow('tt0944947');
  t.is(show.title, 'Game of Thrones');
});

test('client.getShow() not found', async (t) => {
  const interceptor = mock()
    .get('/show/lolnotfound')
  .reply(200, null);

  const client = eztvapi.createClient();
  const show = await client.getShow('lolnotfound');
  t.is(show, null);
});
