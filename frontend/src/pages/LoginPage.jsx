import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from '../contexts/ToastContext';

export default function LoginPage() {

  const [email, setEmail] = useState('');

  const [senha, setSenha] = useState('');

  const [carregando, setCarregando] = useState(false);

  const { login } = useAuth();

  const toast = useToast();

  const navegar = useNavigate();

  async function tratarSubmit(e) {
    e.preventDefault();

    if(!email || !senha) {
      toast.error('Preencha todos os campos.');
      return;
    }

    setCarregando(true);

    try {
      await login(email, senha);
      toast.success('Login realizado com sucesso!');
      navegar('/');
    }
    catch (erro) {
      toast.error(erro.message || 'Erro ao fazer login.');
    }
    finally {
      setCarregando(false);
    }
  }

  function renderTextoBotao() {

    if(carregando) {
      return 'Entrando...';
    }
    return 'Entrar';

  }

  return (
    <div className="paginaAutenticacao">
      <div className="cardAutenticacao animAparecer">
        <div className="cabecalhoAutenticacao">
          <h1 className="tituloAutenticacao">Bem-vindo de volta</h1>
          <p className="subtituloAutenticacao">Entre na sua conta para continuar</p>
        </div>

        <form onSubmit={tratarSubmit}>
          <div className="grupoFormulario">
            <label className="rotuloFormulario" htmlFor="email">Email</label>
            <input type="email" className="campoFormulario" placeholder="E-mail" value={email} onChange={(e) => setEmail(e.target.value)} autoComplete="email" required />
          </div>

          <div className="grupoFormulario">
            <label className="rotuloFormulario" htmlFor="senha">Senha</label>
            <input type="password" className="campoFormulario" placeholder="Senha" value={senha} onChange={(e) => setSenha(e.target.value)} autoComplete="current-password" required />
          </div>

          <button type="submit" className="botao botaoPrimario botaoGrande botaoBloco" disabled={carregando}>
            {renderTextoBotao()}
          </button>

        </form>

        <div className="rodapeAutenticacao">
          Não tem uma conta? <Link to="/registro">Criar conta</Link>
        </div>
      </div>
    </div>
  );
}
