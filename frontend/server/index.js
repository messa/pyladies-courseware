const express = require('express')
const next = require('next')

const port = parseInt(process.env.PORT, 10) || 3000
const dev = process.env.NODE_ENV !== 'production'
const app = next({ dev })
const handle = app.getRequestHandler()

app.prepare().then(() => {
  server = express()

  if (dev || process.env.BACKEND_PROXY) {
    const { createProxyMiddleware } = require('http-proxy-middleware')
    const backendUrl = process.env.BACKEND_URL || 'http://127.0.0.1:5000'
    server.use(createProxyMiddleware(['/api/', '/auth/'], { target: backendUrl }))
  }

  server.get('*', (req, res) => handle(req, res))

  server.listen(port, err => {
    if (err) throw err
    console.log(`> Ready on http://localhost:${port}`)
  })
})
