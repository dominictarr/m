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