<script lang="ts">
  import type {PageProps} from './$types'

  const {data}: PageProps = $props()

  function getOptionVotes(optionKey: string) {
    return data.results.options[optionKey] ?? 0
  }

  function getOptionPercentage(optionKey: string) {
    if (data.results.totalVotes === 0) {
      return 0
    }

    return Math.round((getOptionVotes(optionKey) / data.results.totalVotes) * 100)
  }
</script>

<svelte:head>
  <title>{data.poll.title || 'Afstemning'} admin</title>
</svelte:head>

<article class="poll-report">
  <header class="poll-report__header">
    <div>
      <a href="/admin/polls">Tilbage til afstemninger</a>
      <h1>{data.poll.question || data.poll.title}</h1>
    </div>
    <a class="poll-report__action" href={`/api/admin/polls/${data.poll._id}/export.csv`}
      >Eksporter CSV</a
    >
  </header>

  <dl class="poll-report__summary">
    <div>
      <dt>Status</dt>
      <dd>{data.poll.status}</dd>
    </div>
    <div>
      <dt>Svar</dt>
      <dd>{data.results.responseCount}</dd>
    </div>
    <div>
      <dt>Stemmer</dt>
      <dd>{data.results.totalVotes}</dd>
    </div>
    <div>
      <dt>Resultatvisning</dt>
      <dd>{data.poll.resultVisibility}</dd>
    </div>
    <div>
      <dt>Start</dt>
      <dd>{data.poll.startsAt || 'Ikke sat'}</dd>
    </div>
    <div>
      <dt>Slut</dt>
      <dd>{data.poll.endsAt || 'Ikke sat'}</dd>
    </div>
  </dl>

  <section class="poll-report__results" aria-labelledby="poll-report-results">
    <h2 id="poll-report-results">Resultater</h2>

    {#each data.poll.options ?? [] as option (option._key)}
      <div class="poll-report-result">
        <div class="poll-report-result__header">
          <span>{option.label}</span>
          <span>{getOptionPercentage(option._key)}%</span>
        </div>
        <div class="poll-report-result__track" aria-hidden="true">
          <span
            class="poll-report-result__bar"
            style={`--poll-result-width: ${getOptionPercentage(option._key)}%`}
          ></span>
        </div>
        <p>{getOptionVotes(option._key)} stemmer</p>
      </div>
    {/each}
  </section>
</article>

<style>
  .poll-report {
    display: grid;
    gap: 1.5rem;
  }

  .poll-report__header {
    display: flex;
    justify-content: space-between;
    gap: 1rem;
  }

  .poll-report__header h1,
  .poll-report__results h2,
  .poll-report-result p {
    margin: 0;
  }

  .poll-report__header a {
    color: inherit;
  }

  .poll-report__action {
    align-self: start;
    min-height: 2.5rem;
    padding: 0.55rem 0.85rem;
    border: 1px solid #33291c;
    background: #33291c;
    color: #fff;
    font-weight: 700;
    text-decoration: none;
  }

  .poll-report__summary {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(9rem, 1fr));
    gap: 1rem;
    margin: 0;
  }

  .poll-report__summary div {
    padding: 1rem;
    border: 1px solid #d8d1c4;
    background: #fbfaf7;
  }

  .poll-report__summary dt {
    color: #666;
    font-size: 0.8rem;
  }

  .poll-report__summary dd {
    margin: 0.25rem 0 0;
    font-weight: 700;
  }

  .poll-report__results,
  .poll-report-result {
    display: grid;
    gap: 1rem;
  }

  .poll-report-result {
    gap: 0.35rem;
  }

  .poll-report-result__header {
    display: flex;
    justify-content: space-between;
    gap: 1rem;
    font-weight: 700;
  }

  .poll-report-result__track {
    height: 0.75rem;
    overflow: hidden;
    background: #e8e0d3;
  }

  .poll-report-result__bar {
    display: block;
    width: var(--poll-result-width);
    height: 100%;
    background: #8b6f3d;
  }

  .poll-report-result p {
    color: #6d6559;
    font-size: 0.9rem;
  }

  @media (max-width: 700px) {
    .poll-report__header {
      display: grid;
    }
  }
</style>
