import React from 'react'
import Layout from '../components/Layout'
import withData from '../util/withData'

class ProfilePage extends React.Component {

  render() {
    const { currentUser } = this.props
    const attendedCourseIds = []
    const coachedCourseIds = []
    return (
      <Layout currentUser={currentUser}>

        <h1>Tvůj profil</h1>

        <p>Jméno: {currentUser.name}</p>
        <p>E-mail: {currentUser.email}</p>
        <p>id: <code>{currentUser.userId}</code></p>

        {attendedCourseIds.length > 0 && (
          <>
            <p>Navštěvované kurzy:</p>
            <ul>
              {attendedCourseIds.map(course_id => (
                <li key={course_id}>
                  {course_id}
                </li>
              ))}
            </ul>
          </>
        )}

        {coachedCourseIds.length > 0 && (
          <>
            <p>Koučované kurzy:</p>
            <ul>
              {coachedCourseIds.map(course_id => (
                <li key={course_id}>
                  {course_id}
                </li>
              ))}
            </ul>
          </>
        )}

        {currentUser.isAdmin && (
          <p>Admin</p>
        )}

        <pre className='debug' style={{ display: 'none' }}>{JSON.stringify(currentUser, null, 2)}</pre>

      </Layout>
    )
  }
}

export default withData(ProfilePage, {
  query: graphql`
    query profileQuery {
      currentUser {
        ...Layout_currentUser
        name
        email
        userId
      }
    }
  `
})
