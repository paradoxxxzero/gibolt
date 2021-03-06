import './Issues.sass'

import block from 'bemboo'
import React from 'react'
import ReactModal from 'react-modal'

import {
  fetchResults,
  setLoading,
  setModal,
  setParams,
  setRefresh,
} from '../actions'
import {
  fetchIssues,
  setIssuesSelectness,
  toggleIssue,
  updateCurrentIssue,
  updateIssues,
} from '../actions/issues'
import {
  connect,
  filterIssuesOnLabels,
  filterIssuesOnState,
  groupIssues,
  grouperFromState,
  issuesStateFromState,
  sortGroupIssues,
  sortIssues,
} from '../utils'
import Issue from './Issue'
import IssueCreationDetail from './IssueCreationDetail'
import IssueDetail from './IssueDetail'
import Loading from './Loading'
import Progress from './Progress'

function checkboxState(issues) {
  const selectedIssues = issues.filter(issue => issue.selected).length
  if (selectedIssues === 0) {
    return 'unchecked'
  }
  if (selectedIssues === issues.length) {
    return 'checked'
  }
  return 'indeterminate'
}

@block
class Issues extends React.Component {
  constructor(props, context) {
    super(props, context)
    this.state = {
      hideAllGroups: false,
      hiddenGroups: [],
      location: props.location,
    }
  }
  static getDerivedStateFromProps(props, state) {
    if (
      props.location.pathname === state.location.pathname &&
      props.location.search !== state.location.search
    ) {
      return { hiddenGroups: [], hideAllGroups: false }
    }
    return null
  }

  componentDidMount() {
    this.props.sync()
    ReactModal.setAppElement('#root')
  }

  componentDidUpdate(prevProps) {
    if (
      this.props.location.pathname === prevProps.location.pathname &&
      this.props.location.search !== prevProps.location.search
    ) {
      this.props.sync()
    }
  }

  updateAccordion(group, issuesByGroup) {
    const { hiddenGroups, hideAllGroups } = this.state
    if (hideAllGroups) {
      issuesByGroup
        .filter(issues => issues.group !== group)
        .map(issues => hiddenGroups.push(issues.group))
    } else if (hiddenGroups.find(g => g === group)) {
      hiddenGroups.splice(hiddenGroups.indexOf(group), 1)
    } else {
      hiddenGroups.push(group)
    }
    this.setState({ hiddenGroups, hideAllGroups: false })
  }

  isHidden(group) {
    return this.state.hideAllGroups
      ? true
      : this.state.hiddenGroups.find(g => g === group)
  }

  setCheckBox(checked) {
    this.setState({ hideAllGroups: checked, hiddenGroups: [] })
  }

  render(b) {
    const {
      labelFilteredIssues,
      issues,
      issuesState,
      loading,
      grouper,
      error,
      modal,
      onModalClose,
      onModalCreation,
      onModalDisplay,
      onToggleSelected,
      onToggleGrouper,
      onChangeTickets,
    } = this.props
    const issuesByGroup = sortGroupIssues(groupIssues(issues, grouper), grouper)
    const closedLen = labelFilteredIssues.filter(
      issue => issue.state === 'closed'
    ).length

    return (
      <section className={b}>
        <h1 className={b.e('head')}>
          {issues.length} {issuesState === 'all' ? ' ' : ` ${issuesState} `}
          issues{' '}
          {issuesState === 'all'
            ? ''
            : `over ${labelFilteredIssues.length} in total `}
          {grouper !== 'nogroup' && `grouped by ${grouper}`}{' '}
          <input
            type="checkbox"
            defaultChecked={checkboxState(issues) === 'checked'}
            ref={elem =>
              elem &&
              (elem.indeterminate = checkboxState(issues) === 'indeterminate')
            }
            onChange={() =>
              onToggleGrouper(
                issues.map(issue => issue.ticket_id),
                checkboxState(issues) !== 'checked'
              )
            }
          />
          <Progress val={closedLen} total={labelFilteredIssues.length} />
        </h1>
        <ReactModal
          className={b.e('modal').toString()}
          overlayClassName={b.e('modal-overlay').toString()}
          isOpen={!!modal.display}
          onRequestClose={() => onModalClose(modal.refresh)}
          shouldCloseOnOverlayClick
        >
          {modal.creation ? (
            <IssueCreationDetail
              circleId={null}
              onModalClose={() => onModalClose(modal.refresh)}
            />
          ) : (
            modal.data.issueId && (
              <span>
                <IssueDetail
                  issue={
                    issues.filter(
                      iss => iss.ticket_id === modal.data.issueId
                    )[0]
                  }
                  onModalClose={() => onModalClose(modal.refresh)}
                />
              </span>
            )
          )}
        </ReactModal>
        {loading && <Loading />}
        {error && (
          <article className={b.e('group').m({ error: true })}>
            <h2>Error during issue fetch</h2>
            {typeof error === 'object' ? (
              <ul>
                {error.map(err => (
                  <li key={err.id}>
                    <span className={b.e('bullet')} />
                    {err.value}
                  </li>
                ))}
              </ul>
            ) : (
              <code>{error}</code>
            )}
          </article>
        )}
        <div className={b.e('check')}>
          <label htmlFor="checkbox">
            <input
              defaultChecked={this.state.hideAllGroups}
              id="checkbox"
              onClick={e => this.setCheckBox(e.target.checked)}
              type="checkbox"
            />
            hide all issues
          </label>
        </div>
        {issuesByGroup.map(({ id, group, issues }) => (
          <article key={id} className={b.e('group')}>
            <h2>
              <button
                className={b.e('accordion')}
                onClick={() => this.updateAccordion(group, issuesByGroup)}
              >
                {this.isHidden(group) ? '+' : '-'}
              </button>
              {group} <sup>({issues.length})</sup>{' '}
              <input
                type="checkbox"
                defaultChecked={checkboxState(issues) === 'checked'}
                ref={elem =>
                  elem &&
                  (elem.indeterminate =
                    checkboxState(issues) === 'indeterminate')
                }
                onChange={() =>
                  onToggleGrouper(
                    issues.map(issue => issue.ticket_id),
                    checkboxState(issues) !== 'checked'
                  )
                }
              />
              {(grouper === 'project' ||
                (grouper === 'milestone' &&
                  (issues[0].milestone_state === 'open' ||
                    group.split(' ⦔ ')[1] === 'No milestone'))) && (
                <button
                  className={b.e('newTicket')}
                  onClick={() => onModalCreation(grouper, group, id)}
                >
                  Create issue
                </button>
              )}
              {issuesState === 'all' && grouper !== 'state' && (
                <Progress
                  val={issues.filter(i => i.state === 'closed').length}
                  total={issues.length}
                />
              )}
            </h2>
            <ul
              className={b.e(
                `panel__${this.isHidden(group) ? 'hidden' : 'display'}`
              )}
            >
              {sortIssues(issues, grouper).map(issue => (
                <Issue
                  key={issue.ticket_id}
                  id={issue.ticket_number}
                  state={issue.state}
                  closed_at={issue.closed_at}
                  title={issue.ticket_title}
                  body={issue.body}
                  assignee={issue.user}
                  users={issue.assignees}
                  avatars={issue.avatar_url}
                  project={issue.repo_name}
                  labels={issue.labels}
                  milestone_id={issue.milestone_id}
                  milestone_title={issue.milestone_title}
                  selected={issue.selected}
                  url={issue.html_url}
                  pull_request={issue.pull_request}
                  expanded={issue.expanded}
                  comments_expanded={issue.comments_expanded}
                  nb_comments={issue.nb_comments}
                  comments={issue.comments}
                  onBoxChange={() => onToggleSelected(issue.ticket_id)}
                  onModalDisplay={() => onModalDisplay(issue)}
                />
              ))}
            </ul>
          </article>
        ))}
        <article className={b.e('action')}>
          <button type="submit" onClick={() => onChangeTickets('increment')}>
            Increment priority
          </button>
          <button type="submit" onClick={() => onChangeTickets('removeTop')}>
            Remove top priority
          </button>
          <button type="submit" onClick={() => onChangeTickets('close')}>
            Close issue
          </button>
          <button type="submit" onClick={() => onModalCreation()}>
            Create issue
          </button>
        </article>
      </section>
    )
  }
}

export default connect(
  state => {
    const labelFilteredIssues = filterIssuesOnLabels(
      state.issues.results.issues,
      state
    )
    return {
      labelFilteredIssues,
      issues: filterIssuesOnState(labelFilteredIssues, state),
      loading: state.issues.loading,
      grouper: grouperFromState(state),
      issuesState: issuesStateFromState(state),
      error: state.issues.error,
      modal: state.modal,
      currentIssue: state.issues.results.currentIssue,
    }
  },
  dispatch => ({
    onModalClose: refresh => {
      dispatch(setModal(false, false, {}))
      dispatch(updateCurrentIssue({}))
      if (refresh) {
        dispatch(setLoading('issues'))
        dispatch(fetchIssues())
        dispatch(setRefresh(false))
      }
    },
    onModalCreation: (grouper = null, group = null, id = null) => {
      const params =
        grouper === 'milestone'
          ? {
              grouper,
              group: id.split('|')[1]
                ? `${group.split(' ⦔ ')[0]} ⦔ ${id.split('|')[1]}`
                : group,
            }
          : { grouper, group }
      dispatch(setParams(params))
      dispatch(setModal(true, true, {}))
    },
    onModalDisplay: issue => {
      dispatch(setModal(true, false, { issueId: issue.ticket_id }))
      dispatch(updateCurrentIssue(issue))
    },
    onToggleSelected: issueId => {
      dispatch(toggleIssue(issueId))
    },
    onToggleGrouper: (issuesId, isSelected) => {
      dispatch(setIssuesSelectness(issuesId, isSelected))
    },
    onChangeTickets: change => {
      dispatch(setLoading('issues'))
      switch (change) {
        case 'removeTop':
          return dispatch(updateIssues('removeSelectedIssuesPriority'))
        case 'increment':
          return dispatch(updateIssues('incrementSelectedIssuesPriority'))
        case 'close':
          return dispatch(updateIssues('closeSelectedIssues'))
      }
    },
    sync: () => {
      dispatch(setLoading('issues'))
      dispatch(fetchIssues())
      dispatch(setLoading('circles'))
      dispatch(fetchResults('circles'))
    },
  })
)(Issues)
