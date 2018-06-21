import Head from 'next/head'

export default ({ children }) => (
  <div>
    <Head>
      <title>Pyladies Courseware</title>
      <link rel="stylesheet" href="//cdnjs.cloudflare.com/ajax/libs/semantic-ui/2.3.1/semantic.min.css" />
    </Head>
    <div style={{ margin: '1em auto', maxWidth: 700, padding: 12 }}>
      {children}
    </div>
  </div>
)
