#!/usr/bin/env node
'use strict'

const core = require('@actions/core')
const github = require('@actions/github')

const { parse } = require('../lib/args.js')
const { create } = require('../lib/check-run.js')

const main = async () => {
  const args = parse(create)
  core.info(`Creating check run: ${args.name}`)
  const octokit = github.getOctokit(process.env.GITHUB_TOKEN)
  const checkRun = await octokit.rest.checks.create(args)
  core.info(`Created check run: ${checkRun.data.id}`)
  core.setOutput('script-result', checkRun.data.id)
}

main().catch((err) => {
  if (err.status) {
    console.error(err.stack)
  } else if (err.code === 'ERR_ASSERTION') {
    console.error(`ERROR: ${err.message}`)
  } else {
    console.error(err.stack)
  }
  process.exitCode = 1
})
