import {fail, redirect} from '@sveltejs/kit'
import {createPollAdminSession, clearPollAdminSession, isPollAdmin} from '$lib/server/admin/auth'
import {getPollConfigs} from '$lib/server/polls/poll-config'
import {getPollAdminResults} from '$lib/server/polls/results'
import type {Actions, PageServerLoad} from './$types'

export const load: PageServerLoad = async ({cookies}) => {
  const authenticated = isPollAdmin(cookies)

  if (!authenticated) {
    return {
      authenticated,
      polls: [],
    }
  }

  const polls = await getPollConfigs()
  const pollsWithResults = await Promise.all(
    polls.map(async (poll) => ({
      poll,
      results: await getPollAdminResults(poll._id),
    })),
  )

  return {
    authenticated,
    polls: pollsWithResults,
  }
}

export const actions: Actions = {
  login: async ({cookies, request, url}) => {
    const formData = await request.formData()
    const token = String(formData.get('token') ?? '')
    const authenticated = createPollAdminSession(cookies, token, url.protocol === 'https:')

    if (!authenticated) {
      return fail(401, {
        message: 'Forkert admin-token.',
      })
    }

    redirect(303, '/admin/polls')
  },
  logout: async ({cookies}) => {
    clearPollAdminSession(cookies)
    redirect(303, '/admin/polls')
  },
}
