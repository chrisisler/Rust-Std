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
  // If you are passing the result of a function call, use `unwrapOrElse`.
  unwrapOr(alternative) {
    if (this.isSome()) {
      return this.value
    }
    return alternative
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
      // Flatten the return type if necessary.
      if (isOption(mapped)) {
        return mapped
      }
      return Some(mapped)
    }
    return this
  }

  // Applies a function to the contained value (if `Some`), or returns the
  // provided alternative (if `None`).
  mapOr(alternative, fn) {
    if (this.isSome()) {
      let mapped = fn(this.value)
      if (isOption(mapped)) {
        return mapped
      }
      return Some(mapped)
    }
    return alternative
  }

  // Applies a function to the contained value (if `Some`), or computes
  // an alternative (if `None`).
  mapOrElse(computeAlternative, fn) {
    if (this.isSome()) {
      let mapped = fn(this.value)
      if (isOption(mapped)) {
        return mapped
      }
      return Some(mapped)
    }
    return computeAlternative()
  }

  // Transform the `Option` into a `Result`, mapping `Some(v)` to `Ok(v)` and
  // `None` to `Err(error)`.
  // If you are passing the result of a function call, it is recommend to use
  // `okOrElse`.
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
  iter() {
    return this[Symbol.iterator]()
  }

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
  // Also called flatMap.
  andThen(fn) {
    if (this.isSome()) {
      let mapped = fn(this.value)
      if (!isOption(mapped)) {
        throw TypeError(
          'Expected `fn` to return `Option` type, received ' + typeof mapped
        )
      }
      return mapped
    }
    return this
  }

  // Alias.
  flatMap(fn) {
    return this.andThen(fn)
  }
}

function isOption(x) {
  return x.constructor.name === 'Option'
}

function None() {
  return new Option(void 0)
}

function Some(value) {
  return new Option(value)
}

module.exports = { None, Some }

let option = new Some(3)
console.log('option is:', option)
// for (value of option) {
//   console.log('value is:', value)
// }
