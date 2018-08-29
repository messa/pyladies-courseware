import React from 'react'
import Link from 'next/link'
import { Button } from 'semantic-ui-react'
import Layout from '../components/Layout'
import fetchPageData from '../util/fetchPageData'
import ALink from '../components/ALink'
import LessonItems from '../components/LessonItems'
import formatDate from '../util/formatDate'
import HomeworkSubmission from '../components/HomeworkSubmission'
import TaskReviewLessonSummary from '../components/TaskReviewLessonSummary'

const HomeworkTask = ({ hwItem, userCanSubmitHomework, courseId, lessonSlug }) => (
  <div className='homework-task'>
    <div className='number'>{hwItem['number']}.</div>
    <div className='homework-body' dangerouslySetInnerHTML={{__html: hwItem['text_html'] }} />
    {userCanSubmitHomework && (
      <HomeworkSubmission
        courseId={courseId}
        lessonSlug={lessonSlug}
        taskId={hwItem.id}
      />
    )}
    <style jsx>{`
      .homework-task {
        margin: 2rem 0;
        padding-left: 1.8rem;
        position: relative;
      }
      .homework-task .number {
        position: absolute;
        left: 0;
        font-weight: 600;
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
        margin: 2rem 0;
        color: #038;
        font-weight: 600;
      }
    `}</style>
  </div>)

function arrayContains(array, item) {
  return array && array.indexOf(item) !== -1
}

export default class extends React.Component {

  static async getInitialProps({ req, query }) {
    const courseId = query.course
    const lessonSlug = query.lesson
    const data = await fetchPageData(req, {
      lesson: { 'lesson_detail': { 'course_id': courseId, 'lesson_slug': lessonSlug } },
    })
    return {
      courseId,
      ...data
    }
  }

  render() {
    const { user, courseId, lesson } = this.props
    const userCanSubmitHomeworks = user && (user['is_admin'] || arrayContains(user['attended_course_ids'], courseId))
    const userCanReviewHomeworks = user && (user['is_admin'] || arrayContains(user['coached_course_ids'], courseId))
    const lessonSlug = lesson.slug
    const { course } = lesson
    const tasks = lesson['homework_items'].filter(x => x.homework_item_type === 'task')
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
          <small style={{ fontWeight: 300, color: '#c39', whiteSpace: 'nowrap' }}>
            {formatDate(lesson['date'])}
          </small>
        </h1>

        <h2>Materiály</h2>

        <LessonItems lessonItems={lesson['lesson_items']} />

        {userCanReviewHomeworks && (
          <>
            <h2>Odevzdané úkoly</h2>
            <TaskReviewLessonSummary
              courseId={courseId}
              lessonSlug={lessonSlug}
              tasks={tasks}
            />
          </>
        )}

        <h2>Domácí projekty</h2>

        {lesson['homework_items'].map((hwItem, i) => {
          switch (hwItem.homework_item_type) {
            case 'task': return (
              <HomeworkTask
                key={i}
                hwItem={hwItem}
                userCanSubmitHomework={userCanSubmitHomeworks}
                courseId={courseId}
                lessonSlug={lessonSlug}
              />
            )
            case 'section': return (
              <HomeworkSection
                key={i}
                hwItem={hwItem}
              />
            )
            default: return (
              <pre key={i} className='debug'>
                {JSON.stringify({ hwItem }, null, 2)}
              </pre>
            )
          }
        })}

      </Layout>
    )
  }
}
