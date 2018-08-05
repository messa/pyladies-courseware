import React from 'react'
import Link from 'next/link'
import { Button } from 'semantic-ui-react'
import Layout from '../../components/Layout'
import fetchPageData from '../../util/fetchPageData'
import UserTable from '../../components/admin/UserTable'

export default class extends React.Component {

  static async getInitialProps({ req }) {
    return await fetchPageData(req, {})
  }

  render() {
    const { userDetail } = this.props
    return (
      <Layout user={this.props.user}>

        <h1>Administrace &ndash; Přehled uživatelů</h1>

        <UserTable />

      </Layout>
    )
  }
}
