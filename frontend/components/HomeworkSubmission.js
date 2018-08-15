import React from 'react'
import { Button } from 'semantic-ui-react'
import { Comment, Form, Header, Icon, TextArea, Message } from 'semantic-ui-react'
import HomeworkSolutionForm from './HomeworkSolutionForm'
import HomeworkComments from './HomeworkComments'

const HomeworkSolution = ({ code }) => (
  <div className='HomeworkSolution'>
    <h4>Odevzdané řešení</h4>
    <pre>{code}</pre>
  </div>
)

export default class HomeworkSubmission extends React.Component {

  state = {
    open: false,
    loading: true,
    loadError: null,
    currentSolution: null,
    comments: null,
    //currentSolution: { code: 'foo\nbar\n' },
    editCurrentSolution: false,
    submitInProgress: false,
    submitError: null,
  }

  componentDidMount() {
    this.loadData()
  }

  async loadData() {
    try {
      const { courseId, lessonSlug, taskId } = this.props
      const url = '/api/tasks/user-solutions' +
        `?course_id=${encodeURIComponent(courseId)}` +
        `&lesson_slug=${encodeURIComponent(lessonSlug)}` +
        `&task_id=${encodeURIComponent(taskId)}`
      const r = await fetch(url, {
        credentials: 'same-origin',
        headers: {
          'Accept': 'application/json',
        }
      })
      const { task_solutions, comments } = await r.json()
      this.setState({
        loading: false,
        loadError: null,
        currentSolution: task_solutions[0],
        comments: comments,
      })
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

  handleSubmitSolution = async ({ code }) => {
    this.setState({
      submitInProgress: true,
    })
    try {
      const { courseId, lessonSlug, taskId } = this.props
      const payload = {
        'course_id': courseId,
        'lesson_slug': lessonSlug,
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
      const { err } = await r.json()
      this.setState({
        submitInProgress: false,
        submitError: null,
        currentSolution: { code },
        editCurrentSolution: false,
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
      editCurrentSolution: true,
    })
  }

  render() {
    const { open, currentSolution, editCurrentSolution, submitInProgress, submitError } = this.state
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
    } else if (editCurrentSolution || (open && !currentSolution)) {
        content = (
          <>
            <h4>Odevzdat řešení</h4>
            {submitError && (
              <Message
                negative header='Send failed'
                content={submitError}
              />
            )}
            <HomeworkSolutionForm
              onSubmit={this.handleSubmitSolution}
              code={currentSolution ? currentSolution.code : null}
              loading={submitInProgress}
            />
          </>
        )
    } else if (currentSolution) {
      content = (
        <>
          <HomeworkSolution code={currentSolution.code} />
          <Button
            basic
            size='tiny'
            color='blue'
            content='Upravit'
            icon='edit'
            onClick={this.handleEditButton}
          />
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
      <div className='HomeworkSubmission'>
        {loading && (<p><em>Loading</em></p>)}
        {content}
        {comments && (<HomeworkComments comments={comments} />)}
        <style jsx>{`
          .HomeworkSubmission {
            margin-top: 1rem;
          }
        `}</style>
      </div>
    )
  }
}
