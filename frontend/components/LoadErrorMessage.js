import React from 'react'
import { Message } from 'semantic-ui-react'

export default function LoadErrorMessage ({ active, message }) {
  if (!active) return null
  return (
    <Message
      negative
      header='Load failed'
      content={message}
    />
  )
}
