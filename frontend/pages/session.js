import React from 'react'
import Link from 'next/link'
import { Button, Grid } from 'semantic-ui-react'
import { graphql } from 'react-relay'
import Layout from '../components/Layout'
import fetchPageData from '../util/fetchPageData'
import ALink from '../components/ALink'
import MaterialItems from '../components/MaterialItems'
import formatDate from '../util/formatDate'
import TaskSubmission from '../components/TaskSubmission'
import TaskReviewLessonSummary from '../components/TaskReviewLessonSummary'
import TaskSubmissionLessonSummary from '../components/TaskSubmissionLessonSummary'
import CourseOverview from '../components/lesson/CourseOverview'
import TaskReview from '../components/lesson/TaskReview'
import withData from '../util/withData'

const HomeworkTask = ({ taskItem, userCanSubmitTask, courseId, sessionSlug, reviewUserId }) => (
  <div className='homework-task' id={'task-' + taskItem['id']}>
    <div className='number'>{taskItem['number']}.</div>
    <div className='homework-body'>
      {taskItem.mandatory && (
        <div className='mandatory-sign'>☜</div>
      )}
      <span dangerouslySetInnerHTML={{__html: taskItem['text_html'] }} />
    </div>
    {reviewUserId && (
      <TaskReview
        courseId={courseId}
        sessionSlug={sessionSlug}
        taskId={taskItem.id}
        taskSubmit={taskItem.submit}
        reviewUserId={reviewUserId}
      />
    )}
    {!reviewUserId && userCanSubmitTask && taskItem.submit && (
      <TaskSubmission
        courseId={courseId}
        sessionSlug={sessionSlug}
        taskId={taskItem.id}
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

const TaskSection = ({ taskItem }) => (
  <div className='task-section'>
    <div dangerouslySetInnerHTML={{__html: taskItem['text_html'] }} />
    <style jsx>{`
      .task-section {
        margin: 2rem 0;
        color: #038;
        font-weight: 600;
      }
    `}</style>
  </div>)

function arrayContains(array, item) {
  return array && array.indexOf(item) !== -1
}

class SessionPage extends React.Component {

  render() {
    console.debug('SessionPage props:')
    const { currentUser, course } = this.props
    console.debug(`course: ${JSON.stringify(course, null, 2)}`)
    const { courseId, session } = course
    const userCanSubmitTasks = currentUser && (currentUser['isAdmin'] || arrayContains(currentUser['attended_course_ids'], courseId))
    const userCanReviewTasks = currentUser && (currentUser['isAdmin'] || arrayContains(currentUser['coached_course_ids'], courseId))
    const sessionSlug = session.slug
    const tasks = session['taskItems'].filter(x => x.task_item_type === 'task')
    return (
      <Layout user={currentUser} width={1200}>
        <Grid relaxed padded>
          <Grid.Row>
            <Grid.Column width={4} only='computer'>

              <CourseOverview course={course} />

            </Grid.Column>
            <Grid.Column width={16} computer={12}>

              <h1 style={{ marginTop: '1rem' }}>
                <span dangerouslySetInnerHTML={{__html: session['title_html']}} />
                {' '}&nbsp;
                <small style={{ fontWeight: 300, color: '#c39', whiteSpace: 'nowrap' }}>
                  {formatDate(session['date'])}
                </small>
              </h1>

              <h2>Materiály</h2>

              <MaterialItems materialItems={session['materialItems']} />

              {user && (
                <>
                  <h2>Odevzdané projekty</h2>
                  {userCanReviewTasks ? (
                    <TaskReviewLessonSummary
                      key={`${courseId} ${sessionSlug}`}
                      courseId={courseId}
                      sessionSlug={sessionSlug}
                      tasks={tasks}
                      reviewUserId={reviewUser ? reviewUser.id : null}
                    />
                  ) : (
                    <TaskSubmissionLessonSummary
                      key={`${courseId} ${sessionSlug}`}
                      courseId={courseId}
                      sessionSlug={sessionSlug}
                      tasks={tasks}
                    />
                  )}
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

              {session['task_items'].map((taskItem, i) => {
                switch (taskItem.task_item_type) {
                  case 'task': return (
                    <HomeworkTask
                      key={`${courseId} ${sessionSlug} ${i}`}
                      taskItem={taskItem}
                      userCanSubmitTask={userCanSubmitTasks}
                      courseId={courseId}
                      sessionSlug={sessionSlug}
                      reviewUserId={reviewUser ? reviewUser.id : null}
                    />
                  )
                  case 'section': return (
                    <TaskSection
                      key={`${courseId} ${sessionSlug} ${i}`}
                      taskItem={taskItem}
                    />
                  )
                  default: return (
                    <pre key={`${courseId} ${sessionSlug} ${i}`} className='debug'>
                      {JSON.stringify({ taskItem }, null, 2)}
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

export default withData(SessionPage, {
  variables: ({ query }) => ({
    courseId: query.course,
    sessionSlug: query.session,
    reviewUserId: query.reviewUserId,
  }),
  query: graphql`
    query sessionQuery($courseId: String!, $sessionSlug: String!) {
      currentUser {
        isAdmin
        ...Layout_currentUser
      }
      reviewUser: user(userId: $reviewUserId) {
      }
      course(courseId: $courseId) {
        id
        courseId
        titleHTML
        subtitleHTML
        session(slug: $sessionSlug) {
          id
          slug
          titleHTML
          date
          hasTasks
          materialItems {
            materialItemType
            titleHTML
            textHTML
            url
          }
          taskItems {
            taskItemType
            taskId
            textHTML
            number
            mandatory
            submit
          }
        }
      }
    }
  `
})
