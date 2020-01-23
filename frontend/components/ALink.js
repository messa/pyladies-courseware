import React from 'react'
import Link from 'next/link'

class ALink extends React.Component {
  render() {
    const { href, children, ...rest } = this.props
    return (
      <Link href={href}><a {...rest}>{children}</a></Link>
    )
  }
}

export default ALink
