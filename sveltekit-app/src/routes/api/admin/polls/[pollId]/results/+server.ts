import {error, json} from '@sveltejs/kit'
import {requirePollAdmin} from '$lib/server/admin/auth'
import {getAdminCorsHeaders, handleAdminOptions} from '$lib/server/admin/cors'
import {getPollConfig} from '$lib/server/polls/poll-config'
import {getPollAdminResults} from '$lib/server/polls/results'
import type {RequestHandler} from './$types'

export const OPTIONS: RequestHandler = async ({request}) => handleAdminOptions(request)

export const GET: RequestHandler = async ({cookies, params, request}) => {
  requirePollAdmin(cookies, request)

  const poll = await getPollConfig(params.pollId)

  if (!poll) {
    error(404, 'Poll not found')
  }

  return json(
    {
      poll,
      results: await getPollAdminResults(poll._id),
    },
    {
      headers: getAdminCorsHeaders(request),
    },
  )
}
