var Confidence = require('confidence');
console.log(process.env);
var criteria = {
  env: process.env.NODE_ENV
};

var config = {

  aws: {
    config: {
      accessKeyId: process.env.AWS_KEY,
      secretAccessKey: process.env.AWS_SECRET,
      region: process.env.AWS_REGION,
      correctClockSkew: true
    }
  }

}

var store = new Confidence.Store(config);

exports.get = function (key) {
  return store.get(key, criteria);
};

exports.meta = function (key) {
  return store.meta(key, criteria);
};
