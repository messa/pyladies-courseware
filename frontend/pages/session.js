import React from 'react'
import Link from 'next/link'
import { Button, Grid, Message } from 'semantic-ui-react'
import Layout from '../components/Layout'
import fetchPageData from '../util/fetchPageData'
import ALink from '../components/ALink'
import MaterialItems from '../components/MaterialItems'
import formatDate from '../util/formatDate'
import HomeworkTask from '../components/lesson/HomeworkTask'
import TaskReviewLessonSummary from '../components/TaskReviewLessonSummary'
import TaskSubmissionLessonSummary from '../components/TaskSubmissionLessonSummary'
import CourseOverview from '../components/lesson/CourseOverview'
import TaskReview from '../components/lesson/TaskReview'

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

export default class SessionPage extends React.Component {

  static async getInitialProps({ req, query }) {
    const courseId = query.course
    const sessionSlug = query.session
    const { reviewUserId } = query
    const data = await fetchPageData(req, {
      course: { 'course_detail': { 'course_id': courseId } },
      session: { 'session_detail': { 'course_id': courseId, 'session_slug': sessionSlug } },
      reviewUser: { 'review_user': { 'user_id': reviewUserId } },
    })
    return { courseId, ...data }
  }

  render() {
    const { user, courseId, session, course, reviewUser } = this.props
    const userCanSubmitTasks = user && (user['is_admin'] || arrayContains(user['attended_course_ids'], courseId))
    const userCanReviewTasks = user && (user['is_admin'] || arrayContains(user['coached_course_ids'], courseId))
    const sessionSlug = session.slug
    const tasks = session['task_items'].filter(x => x.task_item_type === 'task')
    return (
      <Layout user={user} width={1200}>
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

              <MaterialItems materialItems={session['material_items']} />

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
                  ) : (userCanSubmitTasks && (
                    <TaskSubmissionLessonSummary
                      key={`${courseId} ${sessionSlug}`}
                      courseId={courseId}
                      sessionSlug={sessionSlug}
                      tasks={tasks}
                    />
                  ))}
                </>
              )}

              {!userCanSubmitTasks && !userCanReviewTasks && (
                <Message>
                  <Message.Header>Nejste účastníkem kurzu</Message.Header>
                  {user ? (
                    <>
                      Pro zápis do kurzu použijte tlačítko v
                      <Link href={{ pathname: '/course', query: { course: courseId } }}><a> přehledu kurzu</a></Link>.
                    </>
                  ) : (
                    <>
                      Pro zápis do kurzu se nejprve
                      <Link href={{ pathname: '/login' }}><a> přihlašte </a></Link>
                      a následně použijte tlačítko v
                      <Link href={{ pathname: '/course', query: { course: courseId } }}><a> přehledu kurzu</a></Link>.
                    </>
                  )}
                </Message>
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
