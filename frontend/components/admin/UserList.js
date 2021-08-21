import React from 'react'
import { createFragmentContainer, graphql } from 'react-relay'
import { Button, Table } from 'semantic-ui-react'
import ALink from '../ALink'

class UserList extends React.Component {

  state = {
    loading: true,
    error: null,
    items: null,
  }

  // componentDidMount() {
  //   this.fetchData()
  // }

  // async fetchData() {
  //   try {
  //     const r = await fetch('/api/admin/users', {
  //       headers: {
  //         'Accept-Type': 'application/json',
  //       },
  //       credentials: 'same-origin',
  //     })
  //     const { items } = await r.json()
  //     this.setState({
  //       loading: false,
  //       items,
  //     })
  //   } catch (err) {
  //     this.setState({
  //       loading: false,
  //       error: err.toString()
  //     })
  //   }
  // }

  render() {
    const { allUsers } = this.props
    return (
      <div>
        {allUsers && (
          <UserListView
            items={allUsers.edges.map(edge => edge.node)}
          />
        )}
      </div>
    )
  }

}

function UserListView({ items }) {
  return (
    <Table size='small' basic='very' unstackable className='admin'>
      <Table.Header>
        <Table.Row>
          <Table.HeaderCell>Id</Table.HeaderCell>
          <Table.HeaderCell>Name</Table.HeaderCell>
          <Table.HeaderCell>Roles</Table.HeaderCell>
          <Table.HeaderCell>Date created &amp; last active</Table.HeaderCell>
          <Table.HeaderCell></Table.HeaderCell>
        </Table.Row>
      </Table.Header>
      <Table.Body>
        {items.map(user => (
          <Table.Row key={user.id}>
            <Table.Cell><code><small>{user.id}</small></code></Table.Cell>
            <Table.Cell>
              <strong>{user.name}</strong><br />
              {user.email}
              {user.dev_login && (
                <div>Dev login</div>
              )}
              {user.fb_id && (
                <div>FB: <small>{user.fb_id}</small></div>
              )}
              {user.google_id && (
                <div>Google: <a href={`https://plus.google.com/${user.google_id}`}><small>{user.google_id}</small></a></div>
              )}
            </Table.Cell>
            <Table.Cell><UserRoles user={user} /></Table.Cell>
            <Table.Cell><UserDate user={user} /></Table.Cell>
            <Table.Cell><UserActions user={user} /></Table.Cell>
          </Table.Row>
        ))}
      </Table.Body>
    </Table>
  )
}

function UserRoles({ user }) {
  return (
    <>
      {user.isAdmin && (
        <div><strong>Admin</strong></div>
      )}
      {user.coached_course_ids && user.coached_course_ids.map(courseId => (
        <div key={courseId}><strong>Coach:</strong> <code>{courseId}</code></div>
      ))}
      {user.attended_course_ids && user.attended_course_ids.map(courseId => (
        <div key={courseId}>Student: <code>{courseId}</code></div>
      ))}
    </>
  )
}

function UserDate({ user }) {
  return (
    <>
    </>
  )
}

function UserActions({ user }) {
  return (
    <>
      <Button
        basic
        icon='magnify'
        size='small'
        as={ALink}
        href={{
          pathname: '/admin/users/detail',
          query: { userId: user.id }
        }}
      />
    </>
  )
}

export default createFragmentContainer(UserList, {
  allUsers: graphql`
    fragment UserList_allUsers on UserConnection {
      edges {
        node {
          id
          userId
          name
          isAdmin
        }
      }
    }
  `,
})
