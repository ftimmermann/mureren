import {error, json} from '@sveltejs/kit'
import {db} from '$lib/server/db/client'
import {pollResponses, pollVotes} from '$lib/server/db/schema'
import {
  getPollConfig,
  isPollOpen,
  normalizeSelectedOptionKeys,
  shouldShowPublicResults,
  validateSelectedOptionKeys,
} from '$lib/server/polls/poll-config'
import {getPollResults, getPollVoteState} from '$lib/server/polls/results'
import {getOrCreateVoterHash} from '$lib/server/polls/voter'
import type {RequestHandler} from './$types'

export const GET: RequestHandler = async ({cookies, params, url}) => {
  const poll = await getPollConfig(params.pollId)

  if (!poll) {
    error(404, 'Poll not found')
  }

  const voterHash = getOrCreateVoterHash(cookies, url.protocol === 'https:')
  const voteState = await getPollVoteState(poll._id, voterHash)
  const showResults = shouldShowPublicResults(poll, voteState.hasVoted)
  const results = showResults ? await getPollResults(poll._id) : null

  return json({
    pollId: poll._id,
    hasVoted: voteState.hasVoted,
    isOpen: isPollOpen(poll),
    showResults,
    results,
  })
}

export const POST: RequestHandler = async ({cookies, params, request, url}) => {
  const poll = await getPollConfig(params.pollId)

  if (!poll) {
    error(404, 'Poll not found')
  }

  if (!isPollOpen(poll)) {
    error(400, 'Poll is not open for voting')
  }

  const payload = (await request.json().catch(() => null)) as {
    optionKeys?: unknown
    optionKey?: unknown
  } | null
  const selectedOptionKeys = normalizeSelectedOptionKeys(payload?.optionKeys ?? payload?.optionKey)
  const validation = validateSelectedOptionKeys(poll, selectedOptionKeys)

  if (!validation.ok) {
    error(400, validation.message)
  }

  const voterHash = getOrCreateVoterHash(cookies, url.protocol === 'https:')

  try {
    await db.transaction(async (transaction) => {
      const [response] = await transaction
        .insert(pollResponses)
        .values({
          pollId: poll._id,
          voterHash,
        })
        .returning({id: pollResponses.id})

      await transaction.insert(pollVotes).values(
        validation.optionKeys.map((optionKey) => ({
          responseId: response.id,
          pollId: poll._id,
          optionKey,
        })),
      )
    })
  } catch (cause) {
    const message = cause instanceof Error ? cause.message : ''

    if (message.includes('poll_responses_poll_voter_unique')) {
      error(409, 'You have already voted in this poll')
    }

    throw cause
  }

  const showResults = shouldShowPublicResults(poll, true)
  const results = showResults ? await getPollResults(poll._id) : null

  return json(
    {
      pollId: poll._id,
      hasVoted: true,
      isOpen: isPollOpen(poll),
      showResults,
      results,
    },
    {status: 201},
  )
}
