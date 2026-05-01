<script lang="ts">
  import {onMount} from 'svelte'
  import type {Poll} from '$lib/sanity/queries'

  interface PollResults {
    options: Record<string, number>
    totalVotes: number
  }

  interface PollState {
    pollId: string
    hasVoted: boolean
    isOpen: boolean
    showResults: boolean
    results: PollResults | null
  }

  const props = $props()
  const value = $derived(
    (props as {portableText?: {value?: {poll?: Poll}}; value?: {poll?: Poll}; poll?: Poll})
      .portableText?.value ?? (props as {value?: {poll?: Poll}}).value,
  )
  const poll = $derived(value?.poll ?? (props as {poll?: Poll}).poll)
  const options = $derived(poll?.options ?? [])
  const isMultipleChoice = $derived(poll?.type === 'multipleChoice')
  const resultVisibilityLabel = $derived(getResultVisibilityLabel(poll?.resultVisibility))
  const thankYouMessage = $derived(getThankYouMessage(poll?.resultVisibility))

  let pollState = $state<PollState | null>(null)
  let selectedOptionKeys = $state<string[]>([])
  let isLoading = $state(false)
  let isSubmitting = $state(false)
  let errorMessage = $state('')
  const shouldShowConclusion = $derived(
    Boolean(poll?.conclusionText && pollState?.showResults && isPollConcluded(poll)),
  )
  const canSubmit = $derived(
    Boolean(pollState?.isOpen && selectedOptionKeys.length > 0 && !isSubmitting),
  )

  onMount(() => {
    loadPollState()
  })

  function getResultVisibilityLabel(visibility: Poll['resultVisibility']) {
    if (visibility === 'immediate') return 'Resultatet vises efter stemme'
    if (visibility === 'hidden') return 'Resultatet vises ikke offentligt'
    return 'Resultatet vises efter lukning'
  }

  function getThankYouMessage(visibility: Poll['resultVisibility']) {
    if (visibility === 'hidden') {
      return 'Tak for din stemme. Resultatet bliver ikke vist offentligt.'
    }

    if (visibility === 'afterClose') {
      return 'Tak for din stemme. Resultatet bliver vist, når afstemningen lukker.'
    }

    return 'Tak for din stemme.'
  }

  function isPollConcluded(currentPoll: Poll | undefined) {
    if (!currentPoll) {
      return false
    }

    if (currentPoll.status === 'closed' || currentPoll.status === 'archived') {
      return true
    }

    return Boolean(currentPoll.endsAt && new Date(currentPoll.endsAt).getTime() <= Date.now())
  }

  function getOptionVotes(optionKey: string) {
    return pollState?.results?.options[optionKey] ?? 0
  }

  function getOptionPercentage(optionKey: string) {
    const totalVotes = pollState?.results?.totalVotes ?? 0

    if (totalVotes === 0) {
      return 0
    }

    return Math.round((getOptionVotes(optionKey) / totalVotes) * 100)
  }

  function isSelected(optionKey: string) {
    return selectedOptionKeys.includes(optionKey)
  }

  function updateSelection(optionKey: string, checked: boolean) {
    errorMessage = ''

    if (isMultipleChoice) {
      selectedOptionKeys = checked
        ? [...new Set([...selectedOptionKeys, optionKey])]
        : selectedOptionKeys.filter((selectedOptionKey) => selectedOptionKey !== optionKey)
      return
    }

    selectedOptionKeys = checked ? [optionKey] : []
  }

  async function loadPollState() {
    if (!poll?._id) {
      return
    }

    isLoading = true
    errorMessage = ''

    try {
      const response = await fetch(`/api/polls/${encodeURIComponent(poll._id)}`)

      if (!response.ok) {
        throw new Error('Afstemningen kunne ikke indlæses.')
      }

      pollState = (await response.json()) as PollState
    } catch (error) {
      errorMessage = error instanceof Error ? error.message : 'Afstemningen kunne ikke indlæses.'
    } finally {
      isLoading = false
    }
  }

  async function submitVote() {
    if (!poll?._id || !canSubmit) {
      return
    }

    isSubmitting = true
    errorMessage = ''

    try {
      const response = await fetch(`/api/polls/${encodeURIComponent(poll._id)}`, {
        method: 'POST',
        headers: {
          'content-type': 'application/json',
        },
        body: JSON.stringify({optionKeys: selectedOptionKeys}),
      })

      if (!response.ok) {
        const message = await response.text()
        throw new Error(message || 'Din stemme kunne ikke gemmes.')
      }

      pollState = (await response.json()) as PollState
    } catch (error) {
      errorMessage = error instanceof Error ? error.message : 'Din stemme kunne ikke gemmes.'
    } finally {
      isSubmitting = false
    }
  }
</script>

{#if poll}
  <section class="poll-block" aria-labelledby={`poll-${poll._id}`}>
    <div class="poll-block__content">
      <p class="poll-block__eyebrow">Afstemning</p>
      <h2 class="poll-block__title" id={`poll-${poll._id}`}>{poll.question || poll.title}</h2>

      {#if poll.description}
        <p class="poll-block__description">{poll.description}</p>
      {/if}

      {#if poll.purposeText}
        <p class="poll-block__purpose">{poll.purposeText}</p>
      {/if}
    </div>

    {#if errorMessage}
      <p class="poll-block__error">{errorMessage}</p>
    {/if}

    {#if options.length && !pollState?.hasVoted}
      <form class="poll-block__form" onsubmit={(event) => event.preventDefault()}>
        <fieldset
          class="poll-block__options"
          disabled={isLoading || isSubmitting || pollState?.isOpen === false}
        >
          <legend>{isMultipleChoice ? 'Vælg en eller flere svarmuligheder' : 'Vælg et svar'}</legend
          >
          {#each options as option (option._key)}
            <label class="poll-block__option">
              <input
                checked={isSelected(option._key)}
                type={isMultipleChoice ? 'checkbox' : 'radio'}
                name={`poll-${poll._id}`}
                onchange={(event) => updateSelection(option._key, event.currentTarget.checked)}
              />
              <span>{option.label}</span>
            </label>
          {/each}
        </fieldset>

        <button class="poll-block__submit" type="button" disabled={!canSubmit} onclick={submitVote}>
          {isSubmitting ? 'Gemmer...' : 'Stem'}
        </button>
      </form>
    {/if}

    {#if pollState?.showResults && pollState.results}
      <div class="poll-block__results" aria-live="polite">
        {#each options as option (option._key)}
          <div class="poll-block__result">
            <div class="poll-block__result-header">
              <span>{option.label}</span>
              <span>{getOptionPercentage(option._key)}%</span>
            </div>
            <div class="poll-block__result-track" aria-hidden="true">
              <span
                class="poll-block__result-bar"
                style={`--poll-result-width: ${getOptionPercentage(option._key)}%`}
              ></span>
            </div>
            <p>{getOptionVotes(option._key)} stemmer</p>
          </div>
        {/each}
        <p class="poll-block__total">{pollState.results.totalVotes} stemmer i alt</p>
      </div>

      {#if shouldShowConclusion}
        <aside class="poll-block__conclusion" aria-label="Opfølgning på afstemning">
          <p class="poll-block__conclusion-label">Resultatet betyder, at vi...</p>
          <p>{poll.conclusionText}</p>
        </aside>
      {/if}
    {:else if pollState?.hasVoted}
      <p class="poll-block__notice">{thankYouMessage}</p>
    {/if}

    <div class="poll-block__meta">
      <span>{resultVisibilityLabel}</span>
      {#if isLoading}
        <span>Indlæser...</span>
      {:else if pollState?.hasVoted}
        <span>Du har stemt.</span>
      {:else if pollState?.isOpen === false}
        <span>Afstemningen er ikke åben.</span>
      {/if}
    </div>
  </section>
{/if}

<style>
  .poll-block {
    display: grid;
    gap: 1rem;
    margin: 2rem 0;
    padding: 1.25rem;
    border: 1px solid #d8d1c4;
    background: #fbfaf7;
  }

  .poll-block__content {
    display: grid;
    gap: 0.5rem;
  }

  .poll-block__eyebrow,
  .poll-block__title,
  .poll-block__description,
  .poll-block__purpose,
  .poll-block__conclusion p,
  .poll-block__conclusion-label,
  .poll-block__error,
  .poll-block__notice,
  .poll-block__total {
    margin: 0;
  }

  .poll-block__eyebrow {
    color: #6a5b45;
    font-size: 0.78rem;
    font-weight: 700;
    text-transform: uppercase;
  }

  .poll-block__title {
    font-size: 1.35rem;
    line-height: 1.2;
  }

  .poll-block__description,
  .poll-block__purpose {
    color: #4f4a42;
    line-height: 1.5;
  }

  .poll-block__purpose {
    padding-left: 0.75rem;
    border-left: 3px solid #c5aa72;
  }

  .poll-block__conclusion {
    display: grid;
    gap: 0.35rem;
    padding: 0.875rem;
    border: 1px solid #d8d1c4;
    background: #fff;
  }

  .poll-block__conclusion p {
    color: #4f4a42;
    line-height: 1.5;
  }

  .poll-block__conclusion-label {
    color: #6a5b45;
    font-size: 0.78rem;
    font-weight: 700;
    text-transform: uppercase;
  }

  .poll-block__form {
    display: grid;
    gap: 1rem;
  }

  .poll-block__options {
    display: grid;
    gap: 0.625rem;
    min-width: 0;
    margin: 0;
    padding: 0;
    border: 0;
  }

  .poll-block__options legend {
    margin-bottom: 0.25rem;
    color: #666;
    font-size: 0.9rem;
  }

  .poll-block__option {
    display: flex;
    align-items: center;
    gap: 0.625rem;
    padding: 0.75rem;
    border: 1px solid #ded7cb;
    background: #fff;
  }

  .poll-block__option input {
    flex: 0 0 auto;
  }

  .poll-block__submit {
    justify-self: start;
    min-height: 2.75rem;
    padding: 0 1rem;
    border: 1px solid #33291c;
    background: #33291c;
    color: #fff;
    font: inherit;
    font-weight: 700;
    cursor: pointer;
  }

  .poll-block__submit:disabled {
    border-color: #c9c1b4;
    background: #d8d1c4;
    color: #6d6559;
    cursor: not-allowed;
  }

  .poll-block__results {
    display: grid;
    gap: 0.875rem;
  }

  .poll-block__result {
    display: grid;
    gap: 0.35rem;
  }

  .poll-block__result-header {
    display: flex;
    justify-content: space-between;
    gap: 1rem;
    font-weight: 700;
  }

  .poll-block__result-track {
    height: 0.65rem;
    overflow: hidden;
    background: #e8e0d3;
  }

  .poll-block__result-bar {
    display: block;
    width: var(--poll-result-width);
    height: 100%;
    background: #8b6f3d;
  }

  .poll-block__result p,
  .poll-block__total {
    color: #6d6559;
    font-size: 0.85rem;
  }

  .poll-block__error {
    color: #9f1d1d;
    font-weight: 700;
  }

  .poll-block__notice {
    color: #4f4a42;
    font-weight: 700;
  }

  .poll-block__meta {
    display: flex;
    flex-wrap: wrap;
    gap: 0.75rem;
    color: #6d6559;
    font-size: 0.85rem;
  }
</style>
