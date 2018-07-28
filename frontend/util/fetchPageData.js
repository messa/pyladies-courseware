import fetchFromBackend from './fetchFromBackend'

const runningOnServer = typeof window === 'undefined'
// cache only in browser
const enableCache = !runningOnServer
const cached = enableCache ? {} : null

export default async function fetchPageData(req, queriesByOutKey) {
  queriesByOutKey['user'] = 'user' // we want user info always
  const outKeys = Object.keys(queriesByOutKey)
  const serializedQueries = outKeys.map(k => JSON.stringify(queriesByOutKey[k]))
  let coveredByCache = true
  const alreadyProcessed = {}
  const toFetch = []
  const resultsBySQ = {}
  serializedQueries.forEach(sq => {
    if (!alreadyProcessed[sq]) {
      alreadyProcessed[sq] = true
      toFetch.push(sq)
      if (enableCache && cached[sq]) {
        resultsBySQ[sq] = cached[sq]
      } else {
        coveredByCache = false
      }
    }
  })
  if (!coveredByCache) {
    toFetch.sort()
    const payload = '[' + toFetch.join(',') + ']'
    const reply = await fetchFromBackend(req, '/api/page-data?q=' + encodeURIComponent(payload))
    if (reply.length !== toFetch.length) {
      throw new Error('page-data: reply.length !== toFetch.length')
    }
    toFetch.forEach((sq, i) => {
      resultsBySQ[sq] = reply[i]
      if (enableCache) {
        cached[sq] = reply[i]
      }
    })
  }
  const out = {}
  outKeys.forEach((key, i) => {
    const sq = serializedQueries[i]
    out[key] = resultsBySQ[sq]
  })
  return out
}
