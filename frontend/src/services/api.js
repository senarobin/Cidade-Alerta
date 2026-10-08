const obterUrlBase = () =>{
  const urlEnv = import.meta.env.VITE_API_URL;

  if (urlEnv && urlEnv.startsWith('http')) {
    return urlEnv;
  }
  const hostname = window.location.hostname;

  if (hostname !== 'localhost' && hostname !== '127.0.0.1') {
    return `http://${hostname}:3000${urlEnv || '/api'}`;
  }
  return urlEnv || 'http://localhost:3000/api';
};

const URL_BASE_API = obterUrlBase();

const obterHeaders = (ehJson = true) =>{
  const headers = {};
  const token = localStorage.getItem('token');
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  if (ehJson){
    headers['Content-Type'] = 'application/json';
  }
  return headers;
};

const tratarResposta = async (resposta) =>{
  const dados = await resposta.json();

  if (!resposta.ok) {
    throw new Error(dados.message || 'Erro na requisição');
  }
  return dados;
};

const requisicao = (caminho,{metodo = 'GET',body} = {}) =>{
  let bodyFormatado = undefined;

  if (body !== undefined) {
    bodyFormatado = JSON.stringify(body);
  }
  return fetch(`${URL_BASE_API}${caminho}`,{method: metodo,headers: obterHeaders(),body: bodyFormatado}).then(tratarResposta);
};

export const authApi = {
  perfil: () =>requisicao('/auth/perfil'),
};

export const reportesApi = {
  meus: () =>requisicao('/reportes/autenticado'),

  criar: async (dados,arquivos = []) =>{

    const formulario = new FormData();
    formulario.append('titulo',dados.titulo);
    formulario.append('descricao',dados.descricao);
    formulario.append('categoria',dados.categoria);
    formulario.append('localizacao[type]','Point');
    formulario.append('localizacao[coordinates][]',dados.localizacao.coordinates[0]);
    formulario.append('localizacao[coordinates][]',dados.localizacao.coordinates[1]);

    if (dados.endereco) {
      formulario.append('endereco', dados.endereco);
    }

    arquivos.forEach((arquivo) =>{
      formulario.append('imagens', arquivo);
    });

    const res = await fetch(`${URL_BASE_API}/reportes`,{method: 'POST',headers: obterHeaders(false),body: formulario});
    return tratarResposta(res);
  },
  atualizar: (id,dados) =>requisicao(`/reportes/${id}`,{metodo:'PUT',body: dados}),
  deletar: (id) =>requisicao(`/reportes/${id}`,{metodo: 'DELETE'}),
  historico: (id) =>requisicao(`/reportes/${id}/historico`),
  comentarios: (id) =>requisicao(`/reportes/${id}/comentarios`),
};

export const categoriasApi = {
  listar: () =>requisicao('/categorias'),
  criar: (dados) =>requisicao('/categorias',{metodo: 'POST',body: dados}),
  atualizar: (id,dados) =>requisicao(`/categorias/${id}`,{metodo: 'PUT',body: dados}),
  deletar: (id) =>requisicao(`/categorias/${id}`,{metodo: 'DELETE'}),
};

export const usuariosApi = {
  listar: () =>requisicao('/usuarios'),
  alterarPapel: (id,perfil) =>requisicao(`/usuarios/${id}/papel`,{metodo: 'PATCH',body: {perfil}}),
  alterarStatus: (id,ativo) =>requisicao(`/usuarios/${id}/status`,{metodo: 'PATCH',body: {ativo}}),
};
