import React from 'react'
import { graphql } from 'react-relay'
import Link from 'next/link'
import Layout from '../components/Layout'
import withData from '../util/withData'

class IndexPage extends React.Component {

  render() {
    const { currentUser, activeCourses, pastCourses } = this.props // XXX merge conflict
    const { user, courses } = this.props                           // XXX merge conflict
    const my_courses_ids = user ? user.attended_course_ids.concat(user.coached_course_ids) : []
    const active_courses_ids = new Set(courses.active.map(c => c.id))
    const my_active_courses_ids = new Set(my_courses_ids.filter(cid => active_courses_ids.has(cid)))
    return (
      <Layout currentUser={currentUser} width={600}>

        { my_active_courses_ids.size > 0 && (
          <>
            <h2>Moje kurzy</h2>

            {courses.active.filter(c => my_active_courses_ids.has(c.id)).map(course => (
              <p key={course.id} className='course'>
                <Link href={{ pathname: '/course', query: { course: course.id }}} prefetch><a>
                  <strong dangerouslySetInnerHTML={{__html: course.title_html}} />
                  {' – '}
                  <span dangerouslySetInnerHTML={{__html: course.subtitle_html}} />
                </a></Link>
              </p>
            ))}
          </>
        )}
        <h2>Aktuálně běžící kurzy</h2>

        {activeCourses.edges.map(edge => edge.node).map(course => (
          <p key={course.courseId} className='course'>
            <Link href={{ pathname: '/course', query: { course: course.courseId }}} prefetch><a>
              <strong dangerouslySetInnerHTML={{ __html: course.titleHTML }} />
              {' – '}
              <span dangerouslySetInnerHTML={{__html: course.subtitleHTML }} />
            </a></Link>
          </p>
        ))}

        <h2>Proběhlé kurzy</h2>

        {pastCourses.edges.map(edge => edge.node).map(course => (
          <p key={course.courseId} className='course'>
            <Link href={{ pathname: '/course', query: { course: course.courseId }}} prefetch><a>
              <strong dangerouslySetInnerHTML={{ __html: course.titleHTML }} />
              {' – '}
              <span dangerouslySetInnerHTML={{ __html: course.subtitleHTML }} />
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

export default withData(IndexPage, {
  query: graphql`
    query pages_indexQuery {
      currentUser {
        ...Layout_currentUser
      }
      activeCourses {
        edges {
          node {
            id
            courseId
            titleHTML
            subtitleHTML
          }
        }
      }
      pastCourses {
        edges {
          node {
            id
            courseId
            titleHTML
            subtitleHTML
          }
        }
      }
    }
  `
})
