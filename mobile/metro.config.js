const { getDefaultConfig } = require('expo/metro-config');
const fruitsMiddleware = require('./server/fruitsMiddleware.cjs');

const config = getDefaultConfig(__dirname);
const enhanceMiddleware = config.server.enhanceMiddleware;
config.server.enhanceMiddleware = (middleware, server) => {
    const next = enhanceMiddleware ? enhanceMiddleware(middleware, server) : middleware;
    return (req, res, done) => fruitsMiddleware(req, res, () => next(req, res, done));
};
module.exports = config;
