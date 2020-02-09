import React from 'react'
import Link from 'next/link'
import Layout from '../components/Layout'
import fetchPageData from '../util/fetchPageData'

export default class extends React.Component {

  static async getInitialProps({ req }) {
    return await fetchPageData(req, { courses: 'list_courses' })
  }

  render() {
    const { user, courses } = this.props
    const my_courses_ids = user ? user.attended_course_ids.concat(user.coached_course_ids) : []
    const active_courses_ids = new Set(courses.active.map(c => c.id))
    const my_active_courses_ids = new Set(my_courses_ids.filter(cid => active_courses_ids.has(cid)))
    return (
      <Layout user={user} width={600}>

        { my_active_courses_ids.size > 0 && (
          <>
            <h2>Moje kurzy</h2>

            {courses.active.filter(c => my_active_courses_ids.has(c.id)).map(course => (
              <p key={course.id} className='course'>
                <Link href={{ pathname: '/course', query: { course: course.id }}}><a>
                  <strong dangerouslySetInnerHTML={{__html: course.title_html}} />
                  {' – '}
                  <span dangerouslySetInnerHTML={{__html: course.subtitle_html}} />
                </a></Link>
              </p>
            ))}
          </>
        )}
        <h2>Aktuálně běžící kurzy</h2>

        {courses.active.map(course => (
          <p key={course.id} className='course'>
            <Link href={{ pathname: '/course', query: { course: course.id }}}><a>
              <strong dangerouslySetInnerHTML={{__html: course.title_html}} />
              {' – '}
              <span dangerouslySetInnerHTML={{__html: course.subtitle_html}} />
            </a></Link>
          </p>
        ))}

        <h2>Proběhlé kurzy</h2>

        {courses.past.map(course => (
          <p key={course.id} className='course'>
            <Link href={{ pathname: '/course', query: { course: course.id }}}><a>
              <strong dangerouslySetInnerHTML={{__html: course.title_html}} />
              {' – '}
              <span dangerouslySetInnerHTML={{__html: course.subtitle_html}} />
            </a></Link>
          </p>
        ))}

        <style jsx>{`
          p.course {
            margin: 1.5rem 0;
            font-size: 18px;
          }
          .course a {
            font-weight: 300;
          }
        `}</style>

      </Layout>
    )
  }
}
