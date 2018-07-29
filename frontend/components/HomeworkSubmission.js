import React from 'react'
import { Button } from 'semantic-ui-react'
import { Comment, Form, Header, Icon, TextArea } from 'semantic-ui-react'
import HomeworkSolutionForm from './HomeworkSolutionForm'

const HomeworkSolution = ({ code }) => (
  <div className='HomeworkSolution'>
    <h4>Odevzdané řešení</h4>
    <pre>{code}</pre>
  </div>
)

class CommentContent extends React.Component {

  handleReplyAction = () => {
    this.props.onReply()
  }

  render() {
    return (
      <>
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
            <Comment.Action onClick={this.handleReplyAction}>
              <Icon name='reply' /> Odpovědět
            </Comment.Action>
          </Comment.Actions>
        </Comment.Content>
      </>
    )
  }
}

class CommentReply extends React.Component {

  handleReplyAction = () => {
    this.props.onReply()
  }

  render() {
    return (
      <Comment>
        <CommentContent onReply={this.handleReplyAction} />
      </Comment>
    )
  }

}


class CommentThread extends React.Component {

  state = {
    showReplyForm: false,
  }

  textAreaRef = null

  setTextAreaRef = (c) => {
    this.textAreaRef = c
  }

  handleReplyAction = () => {
    this.setState({ showReplyForm: true }, () => {
      try {
        this.textAreaRef.focus()
      } catch (err) {
        console.error(`TextArea focus failed: ${err}`)
      }
    })

  }

  handleCancel = () => {
    this.setState({ showReplyForm: false })
  }

  render() {
    const { showReplyForm } = this.state
    return (
      <Comment>
        <CommentContent onReply={this.handleReplyAction} />

        <Comment.Group>
          <CommentReply onReply={this.handleReplyAction} />
          <CommentReply onReply={this.handleReplyAction} />
        </Comment.Group>

        {showReplyForm && (
          <Comment.Content style={{ animation: 'slide-up 0.4s ease' }}>
            <Form reply>
              <Form.Field>
                <TextArea ref={this.setTextAreaRef} />
              </Form.Field>
              <Button content='Odeslat odpověď' icon='send' primary />
              &nbsp;{' '}
              <Button content='Zrušit' icon='cancel' color='red' basic onClick={this.handleCancel} />
            </Form>
          </Comment.Content>
        )}


      </Comment>

    )
  }

}

class HomeworkComments extends React.Component {

  render() {
    return (
      <div style={{ marginTop: '1.5rem' }}>
        <Comment.Group>
          <CommentThread />

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
