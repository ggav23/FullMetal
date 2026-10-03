(() => {
  const contrastButton = document.querySelector("[data-contrast-toggle]");
  if (!contrastButton) return;

  const preferenceKey = "fullmetal-high-contrast";
  let contrastEnabled = false;

  // Recupero a preferência sem depender do armazenamento para o botão funcionar.
  try {
    contrastEnabled = localStorage.getItem(preferenceKey) === "true";
  } catch {
    // O navegador pode bloquear o armazenamento em arquivos locais.
  }

  function updateContrast() {
    document.body.classList.toggle("high-contrast", contrastEnabled);
    contrastButton.setAttribute("aria-pressed", String(contrastEnabled));
    contrastButton.setAttribute(
      "aria-label",
      contrastEnabled ? "Desativar alto contraste" : "Ativar alto contraste",
    );
  }

  updateContrast();
  contrastButton.hidden = false;

  contrastButton.addEventListener("click", () => {
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
  const emDesenvolvimento =
    window.location.protocol === "file:" ||
    ["localhost", "127.0.0.1"].includes(window.location.hostname);
  const chavePerfil = "fullmetal-dev-perfil";
  const chaveUsuario = "fullmetal-dev-usuario";
  const nomes = Object.freeze({
    solicitante: "Solicitante",
    triagem: "Triagem",
    responsavel: "Responsável",
  });
  const paginas = Object.freeze({
    solicitante: "painel-de-demandas.html",
    triagem: "triagem.html",
    responsavel: "responsavel.html",
  });
  const permissoes = Object.freeze({
    solicitante: [
      "cadastrar_demanda",
      "consultar_detalhes",
      "cancelar_demanda",
    ],
    triagem: [
      "consultar_detalhes",
      "alterar_status",
      "cancelar_demanda",
      "encaminhar_demanda",
    ],
    responsavel: [
      "consultar_detalhes",
      "alterar_status",
      "definir_prioridade",
      "iniciar_atendimento",
      "concluir_demanda",
    ],
  });

  const recipiente = document.querySelector(".profile-container");
  const indicador = recipiente?.querySelector(".profile-indicator");
  const valor = recipiente?.querySelector(".profile-value");
  let seletor = null;
  let botaoPerfil = null;
  let rotuloPerfil = null;
  let fecharMenuPerfil = () => {};
  const opcoesPerfil = [];
  let perfilAtual = null;
  let usuarioDev = null;

  if (emDesenvolvimento) {
    // Mantenho a mesma identidade ao trocar de perfil para testar "minhas demandas".
    // A unidade fica vazia até ser informada explicitamente; não invento um setor.
    try {
      const salvo = JSON.parse(localStorage.getItem(chaveUsuario));
      if (
        salvo &&
        typeof salvo.id === "string" &&
        salvo.id.startsWith("dev-") &&
        salvo.id.length > 4
      ) {
        usuarioDev = {
          id: salvo.id,
          unidade:
            typeof salvo.unidade === "string" && salvo.unidade.trim()
              ? salvo.unidade.trim()
              : null,
        };
      }
    } catch {
      // Dados inválidos ou armazenamento bloqueado não impedem os testes locais.
    }
    if (!usuarioDev) {
      const id =
        globalThis.crypto?.randomUUID?.() ||
        `${Date.now().toString(36)}-${Math.random().toString(36).slice(2)}`;
      usuarioDev = { id: `dev-${id}`, unidade: null };
    }
    salvarUsuarioDev();
    perfilAtual = "solicitante";
    try {
      const salvo = localStorage.getItem(chavePerfil);
      if (Object.prototype.hasOwnProperty.call(nomes, salvo))
        perfilAtual = salvo;
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
      ? {
          ...usuarioDev,
          nome: null,
          perfil: perfilAtual,
          origem: "desenvolvimento",
        }
      : null;
  }

  function definirUnidadeDesenvolvimento(unidade) {
    // A integração de testes informa a chave real da unidade; null limpa o contexto.
    if (!emDesenvolvimento || (unidade !== null && typeof unidade !== "string"))
      return false;
    usuarioDev.unidade =
      typeof unidade === "string" ? unidade.trim() || null : null;
    salvarUsuarioDev();
    document.dispatchEvent(
      new CustomEvent("fullmetal:usuario-alterado", {
        detail: { usuario: obterUsuarioAtual() },
      }),
    );
    return true;
  }

  function atualizarPerfil() {
    if (valor) valor.textContent = nomes[perfilAtual] || "A definir";
    if (seletor) seletor.value = perfilAtual || "";
    if (rotuloPerfil)
      rotuloPerfil.textContent = nomes[perfilAtual] || "A definir";
    if (botaoPerfil)
      botaoPerfil.setAttribute(
        "aria-label",
        `Perfil: ${nomes[perfilAtual]}. Alterar perfil local de desenvolvimento`,
      );
    for (const opcao of opcoesPerfil) {
      const ativa = opcao.dataset.perfil === perfilAtual;
      opcao.classList.toggle("active", ativa);
      opcao.setAttribute("aria-checked", String(ativa));
    }

    if (perfilAtual) {
      document.body.dataset.perfilAtivo = perfilAtual;
      const marca = document.querySelector(".brand");
      if (marca) marca.href = paginas[perfilAtual];
    } else {
      delete document.body.dataset.perfilAtivo;
    }
  }

  function definirPerfil(perfil) {
    if (
      !emDesenvolvimento ||
      !Object.prototype.hasOwnProperty.call(nomes, perfil)
    )
      return false;
    if (perfil === perfilAtual) return true;

    perfilAtual = perfil;
    atualizarPerfil();
    fecharMenuPerfil();
    try {
      localStorage.setItem(chavePerfil, perfil);
    } catch {
      // A escolha ainda vale até a página ser recarregada.
    }

    // Outras telas podem reagir a esta troca sem depender do HTML do cabeçalho.
    document.dispatchEvent(
      new CustomEvent("fullmetal:perfil-alterado", {
        detail: { perfil, usuario: obterUsuarioAtual() },
      }),
    );
    return true;
  }

  // Estas permissões só orientam a interface; o servidor terá de autorizar as ações reais.
  window.FullmetalPerfis = Object.freeze({
    obterPerfilAtual: () => perfilAtual,
    obterUsuarioAtual,
    pode: (acao) =>
      Boolean(perfilAtual && permissoes[perfilAtual].includes(acao)),
    definirPerfil,
    definirUnidadeDesenvolvimento,
  });

  if (emDesenvolvimento && recipiente && indicador) {
    const controle = document.createElement("div");
    controle.className = "profile-switcher";

    const etiqueta = document.createElement("label");
    etiqueta.className = "sr-only";
    etiqueta.htmlFor = "perfil-dev";
    etiqueta.textContent = "Perfil de teste, somente desenvolvimento";

    seletor = document.createElement("select");
    seletor.id = "perfil-dev";
    seletor.className = "profile-dev-select";
    // Mantenho o valor nativo como contrato; o menu visual usa a mesma função de troca.
    seletor.hidden = true;
    for (const [chave, nome] of Object.entries(nomes)) {
      const opcao = document.createElement("option");
      opcao.value = chave;
      opcao.textContent = nome;
      seletor.appendChild(opcao);
    }
    function trocarPerfil(perfil) {
      if (!Object.prototype.hasOwnProperty.call(nomes, perfil)) return false;
      const formulario = document.querySelector("#formulario-demanda");
      const temRascunho =
        formulario &&
        [...formulario.querySelectorAll("input, textarea, select")].some(
          (campo) => campo.value.trim(),
        );
      if (
        temRascunho &&
        !window.confirm(
          "Há informações preenchidas na nova demanda. Deseja descartá-las e trocar de perfil?",
        )
      ) {
        seletor.value = perfilAtual;
        fecharMenuPerfil(true);
        return false;
      }
      try {
        // A troca pelo menu abre outra página. Salvo a escolha sem mudar o contexto
        // da tela antiga; o header do destino recupera o perfil e valida sua própria tela.
        localStorage.setItem(chavePerfil, perfil);
      } catch {
        seletor.value = perfilAtual;
        fecharMenuPerfil(true);
        window.alert(
          "Não foi possível salvar a escolha de perfil. Verifique o armazenamento do navegador e tente novamente.",
        );
        return false;
      }
      seletor.value = perfilAtual;
      fecharMenuPerfil();
      window.location.assign(paginas[perfil]);
      return true;
    }
    seletor.addEventListener("change", () => trocarPerfil(seletor.value));

    botaoPerfil = document.createElement("button");
    botaoPerfil.type = "button";
    botaoPerfil.className = "profile-dev-control";
    botaoPerfil.id = "perfil-toggle";
    botaoPerfil.setAttribute("aria-haspopup", "menu");
    botaoPerfil.setAttribute("aria-expanded", "false");
    botaoPerfil.setAttribute("aria-controls", "perfil-menu");
    const prefixo = document.createElement("span");
    prefixo.className = "profile-label";
    prefixo.textContent = "Perfil:";
    rotuloPerfil = document.createElement("span");
    rotuloPerfil.className = "profile-current-name";
    const seta = document.createElement("span");
    seta.className = "profile-chevron";
    seta.setAttribute("aria-hidden", "true");
    botaoPerfil.append(prefixo, rotuloPerfil, seta);

    const menu = document.createElement("div");
    menu.id = "perfil-menu";
    menu.className = "profile-menu";
    menu.hidden = true;
    const lista = document.createElement("div");
    lista.setAttribute("role", "menu");
    lista.setAttribute("aria-label", "Perfis locais de desenvolvimento");
    const descricoes = {
      solicitante: "Registra e acompanha suas demandas.",
      triagem: "Analisa e encaminha as solicitações.",
      responsavel: "Define a prioridade e atende sua unidade.",
    };
    for (const [perfil, nome] of Object.entries(nomes)) {
      const opcao = document.createElement("button");
      opcao.type = "button";
      opcao.className = "profile-option";
      opcao.dataset.perfil = perfil;
      opcao.setAttribute("role", "menuitemradio");
      opcao.tabIndex = -1;
      const titulo = document.createElement("strong");
      titulo.textContent = nome;
      const descricao = document.createElement("span");
      descricao.className = "profile-option-description";
      descricao.textContent = descricoes[perfil];
      opcao.append(titulo, descricao);
      lista.appendChild(opcao);
      opcoesPerfil.push(opcao);
      opcao.addEventListener("click", () => {
        if (perfil === perfilAtual) fecharMenuPerfil(true);
        else trocarPerfil(perfil);
      });
      opcao.addEventListener("keydown", (evento) => {
        const indice = opcoesPerfil.indexOf(opcao);
        let destino;
        if (evento.key === "ArrowDown")
          destino = (indice + 1) % opcoesPerfil.length;
        if (evento.key === "ArrowUp")
          destino = (indice + opcoesPerfil.length - 1) % opcoesPerfil.length;
        if (evento.key === "Home") destino = 0;
        if (evento.key === "End") destino = opcoesPerfil.length - 1;
        if (destino !== undefined) {
          evento.preventDefault();
          opcoesPerfil[destino].focus();
        }
      });
    }
    menu.append(lista);
    fecharMenuPerfil = (devolverFoco = false) => {
      menu.hidden = true;
      botaoPerfil.setAttribute("aria-expanded", "false");
      if (devolverFoco) botaoPerfil.focus();
    };
    function abrirMenu(ultimo = false) {
      menu.hidden = false;
      botaoPerfil.setAttribute("aria-expanded", "true");
      (ultimo
        ? opcoesPerfil.at(-1)
        : opcoesPerfil.find((opcao) => opcao.dataset.perfil === perfilAtual) ||
          opcoesPerfil[0]
      ).focus();
    }
    botaoPerfil.addEventListener("click", () =>
      menu.hidden ? abrirMenu() : fecharMenuPerfil(true),
    );
    botaoPerfil.addEventListener("keydown", (evento) => {
      if (["ArrowDown", "ArrowUp"].includes(evento.key)) {
        evento.preventDefault();
        abrirMenu(evento.key === "ArrowUp");
      }
    });
    controle.addEventListener("keydown", (evento) => {
      if (evento.key === "Escape" && !menu.hidden) {
        evento.preventDefault();
        fecharMenuPerfil(true);
      }
      if (evento.key === "Tab") fecharMenuPerfil();
    });
    document.addEventListener("click", (evento) => {
      if (!controle.contains(evento.target)) fecharMenuPerfil();
    });
    controle.addEventListener("focusout", (evento) => {
      if (!controle.contains(evento.relatedTarget)) fecharMenuPerfil();
    });

    controle.append(etiqueta, seletor, botaoPerfil, menu);
    recipiente.appendChild(controle);
    indicador.hidden = true;
  }

  atualizarPerfil();
})();
