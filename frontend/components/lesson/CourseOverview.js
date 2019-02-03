import React from 'react'
import Link from 'next/link'
import formatDate from '../../util/formatDate'

export default ({ course }) => (
  <div className='CourseOverview'>

    <div className='course-title'>
      <Link href={{ pathname: '/course', query: { course: course.id } }} prefetch><a>
        <strong dangerouslySetInnerHTML={{__html: course['title_html']}} />
        {course['subtitle_html'] && (
          <div dangerouslySetInnerHTML={{__html: course['subtitle_html']}} />
        )}
      </a></Link>
    </div>

    <ul className='lessons'>
      {course['sessions'].map(session => (
        <li key={session.slug} className='lesson'>
          <div className='lesson-title'>
            <Link href={{ pathname: '/session', query: { course: course.id, session: session.slug } }}><a>
              <span dangerouslySetInnerHTML={{__html: session['title_html']}} />
            </a></Link>
          </div>
          <div className='lessonDate'>{formatDate(session['date'])}</div>
        </li>
      ))}
    </ul>

    <style jsx>{`
      .course-title {
        font-weight: 300;
      }
      .course-title strong {
        font-weight: 700;
      }
      .course-title a {
        color: #634;
      }
      ul.lessons {
        font-size: 13px;
        line-height: 19px;
        color: #808080;
        padding-left: 0;
        list-style: none;
      }
      ul.lessons li {
        margin-top: 0.5rem;
      }
      ul.lessons .lesson-title,
      ul.lessons .lesson-title a {
        color: #789;
      }
      ul.lessons .lessonDate {
        font-size: 10px;
        text-transform: uppercase;
        font-weight: 300;
      }
    `}</style>
  </div>
)
