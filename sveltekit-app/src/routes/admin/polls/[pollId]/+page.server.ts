import {error} from '@sveltejs/kit'
import {requirePollAdminPage} from '$lib/server/admin/auth'
import {getPollConfig} from '$lib/server/polls/poll-config'
import {getPollAdminResults} from '$lib/server/polls/results'
import type {PageServerLoad} from './$types'

export const load: PageServerLoad = async ({cookies, params}) => {
  requirePollAdminPage(cookies)

  const poll = await getPollConfig(params.pollId)

  if (!poll) {
    error(404, 'Poll not found')
  }

  return {
    poll,
    results: await getPollAdminResults(poll._id),
  }
}
