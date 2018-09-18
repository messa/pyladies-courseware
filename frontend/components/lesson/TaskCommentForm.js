import React from 'react'
import { Button, Comment, Form, Header } from 'semantic-ui-react'

export default class TaskCommentForm extends React.Component {

  state = {
    body: ''
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

  render() {
    return (
      <Form reply>

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
