// test/app.integration.spec.js
const request = require('supertest');
const app = require('../app');
const connection = require('../connection');

describe('Test routes', () => {
  beforeEach(done => connection.query('TRUNCATE bookmark', done));
  it('GET / sends "Hello World" as json', (done) => {
    request(app)
      .get('/')
      .expect(200)
      .expect('Content-Type', /json/)
      .then(response => {
        const expected = { message: 'Hello World!' };
        expect(response.body).toEqual(expected);
        done();
      });
  });

  it('POST / NO - Bookmark field(s) missing', (done) => {
    request(app)
      .post('/bookmark')
      .send({})
      .expect(422)
      .expect('Content-Type', /json/)
      .then(res => {
        const expected = { "error": "required field(s) missing" };
        expect(res.body).toEqual(expected);
        done();
      });
  });

  it('POST / OK - Bookmark test passed', (done) => {
    request(app)
      .post('/bookmark')
      .send({ url: 'https://nodejs.org/', title: 'Node.js' })
      .expect(201)
      .expect('Content-Type', /json/)
      .then(res => {
        const expected = { id: expect.any(Number), url: 'https://nodejs.org/', title: 'Node.js' };
        expect(res.body).toEqual(expected);
        done();
      });
  });

  describe('GET /bookmark/:id', () => {
    const testBookmark = { url: 'https://nodejs.org/', title: 'Node.js' };
    beforeEach((done) => connection.query(
      'TRUNCATE bookmark', () => connection.query(
        'INSERT INTO bookmark SET ?', testBookmark, done
      )
    ));

    it('GET / NO - bookmark is not found', (done) => {
      request(app)
        .get('/bookmark/:id')
        .send({})
        .expect(404)
        .expect('Content-Type', /json/)
        .then(response => {
          const expected = { error: 'Bookmark not found' };
          expect(response.body).toEqual(expected);
          done();
        });
    });

    it('GET / OK - bookmark is found', (done) => {
      request(app)
        .get('/bookmark/1')
        .send(testBookmark)
        .expect(200)
        .expect('Content-Type', /json/)
        .then(response => {
          const expected = { id: 1, url: 'https://nodejs.org/', title: 'Node.js' };
          expect(response.body).toEqual(expected);
          done();
        });
    });
  });
});