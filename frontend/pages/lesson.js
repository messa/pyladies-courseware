import Link from 'next/link'
import Layout from '../components/Layout'

export default () => (
  <Layout>
    <h1>Demo lekce</h1>

  <p>
    <Link href={{ pathname: '/task', query: { courseId: 'c1', taskId: 't1' }}}><a>
      Úkol 1: rozdíl dvou slovníků
    </a></Link>

  </p>


  </Layout>
)
