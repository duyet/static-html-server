#!/usr/bin/env node
var http = require('http')
  , url  = require('url')
  , path = require('path')
  , fs   = require('fs')
  , mime = require('mime')
  , mnm  = require('minimist')

var argv = mnm(process.argv.slice(2))
  , port = argv.p || 7788
  , root = argv.r || process.cwd()
  , fallbackPath = argv.f
  , help = argv.h || false;

if (argv.h) {
  console.log("\nNODE STATIC SERVER");
  console.log("   Simple static web server.\
    \n   Author: Van-Duyet Le (me@duyetdev.com). \
    \n   Website: http://duyetdev.com");
  console.log("\nUsage:\
    \n    static-html-server -p [port] -r [root folder] -f [fallback path if not found]");
  console.log("\nArguments (all are optional):\
    \n    - p: [Number] port number, default to 8000\
    \n    - r: [String] root folder, default to working directory\
    \n    - f: [String] fallback path when page not found, default to not falling back and send 404\n\n");
  console.log("For example\
    \n    $ static-html-server -p 8899 -r ./ -f index.html\
    \n    Server running at http://localhost:8899/ [root: ./, fallback: index.html]\n");
  process.exit(1);
}

if (fallbackPath) fallbackPath = path.join(root, fallbackPath)

http.createServer(function requestHandler(req, res) {
  var uriPath  = url.parse(req.url).pathname,
      filePath = path.join(root, unescape(uriPath))

  console.log('Serving ' + uriPath)
  handle(filePath)

  function handle(filePath, fallingback) {
    fs.stat(filePath, function(err, stat) {
      if (err) {
        if (err.code == 'ENOENT') {
          if (!fallingback && fallbackPath) return handle(fallbackPath, true)
          res.statusCode = 404
        }
        else res.statusCode = 500
        res.end()
        console.error(err)
      } 

      else if (stat.isDirectory()) {
        handle(path.join(filePath, 'index.html'))
      } 

      else {
        var contentType = mime.lookup(path.extname(filePath))
        res.writeHead(200, { 'Content-Type': contentType })
        fs.createReadStream(filePath).pipe(res)
      }
    })
  }
}).listen(port)

console.log('Server running at http://localhost:' + port + '/' + ' [root: ' + root + ', fallback: ' + fallbackPath + ']')
