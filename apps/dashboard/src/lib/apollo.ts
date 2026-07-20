import { ApolloClient, HttpLink, InMemoryCache } from '@apollo/client';

const graphqlApiUrl = import.meta.env.VITE_GRAPHQL_API_URL;

if (!graphqlApiUrl) {
  throw new Error('Missing VITE_GRAPHQL_API_URL environment variable');
}

export const apolloClient = new ApolloClient({
  link: new HttpLink({
    uri: graphqlApiUrl,
  }),
  cache: new InMemoryCache(),
});