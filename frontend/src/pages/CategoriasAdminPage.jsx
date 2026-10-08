import { useState, useEffect } from 'react';
import { categoriasApi } from '../services/api';
import { useToast } from '../contexts/ToastContext';
import { getId } from '../utils/helpers';
import * as Lucide from 'lucide-react';

export default function CategoriasAdminPage() {

  const [categorias, setCategorias] = useState([]);

  const [carregando, setCarregando] = useState(true);

  const toast = useToast();

  const [formAberto, setFormAberto] = useState(false);

  const [editando, setEditando] = useState(null);

  const [nome, setNome] = useState('');

  const [descricao, setDescricao] = useState('');

  const [salvando, setSalvando] = useState(false);

  useEffect(() => {
    carregarCategorias();
  },[]);

  const carregarCategorias = async () => {

    setCarregando(true);

    try {
      const res = await categoriasApi.listar();
      setCategorias(res.data?.categorias || res.data || []);
    }
    catch {
      setCategorias([]);
    }
    finally {
      setCarregando(false);
    }
  };

  const abrirForm = (categoria = null) => {

    if(categoria) {
      setEditando(categoria);
      setNome(categoria.nome);
      setDescricao(categoria.descricao || '');
    }
    else {
      setEditando(null);
      setNome('');
      setDescricao('');
    }
    setFormAberto(true);
  };

  const fecharForm = () => {
    setFormAberto(false);
    setEditando(null);
    setNome('');
    setDescricao('');
  };

  const salvar = async (e) => {
    e.preventDefault();

    if(!nome.trim()) {
      toast.error('Nome é obrigatório.');
      return;
    }

    setSalvando(true);

    try {
      if(editando) {
        await categoriasApi.atualizar(getId(editando), {nome, descricao});
        toast.success('Categoria updated');
      }
      else {
        await categoriasApi.criar({nome, descricao});
        toast.success('Categoria criada');
      }
      fecharForm();
      carregarCategorias();
    }
    catch(err) {
      toast.error(err.message || 'Erro ao salvar categoria.');
    }
    finally {
      setSalvando(false);
    }
  };

  const deletar = async (id) => {

    if(!window.confirm('Tem certeza?')) {
      return;
    }

    try {
      await categoriasApi.deletar(id);
      toast.success('Categoria removida');
      carregarCategorias();
    }
    catch(err) {
      toast.error(err.message || 'Erro ao deletar.');
    }
  };

  const renderTituloModal = () => {

    if(editando) {
      return 'Editar Categoria';
    }
    return 'Nova Categoria';
  };

  const renderTextoBotaoSalvar = () => {

    if(salvando) {
      return 'Salvando...';
    }
    return 'Salvar';
  };

  const renderConteudoCategorias = () => {

    if(carregando) {
      return (
        <div className="containerCarregamento">
          <div className="carregador" />
          <span className="textoCarregamento">Carregando...</span>
        </div>
      );
    }

    if(categorias.length === 0) {
      return (
        <div className="estadoVazio">
          <div className="iconeEstadoVazio iconeCentralizado">
            <Lucide.Tag size={48} color="#94a3b8" />
          </div>

          <h3 className="tituloEstadoVazio">Nenhuma categoria</h3>
          <p className="textoEstadoVazio">Crie a primeira categoria para os reportes.</p>
        </div>
      );
    }

    return (
      <div className="listaUsuarios">
        {categorias.map((cat, i) => (
          <div key={getId(cat)} className="card animDeslizarCima">
            <div className="cardCorpo cardCategoriaCorpo">

              <div>
                <div className="nomeCategoria">{cat.nome}</div>
                {cat.descricao && (
                  <div className="descricaoCategoria">
                    {cat.descricao}
                  </div>
                )}
              </div>

              <div className="listaCategoriasAcoes">

                <button className="botao botaoFantasma botaoPequeno" onClick={() => abrirForm(cat)} title="Editar">
                  <Lucide.Pencil size={16} />
                </button>

                <button className="botao botaoFantasma botaoPequeno textoPerigo" onClick={() => deletar(getId(cat))} title="Excluir">
                  <Lucide.Trash2 size={16} />
                </button>

              </div>
            </div>
          </div>
        ))}
      </div>
    );
  };

  return (
    <div className="pagina">
      <div className="container containerMedio">
        <div className="cabecalhoPagina acoesCabecalho">

          <div>
            <h1 className="tituloPagina tituloPaginaFlex">
              <Lucide.Tag size={28} /> Categorias
            </h1>
            <p className="subtituloPagina">Gerencie as categorias de reportes</p>
          </div>

          <button className="botao botaoPrimario botaoComIcone" onClick={() => abrirForm()}>
            <Lucide.Plus size={18} /> Nova Categoria
          </button>

        </div>

        {formAberto && (
          <div className="sobreposicaoModal" onClick={fecharForm}>
            <div className="modal" onClick={(e) => e.stopPropagation()}>
              <div className="cabecalhoModal cabecalhoModalFlex">

                <h2 className="tituloModal">
                  {renderTituloModal()}
                </h2>

                <button className="botao botaoFantasma botaoPequeno botaoFecharMenu" onClick={fecharForm}>
                  <Lucide.X size={18} />
                </button>

              </div>
              <form onSubmit={salvar}>
                <div className="corpoModal">

                  <div className="grupoFormulario">
                    <label className="rotuloFormulario" htmlFor="cat-nome">Nome</label>
                    <input className="campoFormulario" placeholder="Nome da categoria" value={nome} onChange={(e) => setNome(e.target.value)} required />
                  </div>

                  <div className="grupoFormulario">
                    <label className="rotuloFormulario" htmlFor="cat-descricao">Descrição</label>
                    <textarea className="areaTexto" placeholder="Descrição opcional" value={descricao} onChange={(e) => setDescricao(e.target.value)} rows={3} />
                  </div>

                </div>

                <div className="rodapeModal">

                  <button type="button" className="botao botaoSecundario" onClick={fecharForm}>
                    Cancelar
                  </button>

                  <button type="submit" className="botao botaoPrimario" disabled={salvando}>
                    {renderTextoBotaoSalvar()}
                  </button>

                </div>
              </form>
            </div>
          </div>
        )}

        {renderConteudoCategorias()}
      </div>
    </div>
  );
}
