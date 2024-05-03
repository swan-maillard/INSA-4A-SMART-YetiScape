var express = require('express');
var logger = require('morgan');
var path = require('path');
const https=require('https')
var routes = require('./routes');
var app = express();
const fs=require('fs')

const options = {
    key:fs.readFileSync(path.join(__dirname,'./cert/key.pem')),
    cert:fs.readFileSync(path.join(__dirname,'./cert/cert.pem'))
    }

// log requests
app.use(logger('dev'));

app.set('view engine', 'ejs');

app.use(express.static(path.join(__dirname, 'public')));

app.use('/', routes);

 //Peer server

var ExpressPeerServer = require('peer').ExpressPeerServer

var peerjs_options = {
    debug: true
}


var server = https.createServer(options,app)
var peerServer = ExpressPeerServer(server, peerjs_options)

app.use('/', peerServer)

server.listen(443,"0.0.0.0",()=>{
console.log('Secure server is listening on port 443')
})

