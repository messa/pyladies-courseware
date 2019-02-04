import React from 'react'
import { graphql } from 'react-relay'
import Link from 'next/link'
import Layout from '../components/Layout'
import withData from '../util/withData'

class IndexPage extends React.Component {

  render() {
    const { user, courses } = this.props
    return (
      <Layout user={user} width={600}>

        <h2>Aktuálně běžící kurzy</h2>

        {courses.active.map(course => (
          <p key={course.id} className='course'>
            <Link href={{ pathname: '/course', query: { course: course.id }}} prefetch><a>
              <strong dangerouslySetInnerHTML={{__html: course.title_html}} />
              {' – '}
              <span dangerouslySetInnerHTML={{__html: course.subtitle_html}} />
            </a></Link>
          </p>
        ))}

        <h2>Proběhlé kurzy</h2>

        {courses.past.map(course => (
          <p key={course.id} className='course'>
            <Link href={{ pathname: '/course', query: { course: course.id }}} prefetch><a>
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

export default withData(IndexPage, {
  query: graphql`
    query pages_indexQuery {
      courses {
        edges {
          node {
            id
          }
        }
      }
      user {
        id
      }
    }
  `
})
