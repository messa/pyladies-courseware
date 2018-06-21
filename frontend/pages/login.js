import React from 'react'
import Link from 'next/link'
import { Button } from 'semantic-ui-react'
import Layout from '../components/Layout'
import { fetchBackendJSON } from '../util/fetchBackend'
import DevLoginForm from '../components/DevLoginForm'

export default class extends React.Component {

  static async getInitialProps({ req }) {
    const loginCapabilities = await fetchBackendJSON(req, 'login-capabilities')
    return { loginCapabilities }
  }

  render() {
    const { loginCapabilities } = this.props
    const { facebook, dev } = this.props.loginCapabilities
    return (
      <Layout>
        <h1>Přihlášení</h1>

        {facebook && (
          <Button
            as='a'
            href={facebook.endpoint}
            content='Přihlásit se přes Facebook'
            color='facebook'
            icon='facebook'
            size='small'
          />
        )}

        {dev && (
          <>
            <h2>Dev login</h2>
            <DevLoginForm />
          </>
        )}

      </Layout>
    )
  }

}
