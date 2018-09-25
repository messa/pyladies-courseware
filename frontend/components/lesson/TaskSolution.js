import React from 'react'

export default ({ taskSolution }) => {
  if (!taskSolution) return null
  const currentVersion = taskSolution.current_version
  if (!currentVersion) return null
  return (
    <div className='TaskSolution'>
      <pre>{currentVersion.code}</pre>
      <style jsx>{`
        .TaskSolution pre {
          overflow-x: auto;
        }
      `}</style>
    </div>
  )
}
