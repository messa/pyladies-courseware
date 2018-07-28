import React from 'react'
import Link from 'next/link'

export default class extends React.Component {
  render() {
    const { href, children, ...rest } = this.props
    return (
      <Link href={href}><a {...rest}>{children}</a></Link>
    )
  }
}
