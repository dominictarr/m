(function(){function r(e,n,t){function o(i,f){if(!n[i]){if(!e[i]){var c="function"==typeof require&&require;if(!f&&c)return c(i,!0);if(u)return u(i,!0);var a=new Error("Cannot find module '"+i+"'");throw a.code="MODULE_NOT_FOUND",a}var p=n[i]={exports:{}};e[i][0].call(p.exports,function(r){var n=e[i][1][r];return o(n||r)},p,p.exports,r,e,n,t)}return n[i].exports}for(var u="function"==typeof require&&require,i=0;i<t.length;i++)o(t[i]);return o}return r})()({1:[function(require,module,exports){
var GreatCircle = require('great-circle')
var LATLNG = require('./latlng')
var map = L.map('map')
var nav = L.multiPolyline
if(location.hash) {
  [lat, long, zoom] = location.hash.substring(1).split(',')
//  console.log([lat, long, zoom])
  var ll = LATLNG.parse(lat+', '+long)
  map.setView(ll, (+zoom)||13);
}
else
  map.setView([-41.25, 173.25], 13);
//var map = L.map('map').setView([51.505, -0.09], 13);
//  L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
//  L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
//  L.tileLayer('https://tiles.wetmaps.co.nz/file/wetmaps-tiles/sync/tiles/{z}/{x}/{y}.png', {
  L.tileLayer('http://localhost:8080/https/tiles.wetmaps.co.nz/file/wetmaps-tiles/sync/tiles/{z}/{x}/{y}.png', {

//  L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
    maxZoom: 19,
    attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>'
}).addTo(map);
var mouse

function append (type, latlng, string) {
  var log = document.querySelector('#log')
  log.value += '\n' + [type, LATLNG.stringify(latlng), string].join('; ') + '\n'
}

map.on('click', function (ev) {
  console.log('click', ev)

  append('nav', ev.latlng, new Date())
  pl.addLatLng(ev.latlng)
  var X = new L.icon({
    iconUrl: 'images/x.svg',
    iconSize: [10, 10],
    iconAnchor: [5, 5]
  })
  var marker = new L.Marker(ev.latlng, {
    draggable: true, 
    icon: X
  });
marker.bindPopup(''+new Date()).openPopup();
  marker.addTo(map)
})

map.on('mousemove', function (ev) {
  mouse = ev
  document.querySelector('#location').textContent = LATLNG.stringify(ev.latlng)
})
map.on('move', function (e) {
  var center = map.getCenter()
  console.log('MOVE', center, LATLNG.stringify(center), LATLNG.parse(LATLNG.stringify(center))
  )
 window.location.hash = '#' + LATLNG.stringify(center) + ','+map.getZoom()
})
MAP=map

var log = document.querySelector('#log').value
log = log.split('\n').map(e => e.trim()).filter(Boolean).map(line => {
  var [type, ll, message] = line.split(';')
  return {type, latlng: LATLNG.parse(ll), message}
})

var navs = []
log.forEach(v => {
  if('nav' === v.type)
    navs.push(v.latlng)
})
console.log('navs', navs, log)
var pl = L.polyline(navs, {color:'red'});
PL = pl 
function length (line) {
  var sum = 0
  for(var i = 1; i < line.length; i++) {
    var a = line[i-1], b = line[i]
    sum += GreatCircle.distance(a.lat, a.lng, b.lat, b.lng, 'NM')
  }
  return sum
}
pl.addTo(map)
console.log("LENGTH", length(navs))
},{"./latlng":2,"great-circle":3}],2:[function(require,module,exports){
function round (n) {
  return Math.round(n*1000)/1000
}

function miles (lat, acc=6) {
  var [m, f] = lat.toString().split('.')
  return m + "'" + round((+('0.'+f)) * 60)
}

var LATLNG = {
  stringify: function (ll, space, acc=6) {
    return miles(ll.lat, acc) + ',' + (space ? ' ' : '') + miles(ll.lng, acc)
  },
  parse: function (str) {
    var [lat, lng] = str.split(',').map(l => {
      var [lat, miles] = l.trim().split("'")
      return (+lat + (+lat < 0 ? -(miles/60) : (miles/60)))
    })
    return {lat, lng}
  }
}

module.exports = LATLNG
},{}],3:[function(require,module,exports){
var GreatCircle = {

    validateRadius: function(unit) {
        var r = {'M': 6371009, 'KM': 6371.009, 'MI': 3958.761, 'NM': 3440.070, 'YD': 6967420, 'FT': 20902260};
        if ( unit in r ) return r[unit];
        else return unit;
    },

    distance: function(lat1, lon1, lat2, lon2, unit) {
        if ( unit === undefined ) unit = 'KM';
        var r = this.validateRadius(unit); 
        lat1 *= Math.PI / 180;
        lon1 *= Math.PI / 180;
        lat2 *= Math.PI / 180;
        lon2 *= Math.PI / 180;
        var lonDelta = lon2 - lon1;
        var a = Math.pow(Math.cos(lat2) * Math.sin(lonDelta) , 2) + Math.pow(Math.cos(lat1) * Math.sin(lat2) - Math.sin(lat1) * Math.cos(lat2) * Math.cos(lonDelta) , 2);
        var b = Math.sin(lat1) * Math.sin(lat2) + Math.cos(lat1) * Math.cos(lat2) * Math.cos(lonDelta);
        var angle = Math.atan2(Math.sqrt(a) , b);
        
        return angle * r;
    },
    
    bearing: function(lat1, lon1, lat2, lon2) {
        lat1 *= Math.PI / 180;
        lon1 *= Math.PI / 180;
        lat2 *= Math.PI / 180;
        lon2 *= Math.PI / 180;
        var lonDelta = lon2 - lon1;
        var y = Math.sin(lonDelta) * Math.cos(lat2);
        var x = Math.cos(lat1) * Math.sin(lat2) - Math.sin(lat1) * Math.cos(lat2) * Math.cos(lonDelta);
        var brng = Math.atan2(y, x);
        brng = brng * (180 / Math.PI);
        
        if ( brng < 0 ) { brng += 360; }
        
        return brng;
    },
    
    destination: function(lat1, lon1, brng, dt, unit) {
        if ( unit === undefined ) unit = 'KM';
        var r = this.validateRadius(unit);
        lat1 *= Math.PI / 180;
        lon1 *= Math.PI / 180;
        var lat3 = Math.asin(Math.sin(lat1) * Math.cos(dt / r) + Math.cos(lat1) * Math.sin(dt / r) * Math.cos( brng * Math.PI / 180 ));
        var lon3 = lon1 + Math.atan2(Math.sin( brng * Math.PI / 180 ) * Math.sin(dt / r) * Math.cos(lat1) , Math.cos(dt / r) - Math.sin(lat1) * Math.sin(lat3));
        
        return {
            'LAT': lat3 * 180 / Math.PI,
            'LON': lon3 * 180 / Math.PI
        };
    }

}

if (typeof module != 'undefined' && module.exports) {
    module.exports = GreatCircle;
} else {
    window['GreatCircle'] = GreatCircle;
}

},{}]},{},[1]);
