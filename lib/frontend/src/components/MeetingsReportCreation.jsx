import './MeetingsReportCreation.sass'

import { format } from 'date-fns'
import { parse, stringify } from 'query-string'
import React from 'react'
import { Helmet } from 'react-helmet'
import { Link, withRouter } from 'react-router-dom'

import { fetchResults, goBack, setLoading, setParams } from '../actions'
import { submitReport, updateReportsList } from '../actions/meetings'
import { fetchCircleMilestones } from '../actions/milestones'
import { block, connect } from '../utils'
import Loading from './Loading'
import MarkdownEditor from './MarkdownEditor'
import Progress from './Progress'

const b = block('MeetingsReportCreation')

class MeetingsReportCreation extends React.Component {
  componentWillMount() {
    const search = parse(this.props.location.search)
    this.props.sync({
      circle_id: search.circle_id ? +search.circle_id : '',
      meeting_name: search.meeting_name ? search.meeting_name : '',
    })
  }
  componentWillReceiveProps(nextProps) {
    if (
      nextProps.circles !== this.props.circles ||
      nextProps.params.circle_id !== this.props.params.circle_id
    ) {
      this.props.getMilestones()
    }
  }

  render() {
    const {
      circleMilestones,
      circles,
      history,
      meetingsTypes,
      onGoBack,
      onSelectChange,
      onSubmit,
      params,
      search,
    } = this.props
    return (
      <section className={b()}>
        <Helmet>
          <title>Gibolt - Create a report</title>
        </Helmet>
        {(circles.error || meetingsTypes.error) && (
          <article className={b('group', { error: true })}>
            <h2>Error during fetch or creation</h2>
            <code>
              {circles.error
                ? `circles : ${circles.error}`
                : meetingsTypes.error
                  ? `Meetings types: ${meetingsTypes.error}`
                  : ''}
            </code>
          </article>
        )}
        {(circles.loading || meetingsTypes.loading) && <Loading />}
        <article className={b('meetings')}>
          <h2>Create a report</h2>
          <form onSubmit={event => event.preventDefault()}>
            <label>
              Circle:
              <select
                id="circles"
                name="circles"
                value={params.circle_id}
                disabled={search !== ''}
                onChange={event => onSelectChange(event)}
              >
                <option value="" />
                {circles.results.map(circle => (
                  <option key={circle.circle_id} value={circle.circle_id}>
                    {circle.circle_name}
                  </option>
                ))}
              </select>
            </label>
            <label>
              Meetings:
              <select
                id="meetingType"
                name="meetingType"
                value={params.meeting_name}
                disabled={search !== ''}
                onChange={event => onSelectChange(event)}
              >
                <option value="" />
                {meetingsTypes.results.map(type => (
                  <option key={type.type_id} value={type.type_name}>
                    {type.type_name}
                  </option>
                ))}
              </select>
            </label>
            <div className={b('content')}>
              <label className={b('lab')}>Projects:</label>
              <ul>
                {circleMilestones.map(milestone => (
                  <li
                    key={milestone.milestone_number}
                    title={milestone.description}
                  >
                    <a
                      className={b('unlink')}
                      href={milestone.html_url}
                      target="_blank"
                    >
                      <span className={b('bullet')} />
                      {milestone.repo_name}
                      {' - '}
                      <span className={b('lab')}>
                        {milestone.milestone_title}
                      </span>
                    </a>
                    {' -'}
                    <Progress
                      val={milestone.closed_issues}
                      total={milestone.open_issues + milestone.closed_issues}
                    />
                    <span className={b('due-date')}>
                      {' ('}
                      {milestone.due_on
                        ? `due on: ${format(
                            new Date(milestone.due_on),
                            'DD/MM/YYYY'
                          )}`
                        : 'no due date'}
                      {')'}
                    </span>
                    <Link
                      className={b('unlink')}
                      target="_blank"
                      to={{
                        pathname: '/createIssue',
                        search: stringify({
                          grouper: 'milestone',
                          group: `${milestone.repo_name} ⦔ ${
                            milestone.milestone_number
                          }`,
                        }),
                      }}
                    >
                      <i
                        className="fa fa-plus-circle addCircle"
                        aria-hidden="true"
                      />
                    </Link>
                    <br />
                    <input
                      id={`comment-${milestone.milestone_number}`}
                      name={`comment-${milestone.milestone_number}`}
                    />
                  </li>
                ))}
              </ul>
            </div>
            <div className={b('content')}>
              <label className={b('lab')}>Report content:</label>
              <MarkdownEditor />
            </div>
            <article className={b('action')}>
              <button type="submit" onClick={event => onSubmit(event, history)}>
                Submit
              </button>
              <button type="submit" onClick={() => onGoBack(history)}>
                Cancel
              </button>
            </article>
          </form>
        </article>
      </section>
    )
  }
}
export default withRouter(
  connect(
    state => ({
      circleMilestones: state.circleMilestones.results,
      circles: state.circles,
      meetingsTypes: state.meetingsTypes,
      search: state.router.location.search,
      params: state.params,
    }),
    dispatch => ({
      getMilestones: () => {
        dispatch(fetchCircleMilestones())
      },
      onGoBack: history => {
        dispatch(goBack(history))
      },
      onSelectChange: event => {
        dispatch(updateReportsList(event))
      },
      onSubmit: (event, history) => {
        event.preventDefault()
        dispatch(submitReport(event, history))
      },
      sync: locationSearch => {
        dispatch(setParams(locationSearch))
        dispatch(setLoading('circles'))
        dispatch(fetchResults('circles'))
        dispatch(setLoading('meetingsTypes'))
        dispatch(fetchResults('meetingsTypes'))
        dispatch(setLoading('labels'))
        dispatch(fetchResults('labels'))
      },
    })
  )(MeetingsReportCreation)
)
