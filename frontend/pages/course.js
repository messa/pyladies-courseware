import Link from 'next/link'
import Layout from '../components/Layout'

export default () => (
  <Layout>
    <h1>Demo kurz</h1>

    <h2>Lekce</h2>

    <p>
      <Link href={{ pathname: '/lesson', query: { courseId: 'c1', lessonId: 'l1' }}}><a>
        Slovníky
      </a></Link>
    </p>

  </Layout>
)
