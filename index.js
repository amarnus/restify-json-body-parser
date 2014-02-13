var restify = require('restify');
var bodyReader = require('restify-plugin-body-reader');

module.exports = function jsonParser (options) {
  var pass = false;

  return [
    function reader (req, res, next) {
      if (req.method === 'HEAD') {
        pass = true;
        return next();
      }

      if (req.contentLength() === 0 && !req.isChunked()) {
        pass = true;
        return next();
      }

      if (req.contentType() === 'application/json') {
        // No need to read request body
        if (typeof req.body === 'string') {
          return next();
        } else {
          return bodyReader(options)(req, res, next);
        }
      } else {
        pass = true;
        return next();
      }
    },

    function parser (req, res, next) {
      if (!pass) {
        try {
          req.body = JSON.parse(req.body);
        } catch (e) {
          return next(new restify.InvalidContentError('Invalid JSON: ' + e.message));
        }

        return next();
      } else {
        return next();
      }
    }
  ];
};