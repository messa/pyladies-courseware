import React from 'react'
import Head from 'next/head'
import Link from 'next/link'
import CustomHead from '../components/CustomHead'

import {Controlled as CodeMirror} from 'react-codemirror2'

if (typeof window !== 'undefined') {
}


export default class extends React.Component {

  state = {
    showEditor: false,
    value: '<h1>I ♥ react-codemirror2</h1>',
  }

  componentDidMount() {
    console.debug('Enabling editor')
    require('codemirror/mode/xml/xml.js')
    this.setState({ showEditor: true })
  }


  handleEditorDidMount = editor => {
    this.instance = editor
    // bez toho refreshe se ukaze prazdny element; chtello by to asi resit lepe
    setInterval(() => this.instance.refresh(), 50)
    setInterval(() => this.instance.refresh(), 100)
    setInterval(() => this.instance.refresh(), 250)
  }

  handleEditorBeforeChange = (editor, data, value) => {
    this.setState({value});
  }

  render() {
    const options = {
      mode: 'xml',
      theme: 'material',
      lineNumbers: true
    }
    return (
      <div>
        <CustomHead />
        <Head>
          <link rel='stylesheet' href='/static/codemirror/codemirror.css' />
          <link rel='stylesheet' href={`/static/codemirror/theme/${options.theme}.css`} />
        </Head>
        <h1>codemirror demo</h1>
        {!this.state.showEditor ? (
          <pre>{this.state.value}</pre>
        ) : (
          <CodeMirror
            value={this.state.value}
            options={options}
            editorDidMount={this.handleEditorDidMount}
            onBeforeChange={this.handleEditorBeforeChange}
          />
        )}
        <p>
          <Link href='/about'><a>About</a></Link>
        </p>
      </div>
    )
  }

}
