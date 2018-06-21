import React from 'react'
import Link from 'next/link'
import CustomHead from '../components/CustomHead'
import CodeEditor from '../components/CodeEditor'


export default class extends React.Component {

  state = {
    value: 'def hello():\n    return 42',
  }

  handleValueChange = value => this.setState({ value })

  render() {
    return (
      <div>
        <CustomHead />
        <h1>codemirror demo</h1>
        <CodeEditor
          value={this.state.value}
          onValueChange={this.handleValueChange}
        />
        <p>
          <Link href='/about'><a>About</a></Link>
        </p>
      </div>
    )
  }

}
