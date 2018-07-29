import React from 'react'
import { Button } from 'semantic-ui-react'
import CodeEditor from './CodeEditor'

const defaultCode = '# sem napiš svoje řešení\n'

export default class HomeworkSubmission extends React.Component {

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

  render() {
    const { loading } = this.props
    const { code } = this.state
    return (
      <div className='HomeworkSubmitForm'>
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
        </div>
      </div>
    )
  }

}
