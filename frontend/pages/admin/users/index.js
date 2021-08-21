import React from 'react'
import AdminLayout from '../../../components/admin/AdminLayout'
import UserList from '../../../components/admin/UserList'
import withData from '../../../util/withData'

class UserListPage extends React.Component {

  render() {
    const { currentUser } = this.props
    return (
      <AdminLayout currentUser={currentUser} width={1000}>

        <h1>Přehled uživatelů</h1>

        <UserList />

      </AdminLayout>
    )
  }
}

export default withData(UserListPage, {
  query: graphql`
    query users_indexQuery {
      currentUser {
        ...AdminLayout_currentUser
      }
    }
  `
})
