import {relations} from 'drizzle-orm'
import {index, pgTable, text, timestamp, uniqueIndex, uuid} from 'drizzle-orm/pg-core'

export const pollResponses = pgTable(
  'poll_responses',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    pollId: text('poll_id').notNull(),
    voterHash: text('voter_hash').notNull(),
    createdAt: timestamp('created_at', {withTimezone: true}).defaultNow().notNull(),
  },
  (table) => [
    uniqueIndex('poll_responses_poll_voter_unique').on(table.pollId, table.voterHash),
    index('poll_responses_poll_id_idx').on(table.pollId),
  ],
)

export const pollVotes = pgTable(
  'poll_votes',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    responseId: uuid('response_id')
      .notNull()
      .references(() => pollResponses.id, {onDelete: 'cascade'}),
    pollId: text('poll_id').notNull(),
    optionKey: text('option_key').notNull(),
    createdAt: timestamp('created_at', {withTimezone: true}).defaultNow().notNull(),
  },
  (table) => [
    uniqueIndex('poll_votes_response_option_unique').on(table.responseId, table.optionKey),
    index('poll_votes_poll_id_idx').on(table.pollId),
    index('poll_votes_option_key_idx').on(table.optionKey),
  ],
)

export const pollActivityLogs = pgTable(
  'poll_activity_logs',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    pollId: text('poll_id').notNull(),
    voterHash: text('voter_hash'),
    eventType: text('event_type').notNull(),
    ipHash: text('ip_hash'),
    userAgentHash: text('user_agent_hash'),
    createdAt: timestamp('created_at', {withTimezone: true}).defaultNow().notNull(),
  },
  (table) => [
    index('poll_activity_logs_poll_id_idx').on(table.pollId),
    index('poll_activity_logs_event_type_idx').on(table.eventType),
  ],
)

export const pollResponsesRelations = relations(pollResponses, ({many}) => ({
  votes: many(pollVotes),
}))

export const pollVotesRelations = relations(pollVotes, ({one}) => ({
  response: one(pollResponses, {
    fields: [pollVotes.responseId],
    references: [pollResponses.id],
  }),
}))
