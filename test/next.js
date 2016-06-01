var test = require('tape')
var parse = require('../')
var strftime = require('strftime')

test('one-off event (tomorrow)', function (t) {
  var str = 'DMV tomorrow at 10:30'
  var ev = parse(str, { created: new Date('2015-12-10 03:00') })
  t.equal(ev.oneTime, true)
  t.equal(ev.title, 'DMV')
  t.equal(
    ev.next('2015-12-10 03:00').toString().replace(/ GMT.*/, ''),
    'Fri Dec 11 2015 10:30:00'
  )
  t.equal(
    ev.next('2015-12-11 10:00').toString().replace(/ GMT.*/, ''),
    'Fri Dec 11 2015 10:30:00'
  )
  t.equal(ev.next('2015-12-11 11:00'), null)
  t.end()
})

test('one-off event (day)', function (t) {
  var str = 'DMV friday at 10:30'
  var ev = parse(str, { created: new Date('2015-12-10 03:00') })
  t.equal(ev.oneTime, true)
  t.equal(ev.title, 'DMV')
  t.equal(
    ev.next('2015-12-10 03:00').toString().replace(/ GMT.*/, ''),
    'Fri Dec 11 2015 10:30:00'
  )
  t.equal(
    ev.next('2015-12-11 10:00').toString().replace(/ GMT.*/, ''),
    'Fri Dec 11 2015 10:30:00'
  )
  t.equal(ev.next('2015-12-11 11:00'), null)
  t.end()
})

test('thursdays', function (t) {
  var str = 'javascript study group thursdays at 7 pm'
  var ev = parse(str, { created: new Date('2015-12-10 03:00') })
  t.equal(ev.oneTime, false)
  var n = '2015-12-10 03:00', outputs = []
  for (var i = 0; i < 3; i++) {
    n = ev.next(n)
    if (!n) break
    outputs.push(n.toString().replace(/ GMT.*/, ''))
  }
  t.deepEqual(outputs, [
    'Thu Dec 10 2015 19:00:00',
    'Thu Dec 17 2015 19:00:00',
    'Thu Dec 24 2015 19:00:00'
  ])
  t.end()
})

test('every other starting until', function (t) {
  var str = 'oakland wiki 18:30 every other wednesday'
    + ' starting dec 2 until dec 23'
  var ev = parse(str, { created: new Date('2015-12-10 03:00') })
  t.equal(ev.oneTime, false)
  var n = '2015-12-10 03:00', outputs = []
  for (var i = 0; i < 3; i++) {
    n = ev.next(n)
    if (!n) break
    outputs.push(n.toString().replace(/ GMT.*/, ''))
  }
  t.deepEqual(outputs, [
    'Wed Dec 16 2015 18:30:00'
  ])
  t.end()
})

test('every other starting until', function (t) {
  var str = 'oakland wiki 18:30 every other wednesday'
    + ' starting dec 2 until dec 30'
  var ev = parse(str, { created: new Date('2015-12-10 03:00') })
  t.equal(ev.oneTime, false)
  var n = '2015-12-10 03:00', outputs = []
  for (var i = 0; i < 3; i++) {
    n = ev.next(n)
    if (!n) break
    outputs.push(n.toString().replace(/ GMT.*/, ''))
  }
  t.deepEqual(outputs, [
    'Wed Dec 16 2015 18:30:00',
    'Wed Dec 30 2015 18:30:00'
  ])
  t.end()
})

test('every day', function (t) {
  var str = 'every day at 7 pm'
  var ev = parse(str, { created: new Date('2015-12-10 03:00') })
  t.equal(ev.oneTime, false)
  var n = '2015-12-10 03:00', outputs = []
  for (var i = 0; i < 3; i++) {
    n = ev.next(n)
    if (!n) break
    outputs.push(n.toString().replace(/ GMT.*/, ''))
  }
  t.deepEqual(outputs, [
    'Thu Dec 10 2015 19:00:00',
    'Fri Dec 11 2015 19:00:00',
    'Sat Dec 12 2015 19:00:00'
  ])
  t.end()
})

test('using quotes to escape titles', function (t) {
  var str = '"linux installfest friday" friday at 21:00'
  var ev = parse(str, { created: new Date('2015-12-09 03:00') })
  t.equal(ev.oneTime, true)
  t.equal(ev.title, 'linux installfest friday')
  t.equal(
    ev.next('2015-12-09 03:00').toString().replace(/ GMT.*/, ''),
    'Fri Dec 11 2015 21:00:00'
  )
  t.equal(ev.next('2015-12-12 10:00'), null)
  t.end()
})

test('every every', function (t) {
  var str = 'every body dance each friday at 3pm'
  var ev = parse(str)
  t.equal(ev.title, 'every body dance')
  t.equal(
    strftime('%F %T', ev.next('2015-12-09 12:00')),
    '2015-12-11 15:00:00'
  )
  t.end()
})

test('taco tuesdays', function (t) {
  var str = 'taco tuesdays each tuesday at 6pm'
  var ev = parse(str)
  t.equal(ev.title, 'taco tuesdays')
  t.equal(
    strftime('%F %T', ev.next('2015-12-09 12:00')),
    '2015-12-15 18:00:00'
  )
  t.end()
})

test('every day next', function (t) {
  var str = 'every day at 12:00 starting jan 15 until feb 10'
  var ev = parse(str, { created: new Date('2015-12-25') })
  var d = new Date('2016-01-01 00:00')
  var dates = []
  for (var i = 0; i < 20; i++) {
    d = ev.next(d)
    dates.push(strftime('%F %T', d))
  }
  t.deepEqual(dates, [
    '2016-01-15 12:00:00',
    '2016-01-16 12:00:00',
    '2016-01-17 12:00:00',
    '2016-01-18 12:00:00',
    '2016-01-19 12:00:00',
    '2016-01-20 12:00:00',
    '2016-01-21 12:00:00',
    '2016-01-22 12:00:00',
    '2016-01-23 12:00:00',
    '2016-01-24 12:00:00',
    '2016-01-25 12:00:00',
    '2016-01-26 12:00:00',
    '2016-01-27 12:00:00',
    '2016-01-28 12:00:00',
    '2016-01-29 12:00:00',
    '2016-01-30 12:00:00',
    '2016-01-31 12:00:00',
    '2016-02-01 12:00:00',
    '2016-02-02 12:00:00',
    '2016-02-03 12:00:00'
  ])
  t.end()
})

test('the 1st', function (t) {
  var str = 'the 1st'
  var ev = parse(str, { created: new Date('2016-06-01') })
  var d = new Date('2016-06-10 00:00')
  var dates = []
  for (var i = 0; i < 10; i++) {
    d = ev.next(d)
    dates.push(strftime('%F', d))
  }
  t.deepEqual(dates, [
    '2016-07-01',
    '2016-08-01',
    '2016-09-01',
    '2016-10-01',
    '2016-11-01',
    '2016-12-01',
    '2017-01-01',
    '2017-02-01',
    '2017-03-01',
    '2017-04-01'
  ])
  t.end()
})

test('the 15th', function (t) {
  var str = 'the 15th'
  var ev = parse(str, { created: new Date('2016-06-01') })
  var d = new Date('2016-06-10 00:00')
  var dates = []
  for (var i = 0; i < 10; i++) {
    d = ev.next(d)
    dates.push(strftime('%F', d))
  }
  t.deepEqual(dates, [
    '2016-06-15',
    '2016-07-15',
    '2016-08-15',
    '2016-09-15',
    '2016-10-15',
    '2016-11-15',
    '2016-12-15',
    '2017-01-15',
    '2017-02-15',
    '2017-03-15'
  ])
  t.end()
})

test('every oct 31st', function (t) {
  var str = 'every oct 31st'
  var ev = parse(str, { created: new Date('2016-06-01') })
  var d = new Date('2016-06-10 00:00')
  var dates = []
  for (var i = 0; i < 10; i++) {
    d = ev.next(d)
    dates.push(strftime('%F', d))
  }
  t.deepEqual(dates, [
    '2016-10-31',
    '2017-10-31',
    '2018-10-31',
    '2019-10-31',
    '2020-10-31',
    '2021-10-31',
    '2022-10-31',
    '2023-10-31',
    '2024-10-31',
    '2025-10-31'
  ])
  t.end()
})

test('every oct 31', function (t) {
  var str = 'every oct 31'
  var ev = parse(str, { created: new Date('2016-06-01') })
  var d = new Date('2016-06-10 00:00')
  var dates = []
  for (var i = 0; i < 10; i++) {
    d = ev.next(d)
    dates.push(strftime('%F', d))
  }
  t.deepEqual(dates, [
    '2016-10-31',
    '2017-10-31',
    '2018-10-31',
    '2019-10-31',
    '2020-10-31',
    '2021-10-31',
    '2022-10-31',
    '2023-10-31',
    '2024-10-31',
    '2025-10-31'
  ])
  t.end()
})
