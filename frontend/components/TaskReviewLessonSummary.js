import React from 'react'
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
    const { loading, loadError, students, taskSolutionsByUserAndTaskId } = this.state
    const { tasks } = this.props
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
          <TaskReviewLessonSummaryTable
            students={students}
            tasks={tasks}
            taskSolutionsByUserAndTaskId={taskSolutionsByUserAndTaskId}
          />
        )}
        <pre className='debug' style={{ display: 'none' }}>
          TaskReviewLessonSummary {JSON.stringify({ props: this.props, state: this.state }, null, 2)}
        </pre>
      </div>
    )
  }
}

const TaskReviewLessonSummaryTable = ({ students, tasks, taskSolutionsByUserAndTaskId }) => (
  <Table basic celled size='small' compact>
    <Table.Header>
      <Table.Row>
        <Table.HeaderCell>Jméno</Table.HeaderCell>
        {tasks.map((task, i) => (
          <Table.HeaderCell key={i}>{task.number}</Table.HeaderCell>
        ))}
      </Table.Row>
    </Table.Header>

    <Table.Body>
      {students.map(student => (
        <Table.Row key={student.id}>
          <Table.Cell>{student.name}</Table.Cell>
          {tasks.map((task, i) => (
            <Table.Cell key={i}>
              <TaskStatus taskSolution={taskSolutionsByUserAndTaskId.get(`${student.id}|${task.id}`)} />
            </Table.Cell>
          ))}
        </Table.Row>
      ))}
    </Table.Body>
  </Table>
)


const TaskStatus = ({ taskSolution }) => {
  if (!taskSolution) return '·'
  if (!taskSolution.conclusion) return '◯'
  return `${taskSolution.conclusion}`
}
