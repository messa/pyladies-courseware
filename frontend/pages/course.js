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
        <h1>Demo kurz</h1>
        <h2>Lekce</h2>
        <p>
          <Link href={{ pathname: '/lesson', query: { courseId: 'c1', lessonId: 'l1' }}}><a>
            Slovníky
          </a></Link>
        </p>
      </Layout>
    )
  }
}
