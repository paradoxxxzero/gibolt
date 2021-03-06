import './Search.sass'

import block from 'bemboo'
import React from 'react'

import { search } from '../actions'
import { fetchIssues } from '../actions/issues'
import { connect } from '../utils'

const b = block('Search')

function Search({ keywords, onSearchChange }) {
  return (
    <div className={b}>
      <input
        type="text"
        className={b.e('input')}
        value={keywords}
        onChange={e => onSearchChange(e.target.value)}
      />
    </div>
  )
}

export default connect(
  state => ({ keywords: state.search }),
  dispatch => ({
    onSearchChange: value => {
      dispatch(search(value))
      dispatch(fetchIssues())
    },
  })
)(Search)
