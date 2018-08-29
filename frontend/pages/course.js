import React from 'react'
import Link from 'next/link'
import { Button } from 'semantic-ui-react'
import Layout from '../components/Layout'
import fetchPageData from '../util/fetchPageData'
import ALink from '../components/ALink'
import LessonItems from '../components/LessonItems'
import formatDate from '../util/formatDate'

export default class extends React.Component {

  static async getInitialProps({ req, query }) {
    const courseId = query.course
    return await fetchPageData(req, {
      course: { 'course_detail': { 'course_id': courseId } },
    })
  }

  render() {
    const { course } = this.props
    return (
      <Layout user={this.props.user}>

        <h1 style={{ fontWeight: 400 }}>
          <strong dangerouslySetInnerHTML={{__html: course['title_html']}} />
          {course['subtitle_html'] && (
            <div dangerouslySetInnerHTML={{__html: course['subtitle_html']}} />
          )}
        </h1>

        <div
          className='course-description'
          dangerouslySetInnerHTML={{__html: course['description_html']}}
        />

        {course['lessons'].map(lesson => (
          <div key={lesson['slug']} className='lesson'>

            <h2 style={{ marginTop: '1rem' }}>
              <span dangerouslySetInnerHTML={{__html: lesson['title_html']}} />
              {' '}&nbsp;
              <small style={{ fontWeight: 300, color: '#c39', whiteSpace: 'nowrap' }}>
                {formatDate(lesson['date'])}
              </small>
            </h2>

            <LessonItems lessonItems={lesson['lesson_items']} />

            {lesson['has_homeworks'] && (
              <div>
                <Button
                  as={ALink}
                  href={{
                    pathname: '/lesson',
                    query: { course: course.id, lesson: lesson['slug'] }
                  }}
                  basic
                  color='blue'
                  content='Domácí projekty'
                  size='small'
                  icon='home'
                />
              </div>
            )}

          </div>
        ))}

      </Layout>
    )
  }
}
