import React from 'react'
import LoadingMessage from '../LoadingMessage'
import LoadErrorMessage from '../LoadErrorMessage'
import TaskSolution from './TaskSolution'

export default class TaskReview extends React.Component {

  state = {
    loading: true,
    loadError: null,
    reviewUserId: null,
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

  render() {
    const { loading, loadError, taskSolution } = this.state
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
            </>
          )
        )}
        <style jsx>{`
          .TaskReview {
            margin-top: 1rem;
          }
        `}</style>
      </div>
    )
  }

}
