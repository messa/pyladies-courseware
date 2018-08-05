import React from 'react'
import { Button, Form, Checkbox } from 'semantic-ui-react'

export default class LoginForm extends React.Component {

  state = {
    email: '',
    password: '',
  }

  handleInputChange = ({ target }) => {
    this.setState({ [target.name] : target.value })
  }

  render() {
    const { email, password } = this.state
    return (
      <div className='LoginForm'>
        <Form>
          <Form.Input
            required inline name='email' label='E-mail:' id='login-email-input'
            type='email' value={email} onChange={this.handleInputChange}
          />
          <Form.Input
            required inline name='password' label='Heslo:' id='login-password-input'
            type='password' value={password} onChange={this.handleInputChange}
          />
          <Form.Button primary size='small'>Přihlásit se</Form.Button>
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
