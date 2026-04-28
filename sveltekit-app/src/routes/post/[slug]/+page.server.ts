import {articleQuery as query, type Article} from '$lib/sanity/queries'
import type {PageServerLoad} from './$types'

export const load: PageServerLoad = async ({locals, params}) => {
  const {loadQuery} = locals.sanity
  const {slug} = params
  const initial = await loadQuery<Article>(query, {slug})

  return {
    query,
    params: {slug},
    options: {initial},
  }
}
