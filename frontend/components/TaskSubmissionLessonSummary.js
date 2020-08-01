import React from 'react'
import Link from 'next/link'
import { Table, Message } from 'semantic-ui-react'
import { createFragmentContainer, graphql } from 'react-relay'

class TaskSubmissionLessonSummary extends React.Component {

  render() {
    const { session, courseId, sessionSlug } = this.props
    const tasks = session.taskItems.filter(t => t.submit)

    return (
      <Table basic celled size='small' compact unstackable>
        <Table.Header>
          <Table.Row>
            <Table.HeaderCell>Úloha</Table.HeaderCell>
            {tasks && tasks.map((task, i) => (
              <Table.HeaderCell key={i}>{task.number}</Table.HeaderCell>
            ))}
          </Table.Row>
        </Table.Header>

        <Table.Body>
          <Table.Row>
            <Table.Cell>
              Stav
            </Table.Cell>
            {tasks && tasks.map((task, i) => (
              <Table.Cell key={i}>
                <TaskStatus
                  courseId={courseId}
                  sessionSlug={sessionSlug}
                  taskSolution={task.mySolution}
                  taskId={task.taskItemId}
                />
              </Table.Cell>
            ))}
          </Table.Row>
        </Table.Body>
      </Table>
    )
  }
}

export default createFragmentContainer(TaskSubmissionLessonSummary, {
  session: graphql`
    fragment TaskSubmissionLessonSummary_session on Session {
      id
      taskItems {
        taskItemId
        number
        submit
        mySolution {
          lastAction
        }
      }
    }
  `
})

function TaskStatus({ courseId, sessionSlug, taskSolution, taskId }) {
  if (!taskSolution) {
    return '·'
  }
  // old solutions where last_action is not set
  let content = '?'
  if (taskSolution.lastAction) {
    if (taskSolution.lastAction == 'coach') {
      // last action coach => waiting for student
      // student oriented component => full circle
      content = '⬤'
    }
    if (taskSolution.lastAction == 'student') {
      // last action student => waiting for coach
      content = '◯'
    }
  }
  if (taskSolution.isSolved) {
    content = '✓'
  }
  const href = {
    pathname: '/session',
    query: {
      course: courseId,
      session: sessionSlug,
    },
    hash: 'task-' + taskId
  }
  return (
    <Link href={href}><a>
      {content}
    </a></Link>
  )
}
