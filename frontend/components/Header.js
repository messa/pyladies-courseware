import Link from 'next/link'
import { Button } from 'semantic-ui-react'

export default ({ user }) => (
  <nav style={{ borderBottom: '1px solid #333' }}>
    <p style={{ float: 'left' }}>
      <Link href='/' prefetch><a>Pyladies courseware</a></Link>
    </p>
    <p style={{ float: 'right' }}>
      {!user ? (
        <Link href='/login'><a>Přihlásit se</a></Link>
      ) : (
        <span className='loggedInUser'>
          <Link href={'/profile'}><a>{user.name}</a></Link>
          <Button
            as='a'
            href='/auth/logout'
            basic
            color='black'
            icon='sign out'
            content='Odhlásit'
            size='small'
            style={{ marginLeft: 12 }}
          />
        </span>
      )}
    </p>
    <div style={{ clear: 'both' }} />
  </nav>
)
