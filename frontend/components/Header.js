import Link from 'next/link'

export default () => (
  <nav>
    <p style={{ textAlign: 'right' }}>
      <Link href='/login'><a>Přihlásit se</a></Link>
    </p>
  </nav>
)
