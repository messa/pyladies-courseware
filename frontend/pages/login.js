import React from 'react'
import Link from 'next/link'
import { Button, Tab } from 'semantic-ui-react'
import Layout from '../components/Layout'
import fetchPageData from '../util/fetchPageData'
import LoginForm from '../components/LoginForm'
import RegistrationForm from '../components/RegistrationForm'

export default class extends React.Component {

  static async getInitialProps({ req }) {
    return await fetchPageData(req, { loginMethods: 'login_methods' })
  }

  render() {
    const { user } = this.props
    const { facebook, google, dev } = this.props.loginMethods
    const panes = [
      {
        menuItem: 'Přihlášení',
        pane: {
          key: 'login',
          content: <div style={{ padding: 16 }}><LoginForm /></div>,
        }
      }, {
        menuItem: 'Registrace',
        pane: {
          key: 'registration',
          content: <div style={{ padding: 16 }}><RegistrationForm /></div>,
        }
      }
    ]
    return (
      <Layout user={user}>
        <h1>Přihlášení</h1>

        <div className='loginButtons'>
          {facebook && (
            <Button
              as='a'
              href={facebook.url}
              content='Přihlásit se přes Facebook'
              color='facebook'
              icon='facebook'
              size='small'
            />
          )}
          {google && (
            <Button
              as='a'
              href={google.url}
              content='Přihlásit se přes Google'
              color='google plus'
              icon='google'
              size='small'
            />
          )}

        </div>

        {dev && (
          <div className='loginButtons'>
            <Button
              as='a'
              href={dev.student_url}
              content={<>Přihlásit se jako <b>student</b></>}
              icon='sign in'
              size='small'
            />
            <Button
              as='a'
              href={dev.coach_url}
              content={<>Přihlásit se jako <b>kouč</b></>}
              icon='sign in'
              size='small'
            />
            <Button
              as='a'
              href={dev.admin_url}
              content={<>Přihlásit se jako <b>admin</b></>}
              icon='sign in'
              size='small'
            />
          </div>
        )}

        <h2>Přihlásit se jménem a heslem</h2>

        <Tab panes={panes} renderActiveOnly={false} />

        <style jsx>{`
          .loginButtons :global(a) {
            margin-bottom: 1rem;
            margin-right: 1em;
          }
          .loginButtons :global(a b) {
            color: black;
          }
        `}</style>

      </Layout>
    )
  }

}
