import React from 'react'
import { Label, Tab, Icon} from 'semantic-ui-react'
import {Controlled as CodeMirror} from 'react-codemirror2'

function SourceCode(props) {
  const code = props.code;
  const options = {
    mode: 'python',
    lineNumbers: true,
    readOnly: 'nocursor',
    scrollbarStyle: null,
  };

  return (
      <>
        <CodeMirror
            value={code}
            options={options}
        />
        <style jsx global>{`
          .CodeMirror {
            height: auto;
          }
          .CodeMirror-scroll {
            overflow: hidden !important;
          }
        `}</style>
      </>
    );
}

export default class extends React.Component {

  copyToClipboard = (code) => {
    var dummy = document.createElement('textarea')
    document.body.appendChild(dummy)
    dummy.value = code
    dummy.select()
    document.execCommand('copy')
    document.body.removeChild(dummy)
  }

  render() {
    const { taskSolution } = this.props
    if (!taskSolution) return null
    const currentVersion = taskSolution.current_version
    if (!currentVersion) return null
    const allVersions = taskSolution.all_versions
    if (!allVersions) return null
    const sortedVersions = allVersions.slice().sort(function (a, b) { return b.date.localeCompare(a.date) })
    var cntr = sortedVersions.length
    const panes = sortedVersions.slice(0, 8).map(
      (v) => {
        const name = 'Verze ' + cntr
        cntr -= 1
        return {
          menuItem: name,
          render: () => <Tab.Pane style={{padding: 0}}>
            <div className='TaskSolution'>
              <Label attached='bottom right'>{v.date}</Label>
              <Label
                attached='bottom left'
                as='button'
                onClick={() => this.copyToClipboard(v.code)}>
                <Icon name='copy'/>
                <Label.Detail>Kopírovat</Label.Detail>
              </Label>
              <SourceCode code={v.code} />
            </div>
          </Tab.Pane>
        }
      })
    return (
      <div className='TaskSolutionTab'>
        <Tab panes={panes}/>
        <style jsx global>{`
          .TaskSolutionTab {
            margin-bottom: 1rem;
          }
        `}</style>
      </div>
    )
  }
}
