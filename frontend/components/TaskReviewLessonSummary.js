import React from 'react'
import Link from 'next/link'
import { Table, Message, Popup } from 'semantic-ui-react'
import holdAnchor from './Helpers'
import ALink from './ALink'

export default class TaskReviewLessonSummary extends React.Component {

  state = {
    loading: true,
    loadError: null,
    students: null,
    taskSolutionsByUserAndTaskId: null,
    taskSolutionsTaskId: null,
  }

  componentDidMount() {
    this.loadData(true)
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

  async loadData(anchorCheck = false) {
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
      const taskSolutionsByTaskId = new Map(taskIds.map(t => [t, new Array()]))
      task_solutions.forEach(ts => {
        taskSolutionsByTaskId.get(ts.task_id).push(ts)
      })
      this.setState({
        loading: false,
        loadError: null,
        students: students.sort((a, b) => a.name.localeCompare(b.name)),
        taskSolutionsByUserAndTaskId: new Map(
          task_solutions.map(ts => ([`${ts.user_id}|${ts.task_id}`, ts]))),
        taskSolutionsByTaskId: taskSolutionsByTaskId,
      })
      if (anchorCheck) {
        holdAnchor()
      }
    } catch (err) {
      this.setState({
        loading: false,
        loadError: err.toString(),
      })
    }
  }

  render() {
    const { loading, loadError, students, taskSolutionsByUserAndTaskId, taskSolutionsByTaskId } = this.state
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
              taskSolutionsByTaskId={taskSolutionsByTaskId}
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

const TaskReviewLessonSummaryTable = ({ courseId, sessionSlug, students, tasks, taskSolutionsByUserAndTaskId, reviewUserId, reviewTaskId, taskSolutionsByTaskId }) => (
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
    <Table.Footer>
      <Table.Row className='stats-row'>
        <Table.HeaderCell>
          <div className='stats-row-item'>Odevzdáno:</div>
          <div className='stats-row-item'>Vyřešeno:</div>
          <div className='stats-row-item'>Verzí:</div>
          <div className='stats-row-item'>Komnetářů:</div>
        </Table.HeaderCell>
        {tasks.map((task, i) => {
          return (
            <Table.HeaderCell key={i}>
              <TaskStats taskSolutions={taskSolutionsByTaskId.get(task.id)} />
            </Table.HeaderCell>
          );
        })}
      </Table.Row>
    </Table.Footer>
    <style jsx global>{`
      .stats-row {
        text-align: right;
      }
      .stats-row-item {
       color: #666;
      }
    `}</style>
  </Table>
)

const TaskStats = ({ taskSolutions }) => {
  const submitedSolutions = taskSolutions.length
  const solvedSolutions = taskSolutions.filter(t => t.is_solved).length
  const versionsReducer = (acc, val) => acc + val.all_versions.length
  const submitedVersions = taskSolutions.reduce(versionsReducer, 0)
  const commentsReducer = (acc, val) => acc + val.n_comments
  const submitedComments = taskSolutions.reduce(commentsReducer, 0)
  return (
    <>
      <div className='stats-row-item'>{submitedSolutions ? submitedSolutions : '-'}</div>
      <div className='stats-row-item'>{solvedSolutions ? solvedSolutions : '-'}</div>
      <div className='stats-row-item'>{submitedVersions ? submitedVersions : '-'}</div>
      <div className='stats-row-item'>{submitedComments ? submitedComments : '-'}</div>
    </>
  )
}


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
    // <Link href={href}>
    <Popup position='top center' trigger={<ALink href={href}> {content} </ALink>}>
      <div>{taskSolution.all_versions.length} odevzdaných řešení</div>
      <div>{taskSolution.n_comments} komentářů</div>
    </Popup>
  )
}
