import './RoleForm.sass'

import block from 'bemboo'
import { addDays, format } from 'date-fns'
import React from 'react'
import { withRouter } from 'react-router-dom'

import { goBack } from '../../actions'
import { createRole, fetchRole, updateRole } from '../../actions/roles'
import { connect, roleTypes } from '../../utils'
import MarkdownEditor from '../Utils/MarkdownEditor'

@block
class RoleForm extends React.Component {
  constructor(props, context) {
    super(props, context)
    const { role } = props
    this.state = {
      duration: null,
      focus: '',
      selectedRoleType: role ? role.role_type : null,
      startDate: null,
      user: '',
    }
  }

  render(b) {
    const {
      circleId,
      circles,
      history,
      isCreation,
      onCancel,
      onGoBack,
      onSubmit,
      role,
      users,
    } = this.props
    const { duration, selectedRoleType, startDate } = this.state
    const roleNameOptions = selectedRoleType
      ? roleTypes.filter(roleType => roleType.value === selectedRoleType)[0]
          .labels
      : []
    const endDate =
      duration > 0 && startDate
        ? format(addDays(new Date(startDate), duration), 'DD/MM/YYYY (dddd)')
        : null
    return (
      <article className={b}>
        <form
          onSubmit={e => {
            e.preventDefault()
            onSubmit(isCreation, circleId, e, history, role.role_id)
          }}
        >
          <label>
            Circle :
            <select
              className={b.e('long')}
              disabled={isCreation}
              defaultValue={circleId}
              name="circle_id"
              required
            >
              <option value="" />
              {circles.map(circ => (
                <option key={circ.circle_id} value={circ.circle_id}>
                  {circ.circle_name}
                </option>
              ))}
            </select>
          </label>
          <label>
            Role type :
            <select
              className={b.e('long')}
              defaultValue={role.role_type ? role.role_type : ''}
              name="role_type"
              onChange={e => {
                this.setState({ selectedRoleType: e.target.value })
              }}
              required
            >
              <option value="" />
              {roleTypes.map(roleType => (
                <option key={roleType.value} value={roleType.value}>
                  {roleType.name}
                </option>
              ))}
            </select>
          </label>
          <label>
            Role name :
            {roleNameOptions.length > 0 ? (
              <select
                className={b.e('long')}
                defaultValue={role.role_name ? role.role_name : ''}
                name="role_name"
                required
              >
                {roleNameOptions.length !== 1 && <option value="" />}
                {roleNameOptions.map(roleName => (
                  <option key={roleName} value={roleName}>
                    {roleName}
                  </option>
                ))}
              </select>
            ) : (
              <input
                name="role_name"
                className={b.e('long')}
                defaultValue={role.role_name ? role.role_name : ''}
                required
              />
            )}
          </label>

          {isCreation && (
            <span>
              <label>
                Role focus :
                <input
                  className={b.e('long')}
                  defaultValue=""
                  name="focus_name"
                  onChange={e => {
                    this.setState({ focus: e.target.value })
                  }}
                />
              </label>
              <label>
                User :
                <select
                  className={b.e('long')}
                  defaultValue=""
                  name="user_id"
                  onChange={e => {
                    this.setState({ user: e.target.value })
                  }}
                  required={this.state.focus !== ''}
                >
                  <option value="" />
                  {users.map(user => (
                    <option key={user.user_id} value={user.user_id}>
                      {user.user_name}
                    </option>
                  ))}
                </select>
              </label>
              <span className={b.e('date')}>
                <label>
                  Duration (in days) :
                  <span className={b.e('duration')}>
                    <input
                      defaultValue={role.duration ? role.duration : ''}
                      disabled={this.state.user === ''}
                      min="0"
                      name="duration"
                      onChange={e => {
                        this.setState({ duration: +e.target.value })
                      }}
                      type="number"
                    />
                  </span>
                </label>
                <label>
                  Start date:
                  <span className={b.e('duration')}>
                    <input
                      defaultValue=""
                      disabled={this.state.user === ''}
                      name="start_date"
                      onChange={e => {
                        this.setState({ startDate: e.target.value })
                      }}
                      type="date"
                    />
                    <span className={b.e('endDate')}>
                      {endDate && `until ${endDate}`}
                    </span>
                  </span>
                </label>
              </span>
            </span>
          )}
          <label>
            Purpose :
            <input
              name="role_purpose"
              className={b.e('long')}
              defaultValue={role.role_purpose ? role.role_purpose : ''}
              required
            />
          </label>
          <label>
            Domain :
            <MarkdownEditor
              editorName="role_domain"
              initValue={role.role_domain}
            />
          </label>
          <label>
            Accountabilities :
            <MarkdownEditor
              editorName="role_accountabilities"
              initValue={role.role_accountabilities}
            />
          </label>
          <button type="submit">{isCreation ? 'Create role' : 'Submit'}</button>
          <button
            type="button"
            onClick={() => (isCreation ? onGoBack(history) : onCancel())}
          >
            Cancel
          </button>
        </form>
      </article>
    )
  }
}

export default withRouter(
  connect(
    () => ({}),
    dispatch => ({
      onCancel: () => {
        dispatch(fetchRole())
      },
      onGoBack: history => {
        dispatch(goBack(history))
      },
      onSubmit: (isCreation, circleId, e, history, roleId) => {
        const formRole = [].slice.call(e.target.elements).reduce(
          function(map, obj) {
            if (obj.name && obj.value) {
              map[obj.name] = obj.value
            }
            return map
          },
          { circle_id: circleId }
        )
        if (isCreation) {
          dispatch(createRole(formRole, history))
        } else {
          dispatch(updateRole(roleId, formRole, history))
        }
      },
    })
  )(RoleForm)
)
