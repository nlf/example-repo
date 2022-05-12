#!/usr/bin/env node
'use strict'

const core = require('@actions/core')
const github = require('@actions/github')

const { parse } = require('../lib/args.js')
const { copy } = require('../lib/check-run.js')

const main = async () => {
  const args = parse(copy)
  const octokit = github.getOctokit(process.env.GITHUB_TOKEN)
  core.info(`Getting check suite id for workflow run: ${args.run_id}`)
  const { data: workflowRun } = await octokit.rest.actions.getWorkflowRun(args)
  core.info(`Listing completed check runs for check suite: ${workflowRun.check_suite_id}`)
  let scriptResult = 'success'
  const { data: checkRuns } = await octokit.rest.checks.listForSuite({
    owner: args.owner,
    repo: args.repo,
    check_suite_id: workflowRun.check_suite_id,
    status: 'completed',
  })
  core.info(JSON.stringify(checkRuns))
  core.setOutput('script-result', scriptResult)
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

