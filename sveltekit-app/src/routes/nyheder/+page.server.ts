import {shortArticlesQuery as query, type ShortArticle} from '$lib/sanity/queries'
import type {PageServerLoad} from './$types'

export const load: PageServerLoad = async ({locals}) => {
  const {loadQuery} = locals.sanity
  const initial = await loadQuery<ShortArticle[]>(query)

  return {
    query,
    options: {initial},
  }
}
