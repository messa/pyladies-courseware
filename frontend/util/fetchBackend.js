import fetch from 'isomorphic-unfetch'

export const fetchBackendJSON = async (req, path) => {
  const res = await fetchBackend(req, path)
  const data = await res.json()
  console.debug(`backend ${path} -> ${JSON.stringify(data)}`)
  return data
}

export const fetchBackend = async (req, path) => {
  if (req) {
    return await fetchBackendFromNode(req, path)
  } else {
    return await fetchBackendFromBrowser(path)
  }
}

const fetchBackendFromNode = async (req, path) => {
  console.debug(`Calling backend: ${path}`)
  const backendUrl = 'http://127.0.0.1:5000'
  const res = await fetch(backendUrl + path, {
    headers: {
      'Cookie': req.headers['cookie'],
    },
  })
  return res
}

const fetchBackendFromBrowser = async (path) => {
  return await fetch(path, {
    credentials: 'include'
  })
}
