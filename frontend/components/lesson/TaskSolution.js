import React from 'react'
import { Label, Tab } from 'semantic-ui-react'

export default ({ taskSolution }) => {
  if (!taskSolution) return null
  const currentVersion = taskSolution.current_version
  if (!currentVersion) return null
  const allVersions = taskSolution.all_versions
  if (!allVersions) return null
  const sortedVersions = allVersions.slice().sort(function (a, b) { return b.date.localeCompare(a.date) })
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
    <Tab panes={panes} />
  )
}
