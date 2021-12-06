import React, {PureComponent} from 'react'

import diff from 'diff_match_patch'

// This condition is required because CodeMirror does not support SSR.
let CodeMirror = null;
if (typeof window !== 'undefined' && typeof window.navigator !== 'undefined') {
  CodeMirror = require('codemirror')
  require('codemirror/addon/lint/lint.css')
  require('codemirror/addon/merge/merge.css')
  require('codemirror/addon/merge/merge')

  Object.keys(diff).forEach(key => {
    window[key] = diff[key]
  })
}

function clear(node) {
  for (let count = node.childNodes.length; count > 0; --count)
    node.removeChild(node.firstChild)
}

function buildMergeView(node, left, right) {
  CodeMirror.MergeView(node, {
    origLeft: left,
    value: right,
    origRight: null,
    allowEditingOriginals: false,
    lineNumbers: true,
    mode: 'python',
    highlightDifferences: true,
    connect: 'align',
    revertButtons: false
  })
}

class CodeDiffView extends PureComponent {
  componentDidMount() {
    const {left, right} = this.props
    buildMergeView(this._ref, left, right)
  }

  componentDidUpdate(prevProps, prevState, snapshot) {
    if (prevProps !== this.props) {
      clear(this._ref)
      buildMergeView(this._ref, this.props.left, this.props.right)
    }
  }

  render() {
    return (
      <>
        <div className='diff-view' ref={ref => this._ref = ref}/>
        <style jsx global>{`
        .diff-view {
          font-size: 12px;
        }
      `}</style>
      </>
    )
  }
}

export default CodeDiffView
