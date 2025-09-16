import React from 'react'
import { Message } from 'semantic-ui-react'

export default ({ active, title, message }) => {
  if (!active) return null
  return (
    <Message
      negative
      header={title || 'Load failed'}
      content={message}
    />
  )
}
