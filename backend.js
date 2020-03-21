require('dotenv').config();
const http = require('http');
const open = require('open');
const express = require('express');
const path = require('path');
const fs = require('fs');

const apiRouter = require('./backend/api');
const app = express();

const {BACKEND_PORT, REACT_APP_BACKEND_PORT, LAUNCH_BROWSER} = process.env;

const buildDir = fs.existsSync(path.join(__dirname, 'build')) ? 'build' : 'static';
const port = REACT_APP_BACKEND_PORT || BACKEND_PORT || 23367;

app.set('port', port);
app.use(express.json({type: () => true}));
app.use(express.urlencoded({extended: false}));

app.use('/api', apiRouter);
app.use(express.static(path.join(__dirname, buildDir)));
app.get('/*', function(req, res, next) {
    if (fs.existsSync(path.join(__dirname, buildDir, 'index.html'))) {
        res.sendFile('index.html', {root: path.join(__dirname, buildDir)});
    } else {
        res.json('Front end not exist yet');
    }
});

const onError = error => console.error(error);
const onListening = () => {
    console.log(`Cloudflare Configurator running on port ${port}`);
    LAUNCH_BROWSER.toLowerCase() === 'true' && open(`http://127.0.0.1:${port}`);
};

let server = http.createServer(app);
server.listen(port);
server.on('error', onError);
server.on('listening', onListening);
