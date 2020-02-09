import React from 'react'

function MaterialItems({ materialItems }) {
  return (
    <ul style={{ listStyle: 'none', paddingLeft: 0 }}>
      {materialItems.map((item, i) => (
        <li key={i}>
          <LessonItem materialItem={item} />
        </li>
      ))}
    </ul>
  )
}

function LessonItem({ materialItem }) {
  if (materialItem['material_item_type'] === 'attachment') {
    return (
      <a href={materialItem['url']}>
        <span dangerouslySetInnerHTML={{__html: materialItem['title_html']}} />
      </a>
    )
  }
  if (materialItem['material_item_type'] === 'lesson') {
    return (
      <a href={materialItem['url']}>
        <span dangerouslySetInnerHTML={{__html: materialItem['title_html']}} />
      </a>
    )
  }
  if (materialItem['material_item_type'] === 'cheatsheet') {
    return (
      <a href={materialItem['url']}>
        <span dangerouslySetInnerHTML={{__html: materialItem['title_html']}} />
      </a>
    )
  }
  if (materialItem['material_item_type'] === 'text') {
    return (
      <span dangerouslySetInnerHTML={{__html: materialItem['text_html']}} />
    )
  }
  return <code>{JSON.stringify(materialItem)}</code>
}

export default MaterialItems
