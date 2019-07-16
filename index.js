var express = require('express');
var app = express();
var Spirograph = require('./spirograph');
var DotMatrix = require('./dotmatrix');
var murmurHash128x64 = require('murmurhash-native').murmurHash128x64;

String.prototype.endsWith = function(suffix) {
  return this.indexOf(suffix, this.length - suffix.length) !== -1;
};

app.listen(7000);

app.get('/avatar/:hash', function(req, res) {
  var size = parseInt(req.query.s) || 96;
  size = size > 512 ? 512 : size;
  var hash = req.params.hash;
  if(hash.endsWith('.png')) {
    hash = hash.slice(0, -4);
  }
  hash = hash.substr(0, 32);
  var ip = req.headers['x-forwarded-for'] || req.connection.remoteAddress;
  console.log(hash + ' ' + ip);

  res.writeHead(200, {'Content-Type': 'image/png'});
  res.end(Spirograph.getImage(hash, parseInt(size)), 'binary');
});

app.get('/coin/:addr', function(req, res) {
  var size = parseInt(req.query.s) || 96;
  size = size > 512 ? 512 : size;
  var addr = req.params.addr;
  if(addr.endsWith('.png')) {
    addr = addr.slice(0, -4);
  }
  addr = addr.substr(0, 64);

  var hash = murmurHash128x64(addr);
  var ip = req.headers['x-forwarded-for'] || req.connection.remoteAddress;
  console.log(hash + ' ' + ip);

  res.writeHead(200, {'Content-Type': 'image/png'});
  res.end(DotMatrix.getImage(hash, parseInt(size)), 'binary');
});

app.get('/spirograph', function(req, res) {
  var hash = new Uint8Array(16);
  for(var i in hash) {
    hash[i] = Math.floor(Math.random() * 256);
  }

  var size = parseInt(req.query.s) || 96;
  size = size > 512 ? 512 : size;
  res.writeHead(200, {'Content-Type': 'image/png'});
  res.end(Spirograph.getImage(hash, parseInt(size)), 'binary');
});

app.get('/dotmatrix', function(req, res) {
  var hash = new Uint8Array(16);
  for(var i in hash) {
    hash[i] = Math.floor(Math.random() * 256);
  }

  var size = parseInt(req.query.s) || 96;
  size = size > 512 ? 512 : size;
  res.writeHead(200, {'Content-Type': 'image/png'});
  res.end(DotMatrix.getImage(hash, parseInt(size)), 'binary');
});

app.get('/test_spirograph', function(req, res) {
  var out = '';
  for(var i = 0; i < 500; i++) {
    out += '<img src="//localhost:7000/spirograph?i=' + i + '" />';
  }
  res.send(out);
});

app.get('/test_dotmatrix', function(req, res) {
  var out = '';
  for(var i = 0; i < 500; i++) {
    out += '<img src="//localhost:7000/dotmatrix?i=' + i + '" />';
  }
  res.send(out);
});

app.get('*', function(req, res) {
  res.status(404).send('not found');
});
