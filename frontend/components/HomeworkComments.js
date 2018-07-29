import React from 'react'
import { Button } from 'semantic-ui-react'
import { Comment, Form, Header, Icon, TextArea } from 'semantic-ui-react'

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

export default class HomeworkComments extends React.Component {

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
