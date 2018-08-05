import React from 'react'
import { Button, Form, Checkbox } from 'semantic-ui-react'

export default class RegistrationForm extends React.Component {

  state = {
    email: '',
    name: '',
    password: '',
    password2: '',
  }

  handleInputChange = ({ target }) => {
    this.setState({ [target.name] : target.value })
  }

  render() {
    const { email, name, password, password2 } = this.state
    return (
      <div className='RegistrationForm'>
        <Form>
          <Form.Input
            required inline name='email' label='E-mail:' id='reg-email-input'
            type='email' value={email} onChange={this.handleInputChange}
          />
          <Form.Input
            inline name='name' label='Jméno:' id='reg-name-input'
            type='text' value={name} onChange={this.handleInputChange}
          />
          <Form.Input
            required inline name='password' label='Heslo:' id='reg-password-input'
            type='password' value={password} onChange={this.handleInputChange}
          />
          <Form.Input
            required inline name='password2' label='Heslo znovu:' id='reg-password2-input'
            type='password' value={password2} onChange={this.handleInputChange}
          />
        <Form.Button primary size='small'>Zaregistrovat se</Form.Button>
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
