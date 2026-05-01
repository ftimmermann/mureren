<script lang="ts">
  import type {PageProps} from './$types'

  const {data, form}: PageProps = $props()
</script>

<svelte:head>
  <title>Afstemninger admin</title>
</svelte:head>

<section class="poll-admin">
  <header class="poll-admin__header">
    <div>
      <p class="poll-admin__eyebrow">Admin</p>
      <h1>Afstemninger</h1>
    </div>

    {#if data.authenticated}
      <form method="POST" action="?/logout">
        <button class="poll-admin__secondary-action" type="submit">Log ud</button>
      </form>
    {/if}
  </header>

  {#if !data.authenticated}
    <form class="poll-admin__login" method="POST" action="?/login">
      <label>
        <span>Admin-token</span>
        <input name="token" type="password" autocomplete="current-password" />
      </label>

      {#if form?.message}
        <p class="poll-admin__error">{form.message}</p>
      {/if}

      <button class="poll-admin__primary-action" type="submit">Log ind</button>
    </form>
  {:else if data.polls.length}
    <div class="poll-admin__list">
      {#each data.polls as entry (entry.poll._id)}
        <article class="poll-admin-card">
          <div class="poll-admin-card__content">
            <p class="poll-admin-card__status">{entry.poll.status}</p>
            <h2>{entry.poll.question || entry.poll.title}</h2>
            <dl>
              <div>
                <dt>Svar</dt>
                <dd>{entry.results.responseCount}</dd>
              </div>
              <div>
                <dt>Stemmer</dt>
                <dd>{entry.results.totalVotes}</dd>
              </div>
              <div>
                <dt>Resultatvisning</dt>
                <dd>{entry.poll.resultVisibility}</dd>
              </div>
            </dl>
          </div>
          <a class="poll-admin__primary-action" href={`/admin/polls/${entry.poll._id}`}
            >Se rapport</a
          >
        </article>
      {/each}
    </div>
  {:else}
    <p class="poll-admin__empty">Ingen afstemninger endnu.</p>
  {/if}
</section>

<style>
  .poll-admin {
    display: grid;
    gap: 1.5rem;
  }

  .poll-admin__header,
  .poll-admin-card {
    display: flex;
    align-items: flex-start;
    justify-content: space-between;
    gap: 1rem;
  }

  .poll-admin__header h1,
  .poll-admin__eyebrow,
  .poll-admin-card h2,
  .poll-admin-card__status,
  .poll-admin__empty,
  .poll-admin__error {
    margin: 0;
  }

  .poll-admin__eyebrow,
  .poll-admin-card__status {
    color: #666;
    font-size: 0.85rem;
    font-weight: 700;
    text-transform: uppercase;
  }

  .poll-admin__login,
  .poll-admin__list,
  .poll-admin-card__content {
    display: grid;
    gap: 1rem;
  }

  .poll-admin__login {
    max-width: 28rem;
  }

  .poll-admin__login label {
    display: grid;
    gap: 0.35rem;
    font-weight: 700;
  }

  .poll-admin__login input {
    min-height: 2.75rem;
    padding: 0 0.75rem;
    border: 1px solid #c9c1b4;
    font: inherit;
  }

  .poll-admin-card {
    padding: 1rem;
    border: 1px solid #d8d1c4;
    background: #fbfaf7;
  }

  .poll-admin-card dl {
    display: flex;
    flex-wrap: wrap;
    gap: 1rem;
    margin: 0;
  }

  .poll-admin-card dt {
    color: #666;
    font-size: 0.8rem;
  }

  .poll-admin-card dd {
    margin: 0;
    font-weight: 700;
  }

  .poll-admin__primary-action,
  .poll-admin__secondary-action {
    min-height: 2.5rem;
    padding: 0.55rem 0.85rem;
    border: 1px solid #33291c;
    font: inherit;
    font-weight: 700;
    text-decoration: none;
    cursor: pointer;
  }

  .poll-admin__primary-action {
    background: #33291c;
    color: #fff;
  }

  .poll-admin__secondary-action {
    background: #fff;
    color: #33291c;
  }

  .poll-admin__error {
    color: #9f1d1d;
    font-weight: 700;
  }

  @media (max-width: 700px) {
    .poll-admin__header,
    .poll-admin-card {
      display: grid;
    }
  }
</style>
