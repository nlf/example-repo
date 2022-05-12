'use strict'

const assert = require('assert')
const { minargs } = require('minargs')

const validate = require('./validate.js')

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
        value = validate.choices(key, options[key].choices)(value, assert)
      }
    }

    result[key] = value
  }

  return result
}

module.exports = {
  parse,
}
