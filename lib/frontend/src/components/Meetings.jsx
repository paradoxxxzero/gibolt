import './Meetings.sass'

import block from 'bemboo'
import { format } from 'date-fns'
import React from 'react'
import { Helmet } from 'react-helmet'
import { Link, withRouter } from 'react-router-dom'

import { fetchResults, goBack, setLoading, setParams } from '../actions'
import { updateReportsList } from '../actions/meetings'
import { connect } from '../utils'
import { parse, stringify } from '../utils/querystring'
import Loading from './Loading'

@block
class Meetings extends React.Component {
  componentDidMount() {
    this.updateData(this.props.location.search, this.props.sync)
  }

  componentDidUpdate(prevProps) {
    if (
      this.props.location.pathname === prevProps.location.pathname &&
      this.props.location.search !== prevProps.location.search
    ) {
      this.updateData(prevProps.location.search, this.props.sync)
    }
  }

  updateData(locationSearch, sync) {
    const search = parse(locationSearch)
    sync({
      circle_id: search.circle_id ? +search.circle_id : '',
      meeting_name: search.meeting_name ? search.meeting_name : '',
    })
  }

  render(b) {
    const {
      circles,
      history,
      labels,
      meetings,
      meetingsTypes,
      onGoBack,
      onSelectChange,
      params,
    } = this.props
    const sortedMeetings = meetings.results.sort(
      (a, c) => c.report_id - a.report_id
    )
    return (
      <section className={b}>
        <Helmet>
          <title>Gibolt - Meetings</title>
        </Helmet>
        {(circles.error || meetingsTypes.error) && (
          <article className={b.e('group').m({ error: true })}>
            <h2>Error during fetch</h2>
            <code>
              {circles.error
                ? `circles : ${circles.error}`
                : `Meetings types ${meetingsTypes.error}`}
            </code>
          </article>
        )}
        {(circles.loading || meetingsTypes.loading) && <Loading />}
        <article className={b.e('meetings')}>
          <h2>Meetings reports</h2>
          <form onSubmit={event => event.preventDefault()}>
            <label>
              Circle:
              <select
                id="circles"
                name="circles"
                value={params.circle_id}
                onChange={event => onSelectChange(event, history)}
              >
                <option value="">All</option>
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
                onChange={event => onSelectChange(event, history)}
              >
                <option value="">All</option>
                {meetingsTypes.results.map(type => (
                  <option key={type.type_id} value={type.type_name}>
                    {type.type_name}
                  </option>
                ))}
              </select>
            </label>
            <Link
              className={b.e('link')}
              to={{
                pathname: '/createReport',
                search: stringify({
                  circle_id: params.circle_id,
                  meeting_name: params.meeting_name,
                }),
              }}
            >
              <button
                type="submit"
                disabled={
                  params.circle_id === '' ||
                  params.meeting_name === '' ||
                  !circles.results
                    .filter(circle => circle.circle_id === params.circle_id)
                    .map(circle => circle.is_active)[0]
                }
              >
                Add a report
              </button>
            </Link>
          </form>
          {sortedMeetings.length > 0 ? (
            <ul>
              {sortedMeetings.map(meeting => (
                <li
                  key={meeting.report_id}
                  className={b.e('item')}
                  style={{
                    color: `${labels
                      .filter(
                        label => label.label_id === meeting.circle[0].label_id
                      )
                      .map(label => label.color)
                      .toString()}`,
                  }}
                >
                  <Link
                    className={b.e('link')}
                    to={{
                      pathname: '/meeting',
                      search: stringify({ report_id: meeting.report_id }),
                    }}
                  >
                    <span className={b.e('unlink')}>
                      {format(new Date(meeting.created_at), 'DD/MM/YYYY HH:mm')}
                      {' - '}
                      {meeting.circle[0].circle_name} -{' '}
                    </span>
                    {meeting.report_type}
                    <span className={b.e('unlink')}>
                      {meeting.attendees.length > 0 &&
                        !meeting.is_submitted &&
                        ' (Draft)'}
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          ) : (
            <span>No meetings reports</span>
          )}
          <button type="submit" onClick={() => onGoBack(history)}>
            Back
          </button>
        </article>
      </section>
    )
  }
}
export default withRouter(
  connect(
    state => ({
      circles: state.circles,
      labels: state.labels.results.circle,
      meetings: state.meetings,
      meetingsTypes: state.meetingsTypes,
      params: state.params,
    }),
    dispatch => ({
      onGoBack: history => {
        dispatch(goBack(history))
      },
      onSelectChange: (event, history) => {
        dispatch(updateReportsList(event, history))
      },
      sync: locationSearch => {
        dispatch(setParams(locationSearch))
        dispatch(setLoading('circles'))
        dispatch(fetchResults('circles'))
        dispatch(setLoading('meetingsTypes'))
        dispatch(fetchResults('meetingsTypes'))
        dispatch(setLoading('labels'))
        dispatch(fetchResults('labels'))
        dispatch(setLoading('meetings'))
        dispatch(fetchResults('meetings'))
      },
    })
  )(Meetings)
)
