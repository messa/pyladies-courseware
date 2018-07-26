import fetch from 'isomorphic-unfetch'

export default async function fetchFromBackend(req, path) {
  const fetchOptions = {
    method: 'GET',
    headers: {
      'Accept': 'application/json',
    },
  }
  if (req) {
    // we are in node.js
    const backendUrl = process.env.BACKEND_URL || 'http://127.0.0.1:5000'
    fetchOptions.headers['Cookie'] = req.headers['cookie']
    const res = await fetch(backendUrl + path, fetchOptions)
    return await res.json()
  } else {
    // we are in browser
    fetchOptions.credentials = 'same-origin'
    const res = await fetch(path, fetchOptions)
    return await res.json()
  }
}
