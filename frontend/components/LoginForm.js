import React from 'react'
import { Button, Form, Checkbox } from 'semantic-ui-react'

export default class LoginForm extends React.Component {

  state = {
    name: '',
    password: '',
  }

  handleInputChange = ({ target }) => {
    this.setState({ [target.name] : target.value })
  }

  render() {
    const { name, password } = this.state
    return (
      <div className='LoginForm'>
        <Form>
          <Form.Input
            required inline name='name' label='Jméno:' id='name-input'
            value={name} onChange={this.handleInputChange}
          />
          <Form.Input
            required inline name='password' label='Heslo:' id='password-input'
            type='password' value={password} onChange={this.handleInputChange}
          />
          <Form.Button primary size='small'>Přihlásit se</Form.Button>
        </Form>
        <style jsx>{`
          .LoginForm :global(label) {
            min-width: 4em;
          }
        `}</style>
      </div>
    )
  }

}
