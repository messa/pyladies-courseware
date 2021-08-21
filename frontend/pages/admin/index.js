import React from 'react'
import Link from 'next/link'
import { Button } from 'semantic-ui-react'
import AdminLayout from '../../components/admin/AdminLayout'
import AdminNavigation from '../../components/admin/AdminNavigation'
import withData from '../../util/withData'

class AdminIndexPage extends React.Component {

  render() {
    const { currentUser } = this.props
    return (
      <AdminLayout currentUser={currentUser} width={600}>
        <h1>Administrace</h1>
        <AdminNavigation />
      </AdminLayout>
    )
  }
}

export default withData(AdminIndexPage, {
  query: graphql`
    query admin_indexQuery {
      currentUser {
        ...AdminLayout_currentUser
      }
    }
  `
})
