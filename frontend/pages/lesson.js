import React from 'react'
import Link from 'next/link'
import { Button } from 'semantic-ui-react'
import Layout from '../components/Layout'
import fetchPageData from '../util/fetchPageData'
import ALink from '../components/ALink'
import LessonItems from '../components/LessonItems'
import formatDate from '../util/formatDate'

const HomeworkTask = ({ hwItem }) => (
  <div className='homework-task'>
    <div className='homework-body' dangerouslySetInnerHTML={{__html: hwItem['text_html'] }} />
    <style jsx>{`
      .homework-task {
        margin: 1rem 0;
      }
      .homework-body :global(pre),
      .homework-body :global(code) {
        font-family: monospace;
        font-size: 14px;
        color: #360;
      }
      .homework-body :global(table) {
        border-collapse: collapse;
        margin: 1rem 0;
      }
      .homework-body :global(th),
      .homework-body :global(td) {
        border: 1px solid #ccc;
        padding: 1px .5em;
        text-align: center;
      }
    `}</style>
  </div>
)

const HomeworkSection = ({ hwItem }) => (
  <div className='homework-section'>
    <div dangerouslySetInnerHTML={{__html: hwItem['text_html'] }} />
    <style jsx>{`
      .homework-section {
        margin: 1rem 0;
      }
    `}</style>
  </div>)

export default class extends React.Component {

  static async getInitialProps({ req, query }) {
    const courseId = query.course
    const lessonSlug = query.lesson
    return await fetchPageData(req, {
      lesson: { 'lesson_detail': { 'course_id': courseId, 'lesson_slug': lessonSlug } },
    })
  }

  render() {
    const { user, lesson } = this.props
    const { course } = lesson
    return (
      <Layout user={user}>

        <div style={{ marginTop: '1rem' }}>
          <Button
            as={ALink}
            href={{ pathname: '/course', query: { course: course.id }}}
            basic
            color='pink'
            content={(
              <span>
                {'Kurz: '}
                <strong dangerouslySetInnerHTML={{ __html: course['title_html'] }} />
              </span>
            )}
            size='small'
            icon='arrow left'
          />
        </div>

        <h1 style={{ marginTop: '1rem' }}>
          <span dangerouslySetInnerHTML={{__html: lesson['title_html']}} />
          {' '}&nbsp;
          <small style={{ fontWeight: 300, color: '#c39' }}>
            {formatDate(lesson['date'])}
          </small>
        </h1>

        <h2>Materiály</h2>

        <LessonItems lessonItems={lesson['lesson_items']} />

        <h2>Domácí projekty</h2>

        {lesson['homework_items'].map(hwItem => {
          switch (hwItem.homework_item_type) {
            case 'task': return <HomeworkTask hwItem={hwItem} />
            case 'section': return <HomeworkSection hwItem={hwItem} />
            default: <pre className='debug'>{JSON.stringify({ hwItem }, null, 2)}</pre>
          }
        })}

        <pre className='debug'>{JSON.stringify({ lesson }, null, 2)}</pre>

      </Layout>
    )
  }
}
