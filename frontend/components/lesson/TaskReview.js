import React from 'react'
import { Icon, Button } from 'semantic-ui-react'
import LoadingMessage from '../LoadingMessage'
import LoadErrorMessage from '../LoadErrorMessage'
import ErrorMessage from '../ErrorMessage'
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
    // saving a saveError state si udržuje přímo TaskCommentForm

    savingMarkedAsSolved: false,
    saveMarkedAsSolvedError: null,
  }

  componentDidMount() {
    this.loadData()
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
        `&session_slug=${encodeURIComponent(lessonSlug)}` +
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

  handleMarkAsSolvedButtonClick = async () => {
    await this.saveMarkedAsSolved(true)
  }

  handleUnmarkAsSolvedButtonClick = async () => {
    await this.saveMarkedAsSolved(false)
  }

  async saveMarkedAsSolved(solved) {
    this.setState({
      savingMarkedAsSolved: true,
    })
    try {
      const { taskSolution } = this.state
      const payload = {
        task_solution_id: taskSolution.id,
        solved,
      }
      const r = await fetch('/api/tasks/mark-solution-solved', {
        credentials: 'same-origin',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
        },
        method: 'POST',
        body: JSON.stringify(payload),
      })
      const { task_solution } = await r.json()
      this.setState({
        savingMarkedAsSolved: false,
        saveMarkedAsSolvedError: null,
      })
      if (task_solution.user_id !== this.props.reviewUserId) { return }
      this.setState({
        taskSolution: task_solution
      })
    } catch (err) {
      this.setState({
        savingMarkedAsSolved: false,
        saveMarkedAsSolvedError: err.toString(),
      })
    }
  }

  handleAddCommentButtonClick = () => {
    this.setState({
      showAddComment: true,
    })
  }

  handleAddCommentCancel = () => {
    this.setState({
      showAddComment: false,
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
      showAddComment: false,
    })
    if (this.props.reviewUserId !== taskSolution.user_id) { return }
    this.setState({
      comments,
    })
  }

  render() {
    const { loading, loadError, taskSolution, savingMarkedAsSolved, comments, showAddComment } = this.state
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
                {!taskSolution.is_solved ? (
                  <Button
                    color='green'
                    content='Označit za vyřešené'
                    size='small'
                    icon='check'
                    onClick={this.handleMarkAsSolvedButtonClick}
                    loading={!!savingMarkedAsSolved}
                    disabled={!!savingMarkedAsSolved}
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
                      loading={!!savingMarkedAsSolved}
                      disabled={!!savingMarkedAsSolved}
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
                comments={comments}
                addComment={showAddComment}
                onAddCommentCancel={this.handleAddCommentCancel}
                onAddCommentSubmit={this.handleAddCommentSubmit}
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
