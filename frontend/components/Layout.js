import Head from 'next/head'
import Header from './Header'

export default ({ children, user }) => (
  <div>
    <Head>
      <title>Pyladies Courseware</title>
      <meta name="viewport" content="width=device-width, user-scalable=no, initial-scale=1, shrink-to-fit=no" />
      <link rel="stylesheet" href="//cdnjs.cloudflare.com/ajax/libs/semantic-ui/2.3.1/semantic.min.css" />
      <style>{`
        a {
          color: #03c;
        }
      `}</style>
    </Head>
    <div style={{ margin: '1em auto', maxWidth: 700, padding: 12 }}>
      <Header user={user} />
      {children}
    </div>
  </div>
)
