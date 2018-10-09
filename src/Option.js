const { Ok, Err } = require('./Result')

class Option {
  constructor(value) {
    if (value !== void 0) {
      this.value = value
    }
  }

  /////////////////////////////////////////////////////////////////////////////
  // Querying contained values ////////////////////////////////////////////////
  /////////////////////////////////////////////////////////////////////////////

  // Return `true` if the option is a `Some` value.
  isSome() {
    return 'value' in this
  }

  // Return `true` if the option is a `None` value.
  isNone() {
    console.log('this is:', this)
    return !this.isSome()
  }

  /////////////////////////////////////////////////////////////////////////////
  // Getting the contained values /////////////////////////////////////////////
  /////////////////////////////////////////////////////////////////////////////

  // Unwraps an option, returning the content of a `Some`.
  // Throws if the value is a `None` with a custom message provided by `message`.
  expect(message) {
    if (this.isSome()) {
      return this.value
    }
    throw Error(message)
  }

  // Returns the value out of the `Option` if it is `Some`.
  // Use of this function is discouraged because it may throw.
  // Instead, prefer to handle the `None` case explicitly.
  unwrap() {
    if (this.isSome()) {
      return this.value
    }
    throw Error('Called `Option#unwrap()` on a `None` value')
  }

  // Returns the contained value or a alternative.
  // If passing the result of a function call, use `unwrapOrElse`.
  unwrapOr(alt) {
    if (this.isSome()) {
      return this.value
    }
    return alt
  }

  // Returns the contained value or computes it from a given function.
  unwrapOrElse(fn) {
    if (this.isSome()) {
      return this.value
    }
    return fn()
  }

  /////////////////////////////////////////////////////////////////////////////
  // Transforming contained values ////////////////////////////////////////////
  /////////////////////////////////////////////////////////////////////////////

  // Maps an `Option` by applying a function to a contained value.
  map(fn) {
    if (this.isSome()) {
      let mapped = fn(this.value)
      // if (_isOption(mapped)) {
      //   return mapped
      // }
      return Some(mapped)
    }
    return this
  }

  // Applies a function to the contained value (if `Some`), or returns the
  // provided alternative (if `None`).
  mapOr(altValue, fn) {
    if (this.isSome()) {
      let mapped = fn(this.value)
      // if (_isOption(mapped)) {
      //   return mapped
      // }
      return Some(mapped)
    }
    return altValue
  }

  // Applies a function to the contained value (if `Some`), or computes
  // an alternative (if `None`).
  mapOrElse(computerAlt, fn) {
    if (this.isSome()) {
      let mapped = fn(this.value)
      // if (_isOption(mapped)) {
      //   return mapped
      // }
      return Some(mapped)
    }
    return computerAlt()
  }

  // Transform the `Option` into a `Result`, mapping `Some(v)` to `Ok(v)` and
  // `None` to `Err(error)`.
  // If passing the result of a function call, prefer using `okOrElse`.
  okOr(error) {
    if (this.isSome()) {
      return Ok(this.value)
    }
    return Err(error)
  }

  // Transform the `Option` into a `Result`, mapping `Some(v)` to `Ok(v)` and
  // `None` to `Err(getError())`.
  okOrElse(getError) {
    if (this.isSome()) {
      return Ok(this.value)
    }
    return Err(getError())
  }

  /////////////////////////////////////////////////////////////////////////////
  // Iterator constructors ////////////////////////////////////////////////////
  /////////////////////////////////////////////////////////////////////////////

  // Returns an iterator over the possibly contained value.
  // TODO
  // iter() {
  //   return this[Symbol.iterator]
  // }

  // Returns an iterator over the possibly contained value.
  [Symbol.iterator]() {
    let taken = false
    return {
      next: () => {
        if (taken === true || this.isNone()) {
          return { done: true }
        }
        taken = true
        return { value: this.value, done: false }
      }
    }
  }

  /////////////////////////////////////////////////////////////////////////////
  // Boolean operations on contained values ///////////////////////////////////
  /////////////////////////////////////////////////////////////////////////////

  // Returns `None` if the option is `none`, otherwise returns `rhsOption`.
  and(rhsOption) {
    if (this.isSome()) {
      return rhsOption
    }
    return this
  }

  // Returns `None` if the option is `None`, otherwise calls `fn` with the
  // contained value and returns the result.
  andThen(fn) {
    if (this.isSome()) {
      let mapped = fn(this.value)
      if (!_isOption(mapped)) {
        throw TypeError(
          'Expected `fn` to return `Option` type, received ' + typeof mapped
        )
      }
      return mapped
    }
    return this
  }

  flatMap(fn) {
    return this.andThen(fn)
  }

  // Returns `None` if the option is `None`, otherwise calls `predicate`
  // with the contained value and returns:
  // - `Some(v)` if `predicate` returns `true`
  // - `None` if `predicate` returns `false`
  filter(predicate) {
    if (this.isSome()) {
      let ret = predicate(this.value)
      if (typeof ret !== 'boolean') {
        throw TypeError(
          'Expected `predicate` to return boolean, received ' + typeof ret
        )
      }
      if (ret === true) {
        return this
      }
      return None()
    }
    return this
  }

  // Returns the `Option` if it contains a value, otherwise returns `alt`.
  // If passing the result of a function call, prefer using `orElse`.
  or(altOption) {
    if (this.isSome()) {
      return this
    }
    return altOption
  }

  // Returns the `Option` if it contains a value, otherwise calls `fn` and
  // returns the result.
  orElse(fn) {
    if (this.isSome()) {
      return this
    }
    let computed = fn()
    if (!_isOption(computed)) {
      throw TypeError(
        'Expected `fn` to return `Option` type, received ' + typeof computed
      )
    }
    return computed
  }

  // Returns `Some` if only one of `self`, `alt` is `Some`, otherwise returns `None`.
  xor(alt) {
    if (this.isSome() && alt.isNone()) return this
    if (this.isNone() && alt.isSome()) return alt
    return None()
  }

  /////////////////////////////////////////////////////////////////////////////
  // Entry-like operations to insert if None and return a reference ///////////
  /////////////////////////////////////////////////////////////////////////////

  // If the option is `None`, inserts `v`, then returns the contained value.
  getOrInsert(v) {
    if (v === void 0) {
      throw TypeError('Expected `v` not to be `undefined`')
    }

    if (this.isNone()) {
      this.value = v
    }

    if (this.isNone()) {
      throw Error('unreachable')
    }

    return this.value
  }

  // If the option is `None`, inserts a value computed from `fn`, then returns
  // the contained value.
  getOrInsertWith(fn) {
    if (this.isNone()) {
      let computed = fn()
      if (computed === void 0) {
        throw TypeError(
          'Expected value computed from `fn` not to be `undefined`'
        )
      }

      if (_isOption(computed)) {
        this.value = computed.value
      } else {
        this.value = computed
      }
    }

    if (this.isNone()) {
      throw Error('unreachable')
    }

    return this.value
  }

  /////////////////////////////////////////////////////////////////////////////
  // Misc /////////////////////////////////////////////////////////////////////
  /////////////////////////////////////////////////////////////////////////////

  // Takes the value out of the option, leaving a `None` in its place.
  take() {
    if (this.isNone()) {
      return this
    }
    let taken = this.value
    this.value = void 0
    return Some(taken)
  }

  // Replaces the actual value in the option by the given value,
  // returning the old option if present.
  //   let x = Some(2)
  //   let old = x.replace(5)
  //   x //=> Some(5)
  //   old //=> Some(2)
  replace(v) {
    if (v === void 0) {
      throw TypeError('Expected parameter `v` not to be `undefined`')
    }

    if (this.isSome()) {
      let oldValue = this.value
      this.value = v
      return Some(oldValue)
    }

    this.value = v
    return None()
  }

  // Transposes an `Option` of a `Result` into a `Result` of an `Option`.
  // `None` will be mapped to `Ok(None)`.
  // `Some(Ok(_))` and `Some(Err(_))` will be mapped to `Ok(Some(_))` and `Err(_)`.
  transpose() {
    if (this.isNone()) {
      return Ok(this)
    }

    let containedType = this.value.constructor.name
    if (containedType !== 'Result') {
      throw TypeError(
        'Expected contained value to have type `Result`, instead is ' +
          containedType
      )
    } else {
      let { value, error } = this.value
      if (this.value.isOk()) {
        return Ok(Some(value))
      }
      return Err(error)
    }
  }

  unwrapOrDefault() {
    if (this.isSome()) {
      return this.value
    }
    return Option.default()
  }

  static default() {
    return None()
  }

  static from(val) {
    return Some(val)
  }
}

function _isOption(x) {
  return x.constructor.name === 'Option'
}

function None() {
  return new Option(void 0)
}

function Some(value) {
  // if (_isOption(value)) {
  //   Will not work when `Option` internally uses `function` instead of `class`.
  //   return new Option(value.value)
  // }
  return new Option(value)
}

module.exports = { None, Some }
