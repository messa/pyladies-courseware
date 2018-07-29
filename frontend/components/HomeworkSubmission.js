import React from 'react'
import { Button } from 'semantic-ui-react'
import { Comment, Form, Header, Icon, TextArea } from 'semantic-ui-react'
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
    //open: false,
    open: true,
    //currentSolution: null,
    currentSolution: { code: 'foo\nbar\n' },
    editCurrentSolution: false,
    submitInProgress: false,
  }

  handleOpenButton = () => {
    this.setState({ open: true })
  }

  handleSubmitSolution = async ({ code }) => {
    this.setState({
      submitInProgress: true,
    })
    return
    this.setState({
      submitInProgress: false,
      currentSolution: { code },
      editCurrentSolution: false,
    })
  }

  handleEditButton = async () => {
    this.setState({
      editCurrentSolution: true,
    })
  }

  render() {
    const { open, currentSolution, editCurrentSolution, submitInProgress } = this.state
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
              <HomeworkSolutionForm
                onSubmit={this.handleSubmitSolution}
                code={currentSolution ? currentSolution.code : null}
                loading={submitInProgress}
              />
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
