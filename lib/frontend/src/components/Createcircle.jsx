import './Createcircle.sass'

import React from 'react'

import { block, connect } from '../utils'
import { createCircle } from '../actions/circle'
import Loading from './Loading'
import MarkdownEditor from './MarkdownEditor'

const b = block('Createcircle')

function Createcircle({ loading, onSubmit, circles }) {
  return (
    <article className={b()}>
      {loading && <Loading />}
      <h2>Create a new circle :</h2>
      <form
        onSubmit={e => {
          e.preventDefault()
          onSubmit(e)
        }}
      >
        <label>
          Name :
          <input name="circle_name" required />
        </label>
        <br />
        <label>
          Parent :
          <select name="parent_circle_id" defaultValue="">
            {circles
              .filter(circle => circle.parent_circle_id === null)
              .map(circle => (
                <option key={circle.circle_id} value={circle.circle_id}>
                  {circle.circle_name}
                </option>
              ))}
            <option value="">Aucun</option>
          </select>
        </label>
        <br />
        <label>
          Purpose :
          <input name="circle_purpose" required />
        </label>
        <br />
        <label>
          Domain :
          <input name="circle_domain" required />
        </label>
        <br />
        <label>
          Accountabilities :
          <MarkdownEditor />
        </label>
        <br />
        <input type="submit" value="Create circle" />
      </form>
    </article>
  )
}
export default connect(
  state => ({
    circles: state.circles.results,
    loading: state.circles.loading,
    error: state.circles.errors,
  }),
  dispatch => ({
    onSubmit: e => {
      const formCircle = [].slice
        .call(e.target.elements)
        .reduce(function(map, obj) {
          if (obj.name === 'body') {
            map.circle_accountabilities = obj.value
          } else if (obj.name && obj.value) {
            map[obj.name] = obj.value
          }

          return map
        }, {})
      dispatch(createCircle(formCircle))
    },
  })
)(Createcircle)
