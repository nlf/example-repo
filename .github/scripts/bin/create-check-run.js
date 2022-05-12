#!/usr/bin/env node
const core = require('@actions/core')
const github = require('@actions/github')

const { parse, validate } = require('../lib/args.js')

const main = async () => {
  const args = parse({
    owner: {
      required: true,
      from: {
        key: 'repository',
        parse: (value) => value.split('/')[0],
      },
    },
    repo: {
      required: true,
      from: {
        key: 'repository',
        parse: (value) => value.split('/')[1],
      },
    },
    name: { required: true },
    head_sha: { required: true },
    status: {
      required: true,
      choices: ['queued', 'in_progress', 'completed'],
    },
    conclusion: {
      choices: [
        'action_required',
        'cancelled',
        'failure',
        'neutral',
        'success',
        'skipped',
        'stale',
        'timed_out',
      ],
    },
    started_at: {
      validate: validate.date('started_at'),
    },
    completed_at: {
      validate: validate.date('completed_at'),
    },
    details_url: {
      validate: validate.url('details_url'),
    },
  })

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
