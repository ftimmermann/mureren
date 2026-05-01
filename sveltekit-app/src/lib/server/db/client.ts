import {DATABASE_URL} from '$env/static/private'
import {drizzle} from 'drizzle-orm/postgres-js'
import postgres from 'postgres'
import * as schema from './schema'

if (!DATABASE_URL) {
  throw new Error('Missing DATABASE_URL. Set it before using app-owned database features.')
}

const queryClient = postgres(DATABASE_URL, {
  max: 10,
})

export const db = drizzle(queryClient, {schema})
