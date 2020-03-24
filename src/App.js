import React, { Component } from 'react';
import { ApolloProvider } from 'react-apollo'
import gql from 'graphql-tag'
import { Query } from 'react-apollo'
import client from './client'
// import { render } from '@testing-library/react';

const ME = gql`
query me { 
  user(login: "iteachonudemy") { 
    name
    avatarUrl
  }
}
`

class App extends Component {
  
  render() {
    return (
      <ApolloProvider client={client}>
        <div>
          hello!!
        </div>

        <Query query={ME}>
          {
            ({ loading, error, data }) => {
              // loadingのスペルミスで[Legacy context API has been detected within a strict-mode tree.]等のエラー発生注意
              if (loading) return 'Loading...'
              if (error) return `Error! ${error.message}`

              return <div>{data.user.name}</div>
            }
          }
        </Query>
      </ApolloProvider>
    )
  }
}

export default App;
