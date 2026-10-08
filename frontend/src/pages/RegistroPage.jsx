import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from '../contexts/ToastContext';

export default function RegistroPage() {

  const [nome, setNome] = useState('');

  const [email, setEmail] = useState('');

  const [senha, setSenha] = useState('');

  const [confirmarSenha, setConfirmarSenha] = useState('');

  const [carregando, setCarregando] = useState(false);

  const { registro } = useAuth();

  const toast = useToast();

  const navegar = useNavigate();

  async function tratarSubmit(e) {
    e.preventDefault();

    if(!nome || !email || !senha) {
      toast.error('Preencha todos os campos.');
      return;
    }

    if(senha.length < 8) {
      toast.error('A senha deve ter no mínimo 8 caracteres.');
      return;
    }

    if(senha !== confirmarSenha) {
      toast.error('As senhas não coincidem.');
      return;
    }

    setCarregando(true);

    try {
      await registro(nome, email, senha);
      toast.success('Conta criada com sucesso!');
      navegar('/');
    }
    catch (erro) {
      toast.error(erro.message || 'Erro ao criar conta.');
    }
    finally {
      setCarregando(false);
    }
  }

  function renderTextoBotao() {

    if(carregando) {
      return 'Criando conta...';
    }

    return 'Criar conta';
  }

  return (
    <div className="paginaAutenticacao">
      <div className="cardAutenticacao animAparecer">

        <div className="cabecalhoAutenticacao">
          <h1 className="tituloAutenticacao">Criar conta</h1>
          <p className="subtituloAutenticacao">Junte-se à comunidade e reporte problemas</p>
        </div>

        <form onSubmit={tratarSubmit}>

          <div className="grupoFormulario">
            <label className="rotuloFormulario" htmlFor="nome">Nome completo</label>
            <input type="text" className="campoFormulario" placeholder="Seu nome" value={nome} onChange={(e) => setNome(e.target.value)} autoComplete="name" required />
          </div>

          <div className="grupoFormulario">
            <label className="rotuloFormulario" htmlFor="email">Email</label>
            <input type="email" className="campoFormulario" placeholder="seu@email.com" value={email} onChange={(e) => setEmail(e.target.value)} autoComplete="email" required />
          </div>

          <div className="grupoFormulario">
            <label className="rotuloFormulario" htmlFor="senha">Senha</label>
            <input type="password" className="campoFormulario" placeholder="Mínimo 8 caracteres" value={senha} onChange={(e) => setSenha(e.target.value)} autoComplete="new-password" required minLength={8} />
          </div>

          <div className="grupoFormulario">
            <label className="rotuloFormulario" htmlFor="confirmar-senha">Confirmar senha</label>
            <input type="password" className="campoFormulario" placeholder="Repita a senha" value={confirmarSenha} onChange={(e) => setConfirmarSenha(e.target.value)} autoComplete="new-password" required />
          </div>

          <button type="submit" className="botao botaoPrimario botaoGrande botaoBloco" disabled={carregando}>
            {renderTextoBotao()}
          </button>
        </form>

        <div className="rodapeAutenticacao">
          Já tem uma conta? <Link to="/login">Fazer login</Link>
        </div>
      </div>
    </div>
  );
}
