import { Environment, Network, RecordSource, Store } from 'relay-runtime'
import fetch from 'isomorphic-unfetch'
import { SubscriptionClient } from 'subscriptions-transport-ws'

const relayEndpoint = process.browser ? '/api/graphql' : (process.env.RELAY_ENDPOINT || 'http://127.0.0.1:5000/api/graphql')

function getWsUrl() {
  if (!process.browser) {
    throw new Error('Websockets are supposed to be used only in browser')
  }
  const wsProtocol = (window.location.protocol === 'http:') ? 'ws:' : 'wss://'
  return `${wsProtocol}://{window.location.host}/api/subscriptions`
}

// Define a function that fetches the results of an operation (query/mutation/etc)
// and returns its results as a Promise:
function getFetchQuery(req) {
  return async function fetchQuery(operation, variables, cacheConfig, uploadables) {
    const headers = {
      Accept: 'application/json',
      'Content-Type': 'application/json',
    }
    if (req && req.headers) {
      if (process.browser) {
        throw new Error('req is supposed to be only on server, from getInitialProps')
      }
      headers['Cookie'] = req.headers['cookie']
    }
    const r = await fetch(relayEndpoint, {
      method: 'POST',
      headers, // Add authentication and other headers here
      body: JSON.stringify({
        query: operation.text, // GraphQL text from input
        variables
      })
    })
    if (r.status != 200) {
      const rawText = await r.text()
      const text = JSON.stringify(rawText).slice(0, 1000)
      throw new Error(`POST ${relayEndpoint} failed with status ${r.status}: ${text}`)
    }
    const data = await r.json()
    return data
  }
}

let subscriptionClient = null
let wsUrl = null

function setupSubscription(config, variables, cacheConfig, observer) {
  // https://github.com/facebook/relay/issues/1655#issuecomment-349957415
  const onNext = (result) => {
    console.debug(`subscriptionClient -> observer.onNext(${JSON.stringify(result)})`)
    observer.onNext(result)
  }
  const onError = (error) => {
    console.debug(`subscriptionClient -> observer.onError(${JSON.stringify(error)})`)
    observer.onError(error)
  }
  const onComplete = () => {
    console.debug(`subscriptionClient -> observer.onCompleted()`)
    observer.onCompleted()
  }
  const query = config.text
  if (!subscriptionClient) {
    wsUrl = getWsUrl()
    console.debug(`Connecting to ${wsUrl}`)
    subscriptionClient = new SubscriptionClient(wsUrl, { reconnect: true })
  } else {
    console.debug(`Reusing already existing subscriptionClient to ${wsUrl}`)
  }
  const client = subscriptionClient.request({ query, variables }).subscribe(
    onNext,
    onError,
    onComplete
  )
  return {
    dispose: () => {
      console.info('setupSubscription dispose')
      client.unsubscribe()
    }
  }
}


let relayEnvironment = null

export function getRelayEnvironment() {
  if (!process.browser) {
    throw new Error('This is supposed to be used only in browser')
  }
  if (!relayEnvironment) {
    throw new Error('relayEnvironment not initialized')
  }
  return relayEnvironment
}

export function initRelayEnvironment ({ req, records = {} } = {}) {
  // Make sure to create a new Relay environment for every server-side request so that data
  // isn't shared between connections (which would be bad)
  if (!process.browser) {
    return new Environment({
      network: Network.create(getFetchQuery(req)),
      store: new Store(new RecordSource(records))
    })
  }

  // reuse Relay environment on client-side
  if (!relayEnvironment) {
    relayEnvironment = new Environment({
      network: Network.create(getFetchQuery(req), setupSubscription),
      store: new Store(new RecordSource(records))
    })
  }

  return relayEnvironment
}
