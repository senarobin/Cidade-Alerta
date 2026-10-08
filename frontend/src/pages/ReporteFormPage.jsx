import { useState, useEffect, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useQuery, useMutation, useApolloClient } from '@apollo/client/react';
import { reportesApi } from '../services/api';
import { GET_CATEGORIAS, GET_REPORTE, CRIAR_REPORTE } from '../graphql/operations';
import { useToast } from '../contexts/ToastContext';
import { extrairGpsDoExif } from '../utils/exif';
import { getId } from '../utils/helpers';
import { Camera, ImagePlus, MapPin, AlertTriangle, Loader, Save, Megaphone, Pencil, Lightbulb, X, Check } from 'lucide-react';

export default function ReporteFormPage() {
  const {id} = useParams();
  const navegar = useNavigate();
  const toast = useToast();
  const ehEdicao = !!id;
  const refInputArquivo = useRef(null);
  const refInputCamera = useRef(null);
  const cliente = useApolloClient();
  const [salvando,setSalvando] = useState(false);
  const [extraindoGps,setExtraindoGps] = useState(false);
  const [arquivos,setArquivos] = useState([]);
  const [previews,setPreviews] = useState([]);
  const [imagensExistentes,setImagensExistentes] = useState([]);
  const [formulario,setFormulario] = useState({
    titulo: '',
    descricao: '',
    categoria: '',
    endereco: '',
    latitude: '',
    longitude: '',
  });

  const {data: dadosCategorias} = useQuery(GET_CATEGORIAS);
  const categorias = dadosCategorias?.categorias || [];
  const {data: dadosReporte,loading: carregandoReporte,error: erroReporte} = useQuery(GET_REPORTE,{
    variables: {id},
    skip: !ehEdicao,
    fetchPolicy: 'network-only',
  });

  const carregando = ehEdicao && carregandoReporte && !dadosReporte;
  const [criarReporteMutation] = useMutation(CRIAR_REPORTE);
  useEffect(() =>{
    if (!ehEdicao) {
      return;
    }
    if (erroReporte || (dadosReporte && !dadosReporte.reporte)) {
      toast.error('Reporte não encontrado.');
      navegar('/reportes');
      return;
    }

    const r = dadosReporte?.reporte;

    if (!r) {
      return;
    }

    setFormulario({
      titulo: r.titulo || '',
      descricao: r.descricao || '',
      categoria: getId(r.categoria) || '',
      endereco: r.endereco || '',
      latitude: r.localizacao?.coordinates?.[1]?.toString() || '',
      longitude: r.localizacao?.coordinates?.[0]?.toString() || '',
    });
    setImagensExistentes(r.imagens || []);
  },[ehEdicao,dadosReporte,erroReporte]);

  useEffect(() =>{
    return () =>{
      previews.forEach((url) =>URL.revokeObjectURL(url));
    };
  },[previews]);

  const tratarMudanca = (e) =>{
    setFormulario((prev) =>({...prev,[e.target.name]:e.target.value}));
  };

  const processarArquivos = async (novosArquivos) =>{
    if (novosArquivos.length === 0) {
      return;
    }

    const todosArquivos = [...arquivos,...novosArquivos].slice(0,5);
    setArquivos(todosArquivos);

    const novosPreviews = todosArquivos.map((f) =>URL.createObjectURL(f));

    previews.forEach((url) =>URL.revokeObjectURL(url));
    setPreviews(novosPreviews);

    if (!formulario.latitude || !formulario.longitude) {
      setExtraindoGps(true);

      for (const arquivo of novosArquivos) {
        try {
          const gps = await extrairGpsDoExif(arquivo);

          if (gps) {
            setFormulario((prev) =>({
              ...prev,latitude: gps.latitude.toFixed(6),longitude: gps.longitude.toFixed(6),
            }));

            toast.success('Localização extraída automaticamente da foto!');
            break;
          }
        }catch {}
      }
      setExtraindoGps(false);
    }
  };

  const tratarSelecaoArquivo = (e) =>{
    const listaArquivos = Array.from(e.target.files);

    if (listaArquivos.length > 0) {
      processarArquivos(listaArquivos);
    }
    e.target.value = '';
  };

  const removerArquivo = (indice) => {
    const novosArquivos = arquivos.filter((_, i) =>i !==indice);
    setArquivos(novosArquivos);
    URL.revokeObjectURL(previews[indice]);
    setPreviews(novosArquivos.map((f) =>URL.createObjectURL(f)));
  };

  const removerImagemExistente = (indice) =>{
    setImagensExistentes((prev) =>prev.filter((_,i) =>i !== indice));
  };

  const obterLocalizacao = () =>{
    if (!window.isSecureContext) {
      toast.error('Gps requer conexão segura HTTPS, acesse por localhost ou insira as coordenadas manualmente.');
      return;
    }

    if (!navigator.geolocation) {
      toast.error('Geolocalização não suportada neste navegador.');
      return;
    }

    if(navigator.permissions && navigator.permissions.query) {
      navigator.permissions.query({name: 'geolocation'}).then((result) =>{

        if (result.state === 'denied') {
          toast.error('Permissão de localização negada. Vá nas configurações do navegador e permita o acesso à localização para este site.');
          return;
        }
        solicitarPosicao();
      }).catch(() => {
        solicitarPosicao();
      });
    }else {
      solicitarPosicao();
    }
  };

  const solicitarPosicao = () =>{
    navigator.geolocation.getCurrentPosition(
      (pos) =>{
        setFormulario((prev) =>({
          ...prev,latitude: pos.coords.latitude.toFixed(6),longitude: pos.coords.longitude.toFixed(6),
        }));
        toast.success('Localização obtida pelo GPS do dispositivo!');
      },
      (erro) =>{
        if (erro.code === 1) {
          toast.error('Permissão de localização negada. Ative nas configurações do navegador e tente novamente.');
        }else if(erro.code === 2) {
          toast.error('Não foi possível determinar sua localização. Verifique se o GPS do dispositivo está ativado.');
        }else if(erro.code === 3) {
          toast.error('Tempo esgotado ao tentar obter localização. Tente novamente em um local com melhor sinal.');
        }else {
          toast.error('Não foi possível obter a localização.');
        }
      },{enableHighAccuracy: true,timeout: 15000,maximumAge: 60000}
    );
  };

  const tratarSubmit = async (e) =>{
    e.preventDefault();

    if (!formulario.titulo || formulario.titulo.length < 5) {
      toast.error('O título deve ter no mínimo 5 caracteres.');
      return;
    }
    if (!formulario.descricao || formulario.descricao.length < 10) {
      toast.error('A descrição deve ter no mínimo 10 caracteres.');
      return;
    }
    if (!formulario.categoria) {
      toast.error('Selecione uma categoria.');
      return;
    }
    if (!formulario.latitude || !formulario.longitude) {
      toast.error('Informe a localização, tire uma foto com GPS ativo ou use o botão de localização.');
      return;
    }

    setSalvando(true);

    try {
      const dados = {
        titulo: formulario.titulo,
        descricao: formulario.descricao,
        categoria: formulario.categoria,
        endereco: formulario.endereco,
        localizacao: {type: 'Point',coordinates: [parseFloat(formulario.longitude),parseFloat(formulario.latitude)]},
      };
      if (ehEdicao) {
        dados.imagens = imagensExistentes;
        await reportesApi.atualizar(id, dados);
        await cliente.refetchQueries({ include: [GET_REPORTE] });
        toast.success('Reporte atualizado com sucesso.');
        navegar(`/reportes/${id}`);
      } else {
        const { data: dadosResposta } = await criarReporteMutation({
          variables: {
            entrada: {...dados,endereco: dados.endereco || null,imagens: arquivos
            }},
        });
        toast.success('Reporte criado com sucesso.');
        navegar(`/reportes/${dadosResposta.criarReporte.id}`);
      }
    }catch (erro) {
      toast.error(erro.message || 'Erro ao salvar reporte.');
    }finally {
      setSalvando(false);
    }
  };

  const totalImagens = arquivos.length + imagensExistentes.length;
  const podeAdicionarMais = totalImagens < 5;

  const URL_API = (() =>{
    const envUrl = import.meta.env.VITE_API_URL || '';
    if (envUrl.startsWith('/')) {
      return '';
    }

    const semApi = envUrl.replace('/api','');
    if (semApi && semApi.startsWith('http')) {
      return semApi;
    }

    const hostname = window.location.hostname;
    if (hostname !== 'localhost' && hostname !== '127.0.0.1') {
      return `http://${hostname}:3000`;
    }

    return semApi || 'http://localhost:3000';
  })();

  if (carregando) {
    return (
      <div className="pagina">
        <div className="container">
          <div className="containerCarregamento"><div className="carregador"/><span className="textoCarregamento">Carregando...</span></div>
        </div>
      </div>
    );
  }

  const renderTituloPagina = () =>{
    if (ehEdicao) {
      return <><Pencil size={20} className="iconeTitulo"/> Editar Reporte</>;
    }
    return <><Megaphone size={20} className="iconeTitulo"/> Novo Reporte</>;
  };

  const renderSubtituloPagina = () =>{
    if (ehEdicao) {
      return 'Atualize as informações do reporte';
    }
    return 'Tire uma foto do problema, adicione uma descrição e envie';
  };

  const obterUrlImagem = (img) =>{
    if (!img) return '';
    if (img.startsWith('http') || img.startsWith('blob:') || img.startsWith('data:')) {
      return img;
    }
    return `${URL_API}${img}`;
  };

  const renderLocalizacao = () =>{
    if (formulario.latitude && formulario.longitude) {
      return(
        <div className="grupoLocalizacao"><Check size={16} color="#059669"/>
          <div className="grupoLocalizacaoDetalhe"><span className="textoLocalizacaoOk">Localização capturada com sucesso</span><span className="coordenadas">({Number(formulario.latitude).toFixed(4)},{Number(formulario.longitude).toFixed(4)})</span></div>
          <button type="button" onClick={() =>setFormulario((prev) =>({...prev,latitude: '',longitude: ''}))} className="botaoLimpar">Limpar</button>
        </div>
      );
    }
    return null;
  };

  const renderBotaoSubmit = () =>{
    if (salvando) {
      return <><Loader size={16} className="spinnerInline iconeInline"/> Enviando...</>;
    }
    if (ehEdicao) {
      return <><Save size={16} className="iconeInline"/> Atualizar Reporte</>;
    }
    return <><Megaphone size={16} className="iconeInline"/> Enviar Reporte</>;
  };

  return(
    <div className="pagina">
      <div className="container containerEstreito">
        <div className="cabecalhoPagina">
          <h1 className="tituloPagina">{renderTituloPagina()}</h1>
          <p className="subtituloPagina">{renderSubtituloPagina()}</p>
        </div>

        <div className="card animAparecer">
          <div className="cardCorpo">
            <form onSubmit={tratarSubmit}>

              <div className="grupoFormulario">
                <label className="rotuloFormulario"><Camera size={16} className="iconeInline"/>Fotos do problema {!ehEdicao && '*'}{' '}<span className="textoPequenoSuave pesoNormal">({totalImagens}/5)</span></label>

                {podeAdicionarMais &&(
                  <div className="botoesFormulario">
                    <button type="button" className="botao botaoPrimario botaoFlex" onClick={() =>refInputCamera.current?.click()}><Camera size={16} className="iconeInline"/>Tirar Foto</button>
                    <button type="button" className="botao botaoSecundario botaoFlex" onClick={() =>refInputArquivo.current?.click()}><ImagePlus size={16} className="iconeInline"/>Escolher da Galeria</button>
                    <input ref={refInputCamera} type="file" accept="image/jpeg,image/jpg,image/png" capture="environment" onChange={tratarSelecaoArquivo} className="entradaOculta"/>
                    <input ref={refInputArquivo} type="file" accept="image/jpeg,image/jpg,image/png" multiple onChange={tratarSelecaoArquivo} className="entradaOculta"/>
                  </div>
                )}

                {extraindoGps &&(
                  <div className="avisoGps">
                    <div className="carregador carregadorPequeno"/>Extraindo localização da foto...</div>
                )}

                {imagensExistentes.length > 0 &&(
                  <div className="gradeImagens">

                    {imagensExistentes.map((img,i) =>(
                      <div key={`existente-${i}`} className="preVisualizacaoImagem"><img src={obterUrlImagem(img)} alt={`Imagem ${i + 1}`} className="imagemReporte"/>
                        <button type="button" onClick={() =>removerImagemExistente(i)} className="botaoRemoverImagem"><X size={12}/></button>
                      </div>
                    ))}

                  </div>
                )}

                {previews.length > 0 &&(
                  <div className="gradeImagens">

                    {previews.map((url,i) =>(
                      <div key={`nova-${i}`} className="preVisualizacaoImagem">
                        <img src={url} alt={`Nova imagem ${i + 1}`} className="imagemReporte imagemReporteDestaque"/>
                        <button type="button" onClick={() =>removerArquivo(i)} className="botaoRemoverImagem"><X size={12}/></button>
                        {i === 0 && (<span className="etiquetaPrincipal">Principal</span>)}
                      </div>
                    ))}
                  </div>
                )}

                {totalImagens === 0 && !ehEdicao &&(
                  <div onClick={() =>refInputCamera.current?.click()} className="areaArraste">
                    <div className="iconeArraste"><Camera size={40}/></div>
                    <div className="textoArrastePrimario">Toque para tirar uma foto do problema</div>
                    <div className="textoArrasteSecundario">JPEG ou PNG</div>
                  </div>
                )}
              </div>

              <div className="grupoFormulario">
                <label className="rotuloFormulario" htmlFor="titulo">Título</label>
                <input name="titulo" type="text" className="campoFormulario" value={formulario.titulo} onChange={tratarMudanca} required minLength={5} />
                <span className="textoPequenoSuave">min 5 </span>
              </div>

              <div className="grupoFormulario">
                <label className="rotuloFormulario" htmlFor="descricao">Descrição</label>
                <textarea name="descricao" className="areaTexto" value={formulario.descricao} onChange={tratarMudanca} rows={5} required minLength={10}/>
                <span className="textoPequenoSuave">min 10</span>
              </div>

              <div className="grupoFormulario">
                <label className="rotuloFormulario" htmlFor="categoria">Categoria</label>
                <select name="categoria" className="selecaoFormulario" value={formulario.categoria} onChange={tratarMudanca} required>
                  <option value="">Selecione uma categoria</option>

                  {categorias.map((c) =>(
                    <option key={c.id} value={c.id}>{c.nome}</option>
                  ))}
                </select>
              </div>

              <div className="grupoFormulario">
                <label className="rotuloFormulario" htmlFor="endereco"> Endereço <span className="textoPequenoSuave pesoNormal"></span></label>
                <input name="endereco" type="text" className="campoFormulario" placeholder="Rua das Flores, 123 - Centro" value={formulario.endereco} onChange={tratarMudanca}/>
              </div>
              <div className="grupoFormulario">
                <label className="rotuloFormulario"><MapPin size={16} className="iconeInline"/>Localização</label>
                {renderLocalizacao()}
                <div className="grupoBotoesFlex">
                  <button type="button" className="botao botaoSecundario" onClick={obterLocalizacao}><MapPin size={16} className="iconeInline"/>Usar GPS do dispositivo</button>
                </div>
                <details className="detalhesCoordenadas">
                  <summary className="resumoCoordenadas">Inserir coordenadas manualmente</summary>
                  <div className="gridCoordenadas">
                    <input name="latitude" type="number" step="any" className="campoFormulario" placeholder="Latitude (ex: -22.9068)" value={formulario.latitude} onChange={tratarMudanca}/>
                    <input name="longitude" type="number" step="any" className="campoFormulario" placeholder="Longitude (ex: -43.1729)" value={formulario.longitude} onChange={tratarMudanca}/>
                  </div>
                </details>
              </div>
              <div className="botoesAcoesForm">
                <button type="button" className="botao botaoSecundario" onClick={() =>navegar(-1)}>Cancelar</button>
                <button type="submit" className="botao botaoPrimario botaoGrande" disabled={salvando}>{renderBotaoSubmit()}</button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
