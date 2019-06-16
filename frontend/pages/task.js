import React from 'react'
import Link from 'next/link'
import { Button, Grid } from 'semantic-ui-react'
import Layout from '../components/Layout'
import fetchPageData from '../util/fetchPageData'
import ALink from '../components/ALink'
import MaterialItems from '../components/MaterialItems'
import formatDate from '../util/formatDate'
import TaskSubmission from '../components/TaskSubmission'
import TaskReviewLessonSummary from '../components/TaskReviewLessonSummary'
import CourseOverview from '../components/lesson/CourseOverview'
import TaskReview from '../components/lesson/TaskReview'
import LoadingMessage from '../components/LoadingMessage'
import LoadErrorMessage from '../components/LoadErrorMessage'

const HomeworkTask = ({ taskItem, userCanSubmitTask, courseId, sessionSlug, reviewTaskId }) => (
  <div className='homework-task'>
    <div className='number'>{taskItem['number']}.</div>
    <div className='homework-body'>
      {taskItem.mandatory && (
        <div className='mandatory-sign'>☜</div>
      )}
      <span dangerouslySetInnerHTML={{__html: taskItem['text_html'] }} />
    </div>
    {!reviewTaskId && userCanSubmitTask && taskItem.submit && (
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

export default class SessionPage extends React.Component {
  state = {
    loading: true,
    loadError: null,
    students: null,
    taskSolutionsByUserAndTaskId: null,
  }

  static async getInitialProps({ req, query }) {
    const courseId = query.course
    const sessionSlug = query.session
    const { reviewTaskId } = query
    const data = await fetchPageData(req, {
      course: { 'course_detail': { 'course_id': courseId } },
      session: { 'session_detail': { 'course_id': courseId, 'session_slug': sessionSlug } },
    })
    return { courseId, reviewTaskId, ...data }
  }
  componentDidMount() {
    this.loadData()
    if (!this.loadIntervalId) {
      this.loadIntervalId = setInterval(() => this.loadData(), 20 * 1000)
    }
  }

  componentWillUnmount() {
    if (this.loadIntervalId) {
      clearInterval(this.loadIntervalId)
      this.loadIntervalId = null
    }
  }

  async loadData() {
    const { courseId, tasks } = this.props
    //const taskIds = tasks.map(t => t.id)
    try {
      const url = '/api/tasks/lesson-solutions' +
        `?course_id=${encodeURIComponent(courseId)}`
      const r = await fetch(url, {
        credentials: 'same-origin',
        headers: {
          'Accept': 'application/json',
        }
      })
      const { task_solutions, students } = await r.json()
      this.setState({
        loading: false,
        loadError: null,
        students,
        taskSolutionsByUserAndTaskId: new Map(
          task_solutions.map(ts => ([`${ts.user_id}|${ts.task_id}`, ts]))),
      })
    } catch (err) {
      this.setState({
        loading: false,
        loadError: err.toString(),
      })
    }
  }

  render() {
    const { user, courseId, session, course, reviewTaskId } = this.props
    const userCanSubmitTasks = user && (user['is_admin'] || arrayContains(user['attended_course_ids'], courseId))
    const userCanReviewTasks = user && (user['is_admin'] || arrayContains(user['coached_course_ids'], courseId))
    const sessionSlug = session.slug
    const tasks = session['task_items'].filter(x => x.task_item_type === 'task')
    const reviewTask = session['task_items'].filter(x => x.number == reviewTaskId)[0];
    const { loading, loadError, students, taskSolutionsByUserAndTaskId } = this.state
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

              {userCanReviewTasks && (
                <>
                  <h2>Odevzdané projekty</h2>
                  <TaskReviewLessonSummary
                    key={`${courseId} ${sessionSlug}`}
                    courseId={courseId}
                    sessionSlug={sessionSlug}
                    tasks={tasks}
                    reviewTaskId={reviewTask ? reviewTask.id : null}
                  />
                </>
              )}

              <h2 id='tasks'>
                Domácí projekty
              </h2>

                    <HomeworkTask
                      key={`${courseId} ${sessionSlug} ${reviewTaskId}`}
                      taskItem={reviewTask}
                      userCanSubmitTask={userCanSubmitTasks}
                      courseId={courseId}
                      sessionSlug={sessionSlug}
                    />
                    <LoadingMessage active={loading} />
                    <LoadErrorMessage active={loadError} message={loadError} />
                    {students && students.map(student => (
                        <>
                            <TaskReview
                                key={`${reviewTask.id} ${student.id}`}
                                courseId={courseId}
                                sessionSlug={sessionSlug}
                                taskId={reviewTask.id}
                                taskSubmit={reviewTask.submit}
                                reviewUserId={student.id}
                                title={student.name}
                            />
                        </>
                    ))}

            </Grid.Column>
          </Grid.Row>
        </Grid>
      </Layout>
    )
  }
}
