import {useCallback, useEffect, useMemo, useState, type CSSProperties} from 'react'
import {useClient} from 'sanity'

import './PollReportsTool.css'

interface PollOption {
  _key: string
  label?: string
}

interface Poll {
  _id: string
  title?: string
  question?: string
  status?: string
  resultVisibility?: string
  startsAt?: string
  endsAt?: string
  _createdAt?: string
  _updatedAt?: string
  options?: PollOption[]
}

interface PollResults {
  options: Record<string, number>
  totalVotes: number
  responseCount: number
}

interface PollReportResponse {
  poll: Poll
  results: PollResults
}

const appUrl = (process.env.SANITY_STUDIO_PREVIEW_URL || 'http://localhost:5173').replace(/\/$/, '')
const adminToken = process.env.SANITY_STUDIO_POLL_ADMIN_TOKEN || ''
const statusFilters = ['all', 'active', 'draft', 'closed', 'archived'] as const

type StatusFilter = (typeof statusFilters)[number]

export default function PollReportsTool() {
  const client = useClient({apiVersion: '2025-10-22'})
  const [polls, setPolls] = useState<Poll[]>([])
  const [selectedPollId, setSelectedPollId] = useState('')
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all')
  const [searchTerm, setSearchTerm] = useState('')
  const [report, setReport] = useState<PollReportResponse | null>(null)
  const [isLoadingPolls, setIsLoadingPolls] = useState(true)
  const [isLoadingReport, setIsLoadingReport] = useState(false)
  const [isClosing, setIsClosing] = useState(false)
  const [errorMessage, setErrorMessage] = useState('')
  const [reportUpdatedAt, setReportUpdatedAt] = useState<Date | null>(null)

  const selectedPoll = useMemo(
    () => polls.find((poll) => poll._id === selectedPollId) ?? null,
    [polls, selectedPollId],
  )
  const filteredPolls = useMemo(() => {
    const normalizedSearchTerm = searchTerm.trim().toLowerCase()

    return polls.filter((poll) => {
      const matchesStatus = statusFilter === 'all' || poll.status === statusFilter
      const searchableText = [poll.title, poll.question].filter(Boolean).join(' ').toLowerCase()
      const matchesSearch = !normalizedSearchTerm || searchableText.includes(normalizedSearchTerm)

      return matchesStatus && matchesSearch
    })
  }, [polls, searchTerm, statusFilter])
  const pollCounts = useMemo(
    () =>
      statusFilters.reduce(
        (counts, status) => ({
          ...counts,
          [status]:
            status === 'all' ? polls.length : polls.filter((poll) => poll.status === status).length,
        }),
        {} as Record<StatusFilter, number>,
      ),
    [polls],
  )
  const canCloseSelectedPoll = selectedPoll
    ? !['closed', 'archived'].includes(selectedPoll.status ?? '')
    : false

  const loadPolls = useCallback(async () => {
    setIsLoadingPolls(true)
    setErrorMessage('')

    try {
      const nextPolls = await client.fetch<Poll[]>(
        `*[_type == "poll"] | order(_createdAt desc){
          _id,
          title,
          question,
          status,
          resultVisibility,
          startsAt,
          endsAt,
          _createdAt,
          _updatedAt,
          options
        }`,
      )

      setPolls(nextPolls)
      setSelectedPollId((currentPollId) =>
        nextPolls.some((poll) => poll._id === currentPollId)
          ? currentPollId
          : nextPolls[0]?._id || '',
      )
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : 'Afstemninger kunne ikke indlæses.')
    } finally {
      setIsLoadingPolls(false)
    }
  }, [client])

  const loadReport = useCallback(async (pollId: string) => {
    if (!pollId || !adminToken) {
      setReport(null)
      return
    }

    setIsLoadingReport(true)
    setErrorMessage('')

    try {
      const response = await fetch(
        `${appUrl}/api/admin/polls/${encodeURIComponent(pollId)}/results`,
        {
          headers: {
            authorization: `Bearer ${adminToken}`,
          },
        },
      )

      if (!response.ok) {
        throw new Error('Rapporten kunne ikke indlæses.')
      }

      setReport((await response.json()) as PollReportResponse)
      setReportUpdatedAt(new Date())
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : 'Rapporten kunne ikke indlæses.')
    } finally {
      setIsLoadingReport(false)
    }
  }, [])

  useEffect(() => {
    loadPolls()
  }, [loadPolls])

  useEffect(() => {
    loadReport(selectedPollId)
  }, [loadReport, selectedPollId])

  async function downloadCsv() {
    if (!selectedPollId || !adminToken) return

    const response = await fetch(
      `${appUrl}/api/admin/polls/${encodeURIComponent(selectedPollId)}/export.csv`,
      {
        headers: {
          authorization: `Bearer ${adminToken}`,
        },
      },
    )

    if (!response.ok) {
      setErrorMessage('CSV eksport kunne ikke hentes.')
      return
    }

    const blob = await response.blob()
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `poll-${selectedPollId}.csv`
    link.click()
    URL.revokeObjectURL(url)
  }

  async function closeSelectedPoll() {
    if (!selectedPoll || !canCloseSelectedPoll) return

    const confirmed = window.confirm('Vil du lukke afstemningen nu?')

    if (!confirmed) return

    setIsClosing(true)
    setErrorMessage('')

    try {
      await client.patch(selectedPoll._id).set({status: 'closed'}).commit()
      await loadPolls()
      await loadReport(selectedPoll._id)
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : 'Afstemningen kunne ikke lukkes.')
    } finally {
      setIsClosing(false)
    }
  }

  function getOptionVotes(optionKey: string) {
    return report?.results.options[optionKey] ?? 0
  }

  function getOptionPercentage(optionKey: string) {
    const totalVotes = report?.results.totalVotes ?? 0

    if (totalVotes === 0) {
      return 0
    }

    return Math.round((getOptionVotes(optionKey) / totalVotes) * 100)
  }

  function getStatusLabel(status: string | undefined) {
    if (status === 'active') return 'Aktiv'
    if (status === 'draft') return 'Kladde'
    if (status === 'closed') return 'Lukket'
    if (status === 'archived') return 'Arkiveret'
    return 'Ukendt'
  }

  function getStatusFilterLabel(status: StatusFilter) {
    if (status === 'all') return 'Alle'

    return getStatusLabel(status)
  }

  function getVisibilityLabel(visibility: string | undefined) {
    if (visibility === 'immediate') return 'Vises med det samme'
    if (visibility === 'afterClose') return 'Vises efter lukning'
    if (visibility === 'hidden') return 'Skjult eksternt'
    return 'Ikke angivet'
  }

  function formatDateTime(value: string | undefined) {
    if (!value) return 'Ikke sat'

    return new Intl.DateTimeFormat('da-DK', {
      dateStyle: 'medium',
      timeStyle: 'short',
    }).format(new Date(value))
  }

  function formatTime(value: Date | null) {
    if (!value) return ''

    return new Intl.DateTimeFormat('da-DK', {
      hour: '2-digit',
      minute: '2-digit',
    }).format(value)
  }

  return (
    <main className="poll-reports-tool">
      <div className="poll-reports-tool__shell">
        <header className="poll-reports-tool__header">
          <div>
            <p className="poll-reports-tool__eyebrow">Afstemninger</p>
            <h1>Rapporter</h1>
          </div>
          <button
            className="poll-reports-tool__button poll-reports-tool__button--secondary"
            onClick={loadPolls}
            type="button"
          >
            Opdater
          </button>
        </header>

        {!adminToken && (
          <p className="poll-reports-tool__error" role="alert">
            Mangler SANITY_STUDIO_POLL_ADMIN_TOKEN. Rapportdata kan ikke hentes.
          </p>
        )}

        {errorMessage && (
          <p className="poll-reports-tool__error" role="alert">
            {errorMessage}
          </p>
        )}

        <div className="poll-reports-tool__layout">
          <section className="poll-reports-tool__list" aria-label="Afstemninger">
            <div className="poll-reports-tool__list-controls">
              <label className="poll-reports-tool__search">
                <span>Søg</span>
                <input
                  onChange={(event) => setSearchTerm(event.currentTarget.value)}
                  placeholder="Søg i titel eller spørgsmål"
                  type="search"
                  value={searchTerm}
                />
              </label>

              <div className="poll-reports-tool__filters" aria-label="Filtrer efter status">
                {statusFilters.map((status) => (
                  <button
                    className={`poll-reports-tool__filter${
                      statusFilter === status ? ' poll-reports-tool__filter--active' : ''
                    }`}
                    key={status}
                    onClick={() => setStatusFilter(status)}
                    type="button"
                  >
                    {getStatusFilterLabel(status)}
                    <span>{pollCounts[status] ?? 0}</span>
                  </button>
                ))}
              </div>
            </div>

            {isLoadingPolls && <p className="poll-reports-tool__empty">Indlæser afstemninger...</p>}
            {!isLoadingPolls && polls.length === 0 && (
              <p className="poll-reports-tool__empty">Ingen afstemninger endnu.</p>
            )}
            {!isLoadingPolls && polls.length > 0 && filteredPolls.length === 0 && (
              <p className="poll-reports-tool__empty">Ingen afstemninger matcher filtrene.</p>
            )}
            {filteredPolls.map((poll) => (
              <button
                className={`poll-reports-tool-card${
                  poll._id === selectedPollId ? ' poll-reports-tool-card--active' : ''
                }`}
                key={poll._id}
                onClick={() => setSelectedPollId(poll._id)}
                type="button"
              >
                <div className="poll-reports-tool-card__meta">
                  <span
                    className={`poll-reports-tool__status poll-reports-tool__status--${
                      poll.status || 'unknown'
                    }`}
                  >
                    {getStatusLabel(poll.status)}
                  </span>
                  <span>{getVisibilityLabel(poll.resultVisibility)}</span>
                </div>
                <h2>{poll.question || poll.title}</h2>
                <p className="poll-reports-tool-card__date">
                  Slutter: {formatDateTime(poll.endsAt)}
                </p>
              </button>
            ))}
          </section>

          <section className="poll-reports-tool__report" aria-label="Rapport">
            {!selectedPoll && <p className="poll-reports-tool__empty">Vælg en afstemning.</p>}
            {selectedPoll && (
              <>
                <div className="poll-reports-tool__toolbar">
                  <div>
                    <p className="poll-reports-tool__eyebrow">
                      {getStatusLabel(selectedPoll.status)} ·{' '}
                      {getVisibilityLabel(selectedPoll.resultVisibility)}
                    </p>
                    <h2>{selectedPoll.question || selectedPoll.title}</h2>
                    <p className="poll-reports-tool__timeline">
                      {formatDateTime(selectedPoll.startsAt)} -{' '}
                      {formatDateTime(selectedPoll.endsAt)}
                    </p>
                  </div>
                  <div className="poll-reports-tool__actions">
                    <a
                      className="poll-reports-tool__button poll-reports-tool__button--secondary"
                      href={`/structure/poll;${selectedPoll._id}`}
                    >
                      Rediger
                    </a>
                    <button
                      className="poll-reports-tool__button"
                      disabled={!adminToken || !report}
                      onClick={downloadCsv}
                      type="button"
                    >
                      Eksporter CSV
                    </button>
                    <button
                      className="poll-reports-tool__button poll-reports-tool__button--secondary"
                      disabled={!canCloseSelectedPoll || isClosing}
                      onClick={closeSelectedPoll}
                      type="button"
                    >
                      {isClosing ? 'Lukker...' : 'Luk afstemning'}
                    </button>
                  </div>
                </div>

                {isLoadingReport && <p className="poll-reports-tool__empty">Indlæser rapport...</p>}
                {report && (
                  <>
                    <dl className="poll-reports-tool__summary">
                      <div>
                        <dt>Svar</dt>
                        <dd>{report.results.responseCount}</dd>
                      </div>
                      <div>
                        <dt>Stemmer</dt>
                        <dd>{report.results.totalVotes}</dd>
                      </div>
                      <div>
                        <dt>Resultatvisning</dt>
                        <dd>{getVisibilityLabel(selectedPoll.resultVisibility)}</dd>
                      </div>
                      <div>
                        <dt>Opdateret</dt>
                        <dd>{formatTime(reportUpdatedAt)}</dd>
                      </div>
                    </dl>

                    <div className="poll-reports-tool__results">
                      {(selectedPoll.options ?? []).map((option) => (
                        <div className="poll-reports-tool-result" key={option._key}>
                          <div className="poll-reports-tool__result-header">
                            <strong>{option.label}</strong>
                            <strong>{getOptionPercentage(option._key)}%</strong>
                          </div>
                          <div className="poll-reports-tool-result__bar-track" aria-hidden="true">
                            <span
                              className="poll-reports-tool-result__bar"
                              style={
                                {
                                  '--poll-result-width': `${getOptionPercentage(option._key)}%`,
                                } as CSSProperties
                              }
                            />
                          </div>
                          <p>{getOptionVotes(option._key)} stemmer</p>
                        </div>
                      ))}
                    </div>
                  </>
                )}
              </>
            )}
          </section>
        </div>
      </div>
    </main>
  )
}
