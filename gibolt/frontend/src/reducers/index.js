import { combineReducers } from 'redux'

const initialLabels = {
    priority: [{text: 'sprint', color: '#009800'}],
    qualifier: []
}

const labels = (state=initialLabels, action) => state

const search = (state='', action) => {
  switch (action.type) {
    case 'SEARCH':
      return action.search
    default:
      return state
  }
}

const emptyIssues = {
  list: [],
  loading: false,
  mustLoad: true,
  error: null
}

const issues = (state=emptyIssues, action) => {
  switch (action.type) {
    case 'SET_ISSUES':
      return {
        ...state,
        list: action.issues,
        loading: false,
        mustLoad: false,
        error: null
      }
    case 'SET_ISSUES_LOADING':
      return {
        ...state,
        loading: true,
        mustLoad: false,
        error: null
      }
    case 'SET_ISSUES_ERROR':
      return {
        ...state,
        list: [],
        loading: false,
        mustLoad: false,
        error: action.error
      }
    case 'TOGGLE_ISSUE':
      return {
        ...state,
        list: state.list.map(issue => {
          if (issue.id == action.issueId) {
            return {...issue, selected: !issue.selected}
          }
          return issue
        })
      }
    case 'SET_ISSUES_SELECTNESS':
      return {
        ...state,
        list: state.list.map(issue => {
          if (action.issuesId.indexOf(issue.id) > -1) {
            return {...issue, selected: action.isSelected}
          }
          return issue
        })
      }
    case 'TOGGLE_EXPANDED':
      return {
        ...state,
        list: state.list.map(issue => {
          if (issue.id == action.issueId) {
            return {...issue, expanded: !issue.expanded}
          }
          return issue
        })

      }
    default:
      return state
  }
}

const emptyTimeline = {
  list: [],
  loading: false,
  mustLoad: true,
  error: null
}


const timeline = (state=emptyTimeline, action) => {
  switch (action.type) {
    case 'SET_TIMELINE':
      return {
        ...state,
        list: action.timeline,
        loading: false,
        mustLoad: false,
        error: null
      }
    case 'SET_TIMELINE_LOADING':
      return {
        ...state,
        loading: true,
        mustLoad: false,
        error: null
      }
    case 'SET_TIMELINE_ERROR':
      return {
        ...state,
        list: [],
        loading: false,
        mustLoad: false,
        error: action.error
      }
    default:
      return state
  }
}

const users = (state=[], action) => state
const user = (state=[], action) => state

const reducer = combineReducers({
  labels,
  search,
  issues,
  timeline,
  users,
  user,
})

export default reducer
