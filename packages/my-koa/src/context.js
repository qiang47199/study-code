const { delegate } = require('./utils');
const context = (module.exports = {
  get body() {
    return this._body;
  },

  set body(value) {
    this._body = value;
  },
});
delegate(context, 'request').getter('query');
delegate(context, 'response').getter('message').setter('message');
