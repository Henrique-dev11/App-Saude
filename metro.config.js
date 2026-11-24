const { getDefaultConfig } = require('expo/metro-config');
const { createFruitHandler } = require('./server/index.cjs');

const config = getDefaultConfig(__dirname);
const fruitHandler = createFruitHandler();
const enhanceMiddleware = config.server.enhanceMiddleware;
let authHandler;

// A API acompanha o Expo, inclusive com npx expo start e portas/túneis diferentes.
config.server.enhanceMiddleware = (middleware, server) => {
    const nextMiddleware = enhanceMiddleware ? enhanceMiddleware(middleware, server) : middleware;
    return (req, res, next) => {
        if (req.url?.startsWith('/api/auth/')) {
            authHandler ||= require('./server/auth.cjs').createAuthHandler();
            return authHandler(req, res);
        }
        if (req.url?.split('?')[0] === '/api/fruit/all') return fruitHandler(req, res);
        return nextMiddleware(req, res, next);
    };
};

module.exports = config;
