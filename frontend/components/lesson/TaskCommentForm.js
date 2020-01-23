import React from 'react'
import { Button, Comment, Form, Header } from 'semantic-ui-react'
import ErrorMessage from '../ErrorMessage'

class TaskCommentForm extends React.Component {

  state = {
    body: '',
    beingSubmitted: false,
    submitError: null,
  }

  componentDidMount() {
  }

  handleBodyChange = (e) => {
    this.setState({
      body: e.target.value,
    })
  }

  handleCancelClick = (e) => {
    e.preventDefault()
    this.setState({
      body: '',
    })
    if (this.props.onCancel) this.props.onCancel()
  }

  handleSubmit = async () => {
    const { body } = this.state
    this.setState({
      beingSubmitted: true,
    })
    try {
      await this.props.onSubmit({ body })
    } catch (err) {
      this.setState({
        beingSubmitted: false,
        submitError: err.toString(),
      })
    }
  }

  render() {
    const { submitError } = this.state
    return (
      <Form reply onSubmit={this.handleSubmit}>

        <ErrorMessage
          active={submitError !== null}
          title='Submit failed'
          message={submitError}
        />

        <Form.TextArea
          autoFocus
          autoHeight
          onChange={this.handleBodyChange}
          value={this.state.body}
        />

        <Button
          content='Přidat komentář'
          primary
          icon='edit'
          size='small'
        />

        <Button
          content='Zrušit'
          color='red'
          icon='cancel'
          size='small'
          onClick={this.handleCancelClick}
        />

      </Form>
    )
  }

}

export default TaskCommentForm
