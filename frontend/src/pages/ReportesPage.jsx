import { Link, useSearchParams } from 'react-router-dom';
import { useQuery } from '@apollo/client/react';
import { GET_REPORTES, GET_CATEGORIAS } from '../graphql/operations';
import { useAuth } from '../contexts/AuthContext';
import { STATUS_LABELS, STATUS_LIST, tempoRelativo } from '../utils/helpers';
import { ClipboardList, Tag, User, Clock, Plus, FolderOpen, Settings, CheckCircle2, Lock, List } from 'lucide-react';

export default function ReportesPage() {
  const [parametrosBusca, setParametrosBusca] = useSearchParams();
  const {isAutenticado} = useAuth();
  const statusFiltro = parametrosBusca.get('status') || '';
  const categoriaFiltro = parametrosBusca.get('categoria') || '';
  const paginaAtual = parseInt(parametrosBusca.get('pagina')) || 1;
  const {data: dadosCategorias} = useQuery(GET_CATEGORIAS);
  const categorias = dadosCategorias?.categorias || [];
  const {data: dados,loading: carregandoQuery,error: erro} = useQuery(GET_REPORTES,{
    variables: {
      pagina: paginaAtual,
      limite: 10,
      status: statusFiltro || undefined,
      categoria: categoriaFiltro || undefined,
    },
  });

  let reportes = dados?.reportes?.reportes || [];
  if (erro) {
    reportes = [];
  }

  const paginacao = dados?.reportes?.paginacao || {total: 0,pagina: 1,paginas: 1};
  const carregando = carregandoQuery && !dados;

  const aplicarFiltro = (chave,valor) =>{
    const parametros = new URLSearchParams(parametrosBusca);

    if (valor) {
      parametros.set(chave,valor);
    }else {
      parametros.delete(chave);
    }
    parametros.delete('pagina');
    setParametrosBusca(parametros);
  };

  const irParaPagina = (pagina) =>{
    const parametros = new URLSearchParams(parametrosBusca);
    parametros.set('pagina',pagina);
    setParametrosBusca(parametros);
  };

  const obterTextoSubtitulo = () =>{
    if (paginacao.total === 1) {
      return `${paginacao.total} reporte encontrado`;
    }
    return `${paginacao.total} reportes encontrados`;
  };

  const obterClasseFiltroStatus = (status) => {
    if(statusFiltro === status) {
      return 'chipFiltro active';
    }
    return 'chipFiltro';
  };

  const obterClasseFiltroTodos = () =>{
    if (!statusFiltro) {
      return 'chipFiltro active';
    }
    return 'chipFiltro';
  };

  const obterClassePaginacao = (pagina) =>{
    if(pagina === paginaAtual) {
      return 'botaoPaginacao active';
    }
    return 'botaoPaginacao';
  };

  const obterTextoVazio = () =>{
    if(statusFiltro || categoriaFiltro) {
      return 'Tente ajustar os filtros.';
    }
    return 'Seja o primeiro a reportar um problema!';
  };

  const renderConteudo = () =>{
    if (carregando) {
      return(
        <div className="containerCarregamento">
          <div className="carregador"/><span className="textoCarregamento">Carregando reportes...</span>
        </div>
      );
    }

    if (reportes.length === 0) {
      return(
        <div className="estadoVazio">
          <div className="iconeEstadoVazio iconeCentralizado"><ClipboardList size={48} color="#94a3b8"/></div>
          <h3 className="tituloEstadoVazio">Nenhum reporte encontrado</h3>
          <p className="textoEstadoVazio">{obterTextoVazio()}</p>
          {isAutenticado && !statusFiltro && !categoriaFiltro &&(
            <Link to="/reportes/novo" className="botao botaoPrimario">Criar primeiro reporte</Link>)}
        </div>
      );
    }

    return(<>
        <div className="gradeReportes">
          {reportes.map((reporte,i) =>(
            <Link key={reporte.id} to={`/reportes/${reporte.id}`} className="cardReporte animDeslizarCima conteudoReporteLink">
              <div className={`cardReporteIndicador ${reporte.status==="em_andamento"?"emAndamento":reporte.status}`} />
              <div className="cardReporteConteudo">
                <div className="cardReporteCabecalho"><h3 className="cardReporteTitulo">{reporte.titulo}</h3><span className={`etiqueta etiqueta${reporte.status==="em_andamento"?"EmAndamento":reporte.status.charAt(0).toUpperCase()+reporte.status.slice(1)}`}><span className="pontoEtiqueta"/>{STATUS_LABELS[reporte.status]}</span></div>
                <p className="cardReporteDescricao">{reporte.descricao}</p>
                <div className="cardReporteMeta">
                  {reporte.categoria &&(
                    <span className="cardReporteMetaItem"><Tag size={14} className="iconeMeta"/> {reporte.categoria.nome}</span>
                  )}
                  {reporte.autor &&(
                    <span className="cardReporteMetaItem"><User size={14} className="iconeMeta"/> {reporte.autor.nome}</span>
                  )}
                  <span className="cardReporteMetaItem"><Clock size={14} className="iconeMeta"/> {tempoRelativo(reporte.createdAt)}</span>
                </div>
              </div>
            </Link>
          ))}
        </div>

        {paginacao.paginas > 1 &&(
          <div className="paginacao">
            <button className="botaoPaginacao" disabled={paginaAtual<= 1} onClick={() =>irParaPagina(paginaAtual - 1)}>‹</button>
            {Array.from({length: paginacao.paginas},(_,i) =>i + 1).map((p) =>(<button key={p} className={obterClassePaginacao(p)} onClick={() =>irParaPagina(p)}>{p}</button>))}
            <button className="botaoPaginacao" disabled={paginaAtual >= paginacao.paginas} onClick={() =>irParaPagina(paginaAtual + 1)}>›</button>
          </div>
        )}
      </>
    );
  };

  return(
    <div className="pagina">
      <div className="container">
        <div className="cabecalhoPagina acoesCabecalho">
          <div><h1 className="tituloPagina">Reportes</h1><p className="subtituloPagina">{obterTextoSubtitulo()}</p></div>

          {isAutenticado &&(
            <Link to="/reportes/novo" className="botao botaoPrimario botaoComIcone"><Plus size={18}/> Novo Reporte</Link>
          )}
        </div>

        <div className="barraFiltros">
          <select className="selecaoFormulario filtroSelect" value={statusFiltro} onChange={(e) =>aplicarFiltro('status',e.target.value)}>
            <option value="">Todos os status</option>
            {STATUS_LIST.map((s) =>(
              <option key={s} value={s}>{STATUS_LABELS[s]}</option>
            ))}
          </select>

          {categorias.length > 0 &&(
            <select className="selecaoFormulario filtroSelect" value={categoriaFiltro} onChange={(e) =>aplicarFiltro('categoria',e.target.value)}>
              <option value="">Todas categorias</option>

              {categorias.map((c) =>(
                <option key={c.id} value={c.id}>{c.nome}</option>
              ))}
            </select>
          )}
        </div>
        {renderConteudo()}
      </div>
    </div>
  );
}
