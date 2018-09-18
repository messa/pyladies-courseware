import React from 'react'
import { Button, Comment, Form, Header } from 'semantic-ui-react'
import TaskCommentForm from './TaskCommentForm'

export default class TaskComments extends React.Component {

  state = {
    replyToCommentId: null,
  }

  handleReplyClick = (e) => {
    const commentId = e.target.dataset.commentid
    if (!commentId) throw new Error('No commentd')
    this.setState({
      replyToCommentId: commentId,
    })
  }

  handleCommentFormCancel = () => {
    this.setState({
      replyToCommentId: null,
    })
    if (this.props.onAddCommentCancel) this.props.onAddCommentCancel()
  }

  handleCommentFormSubmit = async (data) => {
    const { replyToCommentId } = this.state
    await this.props.onAddCommentSubmit({ replyToCommentId, ...data })
    this.setState({
      replyToCommentId: null,
    })
  }

  render() {
    const { replyToCommentId } = this.state
    const showCommentForm = this.props.addComment || replyToCommentId
    return (
      <div className='TaskComments'>
        <h4>Komentáře</h4>

        <Comment.Group>

          <Comment>
            {/*<Comment.Avatar src='/images/avatar/small/matt.jpg' />*/}
            <Comment.Content>
              <Comment.Author as='span'>Matt</Comment.Author>
              <Comment.Metadata>
                <div>Today at 5:42PM</div>
              </Comment.Metadata>
              <Comment.Text>How artistic!</Comment.Text>
              <Comment.Actions>
                <Comment.Action
                  content='Odpovědět'
                  active={replyToCommentId == 1234}
                  data-commentid={1234}
                  onClick={this.handleReplyClick}
                />
              </Comment.Actions>
            </Comment.Content>
          </Comment>

          {showCommentForm && (
            <TaskCommentForm
              onCancel={this.handleCommentFormCancel}
              onSubmit={this.handleCommentFormSubmit}
            />
          )}

        </Comment.Group>

      </div>
    )
  }

}
