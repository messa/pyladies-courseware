import React from 'react'
import Link from 'next/link'
import { Button, Grid } from 'semantic-ui-react'
import Layout from '../components/Layout'
import fetchPageData from '../util/fetchPageData'
import ALink from '../components/ALink'
import LessonItems from '../components/LessonItems'
import formatDate from '../util/formatDate'
import HomeworkSubmission from '../components/HomeworkSubmission'
import TaskReviewLessonSummary from '../components/TaskReviewLessonSummary'
import CourseOverview from '../components/lesson/CourseOverview'
import TaskReview from '../components/lesson/TaskReview'

const HomeworkTask = ({ hwItem, userCanSubmitHomework, courseId, lessonSlug, reviewUserId }) => (
  <div className='homework-task'>
    <div className='number'>{hwItem['number']}.</div>
    <div className='homework-body'>
      {hwItem.mandatory && (
        <div className='mandatory-sign'>☜</div>
      )}
      <span dangerouslySetInnerHTML={{__html: hwItem['text_html'] }} />
    </div>
    {reviewUserId && (
      <TaskReview
        courseId={courseId}
        lessonSlug={lessonSlug}
        taskId={hwItem.id}
        reviewUserId={reviewUserId}
      />
    )}
    {!reviewUserId && userCanSubmitHomework && hwItem.submit && (
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
      .homework-task .mandatory-sign {
        position: absolute;
        right: 0;
        margin-top: 4px;
        font-weight: 600;
        font-size: 36px;
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

export default class LessonPage extends React.Component {

  static async getInitialProps({ req, query }) {
    const courseId = query.course
    const lessonSlug = query.lesson
    const { reviewUserId } = query
    const data = await fetchPageData(req, {
      course: { 'course_detail': { 'course_id': courseId } },
      lesson: { 'lesson_detail': { 'course_id': courseId, 'lesson_slug': lessonSlug } },
      reviewUser: { 'review_user': { 'user_id': reviewUserId } },
    })
    return { courseId, ...data }
  }

  render() {
    const { user, courseId, lesson, course, reviewUser } = this.props
    const userCanSubmitHomeworks = user && (user['is_admin'] || arrayContains(user['attended_course_ids'], courseId))
    const userCanReviewHomeworks = user && (user['is_admin'] || arrayContains(user['coached_course_ids'], courseId))
    const lessonSlug = lesson.slug
    const tasks = lesson['homework_items'].filter(x => x.homework_item_type === 'task')
    return (
      <Layout user={user} width={1200}>
        <Grid relaxed padded>
          <Grid.Row>
            <Grid.Column width={4} only='computer'>

              <CourseOverview course={course} />

            </Grid.Column>
            <Grid.Column width={16} computer={12}>

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
                  <h2>Odevzdané projekty</h2>
                  <TaskReviewLessonSummary
                    key={`${courseId} ${lessonSlug}`}
                    courseId={courseId}
                    lessonSlug={lessonSlug}
                    tasks={tasks}
                    reviewUserId={reviewUser ? reviewUser.id : null}
                  />
                </>
              )}

              <h2 id='tasks'>
                Domácí projekty
                {reviewUser && (
                  <>
                    {' – '}
                    <span>
                      {reviewUser.name}
                    </span>
                  </>
                )}
              </h2>

              {lesson['homework_items'].map((hwItem, i) => {
                switch (hwItem.homework_item_type) {
                  case 'task': return (
                    <HomeworkTask
                      key={`${courseId} ${lessonSlug} ${i}`}
                      hwItem={hwItem}
                      userCanSubmitHomework={userCanSubmitHomeworks}
                      courseId={courseId}
                      lessonSlug={lessonSlug}
                      reviewUserId={reviewUser ? reviewUser.id : null}
                    />
                  )
                  case 'section': return (
                    <HomeworkSection
                      key={`${courseId} ${lessonSlug} ${i}`}
                      hwItem={hwItem}
                    />
                  )
                  default: return (
                    <pre key={`${courseId} ${lessonSlug} ${i}`} className='debug'>
                      {JSON.stringify({ hwItem }, null, 2)}
                    </pre>
                  )
                }
              })}

            </Grid.Column>
          </Grid.Row>
        </Grid>
      </Layout>
    )
  }
}
