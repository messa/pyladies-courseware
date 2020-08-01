import React from 'react'
import Link from 'next/link'
import { Button, Grid, Message } from 'semantic-ui-react'
import { graphql } from 'react-relay'
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
import withData from '../util/withData'

function TaskSection({ taskItem }) {
  return (
    <div className='task-section'>
      <div dangerouslySetInnerHTML={{__html: taskItem['text_html'] }} />
      <style jsx>{`
        .task-section {
          margin: 2rem 0;
          color: #038;
          font-weight: 600;
        }
      `}</style>
    </div>
  )
}

function arrayContains(array, item) {
  return array && array.indexOf(item) !== -1
}

class SessionPage extends React.Component {

  render() {
    const { currentUser, reviewUser, course } = this.props
    const { courseId, session } = course
    const userCanSubmitTasks = currentUser && (currentUser.isAdmin || arrayContains(currentUser.attendedCourseIds, courseId))
    const userCanReviewTasks = currentUser && (currentUser.isAdmin || arrayContains(currentUser.coachedCourseIds, courseId))
    const sessionSlug = session.slug
    const tasks = session['taskItems'].filter(x => x.taskItemType === 'task')
    return (
      <Layout currentUser={currentUser} width={1200}>
        <Grid relaxed padded>
          <Grid.Row>
            <Grid.Column width={4} only='computer'>

              <CourseOverview course={course} />

            </Grid.Column>
            <Grid.Column mobile={16} computer={12}>

              <h1 style={{ marginTop: '1rem' }}>
                <span dangerouslySetInnerHTML={{__html: session['titleHTML']}} />
                {' '}&nbsp;
                <small style={{ fontWeight: 300, color: '#c39', whiteSpace: 'nowrap' }}>
                  {formatDate(session['date'])}
                </small>
              </h1>

              <h2>Materiály</h2>

              <MaterialItems materialItems={session.materialItems} />

              {currentUser && (
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
                      session={session}
                      courseId={courseId}
                      sessionSlug={sessionSlug}
                    />
                  ))}
                </>
              )}

              {!userCanSubmitTasks && !userCanReviewTasks && (
                <Message>
                  <Message.Header>Nejste účastníkem kurzu</Message.Header>
                  {currentUser ? (
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

              {session['taskItems'].map((taskItem, i) => {
                switch (taskItem.taskItemType) {
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
    reviewUserId: query.reviewUserId || null,
  }),
  query: graphql`
    query sessionQuery($courseId: String!, $sessionSlug: String!, $reviewUserId: String) {
      currentUser {
        id
        userId
        isAdmin
        attendedCourseIds
        coachedCourseIds
        ...Layout_currentUser
      }
      reviewUser: user(userId: $reviewUserId) {
        id
        userId
        name
      }
      course(courseId: $courseId) {
        id
        courseId
        titleHTML
        subtitleHTML
        sessions {
          id
          slug
          titleHTML
          date
          hasTasks
        }
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
            taskItemId
            textHTML
            number
            mandatory
            submit
          }
          ...TaskSubmissionLessonSummary_session
        }
      }
    }
  `
})
