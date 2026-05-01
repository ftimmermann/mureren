import {POLL_VOTER_SECRET} from '$env/static/private'
import {createHash, randomUUID} from 'node:crypto'
import type {Cookies} from '@sveltejs/kit'

const voterCookieName = 'mureren_poll_voter'

export function getOrCreateVoterHash(cookies: Cookies, isSecure: boolean) {
  let voterId = cookies.get(voterCookieName)

  if (!voterId) {
    voterId = randomUUID()
    cookies.set(voterCookieName, voterId, {
      httpOnly: true,
      maxAge: 60 * 60 * 24 * 365,
      path: '/',
      sameSite: 'lax',
      secure: isSecure,
    })
  }

  return createHash('sha256').update(`${POLL_VOTER_SECRET}:${voterId}`).digest('hex')
}
