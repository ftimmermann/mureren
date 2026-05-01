import {POLL_ADMIN_TOKEN} from '$env/static/private'
import {createHash, timingSafeEqual} from 'node:crypto'
import {error, redirect, type Cookies} from '@sveltejs/kit'

const adminCookieName = 'mureren_poll_admin'

function hashToken(token: string) {
  return createHash('sha256').update(token).digest('hex')
}

function timingSafeTokenEqual(left: string, right: string) {
  const leftBuffer = Buffer.from(left)
  const rightBuffer = Buffer.from(right)

  return leftBuffer.length === rightBuffer.length && timingSafeEqual(leftBuffer, rightBuffer)
}

export function isPollAdmin(cookies: Cookies) {
  if (!POLL_ADMIN_TOKEN) {
    return false
  }

  const cookieValue = cookies.get(adminCookieName)

  if (!cookieValue) {
    return false
  }

  return timingSafeTokenEqual(cookieValue, hashToken(POLL_ADMIN_TOKEN))
}

export function isPollAdminRequest(cookies: Cookies, request: Request) {
  if (isPollAdmin(cookies)) {
    return true
  }

  if (!POLL_ADMIN_TOKEN) {
    return false
  }

  const authorization = request.headers.get('authorization') ?? ''
  const token = authorization.startsWith('Bearer ') ? authorization.slice('Bearer '.length) : ''

  return Boolean(token && timingSafeTokenEqual(token, POLL_ADMIN_TOKEN))
}

export function requirePollAdmin(cookies: Cookies, request: Request) {
  if (!isPollAdminRequest(cookies, request)) {
    error(401, 'Poll admin login required')
  }
}

export function requirePollAdminPage(cookies: Cookies) {
  if (!isPollAdmin(cookies)) {
    redirect(303, '/admin/polls')
  }
}

export function createPollAdminSession(cookies: Cookies, token: string, isSecure: boolean) {
  if (!POLL_ADMIN_TOKEN || !timingSafeTokenEqual(token, POLL_ADMIN_TOKEN)) {
    return false
  }

  cookies.set(adminCookieName, hashToken(POLL_ADMIN_TOKEN), {
    httpOnly: true,
    maxAge: 60 * 60 * 8,
    path: '/',
    sameSite: 'lax',
    secure: isSecure,
  })

  return true
}

export function clearPollAdminSession(cookies: Cookies) {
  cookies.delete(adminCookieName, {path: '/'})
}
