import React from 'react'
import Link from 'next/link'
import { Button } from 'semantic-ui-react'
import AdminLayout from '../../components/admin/AdminLayout'
import AdminNavigation from '../../components/admin/AdminNavigation'
import fetchPageData from '../../util/fetchPageData'

export default class extends React.Component {

  static async getInitialProps({ req }) {
    return await fetchPageData(req, {})
  }

  render() {
    const { userDetail } = this.props
    return (
      <AdminLayout user={this.props.user} width={600}>
        <h1>Administrace</h1>
        <AdminNavigation />
      </AdminLayout>
    )
  }
}
