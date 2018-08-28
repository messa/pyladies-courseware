import React from 'react'
import Link from 'next/link'

export default class extends React.Component {
  render() {
    const { href, prefetch, children, ...rest } = this.props
    return (
      <Link href={href} prefetch={true}><a {...rest}>{children}</a></Link>
    )
  }
}
