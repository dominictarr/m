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