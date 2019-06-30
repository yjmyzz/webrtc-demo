'use strict'

var http = require("http")
var https = require('https');
var fs = require('fs');

var serveIndex = require('serve-index');
var express = require('express');
var app = express();
app.use(serveIndex('../html'));
app.use(express.static('../html'));

var options = {
    key  : fs.readFileSync('./cert/server.key'),
    cert : fs.readFileSync('./cert/server.pem')
}
  
var https_server = https.createServer(options, app);
https_server.listen(443, '0.0.0.0');

var http_server = http.createServer(app);
http_server.listen(80, '0.0.0.0');