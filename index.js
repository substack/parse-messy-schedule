var parset = require('parse-messy-time')

var nums1to4 = '(1st|2nd|3rd|4th|first|second|third|fourth)'
var numNames = { first: '1st', second: '2nd', third: '3rd', fourth: '4th' }

var re = {}
re.time = /(\d+:\d+|\d+(?::\d+)?\s*(?:pm|am))/
re.every = RegExp(
  '(?:' + re.time.source + '\\s+)?'
  + '(every|each)?\\s+(?:(other)\\s+|'
  + nums1to4
    + '(?:(?:\\s*,\\s*|\\s+(and|through)\\s+)' + nums1to4 + ')?'
    + '\\s+)?'
  + '(?:((?:mon|tues?|wed(?:nes)?|thurs?|fri|sat(?:ur)?|sun)(?:days?)?'
    + '|tomorrow|day)\\b)'
  + '(?:\\s+(.+?))?'
  + '(?:\\s+(?:starting|from)\\s+(.+?))?'
  + '(?:\\s+(?:until|to)\\s+(.+?))?'
  + '\\s*$',
  'i'
)

function everyf (s, now) {
  if (!now) now = new Date
  var m = re.every.exec(s)
  if (!m) return m
  var time = m[1] || m[8] || null
  var ut = time && !re.time.test(m[10]) ? ' ' + time : ''
  return {
    every: Boolean(m[2] || /days$/i.test(m[7])),
    other: Boolean(m[3]),
    numbered: m[4] ? normNum(
      m[4] && m[5] === 'through' && m[6] ? thru(m[4], m[6]) :
        m[6] ? [ m[4], m[6] ] :
        [ m[4] ]
    ) : null,
    time: time,
    day: String(m[7]).toLowerCase(),
    starting: m[9] ? parset(m[9], { now: now }) : null,
    until: m[10] ? parset(m[10] + ut, { now: now }) : null,
    index: m.index
  }
}

function normNum (xs) {
  return xs.map(function (x) {
    x = (x || '').toLowerCase()
    return numNames[x] || x
  })
}

function thru (a, b) {
  var m = normNum([ a, b ])
  var ns = Object.keys(numNames)
    .map(function (n) { return numNames[n] })
    .sort()
  ns.forEach(function (n) {
    if (n > m[m.length-2] && n < m[m.length-1]) {
      m.splice(m.length-1, 0, n)
    }
  })
  return m
}

function countWeeks (a, b) {
  return Math.round((b.getTime() - a.getTime()) / 1000 / 60 / 60 / 24 / 7)
}

module.exports = Mess

function Mess (str, opts) {
  if (!(this instanceof Mess)) return new Mess(str, opts)
  if (!opts) opts = {}
  this._every = everyf(str, opts.created)
  this._created = opts.created
  this.title = this._every ? str.slice(0, this._every.index).trim().replace(/"/g, '') : null
  this.oneTime = Boolean(!(this._every && this._every.every))
  // for X weeks
  // starting X for Y weeks
}

Mess.prototype.next = function (base) {
  if (!base) base = new Date
  if (typeof base === 'string') base = parset(base, { now: this._created })
  if (this._every && this._every.numbered) {
    //...
  } else if (this._every && this._every.other && this._every.every
  && (this._every.starting || this._created)) {
    var x = this._every.starting || this._created
    if (base <= x) base = x
    var p = countWeeks(x, base) % 2 === 0 ? 'this' : 'next'
    var tt = this._every.time ? ' at ' + this._every.time : ''
    var t = parset(p + ' ' + this._every.day + tt, { now: base })
    if (t <= base) t.setDate(t.getDate() + 14)
    if (this._every.until && t - 1000 > this._every.until) return null
    return t
  } else if (this._every && this._every.every) {
    var tt = this._every.time ? ' at ' + this._every.time : ''
    var t = this._every.day === 'day'
      ? parset(tt, { now: base })
      : parset('this ' + this._every.day + tt, { now: base })
    if (t <= base && this._every.day === 'day') {
      t.setDate(t.getDate() + 1)
    } else if (t <= base) t.setDate(t.getDate() + 7)
    if (this._every.until && t - 1000 > this._every.until) return null
    return t
  } else if (this._every && (this._created || this._every.starting)) {
    var x = this._every.starting || this._created
    var tt = this._every.time ? ' at ' + this._every.time : ''
    var t = parset('this ' + this._every.day + tt, { now: x })
    if (t <= base) return null
    return t
  }
}
