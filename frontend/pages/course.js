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
      <Layout user={this.props.user} width={1000}>

        <div className='overview'>

          <h1 className='course-title'>
            <strong dangerouslySetInnerHTML={{__html: course['title_html']}} />
            {course['subtitle_html'] && (
              <div dangerouslySetInnerHTML={{__html: course['subtitle_html']}} />
            )}
          </h1>

          <div
            className='course-description'
            dangerouslySetInnerHTML={{__html: course['description_html']}}
          />

        </div>

        <div className='lessons'>

          {course['lessons'].map(lesson => (
            <div key={lesson['slug']} className='lesson'>

              <h2 className='lesson-title'>
                <span dangerouslySetInnerHTML={{__html: lesson['title_html']}} />
              </h2>
              <div className='lessonDate'>{formatDate(lesson['date'])}</div>

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

        </div>

        <style jsx>{`
          h1 {
            color: #634;
            text-align: center;
            margin: 1.5rem 0;
            font-size: 30px;
            font-weight: 300;
          }
          @media (max-width: 600px) {
            h1 {
              font-size: 22px;
            }
            .course-description {
              font-size: 14px;
            }
          }
          h1 strong {
            font-weight: 800;
          }
          .overview {
            max-width: 800px;
            margin: 2rem auto 3rem auto;
            padding: 0 16px;
          }
          .overview .course-description {
            max-width: 550px;
            margin: 0 auto;
          }
          .lessons {
            max-width: 1100px;
            margin: 2rem auto;
            padding: 0 16px;
          }
          @media (min-width: 700px) {
            .lessons {
              columns: 2;
            }
          }
          .lesson {
            margin-bottom: 3rem;
            break-inside: avoid-column;
          }
          @media (min-width: 600px) {
            .lesson :global(li) {
              font-size: 16px;
              line-height: 23px;
            }
          }
          .lesson .lesson-title {
            margin-bottom: 5px;
            xcolor: #503;
            color: #789;
            font-weight: 400;
            font-size: 24px;
          }
          @media (max-width: 600px) {
            .lesson .lesson-title {
              font-size: 21px;
            }
          }
          .lesson .lessonDate {
            white-space: nowrap;
            font-size: 14px;
            font-weight: 400;
            color: #666;
          }
        `}</style>

      </Layout>
    )
  }
}
