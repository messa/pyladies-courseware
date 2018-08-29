import React from 'react'
import Head from 'next/head'

import {Controlled as CodeMirror} from 'react-codemirror2'

export default class extends React.Component {

  state = {
    showEditor: false,
  }

  componentDidMount() {
    require('codemirror/mode/python/python.js')
    this.setState({ showEditor: true })
  }


  handleEditorDidMount = editor => {
    // bez toho refreshe se ukaze prazdny element; chtello by to asi resit lepe
    setTimeout(() => editor.refresh(), 10)
    setTimeout(() => editor.refresh(), 1000)
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
