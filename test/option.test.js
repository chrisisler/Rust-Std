const test = require('ava')
const { Some, None, Option } = require('../src/option')
const { Ok, Err } = require('../src/result')

let some42 = Some(42)
let none = None()

test('constructor factories', t => {
  t.throws(_ => Some(), TypeError)
  t.throws(_ => Some(undefined), TypeError)
  t.throws(_ => Some(void 0), TypeError)

  t.notThrows(_ => None('foo'))
  t.notThrows(_ => None(1))
  t.notThrows(_ => None(false))

  t.throws(Option)
  t.throws(_ => Option())

  t.throws(_ => new Option())
})

test('isSome', t => {
  t.true(some42.isSome())
})

test('isNone', t => {
  t.false(some42.isNone())
})

test('expect', t => {
  t.is(some42.expect('err msg'), 42)
  t.throws(_ => none.expect('err msg'))
})

test('unwrap', t => {
  t.is(some42.unwrap(), 42)
  t.throws(_ => none.unwrap())
})

test('unwrapOr', t => {
  t.is(some42.unwrapOr(3), 42)
  t.is(none.unwrapOr(3), 3)
})

test('unwrapOrElse', t => {
  t.is(some42.unwrapOrElse(_ => 3), 42)
  t.is(none.unwrapOrElse(_ => 3), 3)
})

test('map', t => {
  t.deepEqual(some42.map(v => v), Some(42))
  t.deepEqual(some42.map(v => v * 2), Some(84))
  t.deepEqual(some42.map(v => Some(v * 2)), Some(84))
  t.deepEqual(some42.map(v => None()), None())

  // the map fn is never invoked
  t.deepEqual(none.map(v => Some(v * 2)), None())
  t.deepEqual(none.map(v => v * 2), None())
})

test('mapOr', t => {
  let altValue = 3

  t.deepEqual(some42.mapOr(altValue, v => v), 42)
  t.deepEqual(some42.mapOr(altValue, v => v * 2), 84)
  t.deepEqual(some42.mapOr(altValue, v => Some(v * 2)), Some(84))
  t.deepEqual(some42.mapOr(altValue, v => None()), None())

  // the map fn is never invoked
  t.deepEqual(none.mapOr(altValue, v => Some(v * 2)), altValue)
  t.deepEqual(none.mapOr(altValue, v => v * 2), altValue)
})

test('mapOrElse', t => {
  let getAltVal = _ => 3

  t.deepEqual(some42.mapOrElse(getAltVal, v => v), 42)
  t.deepEqual(some42.mapOrElse(getAltVal, v => v * 2), 84)
  t.deepEqual(some42.mapOrElse(getAltVal, v => Some(v * 2)), Some(84))
  t.deepEqual(some42.mapOrElse(getAltVal, v => None()), None())

  // the map fn is never invoked
  t.deepEqual(none.mapOrElse(getAltVal, v => Some(v * 2)), 3)
  t.deepEqual(none.mapOrElse(getAltVal, v => v * 2), 3)
})

test('okOr', t => {
  let error = Error('oh no')

  t.deepEqual(some42.okOr(error), Ok(42))
  t.deepEqual(none.okOr(error), Err(error))
})

test('okOrElse', t => {
  let getError = _ => Error('oh no')

  t.deepEqual(some42.okOrElse(getError), Ok(42))
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
  t.deepEqual(some42.and(Some(1)), Some(1))
  t.deepEqual(some42.and(None()), None())
  t.deepEqual(None().and(Some(1)), None())
  t.deepEqual(None().and(None()), None())
})

// AKA `flatMap`.
test('andThen', t => {
  t.deepEqual(none.andThen(_ => {}), None())

  // map fn must return an Option variant.
  t.throws(_ => some42.andThen(v => v * 2), TypeError)

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

  t.throws(_ => Some(4).filter(v => String()), TypeError)
})

test('or', t => {
  t.deepEqual(some42.or(Some(2)), some42)
  t.deepEqual(some42.or(None()), some42)

  t.deepEqual(None().or(Some(2)), Some(2))
  t.deepEqual(None().or(None()), None())

  t.throws(_ => Some(3).or('foo'), TypeError)
  t.throws(_ => None().or('bar'), TypeError)
})

test('orElse', t => {
  t.deepEqual(some42.orElse(_ => Some(2)), some42)
  t.deepEqual(some42.orElse(_ => None()), some42)

  t.deepEqual(None().orElse(_ => Some(2)), Some(2))
  t.deepEqual(None().orElse(_ => None()), None())

  t.notThrows(_ => Some(3).orElse(_ => 'baz'), TypeError)
  t.throws(_ => None().orElse(_ => 'qux'), TypeError)
})

test('xor', t => {
  t.deepEqual(some42.xor(None()), some42)
  t.deepEqual(some42.xor(Some('foo')), None())

  t.deepEqual(None().xor(Some('foo')), Some('foo'))
  t.deepEqual(None().xor(None()), None())

  t.throws(_ => some42.xor('bar'), TypeError)
  t.throws(_ => some42.xor(3), TypeError)
  t.throws(_ => some42.xor(true), TypeError)
})

test('getOrInsert', t => {
  t.throws(_ => some42.getOrInsert(void 0), TypeError)
  t.is(some42.getOrInsert('pizza'), 42)

  let option = None()
  t.is(option.getOrInsert('pizza'), 'pizza')
  // `option` is a `Some('pizza')` now:
  t.is(option.unwrap(), 'pizza')
})

test('getOrInsertWith', t => {
  t.is(some42.getOrInsertWith(_ => 'becca'), 42)

  t.is(None().getOrInsertWith(_ => 'becca'), 'becca')

  t.throws(_ => None().getOrInsertWith(_ => void 0), TypeError)
  t.throws(_ => None().getOrInsertWith(_ => None()), TypeError)

  // Doesn't throw because the option instance is a `Some` variant
  // so the inserting fn is never called
  t.notThrows(_ => Some(4).getOrInsertWith(_ => None()), TypeError)
  t.notThrows(_ => Some(4).getOrInsertWith(_ => void 0), TypeError)
})

test('take', t => {
  let x = Some(2)
  let y = x.take()
  t.deepEqual(x, None())
  t.deepEqual(y, Some(2))

  let a = None()
  let b = a.take()
  t.deepEqual(a, None())
  t.deepEqual(b, None())
})

test('replace', t => {
  let x = Some(2)
  let y = x.replace(5)
  t.deepEqual(x, Some(5))
  t.deepEqual(y, Some(2))

  let a = None()
  let b = a.replace(3)
  t.deepEqual(a, Some(3))
  t.deepEqual(b, None())
})

test('transpose', t => {
  let x = Ok(Some(5))
  let y = Some(Ok(5))

  t.deepEqual(x, y.transpose())
  // Causes AVA to fail due to: "`Some` is not defined" (in result.js) BUG
  // t.deepEqual(y, x.transpose())

  t.deepEqual(Some(Err('oh no')).transpose(), Err('oh no'))

  t.deepEqual(None().transpose(), Ok(None()))
})

// test('unwrapOrDefault', t => {})

test('Option.default', t => {
  // Exported properly?
  t.truthy(Option.default)

  t.deepEqual(Option.default(), None())
})

test('Option.from', t => {
  // Exported properly?
  t.truthy(Option.from)

  t.deepEqual(Option.from(void 0), None())

  t.deepEqual(Option.from(null), Some(null))
  t.deepEqual(Option.from(3), Some(3))
})
