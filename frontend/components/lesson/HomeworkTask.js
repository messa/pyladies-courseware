import TaskSubmission from '../../components/TaskSubmission'

export default ({ taskItem, userCanSubmitTask, courseId, sessionSlug, reviewTaskId }) => (
  <div className='homework-task'>
    <div className='number'>{taskItem['number']}.</div>
    <div className='homework-body'>
      {taskItem.mandatory && (
        <div className='mandatory-sign'>☜</div>
      )}
      <span dangerouslySetInnerHTML={{__html: taskItem['text_html'] }} />
    </div>
    {!reviewTaskId && userCanSubmitTask && taskItem.submit && (
      <TaskSubmission
        courseId={courseId}
        sessionSlug={sessionSlug}
        taskId={taskItem.id}
      />
    )}
    <style jsx>{`
      .homework-task {
        margin: 2rem 0;
        padding-left: 1.8rem;
        position: relative;
      }
      .homework-task .number {
        position: absolute;
        left: 0;
        font-weight: 600;
      }
      .homework-task .mandatory-sign {
        position: absolute;
        right: 0;
        margin-top: 4px;
        font-weight: 600;
        font-size: 36px;
      }
      .homework-body :global(pre),
      .homework-body :global(code) {
        font-family: monospace;
        font-size: 14px;
        color: #360;
      }
      .homework-body :global(table) {
        border-collapse: collapse;
        margin: 1rem 0;
      }
      .homework-body :global(th),
      .homework-body :global(td) {
        border: 1px solid #ccc;
        padding: 1px .5em;
        text-align: center;
      }
    `}</style>
  </div>
)
