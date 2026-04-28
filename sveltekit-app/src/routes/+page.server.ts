import {articlesQuery as query, type Article} from '$lib/sanity/queries'
import type {PageServerLoad} from './$types'

export const load: PageServerLoad = async ({locals}) => {
  const {loadQuery} = locals.sanity
  const initial = await loadQuery<Article[]>(query)

  return {
    query,
    options: {initial},
  }
}
