import fetchFromBackend from './fetchFromBackend'

const cached = {}

export default async function fetchPageData(req, params) {
  const serialized = JSON.stringify(params)
  if (cached[serialized]) {
    return cached[serialized]
  }
  const data = await fetchFromBackend(req, '/api/page-data?p=' + encodeURIComponent(serialized))
  if (!req) {
    // do not cache inside node.js
    cached[serialized] = data
  }
  return data
}
