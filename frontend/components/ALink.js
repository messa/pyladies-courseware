import Link from 'next/link'

export default ({ href, children, ...props }) => (
  <Link href={href}><a {...props}>{children}</a></Link>
)
