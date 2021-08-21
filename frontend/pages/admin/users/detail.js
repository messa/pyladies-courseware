import React from 'react'
import AdminLayout from '../../../components/admin/AdminLayout'
import UserDetail from '../../../components/admin/UserDetail'
import withData from '../../../util/withData'

class UserDetailPage extends React.Component {

  render() {
    const { currentUser, detailUser, allCourses } = this.props
    return (
      <AdminLayout currentUser={currentUser}>

        <h1>Uživatel: <code>{detailUser.userId}</code></h1>

        <UserDetail detailUser={detailUser} allCourses={allCourses} />

      </AdminLayout>
    )
  }
}

export default withData(UserDetailPage, {
  variables: ({ query }) => ({ detailUserId: query.userId }),
  query: graphql`
    query detailQuery($detailUserId: String) {
      currentUser {
        ...AdminLayout_currentUser
      }
      detailUser: user(userId: $detailUserId) {
        ...UserDetail_detailUser
        userId
      }
      allCourses {
        ...UserDetail_allCourses
      }
    }
  `
})
