#!/usr/bin/env node
const { parse, validate } = require('../lib/args.js')
const { setOutput } = require('../lib/action.js')
const octokit = require('../lib/octokit.js')

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

  const checkRun = await octokit.rest.checks.create(args)
  setOutput('check-id', checkRun.id)
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
