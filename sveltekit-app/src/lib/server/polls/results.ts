import {and, count, desc, eq} from 'drizzle-orm'
import {db} from '$lib/server/db/client'
import {pollResponses, pollVotes} from '$lib/server/db/schema'

export async function getPollVoteState(pollId: string, voterHash: string) {
  const [response] = await db
    .select({id: pollResponses.id})
    .from(pollResponses)
    .where(and(eq(pollResponses.pollId, pollId), eq(pollResponses.voterHash, voterHash)))
    .limit(1)

  return {
    hasVoted: Boolean(response),
    responseId: response?.id,
  }
}

export async function getPollResults(pollId: string) {
  const rows = await db
    .select({
      optionKey: pollVotes.optionKey,
      votes: count(),
    })
    .from(pollVotes)
    .where(eq(pollVotes.pollId, pollId))
    .groupBy(pollVotes.optionKey)

  const options = Object.fromEntries(rows.map((row) => [row.optionKey, row.votes]))
  const totalVotes = rows.reduce((total, row) => total + row.votes, 0)

  return {
    options,
    totalVotes,
  }
}

export async function getPollResponseCount(pollId: string) {
  const [row] = await db
    .select({responses: count()})
    .from(pollResponses)
    .where(eq(pollResponses.pollId, pollId))

  return row?.responses ?? 0
}

export async function getPollAdminResults(pollId: string) {
  const [results, responseCount] = await Promise.all([
    getPollResults(pollId),
    getPollResponseCount(pollId),
  ])

  return {
    ...results,
    responseCount,
  }
}

export async function getPollExportRows(pollId: string) {
  return db
    .select({
      responseId: pollResponses.id,
      voteId: pollVotes.id,
      pollId: pollVotes.pollId,
      optionKey: pollVotes.optionKey,
      voterHash: pollResponses.voterHash,
      responseCreatedAt: pollResponses.createdAt,
      voteCreatedAt: pollVotes.createdAt,
    })
    .from(pollVotes)
    .innerJoin(pollResponses, eq(pollVotes.responseId, pollResponses.id))
    .where(eq(pollVotes.pollId, pollId))
    .orderBy(desc(pollVotes.createdAt))
}
