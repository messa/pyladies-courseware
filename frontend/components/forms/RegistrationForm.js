import React from 'react'
import { Button, Form, Message } from 'semantic-ui-react'
import fetch from 'isomorphic-unfetch'

export default class RegistrationForm extends React.Component {

  state = {
    email: '',
    name: '',
    password: '',
    password2: '',
    password2Error: false,
    errors: [],
    loading: false,
  }

  handleInputChange = ({ target }) => {
    this.setState({ [target.name] : target.value })
  }

  handleSubmit = () => {
    const { email, name, password, password2 } = this.state
    this.setState({
      errors: [],
      loading: true,
      password2Error: false,
    })
    const errors = []
    if (email.indexOf('@') === -1) {
      errors.push('E-mail neobsahuje znak @')
    }
    if (name === '') {
      errors.push('Jméno je prázdné')
    }
    if (password === '') {
      errors.push('Heslo je prázdné')
    }
    if (password2 !== password) {
      errors.push('Zopakování hesla není shodné s heslem')
      this.setState({ password2Error: true })
    }
    if (errors.length > 0) {
      this.setState({ errors, loading: false })
    } else {
      this.sendData({ email, name, password })
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
      const res = await fetch('/auth/register', fetchOptions)
      const { errors } = await res.json()
      if (errors && errors.length) {
        this.setState({
          errors,
          loading: false,
        })
      } else {
        // redirect
        window.location = '/login?registrationSuccessfull=1'
      }
    } catch (err) {
      this.setState({
        errors: [<span key='exc'>Registrace selhala: <code>{err.toString()}</code></span>],
        loading: false,
      })
    }
  }

  render() {
    const { email, name, password, password2 } = this.state
    const { password2Error } = this.state
    const { loading, errors } = this.state
    return (
      <div className='RegistrationForm'>
        <Form onSubmit={this.handleSubmit} error={errors.length > 0}>

          {errors.length > 0 && (
            <Message error header='Vyskytly se chyby' list={errors} />
          )}

          <Form.Input
            required inline name='email' label='E-mail:' id='reg-email-input'
            type='email' value={email} onChange={this.handleInputChange}
            disabled={loading} autoComplete='email'
          />

          <Form.Input
            inline name='name' label='Jméno:' id='reg-name-input'
            type='text' value={name} onChange={this.handleInputChange}
            disabled={loading} autoComplete='name'
          />

          <Form.Input
            required inline name='password' label='Heslo:' id='reg-password-input'
            type='password' value={password} onChange={this.handleInputChange}
            disabled={loading} autoComplete="new-password"
          />

          <Form.Input
            required inline name='password2' label='Heslo znovu:' id='reg-password2-input'
            type='password' value={password2} onChange={this.handleInputChange}
            disabled={loading} error={!!password2Error} autoComplete="new-password"
          />

          <Form.Input
            required inline name='privacy-ok' label=<span>Souhlasím se <a href={'/privacy'} target='_blank'>zpracováním osobních ůdajů:</a></span>
            id='reg-privacy-ok'
            type='checkbox' onChange={this.handleInputChange}
            disabled={loading} error={!!password2Error} autoComplete="new-password"
          />

          <Form.Button primary size='small' loading={loading} disabled={loading}>
            Zaregistrovat se
          </Form.Button>

        </Form>

        <style jsx>{`
          .RegistrationForm :global(input) {
            min-width: 20em;
          }
          .RegistrationForm :global(label) {
            min-width: 7em;
          }
        `}</style>
      </div>
    )
  }

}
