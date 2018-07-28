
export default ({ lessonItems }) => {
  return (
    <ul>
      {lessonItems.map((item, i) => (
        <li key={i}>
          <LessonItem lessonItem={item} />
        </li>
      ))}
    </ul>
  )
}

const LessonItem = ({ lessonItem }) => {
  if (lessonItem['lesson_item_type'] === 'attachment') {
    return (
      <a href={lessonItem['url']}>
        <span dangerouslySetInnerHTML={{__html: lessonItem['title_html']}} />
      </a>
    )
  }
  if (lessonItem['lesson_item_type'] === 'lesson') {
    return (
      <a href={lessonItem['url']}>
        <span dangerouslySetInnerHTML={{__html: lessonItem['title_html']}} />
      </a>
    )
  }
  if (lessonItem['lesson_item_type'] === 'cheatsheet') {
    return (
      <a href={lessonItem['url']}>
        <span dangerouslySetInnerHTML={{__html: lessonItem['title_html']}} />
      </a>
    )
  }
  if (lessonItem['lesson_item_type'] === 'text') {
    return (
      <span dangerouslySetInnerHTML={{__html: lessonItem['text_html']}} />
    )
  }
  return <code>{JSON.stringify(lessonItem)}</code>
}
