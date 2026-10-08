import { ApolloClient, ApolloLink, InMemoryCache } from '@apollo/client';
import UploadHttpLink from 'apollo-upload-client/UploadHttpLink.mjs';
import { SetContextLink } from '@apollo/client/link/context';
import { ErrorLink } from '@apollo/client/link/error';
import { CombinedGraphQLErrors } from '@apollo/client/errors';

const obterUrlGraphQL = () => {

  const urlEnv = import.meta.env.VITE_GRAPHQL_URL;

  if(urlEnv && urlEnv.startsWith('http')) {
    return urlEnv;
  }

  const hostname = window.location.hostname;

  if(hostname !== 'localhost' && hostname !== '127.0.0.1') {
    return `http://${hostname}:3000${urlEnv || '/graphql'}`;
  }

  return urlEnv || '/graphql';
};

const URL_GRAPHQL = obterUrlGraphQL();

const linkHttp = new UploadHttpLink({uri: URL_GRAPHQL});

const linkAutenticacao = new SetContextLink((contextoAnterior) => {
  const token = localStorage.getItem('token');

  const headers = {...contextoAnterior.headers};

  if(token) {
    headers.Authorization = `Bearer ${token}`;
  }

  return {headers};
});

const linkErro = new ErrorLink(({ error }) => {

  if(CombinedGraphQLErrors.is(error)) {
    error.errors.forEach(({ message, path }) => {

      let sufixoCaminho = '';

      if(path) {
        sufixoCaminho = ` (em ${path.join('.')})`;
      }

      console.warn(`[GraphQL] ${message}${sufixoCaminho}`);

      if(message.startsWith('Não autenticado') && localStorage.getItem('token')) {
        localStorage.removeItem('token');
        window.dispatchEvent(new Event('auth:expirado'));
      }

    });
  }
  else if(error) {
    console.warn(`[Rede] ${error.message}`);
  }
});

export const clienteApollo = new ApolloClient({

  link: ApolloLink.from([linkErro, linkAutenticacao, linkHttp]),

  cache: new InMemoryCache({
    typePolicies: {
      ContagemPorStatus: { keyFields: false },
      ContagemPorCategoria: { keyFields: false },
      ContagemPorPeriodo: { keyFields: false },
      CategoriaContagem: { keyFields: false },
      PaginacaoInfo: { keyFields: false },
      Localizacao: { keyFields: false },
    },
  }),

  defaultOptions: {
    watchQuery: {fetchPolicy: 'cache-and-network'},
  },

});
