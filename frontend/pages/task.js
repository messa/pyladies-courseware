import React from 'react'
import Link from 'next/link'
import { Button, Grid } from 'semantic-ui-react'
import Layout from '../components/Layout'
import fetchPageData from '../util/fetchPageData'
import ALink from '../components/ALink'
import MaterialItems from '../components/MaterialItems'
import formatDate from '../util/formatDate'
import HomeworkTask from '../components/lesson/HomeworkTask'
import TaskReviewLessonSummary from '../components/TaskReviewLessonSummary'
import CourseOverview from '../components/lesson/CourseOverview'
import TaskReview from '../components/lesson/TaskReview'
import LoadingMessage from '../components/LoadingMessage'
import LoadErrorMessage from '../components/LoadErrorMessage'

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
        students: students.sort((a, b) => a.name.localeCompare(b.name)),
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
              <LoadingMessage active={loading} />
              <LoadErrorMessage active={loadError} message={loadError} />
              {students && (
                <HomeworkTask
                  key={`${courseId} ${sessionSlug} ${reviewTaskId}`}
                  taskItem={reviewTask}
                  userCanSubmitTask={userCanSubmitTasks}
                  courseId={courseId}
                  sessionSlug={sessionSlug}
                  students={students}
                />
              )}
            </Grid.Column>
          </Grid.Row>
        </Grid>
      </Layout>
    )
  }
}
