import React from 'react'
import Link from 'next/link'
import { Table, Message } from 'semantic-ui-react'

export default class TaskSubmissionLessonSummary extends React.Component {

  state = {
    loading: true,
    loadError: null,
    taskSolutionsByTaskId: null,
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

    const taskIds = tasks.map(t => t.id)
    try {
      const url = '/api/tasks/my-lesson-solutions' +
        `?course_id=${encodeURIComponent(courseId)}` +
        `&task_ids=${encodeURIComponent(JSON.stringify(taskIds))}`
      const r = await fetch(url, {
        credentials: 'same-origin',
        headers: {
          'Accept': 'application/json',
        }
      })
      const { task_solutions } = await r.json()
      this.setState({
        loading: false,
        loadError: null,
        taskSolutionsByTaskId: new Map(
          task_solutions.map(ts => ([`${ts.task_id}`, ts]))),
      })
    } catch (err) {
      this.setState({
        loading: false,
        loadError: err.toString(),
      })
    }
  }

  render() {
    const { loading, loadError, taskSolutionsByTaskId } = this.state
    const { courseId, sessionSlug, tasks, user } = this.props
    return (
      <div>
        {loading && (<p><em>Loading</em></p>)}
        {loadError && (
          <Message
            negative
            header='Load failed'
            content={loadError}
          />
        )}

        {taskSolutionsByTaskId && (
          <div style={{ overflowX: 'auto' }}>
            <TaskSubmissionLessonSummaryTable
              courseId={courseId}
              sessionSlug={sessionSlug}
              tasks={tasks.filter(t => t.submit)}
              taskSolutionsByTaskId={taskSolutionsByTaskId}
              user={user}
            />
          </div>
        )}
        <pre className='debug' style={{ display: 'none' }}>
          TaskSubmissionLessonSummary {JSON.stringify({ props: this.props, state: this.state }, null, 2)}
        </pre>
      </div>
    )
  }
}

const TaskSubmissionLessonSummaryTable = ({ courseId, sessionSlug, tasks, taskSolutionsByTaskId, user }) => (
  <Table basic celled size='small' compact unstackable>
    <Table.Header>
      <Table.Row>
        <Table.HeaderCell>Úloha</Table.HeaderCell>
        {tasks.map((task, i) => (
          <Table.HeaderCell key={i}>{task.number}</Table.HeaderCell>
        ))}
      </Table.Row>
    </Table.Header>

    <Table.Body>
      <Table.Row>
        <Table.Cell>
          Stav
        </Table.Cell>
        {tasks.map((task, i) => (
          <Table.Cell key={i}>
            <TaskStatus
              courseId={courseId}
              sessionSlug={sessionSlug}
              taskSolution={taskSolutionsByTaskId.get(`${task.id}`)}
              taskId={task.id}
            />
          </Table.Cell>
        ))}
      </Table.Row>
    </Table.Body>
  </Table>
)


const TaskStatus = ({ courseId, sessionSlug, taskSolution, taskId }) => {
  if (!taskSolution) {
    return '·'
  }
  // old solutions where last_action is not set
  let content = '?'
  if (taskSolution.last_action) {
    if (taskSolution.last_action == 'coach') {
      // last action coach => waiting for student
      // student oriented component => full circle
      content = '⬤'
    }
    if (taskSolution.last_action == 'student') {
      // last action student => waiting for coach
      content = '◯'
    }
  }
  if (taskSolution.is_solved) {
    content = '✓'
  }
  const href = {
    pathname: '/session',
    query: {
      course: courseId,
      session: sessionSlug,
    //   reviewUserId: taskSolution.user_id,
    },
    hash: 'task-' + taskId
  }
  return (
    <Link href={href}><a>
      {content}
    </a></Link>
  )
}
