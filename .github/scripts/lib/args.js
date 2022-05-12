'use strict'

const assert = require('assert')
const { minargs } = require('minargs')

const parse = (options, argv = process.argv) => {
  const { args } = minargs(argv)
  const result = {}

  for (const key in options) {
    let value = args[key] ? args[key][0] : undefined

    // resolve a derived value first
    if (options[key].from) {
      const fromKey = options[key].from.key
      const fromValue = validate.required(fromKey)(args[fromKey], assert)
      value = options[key].from.parse(fromValue)
    }

    // if there's a validate function, run it
    if (value && options[key].validate) {
      value = options[key].validate(value, assert)
    } else {
      // ensure required values exist
      if (options[key].required) {
        value = validate.required(key)(value, assert)
      }

      // ensure it matches a choice if they're provided
      if (value && options[key].choices) {
        const choices = options[key].choices
        assert.ok(choices.includes(value),
          `parameter "${key}" must be one of: ${choices.map(entry => `"${entry}"`).join(', ')}`)
      }
    }

    result[key] = value
  }

  return result
}

const validate = {}
validate.required = (key) => {
  return (value, assert) => {
    assert.ok(value, `must specify parameter "${key}"`)
    if (Array.isArray(value)) {
      assert.equal(value.length, 1, `must specify parameter "${key}" exactly once`)
      assert.ok(value[0].length, `must provide value for parameter "${key}"`)
      return value[0]
    }
    return value
  }
}

validate.date = (key) => {
  return (value, assert) => {
    const parsed = new Date(value)
    try {
      return parsed.toISOString()
    } catch (err) {
      throw new assert.AssertionError({
        message: `invalid value for "${key}", must be a valid timestamp`,
        actual: value,
      })
    }
  }
}

validate.url = (key) => {
  return (value, assert) => {
    try {
      return new URL(value).href
    } catch (err) {
      throw new assert.AssertionError({
        message: `invalid value for "${key}", must be a valid URL`,
        actual: value,
      })
    }
  }
}

module.exports = {
  parse,
  validate,
}
