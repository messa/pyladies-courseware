import React from 'react'
import { Button, Form, Message } from 'semantic-ui-react'

export default class LoginForm extends React.Component {

  state = {
    email: '',
    password: '',
    errors: [],
    loading: false,
  }

  handleInputChange = ({ target }) => {
    this.setState({ [target.name] : target.value })
  }

  handleSubmit = () => {
    const { email, password } = this.state
    this.setState({
      errors: [],
      loading: true,
    })
    const errors = []
    if (email.indexOf('@') === -1) {
      errors.push('E-mail neobsahuje znak @')
    }
    if (password === '') {
      errors.push('Heslo je prázdné')
    }
    if (errors.length > 0) {
      this.setState({ errors, loading: false })
    } else {
      this.sendData({ email, password })
    }
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
      const res = await fetch('/auth/password-login', fetchOptions)
      const { errors } = await res.json()
      if (errors && errors.length) {
        this.setState({
          errors,
          loading: false,
        })
      } else {
        let nextUrl = '/'
        try {
          nextUrl = window.localStoragegetItem('cwUrlAfterLogin')
        } catch (err) {
        }
        // redirect
        window.location = nextUrl
      }
    } catch (err) {
      this.setState({
        errors: [`Přihlášení selhalo: ${err}`],
        loading: false,
      })
    }
  }
  render() {
    const { email, password } = this.state
    const { loading, errors } = this.state
    return (
      <div className='LoginForm'>
        <Form onSubmit={this.handleSubmit} error={errors.length > 0}>

          {errors.length > 0 && (
            <Message error header='Vyskytly se chyby' list={errors} />
          )}

          <Form.Input
            required inline name='email' label='E-mail:' id='login-email-input'
            type='email' value={email} onChange={this.handleInputChange}
          />

          <Form.Input
            required inline name='password' label='Heslo:' id='login-password-input'
            type='password' value={password} onChange={this.handleInputChange}
          />

          <Form.Button primary size='small' loading={loading} disabled={loading}>
            Přihlásit se
          </Form.Button>

        </Form>
        <style jsx>{`
          .LoginForm :global(input) {
            min-width: 20em;
          }
          .LoginForm :global(label) {
            min-width: 4em;
          }
        `}</style>
      </div>
    )
  }

}
