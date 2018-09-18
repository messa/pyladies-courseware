import React from 'react'
import Link from 'next/link'
import { Button } from 'semantic-ui-react'
import AdminLayout from '../../../components/admin/AdminLayout'
import UserList from '../../../components/admin/UserList'
import fetchPageData from '../../../util/fetchPageData'

export default class extends React.Component {

  static async getInitialProps({ req }) {
    return await fetchPageData(req, {})
  }

  render() {
    const { userDetail } = this.props
    return (
      <AdminLayout user={this.props.user} width={1000}>

        <h1>Přehled uživatelů</h1>

        <UserList />

      </AdminLayout>
    )
  }
}
