import groq from 'groq'
import {serverClient} from '$lib/sanity/client.server'
import type {Poll} from '$lib/sanity/queries'

const pollClient = serverClient.withConfig({stega: false})

const pollByIdQuery = groq`*[_type == "poll" && _id == $pollId][0]{
  _id,
  _type,
  title,
  slug,
  question,
  description,
  type,
  options,
  maxSelections,
  startsAt,
  endsAt,
  resultVisibility,
  status,
  purposeText,
  conclusionText
}`

const pollsQuery = groq`*[_type == "poll"] | order(_createdAt desc){
  _id,
  _type,
  title,
  slug,
  question,
  description,
  type,
  options,
  maxSelections,
  startsAt,
  endsAt,
  resultVisibility,
  status,
  purposeText,
  conclusionText
}`

export async function getPollConfig(pollId: string) {
  return pollClient.fetch<Poll | null>(pollByIdQuery, {pollId})
}

export async function getPollConfigs() {
  return pollClient.fetch<Poll[]>(pollsQuery)
}

export async function closePollConfig(pollId: string) {
  return pollClient.patch(pollId).set({status: 'closed'}).commit<Poll>()
}

export function isPollOpen(poll: Poll, now = new Date()) {
  if (normalizeString(poll.status) !== 'active') {
    return false
  }

  if (poll.startsAt && now < new Date(poll.startsAt)) {
    return false
  }

  if (poll.endsAt && now > new Date(poll.endsAt)) {
    return false
  }

  return true
}

export function isPollClosed(poll: Poll, now = new Date()) {
  return (
    normalizeString(poll.status) === 'closed' || Boolean(poll.endsAt && now > new Date(poll.endsAt))
  )
}

export function shouldShowPublicResults(poll: Poll, hasVoted: boolean, now = new Date()) {
  const resultVisibility = normalizeString(poll.resultVisibility)

  if (resultVisibility === 'hidden') {
    return false
  }

  if (resultVisibility === 'immediate') {
    return hasVoted
  }

  return isPollClosed(poll, now)
}

function normalizeString(value: unknown) {
  return typeof value === 'string' ? value.replace(/[\u200B-\u200D\uFEFF]/g, '') : value
}

export function normalizeSelectedOptionKeys(value: unknown) {
  if (Array.isArray(value)) {
    return value.filter((item): item is string => typeof item === 'string')
  }

  if (typeof value === 'string') {
    return [value]
  }

  return []
}

export function validateSelectedOptionKeys(poll: Poll, selectedOptionKeys: string[]) {
  const allowedOptionKeys = new Set((poll.options ?? []).map((option) => option._key))
  const uniqueOptionKeys = [...new Set(selectedOptionKeys)]

  if (uniqueOptionKeys.length === 0) {
    return {ok: false as const, message: 'Select at least one option.'}
  }

  if (uniqueOptionKeys.some((optionKey) => !allowedOptionKeys.has(optionKey))) {
    return {ok: false as const, message: 'Selected option is not valid for this poll.'}
  }

  if (poll.type === 'singleChoice' && uniqueOptionKeys.length !== 1) {
    return {ok: false as const, message: 'This poll only accepts one option.'}
  }

  if (
    poll.type === 'multipleChoice' &&
    poll.maxSelections &&
    uniqueOptionKeys.length > poll.maxSelections
  ) {
    return {
      ok: false as const,
      message: `This poll accepts at most ${poll.maxSelections} options.`,
    }
  }

  return {ok: true as const, optionKeys: uniqueOptionKeys}
}
