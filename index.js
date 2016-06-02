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
  + '\\s*$',
  'i'
)
re.months = RegExp('(jan(?:uary)?|feb(?:ruary)?|mar(?:ch)?|apr(?:il)'
  + '|may|june?|july?|aug(?:ust)?|sep(?:t|tember)?|oct(?:ober)?'
  + '|nov(?:ember)|dec(?:ember)?)', 'i'
)
var months = [ 'jan', 'feb', 'mar', 'apr', 'may', 'jun', 'july',
  'aug', 'sep', 'oct', 'nov', 'dec' ]
re.evmonth = RegExp(
  '(?:(every|each)\\s+)?('
  + '(\\d+)(?:st|nd|rd|th)?\\s+' + re.months.source
  + '|' + re.months.source + '\\s+(\\d+)(?:st|nd|rd|th)?\\b)'
)

re.nth = RegExp('(\\d+)\\s*(?:st|nd|rd|th)\\b')
re.titleBreak = RegExp(
  '\\b(each|every|tomorrow|'
  + '(?:mon|tues?|wed(?:nes)?|thurs?|fri|sat(?:ur)?|sun)(?:days?)?'
  + ')\\b', 'i'
)
re.starting = /\b(?:starting|from)\s+(.+)/
re.until = /\b(?:until|to)\s+(.+)/

function nthf (s) {
  var m = re.nth.exec(s)
  if (m) return {
    n: m[1],
    time: s.replace(re.nth, '').trim()
  }
}

function monthf (s) {
  var m = re.evmonth.exec(s)
  if (m) return {
    date: fix(Number(m[3] || m[6])),
    month: months.indexOf(String(m[4] || m[5]).slice(0,3).toLowerCase()),
    time: s.replace(re.evmonth, '').trim()
  }
  function fix (n) { return isNaN(n) ? undefined : n }
}

function everyf (s, now) {
  if (!now) now = new Date
  var m = re.every.exec(s)
  if (!m) return m
  var time = m[1] || m[8] || null
  if (time) time = time.replace(/\s+(starting|until).*/, '')
  var ut = time && !re.time.test(m[10]) ? ' ' + time : ''
  if (ut) ut = ut.replace(/\b(starting|until).*/, '')
  var mst = re.starting.exec(s)
  if (mst) mst = mst[1].split(/\buntil\b/i)[0]
  var ust = re.until.exec(s)
  if (ust) ust = ust[1].split(/\bstarting\b/i)[0]

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
    starting: mst ? parset(mst + ut, { now: now }) : null,
    until: ust ? parset(ust + ut, { now: now }) : null,
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
  this._nth = nthf(str)
  this._month = monthf(str)
  this._created = opts.created

  this.title = this._every
    ? str.slice(0, this._every.index).trim().replace(/"/g, '')
    : null
  if (this.title) {
    var esp = str.split(re.titleBreak)
    var mstr = esp.slice(0,-4).join('').trim()
    if (mstr.length > this.title.length) {
      this.title = mstr
      var m = /(['"])([^\1]+)\1/.exec(this.title)
      if (m) this.title = m[2]
    }
  }
  this.oneTime = Boolean(!(this._every && this._every.every))
  this.range = [ new Date(-864e13), new Date(864e13) ]
  if (this.oneTime) {
    var t = this.next(this._created)
    if (!t) t = this.prev(this._created)
    if (!t) {
      t = parset(str)
    }
    this.range[0] = t
    this.range[1] = t
  }
  if (this._every && this._every.starting) {
    this.range[0] = this._every.starting
  }
  if (this._every && this._every.until) {
    this.range[1] = this._every.until
  }
  if (this.range[0] > this.range[1]
  && this.range[0].getFullYear()-1 === this.range[1].getFullYear()) {
    this.range[0].setYear(this.range[0].getFullYear()-1)
  }
}

Mess.prototype.next = function (base) {
  return this._advance(1, base)
}

Mess.prototype.prev = function (base) {
  return this._advance(-1, base)
}

Mess.prototype._advance = function (dir, base) {
  if (!base) base = new Date
  if (typeof base === 'string') base = parset(base, { now: this._created })
  if (this._every && this._every.numbered) {
    //...
  } else if (this._every && this._every.every) {
    var tt = this._every.time ? ' at ' + this._every.time : ''
    var t = base
    if (this._every.starting && t < this._every.starting) {
      t = this._every.starting
    } else if (this._every.until && t > this._every.until) {
      t = this._every.until
    } else if (this._every.day === 'day') {
      t = parset(tt, { now: base })
    } else if (!this._every.time || this._every.time.split(/\s+/).length <= 4) {
      t = parset('this ' + this._every.day + tt, { now: base })
    }
    if (((dir > 0 && t <= base) || (dir < 0 && t >= base))
    && this._every.day === 'day') {
      t.setDate(t.getDate() + 1 * dir)
    } else if ((dir > 0 && t <= base) || (dir < 0 && t >= base)) {
      t.setDate(t.getDate() + 7 * dir)
    }
    if ((this._every.starting || this._created) && this._every.other) {
      var x = this._every.starting || this._created
      var w = ((countWeeks(x, t) % 2) + 2) % 2
      if (w % 2 !== 0) t.setDate(t.getDate() + 7 * dir)
    }
    if (this._every.until && tgt(t, this._every.until)) return null
    if (this._every.starting && tlt(t, this._every.starting)) return null
    return t
  } else if (this._every && (this._created || this._every.starting)) {
    var x = this._every.starting || this._created
    var tt = this._every.time ? ' at ' + this._every.time : ''
    var t = parset('this ' + this._every.day + tt, { now: x })
    if (dir > 0 && t <= base) return null
    else if (dir < 0 && t >= base) return null
    return t
  } else if (this._month) {
    var t = this._month.time
      ? parset(this._month.time, { now: base })
      : base
    if ((this._month.month < base.getMonth()
    || (this._month.month === base.getMonth()
    && this._month.date <= base.getDate()))) {
      t.setFullYear(t.getFullYear() + dir)
    }
    t.setMonth(this._month.month)
    t.setDate(this._month.date)
    return t
  } else if (this._nth) {
    var t = this._nth.time
      ? parset(this._nth.time, { now: base })
      : base
    t.setDate(this._nth.n)
    if (dir > 0 && base.getDate() >= t.getDate()) {
      t.setMonth(t.getMonth() + 1)
    } else if (dir < 0 && base.getDate() <= t.getDate()) {
      t.setMonth(t.getMonth() - 1)
    }
    return t
  }
}

function tlt (a, b) {
  return a.getTime() + 1000 < b.getTime()
}

function tgt (a, b) {
  return a.getTime() - 1000 > b.getTime()
}
