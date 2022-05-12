'use strict'

const setOutput = (key, value) => {
  console.log(`::set-output name=${key}::${value}`)
}

module.exports = {
  setOutput,
}
