import React from 'react'
import { Label, Tab, Icon} from 'semantic-ui-react'

export default class extends React.Component {

  copyToClipboard = (e) => {
    var dummy = document.createElement('textarea')
    document.body.appendChild(dummy)
    dummy.value = e.currentTarget.nextSibling.innerText
    dummy.select()
    document.execCommand('copy')
    document.body.removeChild(dummy)
  }

  render() {
    const { taskSolution } = this.props
    if (!taskSolution) return null
    const currentVersion = taskSolution.currentVersion
    if (!currentVersion) return null
    const allVersions = taskSolution.allVersions
    if (!allVersions) return null
    const sortedVersions = allVersions.slice().sort(function (a, b) { return b.date.localeCompare(a.date) })
    const copyToClipboard = this.copyToClipboard
    var cntr = sortedVersions.length
    const panes = sortedVersions.slice(0, 8).map(
      function (v) {
        name = 'Verze ' + cntr
        cntr -= 1
        return {
          menuItem: name,
          render: () => <Tab.Pane>
            <div className='TaskSolution'>
              <Label attached='bottom right'>{v.date}</Label>
              <Label
                attached='bottom left'
                as='button'
                onClick={copyToClipboard}>
                <Icon name='copy'/>
                <Label.Detail>Kopírovat</Label.Detail>
              </Label>
              <pre>{v.code}</pre>
              <style jsx>{`
                .TaskSolution pre {
                  overflow-x: auto;
                }
              `}</style>
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
