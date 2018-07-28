import React from 'react'
import Link from 'next/link'
import Layout from '../components/Layout'
import fetchPageData from '../util/fetchPageData'

const LessonItems = ({ lessonItems }) => {
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

const monthNames = [
  'ledna', 'února', 'března', 'dubna', 'května', 'června',
  'července', 'srpna', 'září', 'října', 'listopadu', 'prosince'
]

const formatDate = (dt) => {
  dt = new Date(dt)
  return `${dt.getDate()}. ${monthNames[dt.getMonth()]} ${dt.getFullYear()}`
}

export default class extends React.Component {

  static async getInitialProps({ req, query }) {
    const { courseId } = query
    return await fetchPageData(req, {
      course: { 'course_detail': { 'course_id': courseId } },
    })
  }

  render() {
    const { course } = this.props
    return (
      <Layout user={this.props.user}>

        <h1 style={{ fontWeight: 400 }}>
          <strong dangerouslySetInnerHTML={{__html: course['title_html']}} />
          {course['subtitle_html'] && (
            <div dangerouslySetInnerHTML={{__html: course['subtitle_html']}} />
          )}
        </h1>

        <div
          className='course-description'
          dangerouslySetInnerHTML={{__html: course['description_html']}}
        />

        {course['lessons'].map(lesson => (
          <div key={lesson['slug']}>
            <h2 style={{ marginTop: '1rem' }}>
              <span dangerouslySetInnerHTML={{__html: lesson['title_html']}} />
              {' '}&nbsp;
              <small style={{ fontWeight: 300, color: '#c39' }}>
                {formatDate(lesson['date'])}
              </small>
            </h2>

            <LessonItems lessonItems={lesson['lesson_items']} />

            {lesson['homework_items'] && lesson['homework_items'].length > 0 && (
              <p>{lesson['homework_items'].length} domácí projekty</p>
            )}

          </div>
        ))}




          <br />
            <br />
              <br />
                <br />
                  <br />
                    <br />
        <br />

        <p>
          <Link href={{ pathname: '/lesson', query: { courseId: 'c1', lessonId: 'l1' }}}><a>
            Slovníky
          </a></Link>
        </p>
        <pre>{JSON.stringify({ course }, null, 2)}</pre>
      </Layout>
    )
  }
}
