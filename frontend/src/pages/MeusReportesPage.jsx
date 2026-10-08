import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import * as Lucide from 'lucide-react';
import { reportesApi } from '../services/api';
import { STATUS_LABELS, tempoRelativo, getId } from '../utils/helpers';

export default function MeusReportesPage() {

  const [reportes, setReportes] = useState([]);

  const [carregando, setCarregando] = useState(true);

  useEffect(() => {

    reportesApi.meus().then((res) => {
      setReportes(res.data.reportes);
    })
    .catch(() => {
      setReportes([]);
    })
    .finally(() => setCarregando(false));
  },[]);

  const renderConteudoReportes = () => {

    if(carregando) {
      return (
        <div className="containerCarregamento">
          <div className="carregador" />
          <span className="textoCarregamento">Carregando...</span>
        </div>
      );
    }

    if(reportes.length === 0) {
      return (
        <div className="estadoVazio">
          <div className="iconeEstadoVazio iconeCentralizado">
            <Lucide.FileText size={48} color="#94a3b8" />
          </div>

          <h3 className="tituloEstadoVazio">Nenhum reporte ainda</h3>
          <p className="textoEstadoVazio">Você ainda não criou nenhum reporte.</p>

          <Link to="/reportes/novo" className="botao botaoPrimario">
            Criar primeiro reporte
          </Link>
        </div>
      );
    }

    return (
      <div className="gradeReportes">
        {reportes.map((reporte, i) => (
          <Link key={getId(reporte)} to={`/reportes/${getId(reporte)}`} className="cardReporte animDeslizarCima conteudoReporteLink">
            <div className={`cardReporteIndicador ${reporte.status==="em_andamento"?"emAndamento":reporte.status}`} />

            <div className="cardReporteConteudo">

              <div className="cardReporteCabecalho">
                <h3 className="cardReporteTitulo">{reporte.titulo}</h3>

                <span className={`etiqueta etiqueta${reporte.status==="em_andamento"?"EmAndamento":reporte.status.charAt(0).toUpperCase()+reporte.status.slice(1)}`}>
                  <span className="pontoEtiqueta"/>
                  {STATUS_LABELS[reporte.status]}
                </span>
              </div>

              <p className="cardReporteDescricao">{reporte.descricao}</p>

              <div className="cardReporteMeta listaMetaEspacada">
                {reporte.categoria && (
                  <span className="cardReporteMetaItem metaItemFlex">
                    <Lucide.Tag size={14} /> {reporte.categoria.nome}
                  </span>
                )}

                <span className="cardReporteMetaItem metaItemFlex">
                  <Lucide.Clock size={14} /> {tempoRelativo(reporte.createdAt)}
                </span>
              </div>

            </div>
          </Link>
        ))}
      </div>
    );
  };

  return (
    <div className="pagina">
      <div className="container">
        <div className="cabecalhoPagina acoesCabecalho">

          <div>
            <h1 className="tituloPagina">Meus Reportes</h1>
            <p className="subtituloPagina">{reportes.length} reportes criados por você</p>
          </div>

          <Link to="/reportes/novo" className="botao botaoPrimario botaoComIcone">
            <Lucide.Plus size={18} /> Novo Reporte
          </Link>

        </div>

        {renderConteudoReportes()}
      </div>
    </div>
  );
}
