import React from 'react'
import { Button, Table } from 'semantic-ui-react'
import ALink from '../ALink'

export default class extends React.Component {

  state = {
    loading: true,
    error: null,
    detailUser: null,
  }

  componentDidMount() {
    this.fetchData()
  }

  async fetchData() {
    try {
      const { detailUserId } = this.props
      const r = await fetch(`/api/admin/user/${detailUserId}`, {
        headers: {
          'Accept-Type': 'application/json',
        },
        credentials: 'same-origin',
      })
      const { user } = await r.json()
      this.setState({
        loading: false,
        detailUser: user,
      })
    } catch (err) {
      this.setState({
        loading: false,
        error: err.toString(),
      })
    }
  }

  render() {
    const { detailUser } = this.state
    return (
      <div>
        {detailUser && <UserDetailView detailUser={detailUser} />}
      </div>
    )
  }

}

const UserDetailView = ({ detailUser }) => (
  <pre>{JSON.stringify(detailUser, null, 2)}</pre>
)
