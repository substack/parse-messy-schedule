var test = require('tape')
var parse = require('../')
var strftime = require('strftime')

test('one-time range', function (t) {
  var str = 'DMV tomorrow at 10:30'
  var ev = parse(str, { created: new Date('2015-12-10 03:00') })
  t.equal(ev.oneTime, true)
  t.equal(dstr(ev.range[0]), '2015-12-11 10:30:00')
  t.equal(dstr(ev.range[1]), '2015-12-11 10:30:00')
  t.end()
})

test('unbounded range', function (t) {
  var str = 'javascript study group thursdays at 7 pm'
  var ev = parse(str, { created: new Date('2015-12-10 03:00') })
  t.equal(ev.oneTime, false)
  t.ok(ev.range[0] < new Date('1970-01-01'))
  t.ok(ev.range[1] > new Date('2500-01-01'))
  t.end()
})

test('upper-bounded range', function (t) {
  var str = 'oakland wiki 18:30 every wednesday'
    + ' until dec 23'
  var ev = parse(str, { created: new Date('2015-12-10 03:00') })
  t.ok(ev.range[0] < new Date('1970-01-01'))
  t.equal(dstr(ev.range[1]), '2015-12-23 18:30:00')
  t.end()
})

test('lower-bounded range', function (t) {
  var str = 'oakland wiki 18:30 every other wednesday'
    + ' starting dec 23'
  var ev = parse(str, { created: new Date('2015-12-10 03:00') })
  t.equal(dstr(ev.range[0]), '2015-12-23 18:30:00')
  t.ok(ev.range[1] > new Date('2500-01-01'))
  t.end()
})

test('double-bounded range', function (t) {
  var str = 'oakland wiki 18:30 every other wednesday'
    + ' starting nov 25 until dec 23'
  var ev = parse(str, { created: new Date('2015-12-10 03:00') })
  t.equal(dstr(ev.range[0]), '2015-11-25 18:30:00')
  t.equal(dstr(ev.range[1]), '2015-12-23 18:30:00')
  t.end()
})

test('single event', function (t) {
  var str = 'sunday may 22nd'
  var ev = parse(str, { created: new Date('2016-05-21') })
  t.equal(dstr(ev.range[0]), '2016-05-22 00:00:00')
  t.equal(dstr(ev.range[1]), '2016-05-22 00:00:00')
  t.end()
})

test('every day range', function (t) {
  var str = 'every day at 12:00 starting jan 15 until feb 10'
  var ev = parse(str, { created: new Date('2015-12-25') })
  t.equal(dstr(ev.range[0]), '2016-01-15 12:00:00')
  t.equal(dstr(ev.range[1]), '2016-02-10 12:00:00')
  t.end()
})

function dstr (d) {
  return strftime('%F %T', d)
}
