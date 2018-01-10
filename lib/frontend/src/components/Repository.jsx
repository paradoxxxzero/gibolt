import './Repository.sass'

import React from 'react'
import { Helmet } from 'react-helmet'

import {
  createLabels,
  deleteLabels,
  fetchRepository,
  fetchResults,
  setLoading,
} from '../actions'
import { block, connect, repositoryNameFromState } from '../utils'
import Loading from './Loading'

const b = block('Repository')

class Repository extends React.Component {
  componentWillMount() {
    this.props.sync()
  }

  render() {
    const {
      loading,
      results,
      reponame,
      onCreateLabels,
      onDeleteLabels,
    } = this.props
    return (
      <section className={b()}>
        <Helmet>
          <title>Gibolt - Repository</title>
        </Helmet>
        <h1>{reponame}</h1>
        {results.errors && (
          <div>
            <ul>
              {results.errors.map(error => (
                <li key={error.id}>
                  <span className={b('bullet')} />
                  {error.value}
                </li>
              ))}
            </ul>
          </div>
        )}
        {loading && <Loading />}
        <article>
          <h2>Current labels</h2>
          <ul>
            {results.labels.map(label => (
              <li key={label.label_id} className={b('label')}>
                <span
                  className={b('bullet')}
                  style={{ backgroundColor: `#${label.color}` }}
                />
                {label.label_name}
              </li>
            ))}
          </ul>
        </article>
        <article>
          <h2>Missing labels</h2>
          <ul>
            {results.missingLabels.map(label => (
              <li key={label.text} className={b('label')}>
                <span
                  className={b('bullet')}
                  style={{ backgroundColor: `#${label}` }}
                />
                {label.text}
              </li>
            ))}
          </ul>
          {results.missingLabels.length > 0 ? (
            results.repository.permissions.push ? (
              <article className={b('action')}>
                <button type="submit" onClick={() => onCreateLabels()}>
                  Add missing labels
                </button>
              </article>
            ) : (
              <p>
                You can’t change labels on this repository, ask an admin for
                write permission.
              </p>
            )
          ) : (
            <p>None</p>
          )}
        </article>
        <article>
          <h2>Unconfigured labels</h2>
          <ul>
            {results.overlyLabels.map(label => (
              <li key={label.label_id} className={b('label')}>
                <span
                  className={b('bullet')}
                  style={{ backgroundColor: `#${label}` }}
                />
                {label.label_name}
              </li>
            ))}
          </ul>
          {results.overlyLabels.length > 0 ? (
            results.repository.permissions.push ? (
              <article className={b('action')}>
                <button type="submit" onClick={() => onDeleteLabels()}>
                  Delete Unconfigured labels
                </button>
              </article>
            ) : (
              <p>
                You can’t change labels on this repository, ask an admin for
                write permission.
              </p>
            )
          ) : (
            <p>None</p>
          )}
        </article>
      </section>
    )
  }
}
export default connect(
  state => ({
    results: state.repository.results,
    loading: state.repository.loading,
    reponame: repositoryNameFromState(state).name,
  }),
  dispatch => ({
    onCreateLabels: () => {
      dispatch(createLabels())
    },
    onDeleteLabels: () => {
      dispatch(deleteLabels())
    },
    sync: () => {
      dispatch(setLoading('labels'))
      dispatch(fetchResults('labels'))
      dispatch(setLoading('repository'))
      dispatch(fetchRepository())
    },
  })
)(Repository)
