(() => {
  const contrastButton = document.querySelector('[data-contrast-toggle]');
  if (!contrastButton) return;

  const preferenceKey = 'fullmetal-high-contrast';
  let contrastEnabled = false;

  // Recupero a preferência sem depender do armazenamento para o botão funcionar.
  try {
    contrastEnabled = localStorage.getItem(preferenceKey) === 'true';
  } catch {
    // O navegador pode bloquear o armazenamento em arquivos locais.
  }

  function updateContrast() {
    document.body.classList.toggle('high-contrast', contrastEnabled);
    contrastButton.setAttribute('aria-pressed', String(contrastEnabled));
    contrastButton.setAttribute(
      'aria-label',
      contrastEnabled ? 'Desativar alto contraste' : 'Ativar alto contraste'
    );
  }

  updateContrast();
  contrastButton.hidden = false;

  contrastButton.addEventListener('click', () => {
    contrastEnabled = !contrastEnabled;
    updateContrast();

    try {
      localStorage.setItem(preferenceKey, String(contrastEnabled));
    } catch {
      // A preferência continua ativa nesta página mesmo sem armazenamento.
    }
  });
})();

(() => {
  // Este seletor existe apenas para testar as telas antes da autenticação real.
  const emDesenvolvimento = window.location.protocol === 'file:' ||
    ['localhost', '127.0.0.1'].includes(window.location.hostname);
  const chavePerfil = 'fullmetal-dev-perfil';
  const chaveUsuario = 'fullmetal-dev-usuario';
  const nomes = Object.freeze({
    solicitante: 'Solicitante',
    triagem: 'Triagem',
    responsavel: 'Responsável'
  });
  const paginas = Object.freeze({
    solicitante: 'painel-de-demandas.html',
    triagem: 'triagem.html',
    responsavel: 'responsavel.html'
  });
  const permissoes = Object.freeze({
    solicitante: ['cadastrar_demanda', 'consultar_detalhes', 'cancelar_demanda'],
    triagem: ['consultar_detalhes', 'alterar_status', 'cancelar_demanda', 'encaminhar_demanda'],
    responsavel: ['consultar_detalhes', 'alterar_status', 'definir_prioridade', 'iniciar_atendimento', 'concluir_demanda']
  });

  const recipiente = document.querySelector('.profile-container');
  const indicador = recipiente?.querySelector('.profile-indicator');
  const valor = recipiente?.querySelector('.profile-value');
  let seletor = null;
  let perfilAtual = null;
  let usuarioDev = null;

  if (emDesenvolvimento) {
    // Mantenho a mesma identidade ao trocar de perfil para testar "minhas demandas".
    // A unidade fica vazia até ser informada explicitamente; não invento um setor.
    try {
      const salvo = JSON.parse(localStorage.getItem(chaveUsuario));
      if (salvo && typeof salvo.id === 'string' && salvo.id.startsWith('dev-') && salvo.id.length > 4) {
        usuarioDev = {
          id: salvo.id,
          unidade: typeof salvo.unidade === 'string' && salvo.unidade.trim() ? salvo.unidade.trim() : null
        };
      }
    } catch {
      // Dados inválidos ou armazenamento bloqueado não impedem os testes locais.
    }
    if (!usuarioDev) {
      const id = globalThis.crypto?.randomUUID?.() || `${Date.now().toString(36)}-${Math.random().toString(36).slice(2)}`;
      usuarioDev = { id: `dev-${id}`, unidade: null };
    }
    salvarUsuarioDev();
    perfilAtual = 'solicitante';
    try {
      const salvo = localStorage.getItem(chavePerfil);
      if (Object.prototype.hasOwnProperty.call(nomes, salvo)) perfilAtual = salvo;
    } catch {
      // Mesmo sem armazenamento, a troca continua funcionando nesta página.
    }
    // Ao abrir uma tela de atendimento diretamente, uso o perfil de teste daquela página.
    const perfilPagina = document.body.dataset.perfilPagina;
    if (Object.prototype.hasOwnProperty.call(nomes, perfilPagina)) {
      perfilAtual = perfilPagina;
      try {
        localStorage.setItem(chavePerfil, perfilAtual);
      } catch {
        // A escolha continua válida nesta página.
      }
    }
  }

  function salvarUsuarioDev() {
    try {
      localStorage.setItem(chaveUsuario, JSON.stringify(usuarioDev));
    } catch {
      // Sem armazenamento, a identidade só dura até a página ser recarregada.
    }
  }

  function obterUsuarioAtual() {
    // Retorno uma cópia para outro módulo não alterar a identidade por acidente.
    return perfilAtual && usuarioDev
      ? { ...usuarioDev, nome: null, perfil: perfilAtual, origem: 'desenvolvimento' }
      : null;
  }

  function definirUnidadeDesenvolvimento(unidade) {
    // A integração de testes informa a chave real da unidade; null limpa o contexto.
    if (!emDesenvolvimento || (unidade !== null && typeof unidade !== 'string')) return false;
    usuarioDev.unidade = typeof unidade === 'string' ? unidade.trim() || null : null;
    salvarUsuarioDev();
    document.dispatchEvent(new CustomEvent('fullmetal:usuario-alterado', {
      detail: { usuario: obterUsuarioAtual() }
    }));
    return true;
  }

  function atualizarPerfil() {
    if (valor) valor.textContent = nomes[perfilAtual] || 'A definir';
    if (seletor) seletor.value = perfilAtual || '';

    if (perfilAtual) {
      document.body.dataset.perfilAtivo = perfilAtual;
      const marca = document.querySelector('.brand');
      if (marca) marca.href = paginas[perfilAtual];
    } else {
      delete document.body.dataset.perfilAtivo;
    }
  }

  function definirPerfil(perfil) {
    if (!emDesenvolvimento || !Object.prototype.hasOwnProperty.call(nomes, perfil)) return false;
    if (perfil === perfilAtual) return true;

    perfilAtual = perfil;
    atualizarPerfil();
    try {
      localStorage.setItem(chavePerfil, perfil);
    } catch {
      // A escolha ainda vale até a página ser recarregada.
    }

    // Outras telas podem reagir a esta troca sem depender do HTML do cabeçalho.
    document.dispatchEvent(new CustomEvent('fullmetal:perfil-alterado', {
      detail: { perfil, usuario: obterUsuarioAtual() }
    }));
    return true;
  }

  // Estas permissões só orientam a interface; o servidor terá de autorizar as ações reais.
  window.FullmetalPerfis = Object.freeze({
    obterPerfilAtual: () => perfilAtual,
    obterUsuarioAtual,
    pode: acao => Boolean(perfilAtual && permissoes[perfilAtual].includes(acao)),
    definirPerfil,
    definirUnidadeDesenvolvimento
  });

  if (emDesenvolvimento && recipiente && indicador) {
    const controle = document.createElement('div');
    controle.className = 'profile-dev-control';

    const etiqueta = document.createElement('label');
    etiqueta.className = 'sr-only';
    etiqueta.htmlFor = 'perfil-dev';
    etiqueta.textContent = 'Perfil de teste, somente desenvolvimento';

    const aviso = document.createElement('span');
    aviso.className = 'profile-dev-badge';
    aviso.setAttribute('aria-hidden', 'true');
    aviso.textContent = 'DEV';

    seletor = document.createElement('select');
    seletor.id = 'perfil-dev';
    seletor.className = 'profile-dev-select';
    for (const [chave, nome] of Object.entries(nomes)) {
      const opcao = document.createElement('option');
      opcao.value = chave;
      opcao.textContent = nome;
      seletor.appendChild(opcao);
    }
    seletor.addEventListener('change', () => {
      const formulario = document.querySelector('#formulario-demanda');
      const temRascunho = formulario && [...formulario.querySelectorAll('input, textarea, select')].some(campo => campo.value.trim());
      if (temRascunho && !window.confirm('Há informações preenchidas na nova demanda. Deseja descartá-las e trocar de perfil?')) {
        seletor.value = perfilAtual;
        return;
      }
      if (definirPerfil(seletor.value)) window.location.assign(paginas[seletor.value]);
    });

    controle.append(etiqueta, aviso, seletor);
    recipiente.appendChild(controle);
    indicador.hidden = true;
  }

  atualizarPerfil();
})();
