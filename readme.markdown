# parse-messy-schedule

parse recurring or one-off scheduled events from free-form text

# example

``` js
var parse = require('parse-messy-schedule')
var str = process.argv.slice(2).join(' ')
var ev = parse(str)

console.log('#', ev.title)
var n = undefined
for (var i = 0; i < 3; i++) {
  n = ev.next(n)
  if (!n) break
  console.log(n)
}
```

output:

```
$ node next3.js DMV tomorrow at 10:30
# DMV
Fri Dec 11 2015 10:30:00 GMT-0800 (PST)
```

```
$ node next3.js javascript study group thursdays at 7 pm
# javascript study group
Thu Dec 10 2015 19:00:00 GMT-0800 (PST)
Thu Dec 17 2015 19:00:00 GMT-0800 (PST)
Thu Dec 24 2015 19:00:00 GMT-0800 (PST)
```

```
$ node next3.js oakland wiki 18:30 every other wednesday starting dec 2 until dec 23
# oakland wiki
Wed Dec 16 2015 18:30:00 GMT-0800 (PST)
Wed Dec 23 2015 18:30:00 GMT-0800 (PST)
```

# api

``` js
var parse = require('parse-messy-schedule')
```

## var m = parse(str, opts)

Parse `str`, returning a parse object `m`.

* `opts.created` - the time when `str` was created

## m.title

event title

## m.range[0]

lower-bound date of event range

## m.range[1]

upper-bound date of event range

## m.oneTime

boolean, whether the event is a one-time event

## m.next(base)

Return the next time the event will be held starting from `base`, or now if
`base` isn't given.

## m.prev(base)

Return the last time the event was held starting from `base`, or now if `base`
isn't given.

# install

```
npm install parse-messy-schedule
```

# license

BSD
