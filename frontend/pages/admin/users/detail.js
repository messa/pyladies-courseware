import React from 'react'
import Link from 'next/link'
import { Button } from 'semantic-ui-react'
import AdminLayout from '../../../components/admin/AdminLayout'
import UserDetail from '../../../components/admin/UserDetail'
import fetchPageData from '../../../util/fetchPageData'

export default class extends React.Component {

  static async getInitialProps({ req, query }) {
    const { userId } = query
    const data = await fetchPageData(req, {})
    return { detailUserId: userId, ...data }
  }

  render() {
    const { user, detailUserId } = this.props
    return (
      <AdminLayout user={user}>

        <h1>Uživatel: <code>{detailUserId}</code></h1>

        <UserDetail detailUserId={detailUserId} />

      </AdminLayout>
    )
  }
}
