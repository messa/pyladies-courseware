import Link from 'next/link'
import Layout from '../components/Layout'
import CodeEditor from '../components/CodeEditor'

export default () => (
  <Layout>
    <h1>Demo úkol</h1>

    <h2>Zadání</h2>

    <p>Lorem ipsum</p>

    <h2>Tvoje řešení</h2>

    <CodeEditor value={'def hello():\n    return 42'} />

    <br/>
    <button>Odevzdat</button>



  </Layout>
)
