import React, { Component } from 'react';
import { ApolloProvider, Mutation, Query } from 'react-apollo'
import client from './client'
import { ADD_STAR, REMOVE_STAR, SEARCH_REPOSITORIES } from './graphql'


const StarButton = props => {
  const { node, query, first, last, before, after } = props
  const totalCount = node.stargazers.totalCount
  const viewerHasStarred = node.viewerHasStarred
  const starCount = totalCount === 1 ? "1 star" : `${totalCount} stars`
  // starを押しているかどうか表示切り替え
  const StarStatus = ({ addOrRemoveStar }) => {
    return (
      <button
        onClick={
          () => addOrRemoveStar({
            variables: { input: { starrableId: node.id } },
            update: (store, {data: { addStar, removeStar }}) => {
            const { starrable } = addStar || removeStar
            console.log(starrable)
            const data = store.readQuery({
              query: SEARCH_REPOSITORIES,
              variables: { query, first, last, after, before }
            })
            const edges = data.search.edges
            const newEdges = edges.map(edge => {
              if (edge.node.id === node.id) {
                const totalCount = edge.node.stargazers.totalCount
                const diff = starrable.viewerHasStarred ? +1 : -1
                const newTotalCount = totalCount + diff
                edge.node.stargazers.totalCount = newTotalCount
              }
              return edge
            })
            data.search.edges = newEdges
            store.writeQuery({ query: SEARCH_REPOSITORIES, data})
            }
          })
        }>
        {starCount} | {viewerHasStarred ? 'starred' : '-'}
      </button>
    )
  }

  return (
    <Mutation mutation={viewerHasStarred ? REMOVE_STAR : ADD_STAR}
    // 関数のパターン
      // refetchQueries={ mutationResult => {
      //   console.log({mutationResult})
      //   return [
      //     {
      //       query: SEARCH_REPOSITORIES,
      //       variables: { query, first, last, before, after }
      //     }
      //   ]

      // }}
      // 配列パターン
      // refetchQueries={
      //    [
      //     {
      //       query: SEARCH_REPOSITORIES,
      //       variables: { query, first, last, before, after }
      //     }
      //   ]
      // }
      >

      {
        addOrRemoveStar => <StarStatus addOrRemoveStar={addOrRemoveStar} />
      }
    </Mutation>
  )
}

const PER_PAGE = 5
const DEFAULT_STATE =
{
  "after": null,
  "before": null,
  "first": PER_PAGE,
  "last": null,
  "query": ""
}

class App extends Component {
  constructor(props) {
    super(props)

    this.state = DEFAULT_STATE

    this.myRef = React.createRef()
    // constructorで初期化の際にrefを生成する
    // refとは
    // reactの要素
    // ユニークな参照用のオブジェクトをrefと言う属性でDOM割り当てて
    // そのDOM要素にアクセスする

    this.handleSubmit = this.handleSubmit.bind(this)
  }

  handleSubmit(event) {
    event.preventDefault()

    this.setState({
      query: this.myRef.current.value
      // submitが押された時にtext fromのvalueを取得してqueryを更新している
      // setStateで更新
    })
  }

  // nextボタンを押した時の動作
  goNext(search) {
    this.setState({
      first: PER_PAGE,
      after: search.pageInfo.endCursor,
      last: null,
      before: null
    })
  }

  // previousボタンを押した時の動作
  goPrevious(search) {
    this.setState({
      first: null,
      after: null,
      last: PER_PAGE,
      before: search.pageInfo.startCursor
    })
  }

  render() {
    const { query, first, last, before, after } = this.state
    return (
      <ApolloProvider client={client}>
        <form onSubmit={this.handleSubmit}>
          <input ref={this.myRef} />
          <input type="submit" value="Submit" />
        </form>
        <Query
          query={SEARCH_REPOSITORIES}
          variables={{ query, first, last, before, after }}>
          {
            ({ loading, error, data }) => {
              // loadingのスペルミスで[Legacy context API has been detected within a strict-mode tree.]等のエラー発生注意
              if (loading) return 'Loading...'
              if (error) return `Error! ${error.message}`

              const search = data.search
              const repositoryCount = search.repositoryCount
              const repositoryUnit = repositoryCount === 1 ? 'Repository' : 'Repositories'
              const title = `Github Repositories Search Results ${repositoryCount} ${repositoryUnit}`
              return (
                <React.Fragment>
                  <h2>{title}</h2>
                  <ul>
                    {
                      search.edges.map(edge => {
                        const node = edge.node
                        return (
                          <li key={node.id}>
                            <a href={node.url} target="_blank" rel="noopener noreferrer">
                              {node.name}
                            </a>
                            &nbsp;
                            <StarButton node={node} {...{query, first, last, after, before}} />
                          </li>
                        )
                      })
                    }
                  </ul>
                  {
                    search.pageInfo.hasPreviousPage === true ?
                      <button onClick={this.goPrevious.bind(this, search)}>
                        Previous
                      </button>
                      :
                      null
                  }

                  {
                    search.pageInfo.hasNextPage === true ?
                      <button onClick={this.goNext.bind(this, search)}>
                        Next
                      </button>
                      :
                      null
                  }
                </React.Fragment>
              )
            }
          }
        </Query>
      </ApolloProvider>
    )
  }
}

export default App;
