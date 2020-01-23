import React from 'react'
import { Button, Label, Tab } from 'semantic-ui-react'
import { Comment, Form, Header, Icon, TextArea, Message } from 'semantic-ui-react'
import TaskSolutionForm from './TaskSolutionForm'
import TaskSolution from './lesson/TaskSolution'
import TaskComments from './lesson/TaskComments'
import holdAnchor from './Helpers'

class TaskSubmission extends React.Component {

  state = {
    open: false,
    loading: true,
    loadError: null,
    taskSolution: null,
    comments: null,
    editSolution: false,
    submitInProgress: false,
    submitError: null,
  }

  componentDidMount() {
    this.loadData(true)
    if (!this.loadIntervalId) {
      this.loadIntervalId = setInterval(() => this.loadData(), 30 * 1000)
    }
  }

  componentWillUnmount() {
    if (this.loadIntervalId) {
      clearInterval(this.loadIntervalId)
      this.loadIntervalId = null
    }
  }

  async loadData(anchorCheck = false) {
    try {
      const { courseId, sessionSlug, taskId } = this.props
      const url = '/api/tasks/solution' +
        `?course_id=${encodeURIComponent(courseId)}` +
        `&session_slug=${encodeURIComponent(sessionSlug)}` +
        `&task_id=${encodeURIComponent(taskId)}`
      const r = await fetch(url, {
        credentials: 'same-origin',
        headers: {
          'Accept': 'application/json',
        }
      })
      const { task_solution, comments } = await r.json()
      this.setState({
        loading: false,
        loadError: null,
        taskSolution: task_solution,
        comments,
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

  handleOpenButton = () => {
    this.setState({ open: true })
  }

  handleCancelSolutionForm = () => {
    this.setState({ open: false, editSolution: false })
  }

  handleSubmitSolution = async ({ code }) => {
    this.setState({
      submitInProgress: true,
    })
    try {
      const { courseId, sessionSlug, taskId } = this.props
      const payload = {
        'course_id': courseId,
        'session_slug': sessionSlug,
        'task_id': taskId,
        'code': code,
      }
      const r = await fetch('/api/tasks/submit-solution', {
        method: 'POST',
        credentials: 'same-origin',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      })
      const { err, task_solution } = await r.json()
      this.setState({
        submitInProgress: false,
        submitError: null,
        taskSolution: task_solution,
        editSolution: false,
      })
    } catch (err) {
      this.setState({
        submitInProgress: false,
        submitError: err.toString(),
      })
    }
  }

  handleEditButton = async () => {
    this.setState({
      editSolution: true,
    })
  }

  handleAddCommentSubmit = async ({ replyToCommentId, body }) => {
    // Tady se nemanaguje saving/saveError state ani nezachytávají výjimky,
    // to se řeší přímo v TaskCommentForm, který volá tento handler.
    // (TODO: řešit takto i marked as solved a další věci?)
    const { taskSolution } = this.state
    const payload = {
      task_solution_id: taskSolution.id,
      reply_to_comment_id: replyToCommentId,
      body: body,
    }
    const r = await fetch('/api/tasks/add-solution-comment', {
      credentials: 'same-origin',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
      },
      method: 'POST',
      body: JSON.stringify(payload),
    })
    const { comments } = await r.json()
    this.setState({
      comments,
    })
  }

  render() {
    const { open, taskSolution, editSolution, submitInProgress, submitError } = this.state
    const { loading, loadError, comments } = this.state
    let content = null
    if (this.state.loadError) {
      content = (
        <Message
          negative
          header='Load failed'
          content={loadError}
        />
      )
    } else if (editSolution || (open && !taskSolution)) {
        content = (
          <>
            <h4>Odevzdat řešení</h4>
            {submitError && (
              <Message
                negative header='Send failed'
                content={submitError}
              />
            )}
            <TaskSolutionForm
              onSubmit={this.handleSubmitSolution}
              onCancel={this.handleCancelSolutionForm}
              code={taskSolution ? taskSolution.current_version.code : null}
              loading={submitInProgress}
            />
          </>
        )
    } else if (taskSolution) {
      content = (
        <>
          <div>
            <h4>Odevzdané řešení <TaskStatus taskSolution={taskSolution} /></h4>
            <TaskSolution taskSolution={taskSolution} />
          </div>
          {taskSolution.is_solved ? (
            <div>
              <Icon
                name='check'
                color='green'
                size='large'
              />
              <span className='markedSolvedLabel'>Vyřešené</span>
            </div>
          ) : (
            <Button
              basic
              size='tiny'
              color='blue'
              content='Upravit'
              icon='edit'
              onClick={this.handleEditButton}
            />
          )}
        </>
      )
    } else if (!open && !loading) {
      content = (
        <Button
          basic
          size='tiny'
          color='blue'
          content='Odevzdat řešení'
          icon='reply'
          onClick={this.handleOpenButton}
        />
      )
    }
    return (
      <div className='TaskSubmission'>
        {loading && (<p><em>Loading</em></p>)}
        {content}
        <TaskComments
          comments={comments}
          onAddCommentSubmit={this.handleAddCommentSubmit}
          taskSolution={taskSolution}
        />
        <style jsx global>{`
          .TaskSubmission {
            margin-top: 1rem;
          }
          .TaskSubmission .markedSolvedLabel {
            font-weight: 600;
            color: #0c0;
          }
        `}</style>
      </div>
    )
  }
}

const TaskStatus = ({ taskSolution }) => {
  if (!taskSolution) {
    return ''
  }
  // old solutions where last_action is not set
  let content = '?'
  let text = '- neznámý stav'
  if (taskSolution.last_action) {
    if (taskSolution.last_action == 'coach') {
      // last action coach => waiting for student
      // student oriented component => full circle
      content = '⬤'
      text = '- přečti si, co napsal kouč'
    }
    if (taskSolution.last_action == 'student') {
      // last action student => waiting for coach
      content = '◯'
      text = '- počkej na reakci kouče'
    }
  }
  if (taskSolution.is_solved) {
    content = '✓'
    text = '- vyřešené'
  }
  return (
    <span>
      (stav: <span className='status-indicator'>{content}</span> {text})
    </span>
  )
}

export default TaskSubmission
