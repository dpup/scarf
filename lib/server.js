/**
 * @fileoverview Simple server for serving RSS feeds for a G+ user's public posts.
 *
 * @author dan@pupi.us (Daniel Pupius)
 */

var dys = require('dys');
var path = require('path')
var action = require('./action');

// Set up and the server.
new dys.Server().
    addModule(new dys.StatsModule()).
    addInterceptor(dys.interceptors.checkHttpMethod).
    addModule(new dys.StaticFileModule().serveFile('/', path.join(__dirname, 'home.html'))).
    addAction('/favicon.ico', new dys.SimpleAction(404, '<h1>404 Not Found</h1>')).
    addAction('/:id', action).
    start();
