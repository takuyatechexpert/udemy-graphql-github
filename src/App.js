import React, { Component } from 'react';
import { ApolloProvider } from 'react-apollo'
import { Query } from 'react-apollo'
import client from './client'
import { ME } from './graphql'
import { SEARCH_REPOSITORES } from './graphql'

const VARIABLES =
{
  " after": null,
  "before": null,
  "first": 5,
  "last": null,
  "query": "フロントエンドエンジニア"
}

class App extends Component {
  constructor(props) {
    super(props)

    this.state = VARIABLES
  }

  render() {
    const { query, first, last, before, after } = this.state
    return (
      <ApolloProvider client={client}>
        <Query
          query={SEARCH_REPOSITORES}
          variables={{ query, first, last, before, after }}>
          {
            ({ loading, error, data }) => {
              // loadingのスペルミスで[Legacy context API has been detected within a strict-mode tree.]等のエラー発生注意
              if (loading) return 'Loading...'
              if (error) return `Error! ${error.message}`
              console.log(data)
              return <div></div>
            }
          }
        </Query>
      </ApolloProvider>
    )
  }
}

export default App;
