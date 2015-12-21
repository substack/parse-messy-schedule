var test = require('tape')
var parse = require('../')

test('previous wednesday', function (t) {
  var str = 'every wednesday at 7 pm'
  var ev = parse(str, { created: new Date('2015-12-10 03:00') })
  t.equal(ev.oneTime, false)
  var n = '2015-12-10 03:00', outputs = []
  for (var i = 0; i < 3; i++) {
    n = ev.prev(n)
    if (!n) break
    outputs.push(n.toString().replace(/ GMT.*/, ''))
  }
  t.deepEqual(outputs, [
    'Wed Dec 09 2015 19:00:00',
    'Wed Dec 02 2015 19:00:00',
    'Wed Nov 25 2015 19:00:00'
  ])
  t.end()
})
