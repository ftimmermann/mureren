import {error} from '@sveltejs/kit'
import {toCsv} from '$lib/server/admin/csv'
import {requirePollAdmin} from '$lib/server/admin/auth'
import {getAdminCorsHeaders, handleAdminOptions} from '$lib/server/admin/cors'
import {getPollConfig} from '$lib/server/polls/poll-config'
import {getPollExportRows} from '$lib/server/polls/results'
import type {RequestHandler} from './$types'

export const OPTIONS: RequestHandler = async ({request}) => handleAdminOptions(request)

export const GET: RequestHandler = async ({cookies, params, request}) => {
  requirePollAdmin(cookies, request)

  const poll = await getPollConfig(params.pollId)

  if (!poll) {
    error(404, 'Poll not found')
  }

  const rows = await getPollExportRows(poll._id)

  const headers = getAdminCorsHeaders(request)

  headers.set('content-disposition', `attachment; filename="poll-${poll._id}.csv"`)
  headers.set('content-type', 'text/csv; charset=utf-8')

  return new Response(toCsv(rows), {
    headers,
  })
}
