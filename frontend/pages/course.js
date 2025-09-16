import React from 'react'
import Link from 'next/link'
import { Button, Message } from 'semantic-ui-react'
import Layout from '../components/Layout'
import fetchPageData from '../util/fetchPageData'
import ALink from '../components/ALink'
import MaterialItems from '../components/MaterialItems'
import formatDate from '../util/formatDate'

function arrayContains(array, item) {
  return array && array.indexOf(item) !== -1
}

function UnreviewedSolutionsHint(props) {
  if (!props.session.hasOwnProperty('unreviewed-count')) return null;

  const count = props.session['unreviewed-count'];
  if (count > 0) {
    return (
        <b title={`V této lekci jsou neopravené úkoly (${count})`} className='notification'>&nbsp;(*{count})</b>
    );
  }
  return null;
}

export default class extends React.Component {

  state = {
    attendInProgress: false,
    attendError: null,
  }

  static async getInitialProps({ req, query }) {
    const courseId = query.course
    const data = await fetchPageData(req, {
      course: { 'course_detail': { 'course_id': courseId, 'check-unreviewed': true } },
    })
    return { courseId, ...data }
  }

  handleEnrollClick = async () => {
    this.setState({
      attendInProgress: true,
    })
    try {
      const { user, courseId } = this.props
      const payload = {
        'course_id': courseId,
      }
      const r = await fetch('/api/users/attend-course', {
        method: 'POST',
        credentials: 'same-origin',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      })
      const { not_logged_in, attended_course_ids } = await r.json()
      if (not_logged_in) {
        window.location = '/login'
        return
      }
      this.setState({
        attendInProgress: false,
      })
      window.location.reload()
    } catch (err) {
      this.setState({
        attendInProgress: false,
        attendError: err.toString(),
      })
    }
  }

  handleCourseReloadClick = async () => {
    const { user, courseId } = this.props
    try {
      const r = await fetch('/api/admin/course/' + courseId + '/reload_course')
      await r.json()
    } finally { window.location = '/course?course=' + courseId }
  }

  render() {
    const { user, courseId, course } = this.props
    const { attendInProgress, attendError } = this.state
    const belongToCourse = user && (
      user['is_admin'] ||
      arrayContains(user['attended_course_ids'], courseId) ||
      arrayContains(user['coached_course_ids'], courseId)
    )
    return (
      <Layout user={this.props.user} width={1000}>

        <div className='overview'>

          <h1 className='course-title'>
            <strong dangerouslySetInnerHTML={{__html: course['title_html']}} />
            {course['subtitle_html'] && (
              <div dangerouslySetInnerHTML={{__html: course['subtitle_html']}} />
            )}
          </h1>

          <div
            className='course-description'
            dangerouslySetInnerHTML={{__html: course['description_html']}}
          />
          {course['allows_registration'] && (
            <div className='course-button-groups'>
              {attendError && (
                <div>
                  <Message
                    negative compact
                    content={attendError}
                  />
                </div>
              )}
              <Button.Group>
                <Button
                  primary
                  onClick={this.handleEnrollClick}
                  disabled={belongToCourse || attendInProgress}
                  loading={attendInProgress}
                  content={belongToCourse ? 'Jste součástí kurzu' : 'Přihlásit se do kurzu'}
                />
              </Button.Group>
            </div>
          )}
          {user && user['is_admin'] && (
            <div className='course-button-groups'>
              <Button.Group>
                <Button
                  primary
                  onClick={this.handleCourseReloadClick}
                  content='Přenačíst kurz'
                />
              </Button.Group>
            </div>
          )}

        </div>

        <div className='sessions'>

          {course['sessions'].map(session => (
            <div key={session['slug']} className='session'>

              <h2 className='session-title'>
                <span dangerouslySetInnerHTML={{__html: session['title_html']}} />
                <UnreviewedSolutionsHint session={session} />
              </h2>
              <div className='sessionDate'>{formatDate(session['date'])}</div>

              <MaterialItems materialItems={session['material_items']} />

              {session['has_tasks'] && (
                <div>
                  <Button
                    as={ALink}
                    href={{
                      pathname: '/session',
                      query: { course: course.id, session: session['slug'] }
                    }}
                    basic
                    color='blue'
                    content='Domácí projekty'
                    size='small'
                    icon='home'
                  />
                </div>
              )}

            </div>
          ))}

        </div>

        <style jsx>{`
          h1 {
            color: #634;
            text-align: center;
            margin: 1.5rem 0;
            font-size: 30px;
            font-weight: 300;
          }
          @media (max-width: 600px) {
            h1 {
              font-size: 22px;
            }
            .course-description {
              font-size: 14px;
            }
          }
          h1 strong {
            font-weight: 800;
          }
          .overview {
            max-width: 800px;
            margin: 2rem auto 3rem auto;
            padding: 0 16px;
          }
          .overview .course-description {
            max-width: 550px;
            margin: 0 auto;
          }
          .overview .course-button-groups {
            text-align: center;
            max-width: 550px;
            margin: 0 auto;
          }
          .sessions {
            max-width: 1100px;
            margin: 2rem auto;
            padding: 0 16px;
          }
          @media (min-width: 700px) {
            .sessions {
              columns: 2;
            }
          }
          .session {
            margin-bottom: 3rem;
            break-inside: avoid;
          }
          @media (min-width: 600px) {
            .session :global(li) {
              font-size: 16px;
              line-height: 23px;
            }
          }
          .session .session-title {
            margin-bottom: 5px;
            xcolor: #503;
            color: #789;
            font-weight: 400;
            font-size: 24px;
          }
          @media (max-width: 600px) {
            .session .session-title {
              font-size: 21px;
            }
          }
          .session .sessionDate {
            white-space: nowrap;
            font-size: 14px;
            font-weight: 400;
            color: #666;
          }
        `}</style>

      </Layout>
    )
  }
}
