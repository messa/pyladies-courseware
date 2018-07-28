import React from 'react'
import { Button } from 'semantic-ui-react'
import CodeEditor from './CodeEditor'

export default class HomeworkSubmission extends React.Component {

  state = {
    code: '# sem napiš svoje řešení\n',
  }

  handleCodeChange = (newValue) => {
    this.setState({ code: newValue })
  }

  render() {
    const { code } = this.state
    return (
      <div className='HomeworkSubmitForm'>
        <CodeEditor
          value={code}
          onValueChange={this.handleCodeChange}
        />
        <div style={{ marginTop: 10 }}>
          <Button
            size='small'
            primary
            content='Odevzdat'
          />
        </div>
      </div>
    )
  }

}
