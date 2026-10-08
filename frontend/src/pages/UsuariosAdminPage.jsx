import { useState, useEffect } from 'react';
import { usuariosApi } from '../services/api';
import { useToast } from '../contexts/ToastContext';
import { PERFIL_LABELS, getIniciais, formatarData, getId } from '../utils/helpers';
import { Users, Calendar } from 'lucide-react';

export default function UsuariosAdminPage() {
  const [usuarios, setUsuarios] = useState([]);
  const [carregando, setCarregando] = useState(true);
  const toast = useToast();

  useEffect(() =>{
    carregarUsuarios();
  },[]);

  const carregarUsuarios = async () =>{
    setCarregando(true);

    try {
      const res = await usuariosApi.listar();
      setUsuarios(res.data?.usuarios || res.data || []);
    }catch {
      setUsuarios([]);
    }finally {
      setCarregando(false);
    }
  };

  const alterarPapel = async (id,perfil) =>{
    try {
      await usuariosApi.alterarPapel(id,perfil);
      toast.success('Perfil atualizado!');
      carregarUsuarios();
    }catch(erro) {
      toast.error(erro.message || 'Erro ao atualizar perfil.');
    }
  };

  const alterarStatus = async (id,ativo) =>{
    try {
      await usuariosApi.alterarStatus(id, ativo);
      if (ativo) {
        toast.success('Usuário ativado!');
      }else {
        toast.success('Usuário desativado!');
      }
      carregarUsuarios();
    }catch(erro) {
      toast.error(erro.message || 'Erro ao alterar status.');
    }
  };

  const CORES_PERFIL = {
    admin: {
      bg: 'rgba(249, 115, 22, 0.15)',
      texto: '#fb923c',
      borda: 'rgba(249, 115, 22, 0.25)'
    },
    moderador: {
      bg: 'rgba(139, 92, 246, 0.15)',
      texto: '#a78bfa',
      borda: 'rgba(139, 92, 246, 0.25)'
    },
    cidadao: {
      bg: 'rgba(59, 130, 246, 0.15)',
      texto: '#60a5fa',
      borda: 'rgba(59, 130, 246, 0.25)'
    },
  };

  const obterClasseBotaoStatus = (ativo) =>{
    if (ativo) {
      return 'botao botaoPequeno botaoPerigo';
    }
    return 'botao botaoPequeno botaoPrimario';
  };

  const obterTextoBotaoStatus = (ativo) =>{
    if (ativo) {
      return 'Desativar';
    }
    return 'Ativar';
  };

  const renderConteudo = () =>{
    if (carregando) {
      return(
        <div className="containerCarregamento">
          <div className="carregador"/><span className="textoCarregamento">Carregando...</span>
        </div>
      );
    }
    if (usuarios.length === 0) {
      return(
        <div className="estadoVazio">
          <div className="iconeEstadoVazio iconeCentralizado"><Users size={48} color="#94a3b8"/></div>
          <h3 className="tituloEstadoVazio">Nenhum usuário</h3>
        </div>
      );
    }
    return(
      <div className="listaUsuarios">
        {usuarios.map((usuario,i) =>{
          const corPerfil = CORES_PERFIL[usuario.perfil] || CORES_PERFIL.cidadao;

          return(
            <div key={usuario._id} className="card animDeslizarCima">
              <div className="cardCorpo cardUsuarioCorpo">
                <div className="navbarAvatar avatarSemEncolher">{getIniciais(usuario.nome)}</div>

                <div className="infoUsuarioPrincipal"><div className="nomeUsuarioLista">{usuario.nome}
                  {!usuario.ativo &&(
                      <span className="statusInativo">(Inativo)</span>)}</div>

                  <div className="emailUsuarioLista">{usuario.email}</div>
                </div>

                <span className={`etiqueta etiquetaPerfil${usuario.perfil.charAt(0).toUpperCase()+usuario.perfil.slice(1)}`}>{PERFIL_LABELS[usuario.perfil]}</span>

                <div className="dataUsuario"><Calendar size={12}/>{formatarData(usuario.createdAt)}</div>

                <div className="acoesUsuario">
                  <select className="selecaoFormulario filtroSelectPequeno" value={usuario.perfil} onChange={(e) =>alterarPapel(usuario._id,e.target.value)}>
                    <option value="cidadao">Cidadão</option><option value="moderador">Moderador</option><option value="admin">Admin</option>
                  </select>

                  <button className={obterClasseBotaoStatus(usuario.ativo)} onClick={() =>alterarStatus(usuario._id,!usuario.ativo)}>{obterTextoBotaoStatus(usuario.ativo)}</button>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    );
  };

  return (
    <div className="pagina">
      <div className="container">
        <div className="cabecalhoPagina">
          <h1 className="tituloPagina tituloPaginaFlex">
            <Users size={28} /> Usuários
          </h1>
          <p className="subtituloPagina">Gerencie os usuários da plataforma</p>
        </div>

        {renderConteudo()}
      </div>
    </div>
  );
}
