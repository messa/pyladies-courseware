import React from 'react'
import { Button, Table, Dropdown, Form, Message } from 'semantic-ui-react'
import ALink from '../ALink'
import fetchPageData from '../../util/fetchPageData'

export default class UserDetail extends React.Component {

  state = {
    loading: true,
    error: null,
    errors: [],
    detailUser: null,
    courses: [],
  }

  componentDidMount() {
    this.fetchData()
  }

  async fetchData() {
    try {
      const { detailUserId } = this.props
      const r = await fetch(`/api/admin/user/${detailUserId}`, {
        headers: {
          'Accept-Type': 'application/json',
        },
        credentials: 'same-origin',
      })
      const { user } = await r.json()
      const { courses } = await await fetchPageData(null, { courses: 'list_courses' })
      const courses_all = courses.active.concat(courses.past)
      this.setState({
        loading: false,
        detailUser: user,
        courses: courses_all,
      })
    } catch (err) {
      this.setState({
        loading: false,
        error: err.toString(),
      })
    }
  }

  handleInputChange = ({ target }) => {
    const { detailUser } = this.state
    detailUser[target.name] = target.value === '' ? null : target.value
    this.setState({ detailUser: detailUser })
  }

  handleCheckboxChange = (e, data) => {
    const { detailUser } = this.state
    detailUser[data.name] = data.checked
    this.setState({ detailUser: detailUser })
  }

  handleCourseChange = (e, data) => {
    const { detailUser } = this.state
    detailUser[data.name] = data.value
    this.setState({ detailUser: detailUser })
  }

  handleSubmit = () => {
    const { detailUser } = this.state
    this.setState({
      errors: [],
      loading: true,
    })
    this.sendData(detailUser)
  }

  async sendData(payload) {
    const fetchOptions = {
      method: 'POST',
      credentials: 'same-origin',
      headers: {
        'Accept': 'application/json',
        "Content-Type": 'application/json',
      },
      body: JSON.stringify(payload),
    }
    try {
      const { detailUserId } = this.props
      const res = await fetch(`/api/admin/user/${detailUserId}`, fetchOptions)
      const { errors } = await res.json()
      if (errors && errors.length) {
        this.setState({
          errors,
          loading: false,
        })
      } else {
        window.location = '/admin/users'
      }
    } catch (err) {
      this.setState({
        errors: [`Aktualizace uživatele se nezdařila: ${err}`],
        loading: false,
      })
    }
  }

  render() {
    const { detailUser, courses } = this.state
    const { loading, errors } = this.state

    const courses_options = courses.map(e => ({ key: e.id, text: e.id, value: e.id,}))
    return (
      <div>
        {detailUser && (
          <Form onSubmit={this.handleSubmit} error={errors.length > 0}>
            {errors.length > 0 && (
              <Message error header='Vyskytly se chyby' list={errors} />
            )}
            <Form.Field>
              <label>ID</label>
              <input placeholder='ID' value={detailUser.id} readOnly disabled />
            </Form.Field>
            <Form.Field>
              <label>Login</label>
              <input
                placeholder='Login'
                value={detailUser.login}
                name='login'
                onChange={this.handleInputChange}
              />
            </Form.Field>
            <Form.Field>
              <label>Name</label>
              <input
                placeholder='Name'
                value={detailUser.name}
                name='name'
                onChange={this.handleInputChange}
              />
            </Form.Field>
            <Form.Field>
              <label>Email</label>
              <input
                placeholder='Email'
                value={detailUser.email === null ? '' : detailUser.email}
                name='email'
                onChange={this.handleInputChange}
              />
            </Form.Field>
            <Form.Field>
              <label>FB ID</label>
              <input
                placeholder='FB ID'
                value={detailUser.fb_id === null ? '' : detailUser.fb_id}
                name='fb_id'
                onChange={this.handleInputChange}
              />
            </Form.Field>
            <Form.Field>
              <label>Google ID</label>
              <input
                placeholder='Google ID'
                value={detailUser.goodle_id === null ? '' : detailUser.doodle_id}
                name='google_id'
                onChange={this.handleInputChange}
              />
            </Form.Field>
            <Form.Group inline>
              <Form.Checkbox
                label='Admin'
                checked={detailUser.is_admin}
                name='is_admin'
                onChange={this.handleCheckboxChange}
              />
              <Form.Checkbox
                label='Dev login'
                checked={detailUser.dev_login}
                name='dev_login'
                onChange={this.handleCheckboxChange}
              />
            </Form.Group>
            <Form.Field>
              <label>Coached</label>
              <Dropdown
                placeholder='Coach'
                fluid
                multiple
                search
                selection
                onChange={this.handleCourseChange}
                options={courses_options}
                name='coached_course_ids'
                value={detailUser.coached_course_ids}
              />
            </Form.Field>
            <Form.Field>
              <label>Study</label>
              <Dropdown
                placeholder='Studnet'
                fluid
                multiple
                search
                selection
                onChange={this.handleCourseChange}
                options={courses_options}
                name='attended_course_ids'
                value={detailUser.attended_course_ids}
              />
            </Form.Field>
            <Button
              content='Uložit'
              type='submit'
              primary
              loading={loading}
              disabled={loading}
            />
            <Button
              content='Zrušit'
              color='red'
              loading={loading}
              disabled={loading}
              as={ALink}
              href='/admin/users'
            />
          </Form>
        )}
        {detailUser && <UserDetailView detailUser={detailUser} />}
      </div>
    )
  }

}

function UserDetailView ({ detailUser }) {
  return (
    <pre>{JSON.stringify(detailUser, null, 2)}</pre>
  )
}
