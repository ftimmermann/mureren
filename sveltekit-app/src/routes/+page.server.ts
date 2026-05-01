import {frontpageQuery as query, type FrontpageData} from '$lib/sanity/queries'
import type {PageServerLoad} from './$types'

export const load: PageServerLoad = async ({locals}) => {
  const {loadQuery} = locals.sanity
  const initial = await loadQuery<FrontpageData>(query)

  return {
    query,
    options: {initial},
  }
}
