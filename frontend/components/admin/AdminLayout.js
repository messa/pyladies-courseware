import React from 'react'
import Layout from '../Layout'
import { Message } from 'semantic-ui-react'

export default class AdminLayout extends React.Component {

  render() {
    const { user, width, children } = this.props
    const accessOK = user && user.is_admin
    const content = accessOK ? children : <AccessDeniedMessage />
    return (
      <Layout activeItem='admin' user={user} width={accessOK ? width : 600}>
        {content}
      </Layout>
    )
  }

}

const AccessDeniedMessage = () => (
  <Message
    negative
    header='Access Denied'
    content='Please sign in as administrator.'
  />
)
