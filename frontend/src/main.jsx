import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { ApolloProvider } from '@apollo/client/react';
import { clienteApollo } from './graphql/client';
import './index.css';
import App from './App.jsx';

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <ApolloProvider client={clienteApollo}>
      <App />
    </ApolloProvider>
  </StrictMode>
);

if('serviceWorker' in navigator) {

  window.addEventListener('load',() =>{

    navigator.serviceWorker.register('/sw.js').then((registro) => {
        console.log('SW registrado com sucesso:', registro.scope);
      })
      .catch((erro)=> {
        console.log('Erro ao registrar SW:', erro);
      });
  });
}
