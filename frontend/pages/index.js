import React from 'react'
import { graphql } from 'react-relay'
import Link from 'next/link'
import Layout from '../components/Layout'
import withData from '../util/withData'

class IndexPage extends React.Component {

  render() {
    const { user, activeCourses, pastCourses } = this.props
    return (
      <Layout user={user} width={600}>

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
