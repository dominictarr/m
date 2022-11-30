var tape = require('tape')

var LATLNG = require('../latlng')
var inputs = [
  "-40'8.24,173'3.52"
]

tape('input matches output', function (t) {
  inputs.forEach(function (e) {
    console.log(e, LATLNG.parse(e))
    t.equal(LATLNG.stringify(LATLNG.parse(e)), e)
    t.deepEqual(LATLNG.parse(LATLNG.stringify(LATLNG.parse(e))), LATLNG.parse(e))
  })

  t.end()

})