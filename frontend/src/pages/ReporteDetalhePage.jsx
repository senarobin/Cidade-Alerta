import { useState, useEffect, useCallback } from 'react';
import { User, Clock, Tag, MessageCircle, RefreshCw, Pencil, Trash2, Calendar, MapPin, Map, ArrowLeft } from 'lucide-react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useQuery, useMutation } from '@apollo/client/react';
import { reportesApi } from '../services/api';
import { GET_REPORTE, ATUALIZAR_STATUS_REPORTE, ADICIONAR_COMENTARIO } from '../graphql/operations';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from '../contexts/ToastContext';
import { STATUS_LABELS, STATUS_LIST, formatarDataHora, tempoRelativo, getIniciais, getId } from '../utils/helpers';

export default function ReporteDetalhePage() {
  const {id} = useParams();
  const navegar = useNavigate();
  const {usuario,isAdmin,isModerador} = useAuth();
  const toast = useToast();
  const [comentarios,setComentarios] = useState([]);
  const [historico,setHistorico] = useState([]);
  const [novoComentario,setNovoComentario] = useState('');
  const [novoStatus,setNovoStatus] = useState('');
  const [observacao,setObservacao] = useState('');
  const [mostrarAlterarStatus,setMostrarAlterarStatus] = useState(false);
  const {data: dados,loading: carregandoQuery,error: erro} = useQuery(GET_REPORTE,{variables: {id}});
  const reporte = dados?.reporte;
  const carregando = carregandoQuery && !dados;
  const [atualizarStatusMutation,{loading: alterandoStatus}] = useMutation(ATUALIZAR_STATUS_REPORTE);
  const [adicionarComentarioMutation,{loading: enviando}] = useMutation(ADICIONAR_COMENTARIO);

  useEffect(() =>{
    if (erro || (!carregandoQuery && dados && !dados.reporte)) {
      toast.error('Reporte não encontrado.');
      navegar('/reportes');
    }
  },[erro,carregandoQuery,dados]);

  const carregarHistorico = useCallback(() =>{
    reportesApi.historico(id).then((res) =>setHistorico(res.data?.historico || [])).catch(() =>setHistorico([]));
  },[id]);

  useEffect(() =>{
    reportesApi.comentarios(id).then((res) =>setComentarios(res.data?.comentarios || [])).catch(() =>setComentarios([]));
    carregarHistorico();

  },[id,carregarHistorico]);

  const enviarComentario = async (e) =>{
    e.preventDefault();

    if (!novoComentario.trim()) {
      return;
    }

    try {
      const {data: res} = await adicionarComentarioMutation({
        variables: {reporteId: id,conteudo: novoComentario.trim()}
      });

      setComentarios((prev) =>[...prev,res.adicionarComentario]);
      setNovoComentario('');
      toast.success('Comentário adicionado!');
    }catch (erro) {
      toast.error(erro.message || 'Erro ao adicionar comentário.');
    }
  };

  const alterarStatus = async () =>{
    if (!novoStatus) {
      return;
    }

    try {
      await atualizarStatusMutation({
        variables: {id,status: novoStatus,observacao: observacao || null}
      });

      toast.success('Status atualizado!');
      setMostrarAlterarStatus(false);
      setObservacao('');
      carregarHistorico();
    }catch (erro) {
      toast.error(erro.message || 'Erro ao alterar status.');
    }
  };

  const deletarReporte = async () =>{
    if (!window.confirm('Tem certeza que deseja deletar este reporte?')) {
      return;
    }

    try {
      await reportesApi.deletar(id);
      toast.success('Reporte deletado.');
      navegar('/reportes');
    }catch(erro) {
      toast.error(erro.message || 'Erro ao deletar reporte.');
    }
  };

  if (carregando) {
    return (
      <div className="pagina">
        <div className="container"><div className="containerCarregamento"><div className="carregador"/><span className="textoCarregamento">Carregando reporte...</span></div></div>
      </div>
    );
  }

  if (!reporte) {
    return null;
  }

  const ehAutor = usuario && reporte.autor && getId(usuario) === getId(reporte.autor);

  const obterUrlImagem = (img) =>{

    if(!img) return '';
    if(img.startsWith('http') || img.startsWith('blob:') || img.startsWith('data:')) {
      return img;
    }

    const envUrl = import.meta.env.VITE_API_URL || '';
    if (envUrl.startsWith('/')) {
      return img;
    }

    const urlBase = (() =>{
      const semApi = envUrl.replace('/api','');

      if (semApi && semApi.startsWith('http'))
        {return semApi;
      }

      const hostname = window.location.hostname;
      if (hostname !== 'localhost' && hostname !== '127.0.0.1') {
        return `http://${hostname}:3000`;
      }
      return semApi || 'http://localhost:3000';
    })();

    return `${urlBase}${img}`;
  };

  let conteudoBotaoComentario = (
    <><MessageCircle size={14} className="iconeInline"/> Comentar</>
  );

  if (enviando) {
    conteudoBotaoComentario = 'Enviando...';
  }

  let listaComentarios;

  if (comentarios.length === 0) {
    listaComentarios = (
      <p className="textoPequenoSuave">Nenhum comentário ainda.</p>
    );
  }

  else {
    listaComentarios = comentarios.map((c) =>(
      <div key={getId(c)} className="comentario">

        <div className="cabecalhoComentario">
          <div className="autorComentario"><div className="avatarComentario">{getIniciais(c.autor?.nome)}</div><span className="nomeComentario">{c.autor?.nome || 'Anônimo'}</span></div>
          <span className="dataComentario">{tempoRelativo(c.createdAt)}</span>
        </div>
        <p className="corpoComentario">{c.conteudo}</p>
      </div>
    ));
  }

  let textoBotaoConfirmarStatus = 'Confirmar';

  if (alterandoStatus) {
    textoBotaoConfirmarStatus = 'Salvando...';
  }

  return(
    <div className="pagina">
      <div className="container">

        <div className="voltarPagina"><Link to="/reportes" className="linkVoltar"><ArrowLeft size={16}/> Voltar aos reportes</Link></div>

        <div className="detalheReporte animAparecer">
          <div className="detalheReportePrincipal">
            <div className="blocoMargemGrande">
              <div className="cabecalhoReporteTopo"><h1 className="tituloReporte">{reporte.titulo}</h1>
                <span className={`etiqueta etiqueta${reporte.status==="em_andamento"?"EmAndamento":reporte.status.charAt(0).toUpperCase()+reporte.status.slice(1)} etiquetaFixa`}><span className="pontoEtiqueta"/>{STATUS_LABELS[reporte.status]}</span>
              </div>
              <div className="cardReporteMeta metaReporte">
                {reporte.autor &&(
                  <span className="cardReporteMetaItem metaItemFlex"><User size={14}/> {reporte.autor.nome}</span>
                )}
                <span className="cardReporteMetaItem metaItemFlex"><Clock size={14}/>{tempoRelativo(reporte.createdAt)}</span>

                {reporte.categoria &&(
                  <span className="cardReporteMetaItem metaItemFlex"><Tag size={14}/> {reporte.categoria.nome}</span>
                )}
              </div>
            </div>
            <div className="secaoDetalhe">
              <h2 className="tituloSecaoDetalhe">Descrição</h2>
              <div className="card"><div className="cardCorpo"><p className="textoDescricao">{reporte.descricao}</p></div></div>
            </div>

            {reporte.imagens && reporte.imagens.length > 0 &&(
              <div className="secaoDetalhe">
                <h2 className="tituloSecaoDetalhe">Imagens</h2>

                <div className="gradeImagens gradeImagensGrande">
                  {reporte.imagens.map((img,i) =>(
                    <div key={i} className="card cartaoImagem">
                      <img src={obterUrlImagem(img)} alt={`Imagem ${i + 1} do reporte`} className="imagemDetalhe"/>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="secaoDetalhe">
              <h2 className="tituloSecaoDetalhe">Comentários ({comentarios.length})</h2>

              {usuario && (
                <form onSubmit={enviarComentario} className="formComentario">
                  <div className="grupoFormulario">
                    <textarea className="areaTexto" placeholder="Escreva um comentário..." value={novoComentario} onChange={(e) =>setNovoComentario(e.target.value)} rows={3}/>
                  </div>
                  <button type="submit" className="botao botaoPrimario botaoPequeno" disabled={enviando || !novoComentario.trim()}>{conteudoBotaoComentario}</button>
                </form>
              )}
              {listaComentarios}
            </div>
          </div>
          <div className="detalheReporteLateral">
            {(ehAutor || isAdmin || isModerador) &&(
              <div className="card">
                <div className="cardCabecalho"><h3 className="tituloAcoes">Ações</h3></div>
                <div className="cardCorpo colunaAcoes">
                  {isModerador &&(
                    <button className="botao botaoSecundario botaoLarguraTotal" onClick={() =>{setNovoStatus(reporte.status);setMostrarAlterarStatus(!mostrarAlterarStatus);}}><RefreshCw size={16} className="iconeInline"/>Alterar Status</button>
                  )}

                  {ehAutor &&(
                    <Link to={`/reportes/${id}/editar`} className="botao botaoSecundario botaoLarguraTotal textoCentro"><Pencil size={16} className="iconeInline"/>Editar</Link>
                  )}

                  {isAdmin &&(
                    <button className="botao botaoPerigo botaoLarguraTotal" onClick={deletarReporte}><Trash2 size={16} className="iconeInline"/>Deletar</button>
                  )}
                </div>

                {mostrarAlterarStatus &&(
                  <div className="cardRodape colunaAcoes">
                    <select className="selecaoFormulario" value={novoStatus} onChange={(e) =>setNovoStatus(e.target.value)}>
                      {STATUS_LIST.map((s) =>(<option key={s} value={s}>{STATUS_LABELS[s]}</option>))}
                    </select>
                    <input className="campoFormulario" placeholder="Observação (opcional)" value={observacao} onChange={(e) =>setObservacao(e.target.value)}/>
                    <button className="botao botaoPrimario botaoPequeno" onClick={alterarStatus} disabled={alterandoStatus}>{textoBotaoConfirmarStatus}</button>
                  </div>
                )}
              </div>
            )}

            <div className="card">
              <div className="cardCabecalho"><h3 className="tituloAcoes">Informações</h3></div>

              <div className="cardCorpo">
                <div className="listaInformacoes">
                  <div className="itemInformacao">
                    <span className="iconeItemInformacao"><Calendar size={18}/></span>
                    <div><div className="rotuloItemInformacao">Criado em</div><div className="valorItemInformacao">{formatarDataHora(reporte.createdAt)}</div></div>
                  </div>
                  <div className="itemInformacao">
                    <span className="iconeItemInformacao"><RefreshCw size={18}/></span>
                    <div><div className="rotuloItemInformacao">Atualizado em</div><div className="valorItemInformacao">{formatarDataHora(reporte.updatedAt)}</div></div>
                  </div>

                  {reporte.endereco &&(
                    <div className="itemInformacao">
                      <span className="iconeItemInformacao"><MapPin size={18}/></span>
                      <div><div className="rotuloItemInformacao">Endereço</div><div className="valorItemInformacao">{reporte.endereco}</div></div>
                    </div>
                  )}

                  {reporte.localizacao?.coordinates &&(
                    <div className="itemInformacao">
                      <Map size={18}/>
                      <span className="iconeItemInformacao"></span>
                      <div><div className="rotuloItemInformacao">Coordenadas</div>
                        <div className="valorItemInformacao textoPequeno">{reporte.localizacao.coordinates[1]?.toFixed(4)}, {reporte.localizacao.coordinates[0]?.toFixed(4)}</div>
                      </div>
                    </div>
                  )}

                </div>
              </div>
            </div>

            {historico.length > 0 &&(
              <div className="card">
                <div className="cardCabecalho"><h3 className="tituloAcoes">Histórico</h3></div>
                <div className="cardCorpo">
                  <div className="linhaTempo">

                    {historico.map((h) =>(
                      <div key={h._id} className="itemLinhaTempo">
                        <div className="pontoLinhaTempo" />
                        <div className="conteudoLinhaTempo"><div className="tituloTransicao">{STATUS_LABELS[h.statusAnterior]} → {STATUS_LABELS[h.statusAtual]}</div>

                          {h.observacao &&(
                            <div className="observacaoHistorico">{h.observacao}</div>
                          )}

                          <div className="dataLinhaTempo">{h.mudadoPor?.nome} · {tempoRelativo(h.dataMudanca || h.createdAt)}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}