import React from 'react'
import Link from 'next/link'
import { Table, Message } from 'semantic-ui-react'

export default class TaskReviewLessonSummary extends React.Component {

  state = {
    loading: true,
    loadError: null,
    students: null,
    taskSolutionsByUserAndTaskId: null,
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
      const url = '/api/tasks/lesson-solutions' +
        `?course_id=${encodeURIComponent(courseId)}` +
        `&task_ids=${encodeURIComponent(JSON.stringify(taskIds))}`
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
    const { loading, loadError, students, taskSolutionsByUserAndTaskId } = this.state
    const { courseId, sessionSlug, tasks, reviewUserId, reviewTaskId } = this.props
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

        {students && (
          <div style={{ overflowX: 'auto' }}>
            <TaskReviewLessonSummaryTable
              courseId={courseId}
              sessionSlug={sessionSlug}
              students={students}
              tasks={tasks.filter(t => t.submit)}
              taskSolutionsByUserAndTaskId={taskSolutionsByUserAndTaskId}
              reviewUserId={reviewUserId}
              reviewTaskId={reviewTaskId}
            />
          </div>
        )}
        <pre className='debug' style={{ display: 'none' }}>
          TaskReviewLessonSummary {JSON.stringify({ props: this.props, state: this.state }, null, 2)}
        </pre>
      </div>
    )
  }
}

const TaskReviewLessonSummaryTable = ({ courseId, sessionSlug, students, tasks, taskSolutionsByUserAndTaskId, reviewUserId, reviewTaskId }) => (
  <Table basic celled size='small' compact unstackable>
    <Table.Header>
      <Table.Row>
        <Table.HeaderCell>Jméno</Table.HeaderCell>
        {tasks.map((task, i) => {
            const href = {
                pathname: '/task',
                query: {
                    course: courseId,
                    session: sessionSlug,
                    reviewTaskId: task.number,
                },
                hash: 'tasks'
            };
          return (
            <Table.HeaderCell key={i}>
                <Link href={href}><a>{task.number}</a></Link>
            </Table.HeaderCell>
          );
        })}
      </Table.Row>
    </Table.Header>

    <Table.Body>
      {students.map(student => (
        <Table.Row key={student.id} active={reviewUserId === student.id}>
          <Table.Cell>
            {reviewUserId === student.id ? (
              <strong>
                {student.name}
              </strong>
            ) : (
              <>
                {student.name}
              </>
            )}
          </Table.Cell>
          {tasks.map((task, i) => (
            <Table.Cell key={i} active={reviewTaskId === task.id}>
              <TaskStatus
                courseId={courseId}
                sessionSlug={sessionSlug}
                taskSolution={taskSolutionsByUserAndTaskId.get(`${student.id}|${task.id}`)}
                taskId={task.id}
              />
            </Table.Cell>
          ))}
        </Table.Row>
      ))}
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
      content = '◯'
    }
    if (taskSolution.last_action == 'student') {
      // last action student => waiting for coach
      // coach oriented component => full circle
      content = '⬤'
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
      reviewUserId: taskSolution.user_id,
    },
    hash: 'task-' + taskId
  }
  return (
    <Link href={href}><a>
      {content}
    </a></Link>
  )
}
