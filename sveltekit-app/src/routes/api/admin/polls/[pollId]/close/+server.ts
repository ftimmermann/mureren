import {error, json} from '@sveltejs/kit'
import {requirePollAdmin} from '$lib/server/admin/auth'
import {getAdminCorsHeaders, handleAdminOptions} from '$lib/server/admin/cors'
import {closePollConfig, getPollConfig} from '$lib/server/polls/poll-config'
import type {RequestHandler} from './$types'

export const OPTIONS: RequestHandler = async ({request}) => handleAdminOptions(request)

export const POST: RequestHandler = async ({cookies, params, request}) => {
  requirePollAdmin(cookies, request)

  const poll = await getPollConfig(params.pollId)

  if (!poll) {
    error(404, 'Poll not found')
  }

  if (poll.status === 'closed') {
    return json({poll}, {headers: getAdminCorsHeaders(request)})
  }

  const closedPoll = await closePollConfig(poll._id)

  return json({poll: closedPoll}, {headers: getAdminCorsHeaders(request)})
}
