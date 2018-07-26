import React from 'react'
import Link from 'next/link'
import Layout from '../components/Layout'
import fetchPageData from '../util/fetchPageData'

export default class extends React.Component {

  static async getInitialProps({ req }) {
    return await fetchPageData(req, {})
  }

  render() {
    return (
      <Layout user={this.props.user}>
        <h1>Demo lekce</h1>

      <p>
        <Link href={{ pathname: '/task', query: { courseId: 'c1', taskId: 't1' }}}><a>
          Úkol 1: rozdíl dvou slovníků
        </a></Link>
      </p>

      </Layout>
    )
  }
}
