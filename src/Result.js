// Private
class Result {
  constructor(value, error) {
    if (value !== void 0) this.value = value
    if (error !== void 0) this.error = error
  }

  /////////////////////////////////////////////////////////////////////////////
  // Querying contained values ////////////////////////////////////////////////
  /////////////////////////////////////////////////////////////////////////////

  // Returns `true` if the result is `Ok`.
  isOk() {
    return this.value !== void 0
  }

  // Returns `true` if the result is `Err`.
  isErr() {
    return !this.isOk()
  }

  /////////////////////////////////////////////////////////////////////////////
  // Transforming contained values ////////////////////////////////////////////
  /////////////////////////////////////////////////////////////////////////////

  // Maps a `Result` to `Result` by applying a function to the `Ok` value.
  map(fn) {
    if (this.isOk()) {
      let result = fn(this.value)
      if (result.constructor.name === 'Result') {
        // `result` is either `Ok` or `Err`, both are acceptable
        return result
      }
      return Ok(result)
    }
    return this
  }

  // Maps a `Result` to `Result` by applying a function to the `Err` value.
  mapErr(fn) {
    if (this.isErr()) {
      let result = fn(this.error)
      if (result.constructor.name === 'Result') {
        // If `result` is not `Err`, enforce that error results stay as errors
        return result.isErr() ? result : Err(result.unwrap())
      }
      return Err(result)
    }
    return this
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
    let { isOk, value, error } = this
    return {
      next() {
        if (taken) {
          taken = false
          let v = isOk() ? value : error
          return { value: v, done: false }
        }
        return { done: true }
      }
    }
  }

  /////////////////////////////////////////////////////////////////////////////
  // Boolean operations on contained values ///////////////////////////////////
  /////////////////////////////////////////////////////////////////////////////

  // Returns `other` if the AND operation is `Ok`, otherwise the `Err` value of `this`.
  and(rhs) {
    if (this.isErr()) {
      return this
    }
    return rhs
  }

  // Calls `fn` if the result is `Ok`, otherwise returns the `Err` value of `this`.
  andThen(fn) {
    if (this.isOk()) {
      let result = fn(this.value)
      if (result.constructor.name !== 'Result') {
        throw TypeError(
          `Expected function to return Result type, received ${typeof result}.`
        )
      }
      return result
    }
    return this
  }

  // Returns `other` if the result is `Err`, otherwise returns the `Ok` value of `this`.
  // If you are passing the result of a function call, it is recommended to use `orElse`.
  or(rhs) {
    if (this.error && rhs.error) return rhs
    if (this.error) return rhs
    if (rhs.error) return this
    return this
  }

  // Calls `fn` if the result is `Err`, otherwise returns the `Ok` value of `this`.
  orElse(fn) {
    if (this.isOk()) {
      return this
    }
    let result = fn(this.error)
    if (result.constructor.name !== 'Result') {
      throw TypeError(
        `Expected function to return Result type, received ${typeof result}.`
      )
    }
    return result
  }

  // Unwraps a result, returning the content of an `Ok`. Else, it returns `nextError`.
  // If you are passing the result of a function call, it is recommended to use `unwrapOrElse`.
  unwrapOr(nextError) {
    if (this.isOk()) {
      return this.value
    }
    return nextError
  }

  // Unwraps a result, returning the content of an `Ok`.
  // If the value is an `Err` then it calls `fn` with its value.
  unwrapOrElse(fn) {
    if (this.isOk()) {
      return this.value
    }
    return fn(this.error)
  }

  // Unwraps a result, returning the content of an `Ok`.
  // Throws if the value is an `Err`, with a message provided by the `Err` value.
  unwrap() {
    if (this.isOk()) {
      return this.value
    }
    throw Error('Called `Result#unwrap()` on an `Err` value: ' + this.error)
  }

  // Unwraps a result, returning the content of an `Ok`.
  // Throw if the value is an `Err`, with a message including the
  // passed message, and the content of the `Err`.
  expect(errorMessage) {
    if (this.isOk()) {
      return this.value
    }
    throw Error(`${errorMessage} ${this.error}`)
  }

  // Unwraps a result, returning the content of an `Err`.
  // Throws if the value is an `Ok`, with a message provided by the `Ok` value.
  unwrapErr() {
    if (this.isErr()) {
      return this.error
    }
    throw Error('called `Result#unwrapErr()` on an `Ok` value: ' + this.value)
  }

  // Unwraps a result, returning the content of an `Err`.
  // Throw if the value is an `Ok`, with a message including the
  // passed message, and the content of the `Ok`.
  expectErr(okMessage) {
    if (this.isOk()) {
      throw Error(`${okMessage} ${this.value}`)
    }
    return this.error
  }

  // Rust question mark operator.
  try() {
    if (this.isOk()) {
      return this.value
    }
    throw this.error
  }

  // Try catch wrapper into `Result`.
  static try(fn) {
    try {
      return Ok(fn())
    } catch (error) {
      return Err(error)
    }
  }
}

function Ok(value) {
  return new Result(value, void 0)
}

function Err(error) {
  return new Result(void 0, error)
}

module.exports = { Ok, Err }
