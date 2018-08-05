import React from 'react'

export default class extends React.Component {

  state = {
    page: 1,
  }

  componentDidMount() {
    this.fetchData()
  }

  async fetchData() {
    const r = await fetch('/api/admin/users', {
      headers: {
        'Accept-Type': 'application/json',
      },
      credentials: 'same-origin',
    })
    const { items, paging } = await r.json()
  }

  render() {
    return (
      <div>
        user table
      </div>
    )
  }

}
