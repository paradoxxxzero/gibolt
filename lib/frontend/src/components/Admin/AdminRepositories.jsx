import './AdminRepositories.sass'

import { stringify } from 'query-string'
import React from 'react'
import { Helmet } from 'react-helmet'
import { Link } from 'react-router-dom'

import {
  fetchResults,
  setLoading,
  updateRepoList,
  updateReposLabels,
} from '../../actions'
import { block, connect, getMissingAndOverlyLabelsForARepo } from '../../utils'
import Loading from './../Loading'

const b = block('Repositories')

class Repositories extends React.Component {
  componentDidMount() {
    this.props.sync()
  }

  render() {
    const {
      labels,
      loading,
      error,
      repositories,
      onCheckboxChange,
      onUpdateRepo,
      selectedRepositories,
    } = this.props
    repositories.sort(function(a, c) {
      return a.repo_name.toLowerCase() > c.repo_name.toLowerCase()
        ? 1
        : c.repo_name.toLowerCase() > a.repo_name.toLowerCase() ? -1 : 0
    })
    repositories.map(repo => {
      const wrongLabels = getMissingAndOverlyLabelsForARepo(labels, repo.labels)
      repo.missingLabels = wrongLabels.missingLabels
      repo.overlyLabels = wrongLabels.overlyLabels
    })
    return (
      <section className={b()}>
        <Helmet>
          <title>Gibolt - Repositories</title>
        </Helmet>
        <article className={b('topRepositories')}>
          <span>
            <h1 className={b('head')}>Repositories</h1>
            <button
              disabled={selectedRepositories.length === 0}
              onClick={() => onUpdateRepo()}
              type="submit"
            >
              Update labels for selected repositories
            </button>
            {selectedRepositories.length > 0 && (
              <span className={b('unlink')}>
                Selected repositories:
                {selectedRepositories
                  .map(repo => ` ${repo.repo_name}`)
                  .toString()}
              </span>
            )}
          </span>
          {loading && <Loading />}
          {error && (
            <article className={b('date', { error: true })}>
              <h2>Error during report fetch</h2>
              <code>{error}</code>
            </article>
          )}
        </article>
        <article className={b('repositories')}>
          <ul>
            {repositories.map(repository => (
              <li key={repository.repo_id} className={b('item')}>
                <div>
                  {repository.missingLabels.length > 0 ||
                  repository.overlyLabels.length > 0 ? (
                    <input
                      id="checkbox"
                      type="checkbox"
                      key={repository.repo_name}
                      onChange={event => onCheckboxChange(event, repository)}
                      checked={
                        selectedRepositories.filter(
                          repo => repo.repo_name === repository.repo_name
                        ).length !== 0
                      }
                    />
                  ) : (
                    <span className={b('space')} />
                  )}
                  <Link
                    className={b('link')}
                    to={{
                      pathname: '/admin/repository',
                      search: stringify({ name: repository.repo_name }),
                    }}
                  >
                    {repository.repo_name}
                    {(repository.missingLabels.length > 0 ||
                      repository.overlyLabels.length > 0) && (
                      <span className={b('unlink')}>
                        some labels are missing or unconfigured
                      </span>
                    )}
                  </Link>
                </div>
              </li>
            ))}
          </ul>
        </article>
        <span>
          <button
            disabled={selectedRepositories.length === 0}
            onClick={() => onUpdateRepo()}
            type="submit"
          >
            Update labels for selected repositories
          </button>
          {selectedRepositories.length > 0 && (
            <span className={b('unlink')}>
              Selected repositories:
              {selectedRepositories
                .map(repo => ` ${repo.repo_name}`)
                .toString()}
            </span>
          )}
        </span>
      </section>
    )
  }
}
export default connect(
  state => ({
    repositories: state.repositories.results.repositories,
    labels: state.labels.results.priority.concat(
      state.labels.results.ack,
      state.labels.results.circle,
      state.labels.results.qualifier
    ),
    loading: state.repositories.loading,
    error: state.repositories.error,
    selectedRepositories: state.repositories.selectedRepositories,
  }),
  dispatch => ({
    onCheckboxChange: (event, repo) => {
      dispatch(updateRepoList(event.target.checked, repo))
    },
    onUpdateRepo: () => {
      dispatch(setLoading('repositories'))
      dispatch(updateReposLabels())
    },
    sync: () => {
      dispatch(setLoading('labels'))
      dispatch(fetchResults('labels'))
      dispatch(setLoading('repositories'))
      dispatch(fetchResults('repositories'))
    },
  })
)(Repositories)
