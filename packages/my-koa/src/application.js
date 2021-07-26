const http = require('http');
const _context = require('./context');
const _request = require('./request');
const _response = require('./response');
const { compose } = require('./utils');

class MyKoa {
  constructor() {
    this.middleware = [];
  }

  listen(...args) {
    const server = http.createServer((req, res) => {
      const ctx = this.createContext(req, res);

      const fn = compose(this.middleware);
      fn(ctx)
        .then(() => {
          res.end(ctx.body);
        })
        .catch((err) => {
          throw err;
        });
    });
    server.listen(...args);
  }

  use(callback) {
    this.middleware.push(callback);
  }

  createContext(req, res) {
    const ctx = Object.assign(_context);
    const request = Object.assign(_request);
    const response = Object.assign(_response);
    ctx.request = request;
    ctx.response = response;
    ctx.req = request.req = req;
    ctx.res = response.res = res;
    return ctx;
  }
}

module.exports = MyKoa;
