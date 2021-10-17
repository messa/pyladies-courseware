import React from 'react'
import { Label, Tab, Icon, Accordion } from 'semantic-ui-react'

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
    const currentVersion = taskSolution.current_version
    if (!currentVersion) return null
    const allVersions = taskSolution.all_versions
    if (!allVersions) return null
    const sortedVersions = allVersions.slice().sort(function (a, b) { return b.date.localeCompare(a.date) })
    const copyToClipboard = this.copyToClipboard
    var cntr = sortedVersions.length
    const panes = sortedVersions.slice(0, 8).map(
      function (v) {
        // console.log(v)
        name = 'Verze ' + cntr
        cntr -= 1
        const test_results = v.test_result && ('tests' in v.test_result) ? v.test_result.tests.map((test, i) => {
          const test_name = test.nodeid.split('::', 2)[1]
          return {
            key: test_name,
            title: {
              content: (
                <span style={{ color: test.outcome == 'failed' ? 'red' : 'green' }} > {test_name} </span>
              )
            },
            content: {
              content: test.outcome == 'failed' ? (
                <pre className='code'>
                  {test.call.longrepr}
                </pre >
              ) : ('Vše v pořádku')
            }
          }
        }) : []
        const collector_results = v.test_result && ('collectors' in v.test_result) ? v.test_result.collectors.filter(c => c.nodeid && c.outcome == 'failed').map((collector, i) => {
          const collector_name = collector.nodeid
          return {
            key: collector_name,
            title: {
              content: (
                <span style={{ color: 'red' }} > {collector_name} </span>
              )
            },
            content: {
              content: (
                <pre className='code'>
                  {collector.longrepr}
                </pre >
              )
            }
          }
        }) : []
        const combined_tests_results = collector_results.concat(test_results)
        return {
          menuItem: name,
          render: () => <Tab.Pane>
            <div className='TaskSolution'>
              <Label attached='bottom right'>{v.date}</Label>
              <Label
                attached='bottom left'
                as='button'
                onClick={copyToClipboard}>
                <Icon name='copy' />
                <Label.Detail>Kopírovat</Label.Detail>
              </Label>
              <pre className='code'>{v.code}</pre>
              {combined_tests_results.length > 0 && (
                <Accordion panels={combined_tests_results} styled fluid />
              )}
            </div>
          </Tab.Pane>
        }
      })
    return (
      <div className='TaskSolutionTab' >
        <Tab panes={panes} />
        <style jsx global>{`
          .TaskSolutionTab {
            margin-bottom: 1rem;
          }
        `}</style>
      </div>
    )
  }
}
