import { useState } from 'react';
import { useQuery } from '@apollo/client/react';
import { GET_DASHBOARD } from '../graphql/operations';
import { STATUS_LABELS } from '../utils/helpers';
import * as Lucide from 'lucide-react';

const STATUS_COLORS = {
  aberto: '#3b82f6',
  em_andamento: '#f59e0b',
  resolvido: '#10b981',
  fechado: '#6b7280',
};

const STATUS_ICONS = {
  aberto: Lucide.FolderOpen,
  em_andamento: Lucide.Settings,
  resolvido: Lucide.CheckCircle2,
  fechado: Lucide.Lock,
};

export default function DashboardPage() {

  const [dias, setDias] = useState(30);

  const {data, loading} = useQuery(GET_DASHBOARD,
      {
        variables: {
          dias
        }
      });

  const estatisticas = data?.estatisticasDashboard;

  const porCategoria = data?.reportesPorCategoria || [];

  const porPeriodo = data?.reportesPorPeriodo || [];

  const carregando = loading && !data;

  const getQuantidadePorStatus = (status) => {

    if(!estatisticas?.porStatus) {
      return 0;
    }

    const item = estatisticas.porStatus.find((s) => s._id === status);
    return item?.quantidade || 0;
  };

  const maxCategoria = Math.max(...porCategoria.map((c) =>c.quantidade), 1);
  const maxPeriodo = Math.max(...porPeriodo.map((p) =>p.quantidade), 1);

  const renderIconeStatus = (key) => {

    const Icon = STATUS_ICONS[key];

    if(Icon) {
      return <Icon size={20} />;
    }
    return null;
  };

  const renderGraficoCategoria = () => {

    if(porCategoria.length === 0) {
      return (
        <p className="textoVazioGrafico">
          Sem dados disponíveis.
        </p>
      );
    }

    return (
      <div className="grupoBarrasGrafico">
        {porCategoria.map((item, i) => (

          <div key={i} className="itemBarraGrafico">
            <span className="rotuloBarraGrafico">{item.categoria?.nome || 'N/A'}</span>

            <div className="trilhoBarraGrafico">
              <div className="preenchimentoBarraGrafico fundoPrimario" style={{ '--pct': `${Math.max((item.quantidade / maxCategoria) * 100, 8)}%` }}>
                {item.quantidade}
              </div>
            </div>

          </div>
        ))}
      </div>
    );
  };

  const renderGraficoPeriodo = () => {

    if(porPeriodo.length === 0) {
      return (
        <p className="textoVazioGrafico">
          Sem dados no período selecionado.
        </p>
      );
    }

    return (
      <div className="grupoBarrasGrafico">
        {porPeriodo.slice(-10).map((item, i) => (
          <div key={i} className="itemBarraGrafico">

            <span className="rotuloBarraGrafico">
              {new Date(item.data + 'T12:00:00').toLocaleDateString('pt-BR', {day: '2-digit', month: 'short'})}
            </span>

            <div className="trilhoBarraGrafico">
              <div className="preenchimentoBarraGrafico fundoSecundario" style={{ '--pct': `${Math.max((item.quantidade / maxPeriodo) * 100, 8)}%` }}>
                {item.quantidade}
              </div>
            </div>

          </div>
        ))}
      </div>
    );
  };

  if(carregando) {
    return (
      <div className="pagina">
        <div className="container">

          <div className="containerCarregamento">
            <div className="carregador" />
            <span className="textoCarregamento">Carregando dashboard...</span>
          </div>

        </div>
      </div>
    );
  }

  return (
    <div className="pagina">
      <div className="container">

        <div className="cabecalhoPagina">
          <h1 className="tituloPagina tituloPaginaFlex">
            <Lucide.BarChart3 size={28} /> Dashboard
          </h1>

          <p className="subtituloPagina">Visão geral dos alertas urbanos</p>

        </div>

        <div className="gradeEstatisticas">
          <div className="cardEstatistica animAparecer">

            <div className="cardEstatisticaIcone">
              <Lucide.BarChart3 size={20} />
            </div>

            <div className="cardEstatisticaValor">{estatisticas?.total || 0}</div>
            <div className="cardEstatisticaRotulo">Total de Reportes</div>
          </div>

          {Object.entries(STATUS_LABELS).map(([key, label], i) => (
            <div key={key} className="cardEstatistica animAparecer">
              <div className="cardEstatisticaIcone">
                {renderIconeStatus(key)}
              </div>

              <div className="cardEstatisticaValor">{getQuantidadePorStatus(key)}</div>
              <div className="cardEstatisticaRotulo">{label}</div>
            </div>
          ))}
        </div>

        <div className="detalhesGrafico">
          <div className="containerGrafico animAparecer">
            <h3 className="tituloGrafico">Reportes por Categoria</h3>
            {renderGraficoCategoria()}
          </div>

          <div className="containerGrafico animAparecer">
            <div className="cabecalhoGraficoFiltros">
              <h3 className="tituloGrafico tituloGraficoSemMargem">Reportes por Período</h3>

              <select className="selecaoFormulario filtroSelectPequeno" value={dias} onChange={(e) => setDias(parseInt(e.target.value))}>
                <option value={7}>7 dias</option>
                <option value={14}>14 dias</option>
                <option value={30}>30 dias</option>
                <option value={60}>60 dias</option>
                <option value={90}>90 dias</option>
              </select>

            </div>

            {renderGraficoPeriodo()}
          </div>
        </div>
      </div>
    </div>
  );
}
