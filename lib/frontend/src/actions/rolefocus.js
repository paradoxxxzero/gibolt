import { compareDesc } from 'date-fns'

import { setError, setLoading, setResults } from './index'
import { fetchRoles } from './roles'
import { roleFocusFromState } from '../utils'

export function editClickItem(itemId) {
  return {
    type: 'EDIT_ITEM',
    itemId: itemId,
  }
}

export function cancelClickItem(itemId) {
  return {
    type: 'CANCEL_ITEM',
    itemId: itemId,
  }
}

export const editRoleFocus = isInEdition => ({
  type: 'EDIT_ROLE_FOCUS',
  isInEdition,
})

const splitItems = focus => {
  const actionsList = [],
    intdicatorsList = []
  focus.items.map(item => {
    if (item.item_type === 'checklist') {
      actionsList.push(item)
    } else {
      intdicatorsList.push(item)
    }
  })
  focus.actions = actionsList
  focus.indicators = intdicatorsList
  delete focus.items
  return focus
}

const sortFocusUsersByDate = (dateA, dateB) =>
  dateB === null ? 1 : dateA === null ? -1 : compareDesc(dateA, dateB)

export const sortFocusUsers = focusUsers => {
  focusUsers.sort(function(a, b) {
    return (b.end_date === null && a.end_date === null) ||
      b.end_date === a.end_date
      ? sortFocusUsersByDate(a.start_date, b.start_date)
      : sortFocusUsersByDate(a.end_date, b.end_date)
  })
  return focusUsers
}

export const fetchRoleFocus = (withRoles = false) => async (
  dispatch,
  getState
) => {
  let response
  let roleFocusJson = {}
  const state = getState()
  const roleFocus = roleFocusFromState(state)
  if (!roleFocus.role_focus_id) {
    return dispatch(
      setError('role_focus_id is missing or is not a number', 'roleFocus')
    )
  }
  try {
    response = await fetch(`/api/role_focuses/${+roleFocus.role_focus_id}`, {
      method: 'GET',
      credentials: 'same-origin',
    })
  } catch (e) {
    return dispatch(
      setError(
        'Erreur pendant la récupération des données du role',
        'roleFocus'
      )
    )
  }
  if (response.status >= 200 && response.status < 300) {
    try {
      roleFocusJson = await response.json()

      if (roleFocusJson.objects[0].role_focus_users.length > 0) {
        roleFocusJson.objects[0].role_focus_users = sortFocusUsers(
          roleFocusJson.objects[0].role_focus_users
        )
        roleFocusJson.objects[0].role_focus_users.map(user => {
          const currentUser = state.users.results.find(
            u => u.user_id === user.user_id
          )
          user.user_name = currentUser ? currentUser.user_name : null
          user.avatar_url = currentUser ? currentUser.avatar_url : null
        })
      }
      if (withRoles) {
        dispatch(fetchRoles(roleFocusJson.objects[0].role[0].circle_id))
      }
      return dispatch(
        setResults(splitItems(roleFocusJson.objects[0]), 'roleFocus')
      )
    } catch (e) {
      console.error(e)
      return dispatch(
        setError('La réponse ne contient pas de json', 'roleFocus')
      )
    }
  } else {
    const jsonMessage = typeof roleJson === 'undefined' ? '' : roleFocus.message
    return dispatch(
      setError(
        `${response.status}: ${response.statusText} ${jsonMessage}`,
        'roleFocus'
      )
    )
  }
}

export const addItem = data => async dispatch => {
  let response
  try {
    response = await fetch('api/items', {
      method: 'POST',
      credentials: 'same-origin',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    })
  } catch (e) {
    return dispatch(
      setError(`Erreur pendant la création de l'item, "${data}"`, 'roleFocus')
    )
  }
  if (response.status >= 200 && response.status < 300) {
    try {
      await response.json()
      return dispatch(fetchRoleFocus())
    } catch (e) {
      return dispatch(
        setError(
          `La réponse ne contient pas de json pour : "${data.content}"`,
          'roleFocus'
        )
      )
    }
  } else {
    return dispatch(
      setError(
        `Erreur [${response.status}] ${response.statusText} pour : "${data}"`,
        'roleFocus'
      )
    )
  }
}

export const delItem = data => async dispatch => {
  let response
  try {
    response = await fetch(`api/items/${data}`, {
      method: 'DELETE',
      credentials: 'same-origin',
      headers: {
        'Content-Type': 'application/json',
      },
    })
  } catch (e) {
    return dispatch(
      setError(
        `Erreur pendant la suppression de l'item, "${data}"`,
        'roleFocus'
      )
    )
  }
  if (response.status >= 200 && response.status < 300) {
    try {
      await response.json()
      return dispatch(fetchRoleFocus())
    } catch (e) {
      return dispatch(
        setError(
          `La réponse ne contient pas de json pour: "${data.content}"`,
          'roleFocus'
        )
      )
    }
  } else {
    return dispatch(
      setError(
        `Erreur [${response.status}] ${response.statusText} pour : "${data}"`,
        'roleFocus'
      )
    )
  }
}

export const updateItem = (itemId, data) => async dispatch => {
  let response, json
  try {
    response = await fetch(`/api/items/${itemId}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
      credentials: 'same-origin',
      headers: {
        'Content-Type': 'application/json',
      },
    })
  } catch (e) {
    return dispatch(
      setError("Erreur pendant la mise à jour de l'item"),
      'roleFocus'
    )
  }
  if (response.status >= 200 && response.status < 300) {
    try {
      json = await response.json()
      return dispatch(fetchRoleFocus())
    } catch (e) {
      return dispatch(
        setError('La réponse ne contient pas de json', 'roleFocus')
      )
    }
  } else {
    const jsonMessage = typeof json === 'undefined' ? '' : json.message
    return dispatch(
      setError(
        `${response.status}: ${response.statusText} ${jsonMessage}`,
        'roleFocus'
      )
    )
  }
}

export const updateFocus = (focus, focusUser) => async dispatch => {
  let response, json
  try {
    response = await fetch(`/api/role_focuses/${focus.role_focus_id}`, {
      method: 'PATCH',
      body: JSON.stringify(focus),
      credentials: 'same-origin',
      headers: {
        'Content-Type': 'application/json',
      },
    })
  } catch (e) {
    return dispatch(
      setError('Erreur pendant la mise à jour du focus'),
      'roleFocus'
    )
  }
  if (response.status >= 200 && response.status < 300) {
    try {
      json = await response.json()
    } catch (e) {
      return dispatch(
        setError('La réponse ne contient pas de json', 'roleFocus')
      )
    }
  } else {
    const jsonMessage = typeof json === 'undefined' ? '' : json.message
    return dispatch(
      setError(
        `${response.status}: ${response.statusText} ${jsonMessage}`,
        'roleFocus'
      )
    )
  }

  try {
    response = await fetch(
      `/api/role_focus_users/${focusUser.role_focus_user_id}`,
      {
        method: 'PATCH',
        body: JSON.stringify(focusUser),
        credentials: 'same-origin',
        headers: {
          'Content-Type': 'application/json',
        },
      }
    )
  } catch (e) {
    return dispatch(
      setError('Erreur pendant la mise à jour du focus (user)'),
      'roleFocus'
    )
  }
  if (response.status >= 200 && response.status < 300) {
    try {
      json = await response.json()
    } catch (e) {
      return dispatch(
        setError('La réponse ne contient pas de json', 'roleFocus')
      )
    }
  } else {
    const jsonMessage = typeof json === 'undefined' ? '' : json.message
    return dispatch(
      setError(
        `${response.status}: ${response.statusText} ${jsonMessage}`,
        'roleFocus'
      )
    )
  }
  dispatch(editRoleFocus(false))
  return dispatch(fetchRoleFocus())
}

export const deleteFocus = (focus, history) => async dispatch => {
  let response
  try {
    response = await fetch(`api/role_focuses/${focus.role_focus_id}`, {
      method: 'DELETE',
      credentials: 'same-origin',
      headers: {
        'Content-Type': 'application/json',
      },
    })
  } catch (e) {
    return dispatch(
      setError('Erreur pendant la suppression du focus', 'roleFocus')
    )
  }
  if (response.status >= 200 && response.status < 300) {
    try {
      await response.json()
      return history.push(`/role?role_id=${focus.role_id}`)
    } catch (e) {
      return dispatch(
        setError('La réponse ne contient pas de json', 'roleFocus')
      )
    }
  } else {
    return dispatch(
      setError(
        `Erreur [${response.status}] ${response.statusText}`,
        'roleFocus'
      )
    )
  }
}

export const addFocusUser = focusUser => async dispatch => {
  let response
  try {
    response = await fetch('api/role_focus_users', {
      method: 'POST',
      credentials: 'same-origin',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(focusUser),
    })
  } catch (e) {
    return dispatch(setError("Erreur pendant l'ajout du focus", 'roleFocus'))
  }
  if (response.status >= 200 && response.status < 300) {
    try {
      await response.json()
      dispatch(setLoading('RoleFocus'))
      return dispatch(fetchRoleFocus())
    } catch (e) {
      return dispatch(
        setError('La réponse ne contient pas de json', 'roleFocus')
      )
    }
  } else {
    return dispatch(
      setError(
        `Erreur [${response.status}] ${response.statusText}`,
        'roleFocus'
      )
    )
  }
}
