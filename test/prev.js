var test = require('tape')
var strftime = require('strftime')
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

test('previous every day', function (t) {
  var str = 'every day at 7 pm'
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
    'Tue Dec 08 2015 19:00:00',
    'Mon Dec 07 2015 19:00:00'
  ])
  t.end()
})

test('previous every other starting until', function (t) {
  var str = 'oakland wiki 18:30 every other wednesday'
    + ' starting dec 2 until dec 23'
  var ev = parse(str, { created: new Date('2015-12-10 03:00') })
  t.equal(ev.oneTime, false)
  var n = '2015-12-10 03:00', outputs = []
  for (var i = 0; i < 3; i++) {
    n = ev.prev(n)
    if (!n) break
    outputs.push(n.toString().replace(/ GMT.*/, ''))
  }
  t.deepEqual(outputs, [
    'Wed Dec 02 2015 18:30:00'
  ])
  t.end()
})

test('previous every other starting until earlier', function (t) {
  var str = 'oakland wiki 18:30 every other wednesday'
    + ' starting nov 18 until dec 23'
  var ev = parse(str, { created: new Date('2015-12-10 03:00') })
  t.equal(ev.oneTime, false)
  var n = '2015-12-10 03:00', outputs = []
  for (var i = 0; i < 5; i++) {
    n = ev.prev(n)
    if (!n) break
    outputs.push(n.toString().replace(/ GMT.*/, ''))
  }
  t.deepEqual(outputs, [
    'Wed Dec 02 2015 18:30:00',
    'Wed Nov 18 2015 18:30:00'
  ])
  t.end()
})

test('every day next/prev', function (t) {
  var str = 'every day at 12:00 starting jan 15 until feb 10'
  var ev = parse(str, { created: new Date('2015-12-25') })
  var d = new Date('2016-01-20 00:00')
  t.equal(strftime('%F %T', ev.next(d)), '2016-01-20 12:00:00', 'next')
  t.equal(strftime('%F %T', ev.prev(d)), '2016-01-19 12:00:00', 'prev')
  t.end()
})

test('every day prev chain', function (t) {
  var str = 'every day at 12:00 starting jan 15 until feb 10'
  var ev = parse(str, { created: new Date('2015-12-25') })
  var dates = []
  var d = new Date('2016-01-20 00:00')
  for (var i = 0; i < 5; i++) {
    d = ev.prev(d)
    dates.push(strftime('%F %T', d))
  }
  t.deepEqual(dates, [
    '2016-01-19 12:00:00',
    '2016-01-18 12:00:00',
    '2016-01-17 12:00:00',
    '2016-01-16 12:00:00',
    '2016-01-15 12:00:00'
  ])
  t.end()
})

test('every sunday', function (t) {
  var str = 'every sunday'
  var ev = parse(str, { created: new Date('2016-06-01') })
  var d0 = new Date('2016-06-01 00:00')
  t.equal(strftime('%F', ev.prev(d0)), '2016-05-29') 
  var d1 = new Date('2016-05-31 00:00')
  t.equal(strftime('%F', ev.prev(d1)), '2016-05-29') 
  t.end()
})

test('the 1st', function (t) {
  var str = 'the 1st'
  var ev = parse(str, { created: new Date('2016-06-01') })
  var d = new Date('2016-06-10 00:00')
  var dates = []
  for (var i = 0; i < 10; i++) {
    d = ev.prev(d)
    dates.push(strftime('%F', d))
  }
  t.deepEqual(dates, [
    '2016-06-01',
    '2016-05-01',
    '2016-04-01',
    '2016-03-01',
    '2016-02-01',
    '2016-01-01',
    '2015-12-01',
    '2015-11-01',
    '2015-10-01',
    '2015-09-01'
  ])
  t.end()
})

test('the 15th', function (t) {
  var str = 'the 15th'
  var ev = parse(str, { created: new Date('2016-06-01') })
  var d = new Date('2016-06-10 00:00')
  var dates = []
  for (var i = 0; i < 10; i++) {
    d = ev.prev(d)
    dates.push(strftime('%F', d))
  }
  t.deepEqual(dates, [
    '2016-05-15',
    '2016-04-15',
    '2016-03-15',
    '2016-02-15',
    '2016-01-15',
    '2015-12-15',
    '2015-11-15',
    '2015-10-15',
    '2015-09-15',
    '2015-08-15'
  ])
  t.end()
})

test('every oct 31st', function (t) {
  var str = 'every oct 31st'
  var ev = parse(str, { created: new Date('2016-06-01') })
  var d = new Date('2016-06-10 00:00')
  var dates = []
  for (var i = 0; i < 10; i++) {
    d = ev.prev(d)
    dates.push(strftime('%F', d))
  }
  t.deepEqual(dates, [
    '2016-10-31',
    '2015-10-31',
    '2014-10-31',
    '2013-10-31',
    '2012-10-31',
    '2011-10-31',
    '2010-10-31',
    '2009-10-31',
    '2008-10-31',
    '2007-10-31'
  ])
  t.end()
})

test('every oct 31', function (t) {
  var str = 'every oct 31'
  var ev = parse(str, { created: new Date('2016-06-01') })
  var d = new Date('2016-06-10 00:00')
  var dates = []
  for (var i = 0; i < 10; i++) {
    d = ev.prev(d)
    dates.push(strftime('%F', d))
  }
  t.deepEqual(dates, [
    '2016-10-31',
    '2015-10-31',
    '2014-10-31',
    '2013-10-31',
    '2012-10-31',
    '2011-10-31',
    '2010-10-31',
    '2009-10-31',
    '2008-10-31',
    '2007-10-31'
  ])
  t.end()
})
