#!/usr/bin/env node
'use strict'

const core = require('@actions/core')
const github = require('@actions/github')

const { parse } = require('../lib/args.js')
const { update } = require('../lib/check-run.js')

const main = async () => {
  const args = parse(update)
  core.info(`Updating check run: ${args.check_run_id}`)
  const octokit = github.getOctokit(process.env.GITHUB_TOKEN)
  await octokit.rest.checks.update(args)
  core.info(`Updated check run: ${args.check_run_id}`)
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

