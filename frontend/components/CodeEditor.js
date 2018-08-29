import React from 'react'
import Head from 'next/head'

import {Controlled as CodeMirror} from 'react-codemirror2'

const runningOnServer = typeof window === 'undefined'

if (!runningOnServer) {
  require('codemirror/mode/python/python.js')
}

export default class extends React.Component {

  state = {
    showEditor: !runningOnServer,
  }

  componentDidMount() {
    // if this component was rendered on server we need to enable the editor
    // only after we are on the client (browser)
    if (!this.state.showEditor) {
      this.setState({ showEditor: true })
    }
  }


  handleEditorDidMount = editor => {
    // bez editor.refresh() se driv nekdy ukazal prazdny element
    //setTimeout(() => editor.refresh(), 10)
    //setTimeout(() => editor.refresh(), 1000)
    if (this.props.focus !== false) {
      editor.focus()
    }
  }

  handleEditorBeforeChange = (editor, data, value) => {
    this.props.onValueChange(value)
  }

  render() {
    const options = {
      mode: 'python',
      theme: 'solarized',
      lineNumbers: true,
    }
    return (
      <div className='CodeEditor'>
        {!this.state.showEditor ? (
          <pre>{this.state.value}</pre>
        ) : (
          <CodeMirror
            value={this.props.value}
            options={options}
            editorDidMount={this.handleEditorDidMount}
            onBeforeChange={this.handleEditorBeforeChange}
          />
        )}
      </div>
    )
  }

}
