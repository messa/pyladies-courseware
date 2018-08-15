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
    open: true,
    currentSolution: null,
    //currentSolution: { code: 'foo\nbar\n' },
    editCurrentSolution: false,
    submitInProgress: false,
    submitError: null,
  }

  handleOpenButton = () => {
    this.setState({ open: true })
  }

  handleSubmitSolution = async ({ code }) => {
    const { courseId, lessonSlug, taskId } = this.props
    const payload = {
      'course_id': courseId,
      'lesson_slug': lessonSlug,
      'task_id': taskId,
      'code': code,
    }
    this.setState({
      submitInProgress: true,
    })
    try {
      const r = await fetch('/api/tasks/submit', {
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
    return (
      <div className='HomeworkSubmission'>
        {!open ? (
          <Button
            basic
            size='tiny'
            color='blue'
            content='Odevzdat řešení'
            icon='reply'
            onClick={this.handleOpenButton}
          />
        ) : (
          <div style={{ animation: 'slide-up 0.4s ease', marginTop: '1.5rem' }}>
            {(!currentSolution || editCurrentSolution) ? (
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
            ) : (
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
                <HomeworkComments />
              </>
            )}


          </div>
        )}
        <style jsx>{`
          .HomeworkSubmission {
            margin-top: 1rem;
          }
        `}</style>
      </div>
    )
  }
}
