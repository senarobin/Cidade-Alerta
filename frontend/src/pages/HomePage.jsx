import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

export default function HomePage() {

  const {isAutenticado} = useAuth();

  function renderBotoesAcao() {

    if(isAutenticado) {
      return (<>
          <Link to="/reportes/novo" className="botao botaoPrimario botaoGrande">Criar Reporte</Link>
          <Link to="/reportes" className="botao botaoSecundario botaoGrande">Ver Reportes</Link>
        </>
      );
    }

    return (<>
        <Link to="/registro" className="botao botaoPrimario botaoGrande">Comece Agora</Link>
        <Link to="/reportes" className="botao botaoSecundario botaoGrande">Explorar Reportes</Link>
      </>
    );
  }

  return (
    <div className="pagina">
      <section className="secaoHero">
        <div className="animAparecer">
          <div className="rotuloHero">Plataforma de alertas urbanos</div>
          <h1 className="tituloHero">Sua cidade, <span>sua voz</span></h1>
          <p className="descricaoHero">Reporte buracos, postes apagados, vazamentos e outros problemas urbanos. Acompanhe a resolucao em tempo real e ajude a melhorar sua cidade.</p>
          <div className="acoesHero">{renderBotoesAcao()}</div>
        </div>
      </section>
    </div>
  );
}
