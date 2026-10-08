import { Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

export function RotaPrivada({children}) {

  const {isAutenticado, carregando} = useAuth();

  if(carregando) {
    return (
      <div className="containerCarregamento">
        <div className="carregador" />
        <span className="textoCarregamento">Carregando...</span>
      </div>
    );
  }

  if(isAutenticado) {
    return children;
  }

  return <Navigate to="/login" replace />;
}

export function RotaAdmin({children}) {

  const {isAdmin, carregando} = useAuth();

  if(carregando) {
    return (
      <div className="containerCarregamento">
        <div className="carregador" />
        <span className="textoCarregamento">Carregando...</span>
      </div>
    );
  }

  if(isAdmin) {
    return children;
  }

  return <Navigate to="/" replace />;
}

export function RotaModerador({children}) {

  const {isModerador, carregando} = useAuth();

  if(carregando) {
    return (
      <div className="containerCarregamento">
        <div className="carregador" />
        <span className="textoCarregamento">Carregando...</span>
      </div>
    );
  }

  if(isModerador) {
    return children;
  }

  return <Navigate to="/" replace />;
}
