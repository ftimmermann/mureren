import sanityPreset from '@sanity/prettier-config'

/** @type {import('prettier').Config} */
const config = {
  ...sanityPreset,
  singleQuote: true,
  plugins: ['prettier-plugin-packagejson', 'prettier-plugin-svelte'],
  overrides: [
    {
      files: '*.svelte',
      options: {
        parser: 'svelte',
      },
    },
  ],
}

export default config
