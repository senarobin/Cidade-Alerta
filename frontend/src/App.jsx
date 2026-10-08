import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { ToastProvider } from './contexts/ToastContext';
import { RotaPrivada, RotaAdmin, RotaModerador } from './components/RotaProtegida';
import Navbar from './components/Navbar';
import { SearchX } from 'lucide-react';
import HomePage from './pages/HomePage';
import LoginPage from './pages/LoginPage';
import RegistroPage from './pages/RegistroPage';
import ReportesPage from './pages/ReportesPage';
import ReporteDetalhePage from './pages/ReporteDetalhePage';
import ReporteFormPage from './pages/ReporteFormPage';
import MeusReportesPage from './pages/MeusReportesPage';
import DashboardPage from './pages/DashboardPage';
import CategoriasAdminPage from './pages/CategoriasAdminPage';
import UsuariosAdminPage from './pages/UsuariosAdminPage';

function AppLayout({children}) {

  return (<><Navbar/>{children}</>);
}

function AuthLayout({children}) {

  return <>{children}</>;
}

export default function App() {

  return (
    <BrowserRouter>
      <AuthProvider>
        <ToastProvider>
          <Routes>
            <Route path="/login" element={<AuthLayout><LoginPage/></AuthLayout>}/>
            <Route path="/registro" element={<AuthLayout><RegistroPage /></AuthLayout>}/>
            <Route path="/" element={<AppLayout><HomePage/></AppLayout>}/>
            <Route path="/reportes" element={<AppLayout><ReportesPage /></AppLayout>}/>
            <Route path="/reportes/novo" element={<AppLayout><RotaPrivada><ReporteFormPage /></RotaPrivada></AppLayout>}/>
            <Route path="/reportes/:id" element={<AppLayout><ReporteDetalhePage /></AppLayout>}/>
            <Route path="/reportes/:id/editar" element={<AppLayout><RotaPrivada><ReporteFormPage /></RotaPrivada></AppLayout>}/>
            <Route path="/meus-reportes" element={<AppLayout><RotaPrivada><MeusReportesPage /></RotaPrivada></AppLayout>}/>
            <Route path="/dashboard" element={<AppLayout><RotaModerador><DashboardPage /></RotaModerador></AppLayout>}/>
            <Route path="/admin/categorias" element={<AppLayout><RotaAdmin><CategoriasAdminPage /></RotaAdmin></AppLayout>}/>
            <Route path="/admin/usuarios" element={<AppLayout><RotaAdmin><UsuariosAdminPage /></RotaAdmin></AppLayout>}/>
            <Route path="*" element={<AppLayout><div className="pagina"><div className="container"><div className="estadoVazio"><div className="iconeEstadoVazio iconeCentralizado"><SearchX size={48} color="#94a3b8" /></div><h3 className="tituloEstadoVazio">Página não encontrada</h3><p className="textoEstadoVazio"> A página que você procura não existe.</p></div></div></div></AppLayout>}/>
          </Routes>
        </ToastProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}
