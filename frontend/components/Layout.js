import Head from 'next/head'
import { createFragmentContainer, graphql } from 'react-relay'
import Header from './Header'
import Footer from './Footer'

const Layout = ({ children, currentUser, activeItem, width }) => (
  <div className='Layout'>
    <Head>
      <title>Pyladies Courseware</title>
      <meta name="viewport" content="width=device-width, user-scalable=no, initial-scale=1.0, maximum-scale=1.0, shrink-to-fit=no" />
      <link rel="stylesheet" href="/static/font-lato/lato.css" />
      <link rel="stylesheet" href="/static/semantic-ui/semantic-2.3.3.no-font.css" />
      <link rel="stylesheet" href="/static/main2.css" />
      <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/codemirror/5.40.0/codemirror.min.css"
        integrity="sha256-I8NyGs4wjbMuBSUE40o55W6k6P7tu/7G28/JGUUYCIs=" crossOrigin="anonymous" />
      <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/codemirror/5.40.0/theme/solarized.min.css"
        integrity="sha256-v5CcBJnFb3uNFDq7uhR4sIS7yihsXlBxN+cwxjtzp7c=" crossOrigin="anonymous" />
    </Head>

    <Header currentUser={currentUser} activeItem={activeItem} />

    <div className='pageContent' style={{ maxWidth: width }}>
      {children}
    </div>

    <Footer />

    <style jsx global>{`
      .Layout {
        max-width: 1200px;
        margin: 0 auto;
        position: relative;
        min-height: 100vh;
      }
      .pageContent {
        padding-left: 1em;
        padding-right: 1em;
        max-width: 800px;
        margin: 2rem auto;
      }
    `}</style>

  </div>
)

export default createFragmentContainer(Layout, {
  currentUser: graphql`
    fragment Layout_currentUser on User {
      ...Header_currentUser
    }
  `
})
