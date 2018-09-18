import React from 'react'

export default ({ active }) => {
  if (!active) return null
  return (<p><em>Loading</em></p>)
}
