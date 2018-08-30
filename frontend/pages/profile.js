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

        <h1>Tvůj profil</h1>

        <p>Jméno: {user.name}</p>
        <p>id: <code>{user.id}</code></p>

        {user.attended_course_ids.length > 0 && (
          <>
            <p>Navštěvované kurzy:</p>
            <ul>
              {user.attended_course_ids.map(course_id => (
                <li key={course_id}>
                  {course_id}
                </li>
              ))}
            </ul>
          </>
        )}

        {user.coached_course_ids.length > 0 && (
          <>
            <p>Koučované kurzy:</p>
            <ul>
              {user.coached_course_ids.map(course_id => (
                <li key={course_id}>
                  {course_id}
                </li>
              ))}
            </ul>
          </>
        )}

        {user.is_admin && (
          <p>Admin</p>
        )}

        <pre className='debug' style={{ display: 'none' }}>{JSON.stringify(user, null, 2)}</pre>

      </Layout>
    )
  }
}
