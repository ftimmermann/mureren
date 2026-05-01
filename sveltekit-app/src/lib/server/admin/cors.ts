import {POLL_ADMIN_ALLOWED_ORIGINS} from '$env/static/private'

const defaultAllowedOrigins = ['http://localhost:3333']

function getAllowedOrigins() {
  const configuredOrigins = POLL_ADMIN_ALLOWED_ORIGINS.split(',')
    .map((origin) => origin.trim())
    .filter(Boolean)

  return new Set([...defaultAllowedOrigins, ...configuredOrigins])
}

export function getAdminCorsHeaders(request: Request) {
  const origin = request.headers.get('origin')
  const headers = new Headers()

  if (origin && getAllowedOrigins().has(origin)) {
    headers.set('access-control-allow-origin', origin)
    headers.set('access-control-allow-credentials', 'true')
    headers.set('vary', 'Origin')
  }

  return headers
}

export function handleAdminOptions(request: Request) {
  const headers = getAdminCorsHeaders(request)

  headers.set('access-control-allow-methods', 'GET, POST, OPTIONS')
  headers.set('access-control-allow-headers', 'authorization, content-type')

  return new Response(null, {
    status: 204,
    headers,
  })
}
