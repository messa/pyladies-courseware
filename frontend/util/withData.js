import React from 'react'
import { fetchQuery, ReactRelayContext } from 'react-relay'
import { initRelayEnvironment } from './relayEnvironment'

export default (ComposedComponent, options = {}) => {
  return class WithData extends React.Component {
    static displayName = `WithData(${ComposedComponent.displayName})`

    static async getInitialProps (ctx) {
      // Evaluate the composed component's getInitialProps()
      let composedInitialProps = {}
      if (ComposedComponent.getInitialProps) {
        composedInitialProps = await ComposedComponent.getInitialProps(ctx)
      }

      let queryProps = {}
      let queryRecords = {}
      const environment = initRelayEnvironment({ req: ctx.req })

      if (options.query) {
        let queryVariables = {}
        if (options.variables) {
          queryVariables = options.variables(ctx)
        }
        // TODO: Consider RelayQueryResponseCache
        // https://github.com/facebook/relay/issues/1687#issuecomment-302931855
        try {
          queryProps = await fetchQuery(environment, options.query, queryVariables)
        } catch (e) {
          throw new Error(`fetchQuery failed: ${e}`)
        }
        queryRecords = environment
          .getStore()
          .getSource()
          .toJSON()
      }

      return {
        ...composedInitialProps,
        ...queryProps,
        queryRecords
      }
    }

    constructor (props) {
      super(props)
      this.environment = initRelayEnvironment({
        records: props.queryRecords
      })
    }

    render () {
      return (
        <ReactRelayContext.Provider value={{ environment: this.environment, variables: {} }}>
          <ComposedComponent {...this.props} />
        </ReactRelayContext.Provider>
      )
    }
  }
}
