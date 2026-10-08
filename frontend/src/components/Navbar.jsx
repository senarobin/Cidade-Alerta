import { useState } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { getIniciais } from '../utils/helpers';
import { Home, ClipboardList, FileEdit, BarChart3, Tag, Users, Menu, X, LogOut } from 'lucide-react';
import logoImg from '../assets/logo-completo.png';

export default function Navbar() {

  const { usuario, logout, isAutenticado, isAdmin, isModerador } = useAuth();

  const navegar = useNavigate();

  const [menuMobileAberto, setMenuMobileAberto] = useState(false);

  function tratarLogout() {
    logout();
    navegar('/login');
    setMenuMobileAberto(false);
  }

  const linksNav = [
    {
      para: '/', rotulo: 'Início', icone: <Home size={18} />
    },
    {
      para: '/reportes', rotulo: 'Reportes', icone: <ClipboardList size={18} />
    },
  ];

  if(isAutenticado) {
    linksNav.push({para: '/meus-reportes', rotulo: 'Meus Reportes', icone: <FileEdit size={18} />});
  }

  if(isModerador) {
    linksNav.push({para: '/dashboard', rotulo: 'Dashboard', icone: <BarChart3 size={18} />});
  }

  if(isAdmin) {
    linksNav.push({ para: '/admin/categorias', rotulo: 'Categorias', icone: <Tag size={18} /> });
    linksNav.push({ para: '/admin/usuarios', rotulo: 'Usu\u00e1rios', icone: <Users size={18} /> });
  }

  function obterClasseLink({isActive}) {

    if(isActive) {
      return 'navbarLink active';
    }

    return 'navbarLink';
  }

  function obterClasseOverlay() {

    if(menuMobileAberto) {
      return 'sobreposicaoNavegacaoMobile open';
    }
    return 'sobreposicaoNavegacaoMobile';
  }

  function obterClasseNavMobile() {
    if(menuMobileAberto) {
      return 'navegacaoMobile open';
    }

    return 'navegacaoMobile';
  }

  const renderDesktop = () => {

    if(isAutenticado) {
      return (
      <div className="navbarUser">
        <div className="navbarAvatar">{getIniciais(usuario?.nome)}</div>
        <span className="navbarUsername">{usuario?.nome}</span>

        <button className="botao botaoFantasma botaoPequeno botaoComIconePequeno" onClick={tratarLogout}><LogOut size={16} /> Sair</button>
      </div>
    );
    }
    return <><Link to="/login" className="botao botaoFantasma botaoPequeno">Entrar</Link><Link to="/registro" className="botao botaoPrimario botaoPequeno">Cadastrar</Link></>;
  };

  const renderMobile = () => {

    if(isAutenticado) {
      return <>
      <div className="infoUsuarioMobile">
        <div className="navbarAvatar">{getIniciais(usuario?.nome)}</div>
        <div><div className="nomeUsuarioMobile">{usuario?.nome}</div><div className="emailUsuarioMobile">{usuario?.email}</div></div>
      </div>

      <button className="botao botaoSecundario botaoBloco botaoComIcone" onClick={tratarLogout}><LogOut size={16} /> Sair</button>
    </>;
    }
    return (
      <div className="acoesAutenticacaoMobile">
        <Link to="/login" className="botao botaoSecundario botaoFlex1" onClick={() => setMenuMobileAberto(false)}>Entrar</Link>
        <Link to="/registro" className="botao botaoPrimario botaoFlex1" onClick={() => setMenuMobileAberto(false)}>Cadastrar</Link>
      </div>
    );
  };

  return <>
    <nav className="navbar">
      <div className="container navbarInner">
        <Link to="/" className="navbarBrand"><img src={logoImg} alt="Cidade Alerta" className="navbarBrandLogo" /></Link>

        <ul className="navbarNav">
          {linksNav.map((link) => <li key={link.para}><NavLink to={link.para} className={obterClasseLink} end={link.para === '/'}><span>{link.icone}</span>{link.rotulo}</NavLink></li>)}
        </ul>

        <div className="navbarActions">
          {renderDesktop()}
          <button className="navbarMenuToggle" onClick={() => setMenuMobileAberto(true)} aria-label="Abrir menu"><Menu size={24} /></button>
        </div>

      </div>
    </nav>

    <div className={obterClasseOverlay()} onClick={() => setMenuMobileAberto(false)} />
    <div className={obterClasseNavMobile()}>

      <div className="cabecalhoMobile">
        <span className="tituloMenuMobile">Menu</span>
        <button className="botao botaoFantasma botaoPequeno botaoFecharMenu" onClick={() => setMenuMobileAberto(false)}><X size={20} /></button>
      </div>

      {linksNav.map((link) => <NavLink key={link.para} to={link.para} className={obterClasseLink} onClick={() => setMenuMobileAberto(false)} end={link.para === '/'}><span>{link.icone}</span>{link.rotulo}</NavLink>)}
      <div className="rodapeNavegacaoMobile">{renderMobile()}</div>
    </div>
  </>;
}
