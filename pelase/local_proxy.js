const express = require('express');
const morgan = require('morgan');
const { createProxyMiddleware } = require('http-proxy-middleware');

//create express server
const app = express();

//config
var PORT = "3000";
var HOST = "localhost";
const API_SERVICE_URL = "https://jsonplaceholder.typicode.com";

var proxyUrl = `${HOST}:${PORT}`;

//logging in
app.use(morgan('dev'));

// Info GET endpoint
app.get('/info', (req, res, next) => {
    res.send('Proxy service for raffle bot');
});

// Authorization
app.use('', (req, res, next) => {
    if (req.headers.authorization) {
        next();
    } else {
        res.sendStatus(403);
    }
});

// Proxy endpoints
app.use('/json_placeholder', createProxyMiddleware({
    target: API_SERVICE_URL,
    changeOrigin: true,
    slowMo: 100,
    pathRewrite: {
        [`^/json_placeholder`]: '',
    },
}));

// Start the Proxy
app.listen(PORT, HOST, () => {
    console.log(`Starting Proxy at ${HOST}:${PORT}\n`);
});