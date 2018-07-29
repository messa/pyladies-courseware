import React from 'react'
import { Button } from 'semantic-ui-react'
import { Comment, Form, Header } from 'semantic-ui-react'
import HomeworkSolutionForm from './HomeworkSolutionForm'

const HomeworkSolution = ({ code }) => (
  <div className='HomeworkSolution'>
    <h4>Odevzdané řešení</h4>
    <pre>{code}</pre>
  </div>
)

class CommentReply extends React.Component {

  render() {
    return (
      <Comment>
        <Comment.Avatar src='https://react.semantic-ui.com/images/avatar/small/jenny.jpg' />
        <Comment.Content>
          <Comment.Author as='a'>Jenny Hess</Comment.Author>
          <Comment.Metadata>
            <div>Just now</div>
          </Comment.Metadata>
          <Comment.Text>Elliot you are always so right :)</Comment.Text>
          <Comment.Actions>
            <Comment.Action>Reply</Comment.Action>
          </Comment.Actions>
        </Comment.Content>
      </Comment>
    )
  }

}


class CommentThread extends React.Component {

  render() {
    return (
      <Comment>
        <Comment.Avatar src='https://react.semantic-ui.com/images/avatar/small/elliot.jpg' />
        <Comment.Content>
          <Comment.Author as='a'>Elliot Fu</Comment.Author>
          <Comment.Metadata>
            <div>Yesterday at 12:30AM</div>
          </Comment.Metadata>
          <Comment.Text>
            <p>This has been very useful for my research. Thanks as well!</p>
          </Comment.Text>
          <Comment.Actions>
            <Comment.Action>Reply</Comment.Action>
          </Comment.Actions>
        </Comment.Content>
        <Comment.Group>
          <CommentReply />
          <CommentReply />
        </Comment.Group>
      </Comment>

    )
  }

}

class HomeworkComments extends React.Component {

  state = {
    replyTo: null,
  }

  render() {
    const { replyTo } = this.state
    return (
      <div style={{ marginTop: '1.5rem' }}>
        <Comment.Group>
          <CommentThread />

          {replyTo !== null && (
            <Form reply>
              <Form.TextArea />
              <Button content='Add Reply' size='small' icon='edit' primary />
            </Form>
          )}
        </Comment.Group>
      </div>
    )
  }
}

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
