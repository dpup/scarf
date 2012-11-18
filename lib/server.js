/**
 * @fileoverview Simple server for serving RSS feeds for a G+ user's public posts.
 *
 * @author dan@pupi.us (Daniel Pupius)
 */

var dys = require('dys');
var action = require('./action');


// Set up and the server.
new dys.Server().
    addModule(new dys.StatsModule()).
    addInterceptor(dys.interceptors.checkHttpMethod).
    addAction('/', new dys.SimpleAction(200, '<!DOCTYPE html><html><p><a href="https://github.com/dpup/scarf">https://github.com/dpup/scarf</a></p>')).
    addAction('/favicon.ico', new dys.SimpleAction(404, '<h1>404 Not Found</h1>')).
    addAction('/:id', action).
    start();
