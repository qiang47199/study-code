module.exports.delegate = function Delegate(obj, property) {
  let setters = [];
  let getters = [];
  let listens = [];

  function listen(key) {
    Object.defineProperty(obj, key, {
      get() {
        return getters.includes(key) ? obj[property][key] : obj[key];
      },
      set(val) {
        if (setters.includes(key)) {
          obj[property][key] = val;
        } else {
          obj[key] = val;
        }
      },
    });
  }

  this.getter = function (key) {
    getters.push(key);
    if (!listens.includes(key)) {
      listen(key);
      listens.push(key);
    }
    return this;
  };

  this.setter = function (key) {
    setters.push(key);
    if (!listens.includes(key)) {
      listen(key);
      listens.push(key);
    }
    return this;
  };
  return this;
};

module.exports.compose = (middleware) => {
  return (ctx, next) => {
    let index = -1;
    return dispatch(0);
    function dispatch(i) {
      if (i <= index) return Promise.reject(new Error('error'));
      index = i;
      const cb = middleware[i] || next;
      if (!cb) return Promise.resolve();
      try {
        return Promise.resolve(
          cb(ctx, function next() {
            return dispatch(i + 1);
          })
        );
      } catch (error) {
        return Promise.reject(error);
      }
    }
  };
};
