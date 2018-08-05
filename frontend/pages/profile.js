import React from 'react'
import Link from 'next/link'
import { Button } from 'semantic-ui-react'
import Layout from '../components/Layout'
import fetchPageData from '../util/fetchPageData'

export default class ProfilePage extends React.Component {

  static async getInitialProps({ req }) {
    return await fetchPageData(req, {
      userDetail: 'user_detail',
    })
  }

  render() {
    const { userDetail } = this.props
    return (
      <Layout user={this.props.user}>

      </Layout>
    )
  }
}
