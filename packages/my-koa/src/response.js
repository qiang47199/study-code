module.exports = {
  get message() {
    return this.res.statusMessage || '';
  },

  set message(msg) {
    this.res.statusMessage = msg;
  },
};
