import React from 'react'
import { Button } from 'semantic-ui-react'
import CodeEditor from './CodeEditor'

const defaultCode = ''

export default class TaskSubmission extends React.Component {

  constructor(props) {
    super(props)
    this.state = {
      code: props.code || defaultCode
    }
  }

  handleCodeChange = (newValue) => {
    if (!this.props.loading) {
      this.setState({ code: newValue })
    }
  }

  handleSubmitClick = () => {
    const { code } = this.state
    this.props.onSubmit({ code })
  }

  handleCancelClick = () => {
    this.props.onCancel()
  }

  render() {
    const { loading } = this.props
    const { code } = this.state
    return (
      <div className='TaskSubmitForm'>
        <CodeEditor
          value={code}
          onValueChange={this.handleCodeChange}
          disabled={loading}
        />
        <div style={{ marginTop: 10 }}>
          <Button
            size='small'
            primary
            icon='send'
            content='Odeslat'
            onClick={this.handleSubmitClick}
            loading={loading}
            disabled={loading}
          />
          <Button
            size='small'
            color='red'
            icon='cancel'
            content='Zrušit'
            onClick={this.handleCancelClick}
            loading={loading}
            disabled={loading}
          />
        </div>
      </div>
    )
  }

}
