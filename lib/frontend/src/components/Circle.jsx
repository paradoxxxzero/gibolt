import './Circle.sass'

import React from 'react'
import { Helmet } from 'react-helmet'

import { block, circleNameFromState, connect } from '../utils'
import {
  toggleAccountExpanded,
  toggleDomainExpanded,
  togglePurposeExpanded,
} from '../actions/circle'
import Loading from './Loading'

const b = block('Circle')

function Circle({
  circle,
  circlename,
  error,
  loading,
  onClickAccount,
  onClickDomain,
  onClickPurpose,
}) {
  return (
    <section className={b()}>
      <Helmet>
        <title>Gibolt - Circle</title>
      </Helmet>
      <h1>{circlename}</h1>
      {error && (
        <article className={b('group', { error: true })}>
          <h2>Error during issue fetch</h2>
          {typeof error === 'object' ? (
            <ul>
              {error.map(err => (
                <li key={err.id}>
                  <span className={b('bullet')} />
                  {err.value}
                </li>
              ))}
            </ul>
          ) : (
            <code>{error}</code>
          )}
        </article>
      )}
      {loading && <Loading />}
      <article>
        <h3>Purpose</h3>
        <div onClick={() => onClickPurpose(circle.purpose_expanded)}>
          {circle.purpose_expanded ? (
            <p>{circle.circle_purpose}</p>
          ) : (
            <span>show purpose</span>
          )}
        </div>
        <h3>Domains</h3>
        <div onClick={() => onClickDomain(circle.domain_expanded)}>
          {circle.domain_expanded ? (
            <p>{circle.circle_domain}</p>
          ) : (
            <span>show domain</span>
          )}
        </div>
        <h3>Accountabilities</h3>
        <div onClick={() => onClickAccount(circle.accountabilities_expanded)}>
          {circle.accountabilities_expanded ? (
            <p>{circle.circle_accountabilities}</p>
          ) : (
            <span>show accountabilities</span>
          )}
        </div>
      </article>
      <article>
        <h3>Rôles</h3>
      </article>
    </section>
  )
}
export default connect(
  state => ({
    circle: state.circle.results,
    loading: state.circle.loading,
    error: state.circle.error,
    circlename: circleNameFromState(state).name,
  }),
  dispatch => ({
    onClickAccount: circleAccount => {
      dispatch(toggleAccountExpanded(circleAccount))
    },
    onClickDomain: circleDomain => {
      dispatch(toggleDomainExpanded(circleDomain))
    },
    onClickPurpose: circlePurpose => {
      dispatch(togglePurposeExpanded(circlePurpose))
    },
  })
)(Circle)
