import Link from 'next/link'

export default ({ user }) => (
  <nav style={{ borderBottom: '1px solid #333' }}>
    <p style={{ float: 'left' }}>
      <Link href='/' prefetch><a>Pyladies courseware</a></Link>
    </p>
    <p style={{ float: 'right' }}>
      {!user ? (
        <Link href='/login'><a>Přihlásit se</a></Link>
      ) : (
        <code>{JSON.stringify(user)}</code>
      )}
    </p>
    <div style={{ clear: 'both' }} />
  </nav>
)
