'use strict'

const required = (key) => {
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

const date = (key) => {
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

const url = (key) => {
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

const choices = (key, choices) => {
  return (value, assert) => {
    assert.ok(choices.includes(value), `parameter "${key}" must be one of: ${choices.join(', ')}`)
    return value
  }
}

module.exports = {
  required,
  date,
  url,
  choices,
}
