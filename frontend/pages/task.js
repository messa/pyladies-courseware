import React from 'react'
import Link from 'next/link'
import Layout from '../components/Layout'
import CodeEditor from '../components/CodeEditor'
import fetchPageData from '../util/fetchPageData'

export default class extends React.Component {

  static async getInitialProps({ req }) {
    return await fetchPageData(req, {})
  }

  render() {
    return (
      <Layout user={this.props.user}>
        <h1>Demo úkol</h1>

        <h2>Zadání</h2>

        <p>Lorem ipsum</p>

        <h2>Tvoje řešení</h2>

        <CodeEditor value={'def hello():\n    return 42'} />

        <br/>
        <button>Odevzdat</button>

      </Layout>
    )
  }
}
