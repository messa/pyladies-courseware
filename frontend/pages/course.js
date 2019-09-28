import React from 'react'
import Link from 'next/link'
import { Button, Message, Label, Input, Divider } from 'semantic-ui-react'
import Layout from '../components/Layout'
import fetchPageData from '../util/fetchPageData'
import ALink from '../components/ALink'
import MaterialItems from '../components/MaterialItems'
import formatDate from '../util/formatDate'
import { request } from 'https'

function arrayContains(array, item) {
  return array && array.indexOf(item) !== -1
}

export default class extends React.Component {

  state = {
    origin: '',
  }

  static async getInitialProps({ req, query }) {
    const courseId = query.course
    const data = await fetchPageData(req, {
      course: { 'course_detail': { 'course_id': courseId } },
    })
    return { courseId, ...data }
  }

  copyToClipboard = (e) => {
    e.currentTarget.previousSibling.select()
    document.execCommand('copy')
  }

  componentDidMount() {
    this.setState({ origin: window.location.origin })
  }

  render() {
    const { user, courseId, course } = this.props
    const { origin } = this.state
    const belongToCourse = user && (
      user['is_admin'] ||
      arrayContains(user['attended_course_ids'], courseId) ||
      arrayContains(user['coached_course_ids'], courseId)
    )
    const now = new Date()
    const courseEnd = new Date(course['end_date'])
    const activeCourse = (courseEnd >= now)
    const studentUrl = '/join-course/' + course.id + '/student'
    const coachUrl = '/join-course/' + course.id + '/coach'
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
          {activeCourse && (
            <>
              <Divider horizontal />
              <div className='course-attend'>
                {user && user['is_admin'] && (
                  <>
                    <p>
                      <Input
                        action={{
                          icon: 'copy',
                          onClick: this.copyToClipboard,
                        }}
                        label='Zápis student:'
                        readOnly
                        fluid
                        value={origin + studentUrl + '?secret=' + course.student_secret}
                      />
                    </p>
                    <p>
                      <Input
                        action={{
                          icon: 'copy',
                          onClick: this.copyToClipboard,
                        }}
                        label='Zápis kouč:'
                        readOnly
                        fluid
                        value={origin + coachUrl + '?secret=' + course.coach_secret}
                      />
                    </p>
                  </>
                )}
                <p>
                  <Button.Group>
                    <Button
                      as={ALink}
                      href={{
                        pathname: studentUrl,
                        query: { secret: course.student_secret }
                      }}
                      primary
                      disabled={belongToCourse}
                      content={belongToCourse ? 'Jste součástí kurzu' : 'Přihlásit se do kurzu'}
                    />
                  </Button.Group>
                </p>
              </div>
            </>
          )}

        </div>

        <div className='sessions'>

          {course['sessions'].map(session => (
            <div key={session['slug']} className='session'>

              <h2 className='session-title'>
                <span dangerouslySetInnerHTML={{__html: session['title_html']}} />
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
          .overview .course-attend {
            text-align: center;
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
            break-inside: avoid-column;
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
