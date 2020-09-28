import React from 'react'

export default function LoadingMessage ({ active }) {
  if (!active) return null
  return (<p><em>Loading</em></p>)
}
