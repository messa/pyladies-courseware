import Link from 'next/link'
import Layout from '../components/Layout'

export default () => (
  <Layout>
    <h1>Pyladies courseware</h1>

    <h2>Aktuálně běžící kurzy</h2>

    <p>
      <Link href={{ pathname: '/course', query: { courseId: 'c1' }}}><a>
        Demo
      </a></Link>
    </p>

    <h2>Proběhlé kurzy</h2>

    <p>TBD&hellip;</p>

  </Layout>
)
