import React from 'react'
import Link from 'next/link'
import { Button, Menu, Input } from 'semantic-ui-react'
import ALink from './ALink'


export default class Header extends React.Component {

  render() {
    const { user } = this.props
    return (
      <div className='Header'>
        <Menu secondary>
          <Menu.Item>
            <div className='siteTitle'>
              <Link href='/'><a>
                <span className='pyladiesLogo'>
                  <img src='https://pyladies.cz/static/img/pyladies.png' alt='Pyladies' />
                </span>
                Courseware
              </a></Link>
            </div>
          </Menu.Item>

          <Menu.Menu position='right'>

            <Menu.Item
              link
              content='Pyladies.cz'
              href='https://pyladies.cz/'
              icon='external'
            />

            {/*
            <Menu.Item>
              <Input icon='search' placeholder='Search...' />
            </Menu.Item>
            */}

            {/*
            <Menu.Item>
              Aktivita
            </Menu.Item>
            */}

            {/*
            <Menu.Item>
              Profil
            </Menu.Item>
            */}

            {!user ? (
              <Menu.Item
                as={ALink}
                content='Přihlásit se'
                href='/login'
                icon='sign in'
              />

            ) : (
              <Menu.Item
                link
                content='Odhlásit se'
                href='/auth/logout'
                icon='sign out'
              />
            )}
          </Menu.Menu>
        </Menu>
        <style jsx global>{`
          .Header {
            border-bottom: 3px solid #e51f40;
          }
          .siteTitle {
            margin-top: 8px;
          }
          .siteTitle, .siteTitle a {
            font-weight: 600;
            text-transform: uppercase;
            font-size: 11px;
            color: #000;
            text-decoration: none;
          }
          span.pyladiesLogo {
            width: calc(1499px * 0.05) !important;
            position: relative;
            margin-right: 0.5em;
            display: inline-block;
          }
          span.pyladiesLogo img {
            position: absolute;
            top: -21px;
            width: calc(1499px * 0.05) !important;
            height: calc(638px * 0.05) !important;
          }
        `}</style>
      </div>
    )
  }

}

/*
export default ({ user }) => (
  <nav style={{ borderBottom: '1px solid #333' }}>
    <p style={{ float: 'left' }}>
      <Link href='/' prefetch><a>Pyladies courseware</a></Link>
    </p>
    <p style={{ float: 'right' }}>
      {!user ? (
        <Link href='/login' prefetch><a>Přihlásit se</a></Link>
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
*/
