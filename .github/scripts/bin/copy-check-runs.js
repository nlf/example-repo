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
  const { data: workflowRun } = await octokit.rest.actions.getWorkflowRun({
    owner: args.owner,
    repo: args.repo,
    run_id: args.run_id,
  })

  core.info(`Listing completed check runs for check suite: ${workflowRun.check_suite_id}`)
  const { data: checkRuns } = await octokit.rest.checks.listForSuite({
    owner: args.owner,
    repo: args.repo,
    check_suite_id: workflowRun.check_suite_id,
    status: 'completed',
  })

  let scriptResult = 'success'
  for (const checkRun of checkRuns.check_runs) {
    if (checkRun.conclusion !== 'success') {
      scriptResult = checkRun.conclusion
    }

    core.info(`Copying check run: ${checkRun.name}`)
    await octokit.rest.checks.create({
      owner: args.owner,
      repo: args.repo,
      head_sha: args.head_sha,
      name: checkRun.name,
      status: checkRun.status,
      conclusion: checkRun.conclusion,
      started_at: checkRun.started_at,
      completed_at: checkRun.completed_at,
      output: {
        title: checkRun.name,
        summary: checkRun.details_url,
      },
    })
  }

  core.info(`Finished copying check runs, final result: ${scriptResult}`)
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

