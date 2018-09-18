import React from 'react'
import { Icon, Button } from 'semantic-ui-react'
import LoadingMessage from '../LoadingMessage'
import LoadErrorMessage from '../LoadErrorMessage'
import TaskSolution from './TaskSolution'
import TaskComments from './TaskComments'

export default class TaskReview extends React.Component {

  state = {
    loading: true,
    loadError: null,
    reviewUserId: null,
    taskSolution: null,
    comments: null,
    showAddComment: false,
    markedAsSolved: true,
  }

  componentDidMount() {
    this.loadData()
  }

  componentDidUpdate(prevProps) {
    if (this.props.reviewUserId !== prevProps.reviewUserId) {
      this.setState({
        loading: true,
        loadError: null,
      })
      this.loadData()
    }
  }

  async loadData() {
    const { courseId, lessonSlug, taskId, reviewUserId } = this.props
    try {
      const url = '/api/tasks/solution' +
        `?course_id=${encodeURIComponent(courseId)}` +
        `&lesson_slug=${encodeURIComponent(lessonSlug)}` +
        `&task_id=${encodeURIComponent(taskId)}` +
        `&user_id=${encodeURIComponent(reviewUserId)}`
      const r = await fetch(url, {
        credentials: 'same-origin',
        headers: {
          'Accept': 'application/json',
        }
      })
      const { task_solution, comments } = await r.json()
      if (reviewUserId !== this.props.reviewUserId) {
        return
      }
      this.setState({
        loading: false,
        loadError: null,
        reviewUserId,
        taskSolution: task_solution,
        comments: comments,
      })
    } catch (err) {
      this.setState({
        loading: false,
        loadError: err.toString(),
      })
    }
  }

  handleMarkAsSolvedButtonClick = () => {
  }

  handleUnmarkAsSolvedButtonClick = () => {
  }

  handleAddCommentButtonClick = () => {
    this.setState({
      showAddComment: true,
    })
  }

  handleCancelAddComment = () => {
    this.setState({
      showAddComment: false,
    })
  }

  render() {
    const { loading, loadError, taskSolution, markedAsSolved, showAddComment } = this.state
    return (
      <div className='TaskReview'>
        <h4>Odevzdané řešení</h4>
        <LoadingMessage active={loading} />
        <LoadErrorMessage active={loadError} message={loadError} />
        {(this.state.reviewUserId === this.props.reviewUserId) && (
          !taskSolution ? (
            <p>–</p>
          ) : (
            <>
              <TaskSolution taskSolution={taskSolution} />
              <div>
                {!markedAsSolved ? (
                  <Button
                    color='green'
                    content='Označit za vyřešené'
                    size='small'
                    icon='check'
                    onClick={this.handleMarkAsSolvedButtonClick}
                  />
                ) : (
                  <>
                    <Icon
                      name='check'
                      color='green'
                      size='large'
                    />
                    <span className='markedSolvedLabel'>Označeno za vyřešené</span>
                    <Button
                      color='red'
                      content='Zrušit označení za vyřešené'
                      size='small'
                      icon='cancel'
                      onClick={this.handleUnmarkAsSolvedButtonClick}
                    />
                  </>
                )}
                <Button
                  color='teal'
                  content='Přidat komentář'
                  size='small'
                  icon='comment alternate'
                  onClick={this.handleAddCommentButtonClick}
                />
              </div>
              <TaskComments
                addComment={showAddComment}
                onCancelAddComment={this.handleCancelAddComment}
              />
            </>
          )
        )}
        <style jsx>{`
          .TaskReview {
            margin-top: 1rem;
          }
          .markedSolvedLabel {
            margin-right: 1em;
          }
        `}</style>
      </div>
    )
  }

}
