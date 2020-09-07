import React from 'react'

function MaterialItems({ materialItems }) {
  if (!materialItems) return null
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
  if (materialItem.materialItemType === 'attachment') {
    return (
      <a href={materialItem.url}>
        <span dangerouslySetInnerHTML={{__html: materialItem.titleHTML}} />
      </a>
    )
  }
  if (materialItem.materialItemType === 'lesson') {
    return (
      <a href={materialItem.url}>
        <span dangerouslySetInnerHTML={{__html: materialItem.titleHTML}} />
      </a>
    )
  }
  if (materialItem.materialItemType === 'cheatsheet') {
    return (
      <a href={materialItem.url}>
        <span dangerouslySetInnerHTML={{__html: materialItem.titleHTML}} />
      </a>
    )
  }
  if (materialItem.materialItemType === 'text') {
    return (
      <span dangerouslySetInnerHTML={{__html: materialItem.textHTML}} />
    )
  }
  return <code>{JSON.stringify(materialItem)}</code>
}

export default MaterialItems
