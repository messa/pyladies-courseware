import React from 'react'
import { Table } from 'semantic-ui-react'

export default class extends React.Component {

  state = {
    paging: null,
    items: null,
    error: null,
    loading: true,
  }

  componentDidMount() {
    this.fetchData()
  }

  async fetchData() {
    try {
      const r = await fetch('/api/admin/users', {
        headers: {
          'Accept-Type': 'application/json',
        },
        credentials: 'same-origin',
      })
      const { items, paging } = await r.json()
      this.setState({
        loading: false,
        items, paging,
      })
    } catch (err) {
      this.setState({
        loading: false,
        error: err.toString()
      })
    }
  }

  render() {
    const { items } = this.state
    return (
      <div>
        {items && <UserTable items={items} />}
      </div>
    )
  }

}

const UserTable = ({ items }) => (
  <Table celled>
    <Table.Header>
      <Table.Row>
        <Table.HeaderCell>Id</Table.HeaderCell>
        <Table.HeaderCell>Name</Table.HeaderCell>
        <Table.HeaderCell>Roles</Table.HeaderCell>
      </Table.Row>
    </Table.Header>
    <Table.Body>
      {items.map(user => (
        <Table.Row key={user.id}>
          <Table.Cell><code>{user.id}</code></Table.Cell>
          <Table.Cell>{user.name}</Table.Cell>
          <Table.Cell><UserRoles user={user} /></Table.Cell>
        </Table.Row>
      ))}
    </Table.Body>
  </Table>
)

const UserRoles = ({ user }) => (
  <>
    {user.is_admin && (
      <div>Admin</div>
    )}
    {user.coached_course_ids && user.coached_course_ids.map(courseId => (
      <div key={courseId}>Coached: <code>{courseId}</code></div>
    ))}
    {user.attended_course_ids && user.attended_course_ids.map(courseId => (
      <div key={courseId}>Attended: <code>{courseId}</code></div>
    ))}
  </>
)
