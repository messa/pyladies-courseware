import React from 'react'
import { Button, Comment, Form, Header, Label } from 'semantic-ui-react'
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

  getCodeVersion = (time, codeVersions) => {
    let version = 0
    codeVersions.forEach(cv => {
      if (cv < time) {
        version++
    }})
    return version
  }

  render() {
    const comments = this.props.comments || []
    const { replyToCommentId } = this.state
    const showCommentForm = this.props.addComment || replyToCommentId
    if (!showCommentForm && comments.length === 0) {
      return null
    }
    const codeVersions = this.props.taskSolution.all_versions.map(v => v.date).sort()
    return (
      <div className='TaskComments'>
        <h4>Komentáře</h4>

        <Comment.Group>

          {comments.map(comment => (

            <Comment key={comment.id}>
              {/*<Comment.Avatar src='/images/avatar/small/matt.jpg' />*/}
              <Comment.Content>
                <Comment.Author as='span'>{comment.author.name}</Comment.Author>
                <Comment.Metadata>
                  <div>{comment.date.toString()}</div>
                  <Label>Verze {this.getCodeVersion(comment.date, codeVersions)}</Label>
                </Comment.Metadata>
                <Comment.Text>{comment.body}</Comment.Text>
                <Comment.Actions>
                  <Comment.Action
                    content='Odpovědět'
                    active={replyToCommentId == comment.id}
                    data-commentid={comment.id}
                    onClick={this.handleReplyClick}
                  />
                </Comment.Actions>
              </Comment.Content>

              {comment.replies && comment.replies.length > 0 && (
                <Comment.Group>
                  {comment.replies.map(reply => (
                    <Comment key={reply.id}>
                      {/*<Comment.Avatar src='/images/avatar/small/jenny.jpg' />*/}
                      <Comment.Content>
                        <Comment.Author as='span'>{reply.author.name}</Comment.Author>
                        <Comment.Metadata>
                          <div>{reply.date.toString()}</div>
                          <Label>Verze {this.getCodeVersion(reply.date, codeVersions)}</Label>
                        </Comment.Metadata>
                        <Comment.Text>{reply.body}</Comment.Text>
                        <Comment.Actions>
                          <Comment.Action
                            content='Odpovědět'
                            active={replyToCommentId == reply.id}
                            data-commentid={reply.id}
                            onClick={this.handleReplyClick}
                          />
                        </Comment.Actions>
                      </Comment.Content>
                    </Comment>
                  ))}
                </Comment.Group>
              )}

            </Comment>
          ))}

          {showCommentForm && (
            <TaskCommentForm
              onCancel={this.handleCommentFormCancel}
              onSubmit={this.handleCommentFormSubmit}
            />
          )}

        </Comment.Group>

        <style jsx global>{`
          .TaskComments .comment .content .text {
            margin-top: 0.5rem;
            margin-bottom: 0.5rem;
            white-space: pre-wrap;
          }
        `}</style>

      </div>
    )
  }

}
