'use strict'

const validate = require('./validate.js')

const owner = {
  required: true,
  from: {
    key: 'repository',
    parse: (value) => value.split('/')[0],
  },
}

const repo = {
  required: true,
  from: {
    key: 'repository',
    parse: (value) => value.split('/')[1],
  },
}

const status = {
  choices: ['queued', 'in_progress', 'completed'],
}

const conclusion = {
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
}

const started_at = {
  validate: validate.date('started_at'),
}

const completed_at = {
  validate: validate.date('completed_at'),
}

const details_url = {
  validate: validate.url('details_url'),
}

const create = {
  owner,
  repo,
  conclusion,
  started_at,
  completed_at,
  details_url,
  name: { required: true },
  head_sha: { required: true },
  status: { ...status, required: true },
}

const update = {
  owner,
  repo,
  status,
  conclusion,
  check_run_id: { required: true },
}

const copy = {
  owner,
  repo,
  run_id: { required: true },
}

module.exports = {
  create,
  update,
  copy,
}
