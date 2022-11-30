var http = require('http')
var path = require('path')
var URL = require('url')
var fs = require('fs')
var request = require('request')

function mkdirp (pathname, cb) {
  console.log('mkdirp', pathname)
  fs.mkdir(pathname, {recursive:true}, cb)
}

var root = path.join(__dirname, 'cache')

function from_cache (_file, url, cb) {
  var file = path.join(root, _file)
  fs.stat(file, function (err, stat) {
    if(stat) {
      console.log("CACHED", file)
      cb(null, fs.createReadStream(file))
    }
    else {
      mkdirp(path.join(root, 'tmp'), function () {
        var tmp = path.join(root, 'tmp',  '_'+Date.now())
        var req = request(url)
        console.log("GET", url)
        var fs_stream = fs.createWriteStream(tmp, {emitClose: true})
        req.pipe(fs_stream)
        fs_stream.on('close', function () {
          console.log("WRITTEN", tmp)
          mkdirp(path.dirname(file), function (err) {
            if(err) throw (err)
            fs.rename(tmp, file, function (err) {
              if(err) throw (err)
              cb(null, fs.createReadStream(file))
            })          
          })
        })
      })
    }
  })
}

var server = http.createServer(function (req, res) {
  var [_, protocol, hostname, ... pathname] = req.url.split('/')
  if(req.url === '/favicon.ico') {
      res.statusCode = '404'
      return res.end()
  }
  from_cache(
    [protocol, hostname, ...pathname].join('/'), 
    URL.format({ protocol, hostname, pathname:pathname.join('/')}),
    function (err, stream) {
      if(!err) {
        res.statusCode = 200
        stream.pipe(res)
      }
      else {
        res.statusCode = 404
        res.end(err.message)
      }
    })
})


server.listen(8080)

