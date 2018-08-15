import React from 'react'
import Link from 'next/link'
import { Button } from 'semantic-ui-react'
import Layout from '../components/Layout'
import fetchPageData from '../util/fetchPageData'

export default class ProfilePage extends React.Component {

  static async getInitialProps({ req }) {
    return await fetchPageData(req, {})
  }

  render() {
    const { user } = this.props
    return (
      <Layout user={user}>

        <pre>{JSON.stringify(user, null, 2)}</pre>

      </Layout>
    )
  }
}
