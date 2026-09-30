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
  const nomes = Object.freeze({
    solicitante: 'Solicitante',
    triagem: 'Triagem',
    responsavel: 'Responsável'
  });
  const permissoes = Object.freeze({
    solicitante: ['cadastrar_demanda', 'consultar_detalhes', 'cancelar_demanda'],
    triagem: ['consultar_detalhes', 'alterar_status', 'cancelar_demanda'],
    responsavel: ['consultar_detalhes', 'alterar_status']
  });

  const recipiente = document.querySelector('.profile-container');
  const indicador = recipiente?.querySelector('.profile-indicator');
  const valor = recipiente?.querySelector('.profile-value');
  let seletor = null;
  let perfilAtual = null;

  if (emDesenvolvimento) {
    perfilAtual = 'solicitante';
    try {
      const salvo = localStorage.getItem(chavePerfil);
      if (Object.prototype.hasOwnProperty.call(nomes, salvo)) perfilAtual = salvo;
    } catch {
      // Mesmo sem armazenamento, a troca continua funcionando nesta página.
    }
  }

  function atualizarPerfil() {
    if (valor) valor.textContent = nomes[perfilAtual] || 'A definir';
    if (seletor) seletor.value = perfilAtual || '';

    if (perfilAtual) {
      document.body.dataset.perfilAtivo = perfilAtual;
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
      detail: { perfil }
    }));
    return true;
  }

  // Estas permissões só orientam a interface; o servidor terá de autorizar as ações reais.
  window.FullmetalPerfis = Object.freeze({
    obterPerfilAtual: () => perfilAtual,
    obterUsuarioAtual: () => perfilAtual ? { perfil: perfilAtual, origem: 'desenvolvimento' } : null,
    pode: acao => Boolean(perfilAtual && permissoes[perfilAtual].includes(acao)),
    definirPerfil
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
    seletor.addEventListener('change', () => definirPerfil(seletor.value));

    controle.append(etiqueta, aviso, seletor);
    recipiente.appendChild(controle);
    indicador.hidden = true;
  }

  atualizarPerfil();
})();
