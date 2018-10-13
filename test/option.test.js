const test = require('ava')
const { Some, None } = require('../src/option')
const { Ok, Err } = require('../src/result')

let value = 42
let some = Some(value)
let none = None()

test('constructor factories', t => {
  t.throws(_ => Some(), TypeError)
  t.throws(_ => Some(undefined), TypeError)
  t.throws(_ => Some(void 0), TypeError)
})

test('isSome', t => {
  t.true(some.isSome())
})

test('isNone', t => {
  t.false(some.isNone())
})

test('expect', t => {
  t.is(some.expect('err msg'), value)
  t.throws(_ => none.expect('err msg'))
})

test('unwrap', t => {
  t.is(some.unwrap(), value)
  t.throws(_ => none.unwrap())
})

test('unwrapOr', t => {
  t.is(some.unwrapOr(3), value)
  t.is(none.unwrapOr(3), 3)
})

test('unwrapOrElse', t => {
  t.is(some.unwrapOrElse(_ => 3), value)
  t.is(none.unwrapOrElse(_ => 3), 3)
})

test('map', t => {
  t.deepEqual(some.map(v => v), Some(value))
  t.deepEqual(some.map(v => v * 2), Some(84))
  t.deepEqual(some.map(v => Some(v * 2)), Some(84))
  t.deepEqual(some.map(v => None()), None())

  // the map fn is never invoked
  t.deepEqual(none.map(v => Some(v * 2)), None())
  t.deepEqual(none.map(v => v * 2), None())
})

test('mapOr', t => {
  let altValue = 3

  t.deepEqual(some.mapOr(altValue, v => v), value)
  t.deepEqual(some.mapOr(altValue, v => v * 2), 84)
  t.deepEqual(some.mapOr(altValue, v => Some(v * 2)), Some(84))
  t.deepEqual(some.mapOr(altValue, v => None()), None())

  // the map fn is never invoked
  t.deepEqual(none.mapOr(altValue, v => Some(v * 2)), altValue)
  t.deepEqual(none.mapOr(altValue, v => v * 2), altValue)
})

test('mapOrElse', t => {
  let getAltVal = _ => 3

  t.deepEqual(some.mapOrElse(getAltVal, v => v), value)
  t.deepEqual(some.mapOrElse(getAltVal, v => v * 2), 84)
  t.deepEqual(some.mapOrElse(getAltVal, v => Some(v * 2)), Some(84))
  t.deepEqual(some.mapOrElse(getAltVal, v => None()), None())

  // the map fn is never invoked
  t.deepEqual(none.mapOrElse(getAltVal, v => Some(v * 2)), 3)
  t.deepEqual(none.mapOrElse(getAltVal, v => v * 2), 3)
})

test('okOr', t => {
  let error = Error('oh no')

  t.deepEqual(some.okOr(error), Ok(value))
  t.deepEqual(none.okOr(error), Err(error))
})

test('okOrElse', t => {
  let getError = _ => Error('oh no')

  t.deepEqual(some.okOrElse(getError), Ok(value))
  t.deepEqual(none.okOrElse(getError), Err(getError()))
})

test('iter', t => {
  for (let value of Some('hummus').iter()) {
    t.is(value, 'hummus')
  }

  // this block is never executed
  for (let value of None().iter()) {
    t.throws(_ => {})
    t.throws(lsdkfjasldkfjalewk)
  }
})

test('and', t => {
  t.deepEqual(some.and(Some(1)), Some(1))
  t.deepEqual(some.and(None()), None())
  t.deepEqual(None().and(Some(1)), None())
  t.deepEqual(None().and(None()), None())
})

// AKA `flatMap`.
test('andThen', t => {
  t.deepEqual(none.andThen(_ => {}), None())

  // map fn must return an Option variant.
  t.throws(_ => some.andThen(v => v * 2), TypeError)

  let sq = x => Some(x * x)
  let nope = _ => None()

  // prettier-ignore
  t.deepEqual(Some(2).andThen(sq).andThen(sq), Some(16))
  // prettier-ignore
  t.deepEqual(Some(2).andThen(sq).andThen(nope), None())
  // prettier-ignore
  t.deepEqual(Some(2).andThen(nope).andThen(sq), None())
  // prettier-ignore
  t.deepEqual(None().andThen(sq).andThen(sq), None())
})

test('filter', t => {
  let isEven = n => n % 2 === 0

  t.deepEqual(None().filter(isEven), None())
  t.deepEqual(Some(3).filter(isEven), None())
  t.deepEqual(Some(4).filter(isEven), Some(4))
})
