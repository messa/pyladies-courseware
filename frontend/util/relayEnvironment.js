import { Environment, Network, RecordSource, Store } from 'relay-runtime'
import fetch from 'isomorphic-unfetch'
import { SubscriptionClient } from 'subscriptions-transport-ws'

const relayEndpoint = process.browser ? '/api/graphql' : (process.env.RELAY_ENDPOINT || 'http://127.0.0.1:8080/api/graphql')
const wsUrl = 'ws://localhost:8080/api/subscriptions'

// Define a function that fetches the results of an operation (query/mutation/etc)
// and returns its results as a Promise:
async function fetchQuery(operation, variables, cacheConfig, uploadables) {
  const r = await fetch(relayEndpoint, {
    method: 'POST',
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json'
    }, // Add authentication and other headers here
    body: JSON.stringify({
      query: operation.text, // GraphQL text from input
      variables
    })
  })
  if (r.status != 200) {
    throw new Error(`POST ${relayEndpoint} failed with status ${r.status}`)
  }
  const data = await r.json()
  return data
}

let subscriptionClient = null

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

export function initRelayEnvironment ({ records = {} } = {}) {
  // Make sure to create a new Relay environment for every server-side request so that data
  // isn't shared between connections (which would be bad)
  if (!process.browser) {
    return new Environment({
      network: Network.create(fetchQuery),
      store: new Store(new RecordSource(records))
    })
  }

  // reuse Relay environment on client-side
  if (!relayEnvironment) {
    relayEnvironment = new Environment({
      network: Network.create(fetchQuery, setupSubscription),
      store: new Store(new RecordSource(records))
    })
  }

  return relayEnvironment
}
