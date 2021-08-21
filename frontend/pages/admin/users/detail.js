import React from 'react'
import Link from 'next/link'
import { Button } from 'semantic-ui-react'
import AdminLayout from '../../../components/admin/AdminLayout'
import UserDetail from '../../../components/admin/UserDetail'
import withData from '../../../util/withData'

class UserDetailPage extends React.Component {

  // static async getInitialProps({ req, query }) {
  //   const { userId } = query
  //   const data = await fetchPageData(req, {})
  //   return { detailUserId: userId, ...data }
  // }

  render() {
    //const { user, detailUserId } = this.props
    const { currentUser } = this.props
    const detailUserId = null
    return (
      <AdminLayout currentUser={currentUser}>

        <h1>Uživatel: <code>{detailUserId}</code></h1>

        <UserDetail detailUserId={detailUserId} />

      </AdminLayout>
    )
  }
}

export default withData(UserDetailPage, {
  query: graphql`
    query detailQuery {
      currentUser {
        ...AdminLayout_currentUser
      }
    }
  `
})
