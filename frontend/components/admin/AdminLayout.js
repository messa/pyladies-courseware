import React from 'react'
import { createFragmentContainer, graphql } from 'react-relay'
import Layout from '../Layout'
import { Message } from 'semantic-ui-react'

class AdminLayout extends React.Component {

  render() {
    const { currentUser, width, children } = this.props
    const accessOK = currentUser && currentUser.isAdmin
    const content = accessOK ? children : <AccessDeniedMessage />
    return (
      <Layout activeItem='admin' currentUser={currentUser} width={accessOK ? width : 600}>
        {content}
      </Layout>
    )
  }

}

function AccessDeniedMessage() {
  return (
    <Message
      negative
      header='Access Denied'
      content='Please sign in as administrator.'
    />
  )
}

export default createFragmentContainer(AdminLayout, {
  currentUser: graphql`
    fragment AdminLayout_currentUser on User {
      ...Layout_currentUser
      isAdmin
    }
  `
})
