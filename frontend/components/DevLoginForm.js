import React from 'react'
import { Button, Form, Checkbox } from 'semantic-ui-react'

export default class DevLoginForm extends React.Component {

  render() {
    return (
      <Form>
        <Form.Input required inline label='Jméno:' id='dev-name-input' value='Jožin' />
        <Form.Group inline>
          <label>Přiřadit role:</label>
          <Form.Field control={Checkbox} label='Student' />
          <Form.Field control={Checkbox} label='Kouč' />
          <Form.Field control={Checkbox} label='Admin' />
        </Form.Group>
        <Form.Button primary size='small'>Přihlásit se</Form.Button>
      </Form>
    )
  }

}
