(() => {
  const tela = document.querySelector("[data-tela-atendimento]");
  if (!tela) return;

  const perfil = document.body.dataset.perfilPagina;
  const fila = tela.querySelector("[data-lista-fila]");
  const filaVazia = tela.querySelector("[data-fila-vazia]");
  const painelDetalhe = tela.querySelector("[data-painel-detalhe]");
  const detalhe = tela.querySelector("[data-detalhe]");
  const detalheVazio = tela.querySelector("[data-detalhe-vazio]");
  const anuncio = tela.querySelector("[data-anuncio]");
  const erro = tela.querySelector("[data-erro]");
  const abas = [...document.querySelectorAll('[role="tab"]')];
  const buscaFila = tela.querySelector("#busca-fila");
  const statusFila = tela.querySelector("#status-fila");
  const limparFila = tela.querySelector("[data-limpar-fila]");
  const buscaTodas = tela.querySelector("#busca-todas");
  const statusTodas = tela.querySelector("#status-todas");
  const limparAuditoria = tela.querySelector("[data-limpar-auditoria]");
  let demandas = [];
  let selecionada = null;

  const normalizar = (valor) =>
    String(valor ?? "")
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .toLowerCase()
      .trim();
  const estados = {
    pendente: [FullmetalDemandas.STATUS.PENDENTE, "status-pendente"],
    "em atendimento": [
      FullmetalDemandas.STATUS.EM_ATENDIMENTO,
      "status-em-atendimento",
    ],
    concluida: [FullmetalDemandas.STATUS.CONCLUIDA, "status-concluida"],
    cancelada: [FullmetalDemandas.STATUS.CANCELADA, "status-cancelada"],
  };
  const texto = (valor) =>
    typeof valor === "string" || typeof valor === "number"
      ? String(valor)
      : "Não informado";

  function criar(tag, conteudo, classe) {
    const elemento = document.createElement(tag);
    if (conteudo !== undefined) elemento.textContent = texto(conteudo);
    if (classe) elemento.className = classe;
    return elemento;
  }

  function criarStatus(status) {
    const chave = normalizar(status);
    const [nome, classe] = Object.prototype.hasOwnProperty.call(estados, chave)
      ? estados[chave]
      : ["Status não informado", "status-cancelada"];
    return criar("span", nome, `status-badge ${classe}`);
  }

  function formatarData(valor) {
    if (!valor) return "Não informada";
    const data = new Date(valor);
    if (Number.isNaN(data.getTime())) return "Não informada";
    return new Intl.DateTimeFormat("pt-BR", {
      dateStyle: "short",
      timeStyle: "short",
    }).format(data);
  }

  function limparDetalhe() {
    selecionada = null;
    detalhe.hidden = true;
    detalheVazio.hidden = false;
    delete detalhe.dataset.demandaId;
    tela.dataset.detalheAberto = "false";
  }

  function mudarAba(aba, moverFoco = false) {
    for (const item of abas) {
      const ativa = item === aba;
      item.classList.toggle("active", ativa);
      item.setAttribute("aria-selected", String(ativa));
      item.tabIndex = ativa ? 0 : -1;
      document.getElementById(item.getAttribute("aria-controls")).hidden =
        !ativa;
    }
    tela.dataset.detalheAberto = "false";
    if (moverFoco) aba.focus();
  }

  for (const [indice, aba] of abas.entries()) {
    aba.addEventListener("click", () => mudarAba(aba));
    aba.addEventListener("keydown", (evento) => {
      let destino;
      if (evento.key === "ArrowRight") destino = (indice + 1) % abas.length;
      if (evento.key === "ArrowLeft")
        destino = (indice + abas.length - 1) % abas.length;
      if (evento.key === "Home") destino = 0;
      if (evento.key === "End") destino = abas.length - 1;
      if (destino !== undefined) {
        evento.preventDefault();
        mudarAba(abas[destino], true);
      }
    });
  }

  function selecionarDemanda(id, moverFoco = true, abrirAba = true) {
    const demanda = demandas.find((item) => String(item.id) === String(id));
    if (!demanda) return false;

    selecionada = String(demanda.id);
    if (
      abrirAba &&
      abas.length &&
      document.getElementById("painel-fila").hidden
    )
      mudarAba(abas[0]);
    for (const campo of detalhe.querySelectorAll("[data-campo]")) {
      const chave = campo.dataset.campo;
      campo.textContent =
        chave === "id"
          ? `Demanda ${texto(demanda.id)}`
          : chave === "dataCriacao"
            ? formatarData(demanda[chave])
            : chave === "prioridade"
              ? FullmetalCatalogos.nomePrioridade(demanda.prioridade)
              : chave === "categoria"
                ? FullmetalCatalogos.nomeCategoria(demanda[chave])
                : chave === "unidade"
                  ? demanda.unidade
                    ? FullmetalCatalogos.nomeUnidade(demanda.unidade)
                    : "Aguardando encaminhamento"
                  : texto(demanda[chave]);
    }
    const status = criarStatus(demanda.status);
    detalhe.querySelector("[data-status]").replaceWith(status);
    status.dataset.status = "";

    const historico = detalhe.querySelector("[data-historico]");
    historico.replaceChildren();
    const registros = Array.isArray(demanda.historico) ? demanda.historico : [];
    for (const registro of registros) {
      if (!registro || typeof registro !== "object") continue;
      const item = criar("li", registro.descricao);
      const data = criar("time", formatarData(registro.data));
      if (registro.data && !Number.isNaN(new Date(registro.data).getTime()))
        data.dateTime = new Date(registro.data).toISOString();
      item.appendChild(data);
      historico.appendChild(item);
    }
    if (!historico.children.length)
      historico.appendChild(criar("li", "Nenhum andamento registrado."));

    const estado = normalizar(demanda.status);
    detalhe.querySelector(".action-card").hidden = [
      "concluida",
      "cancelada",
    ].includes(estado);
    if (perfil === "responsavel") {
      detalhe.querySelector("#prioridade").value = [
        "normal",
        "media",
        "alta",
      ].includes(normalizar(demanda.prioridade))
        ? normalizar(demanda.prioridade)
        : "";
      detalhe.querySelector('[data-acao="iniciar"]').hidden =
        estado !== "pendente";
      detalhe.querySelector('[data-acao="concluir"]').hidden =
        estado !== "em atendimento";
    }

    for (const botao of fila.querySelectorAll("button"))
      botao.setAttribute(
        "aria-pressed",
        String(botao.dataset.demandaId === selecionada),
      );
    detalhe.dataset.demandaId = selecionada;
    detalheVazio.hidden = true;
    detalhe.hidden = false;
    tela.dataset.detalheAberto = "true";
    anuncio.textContent = `Demanda ${selecionada} selecionada.`;
    if (moverFoco) painelDetalhe.focus({ preventScroll: true });
    document.dispatchEvent(
      new CustomEvent("fullmetal:demanda-selecionada", {
        detail: { id: selecionada, perfil },
      }),
    );
    return true;
  }

  tela.querySelector("[data-voltar-fila]").addEventListener("click", () => {
    tela.dataset.detalheAberto = "false";
    const botao = [...fila.querySelectorAll("button")].find(
      (item) => item.dataset.demandaId === selecionada,
    );
    (botao || abas[0] || fila).focus({ preventScroll: true });
  });

  function renderizarFila() {
    fila.replaceChildren();
    // Após encaminhar, a demanda sai da triagem, mas continua pendente até o início do atendimento.
    const base =
      perfil === "triagem"
        ? demandas.filter(
            (item) => normalizar(item.status) === "pendente" && !item.unidade,
          )
        : demandas;
    const itens = FullmetalFiltros.aplicar(base, {
      termo: buscaFila.value,
      status: statusFila?.value,
    });
    for (const demanda of itens) {
      const item = criar("li");
      const botao = criar("button", undefined, "queue-item");
      botao.type = "button";
      botao.dataset.demandaId = String(demanda.id);
      botao.setAttribute(
        "aria-pressed",
        String(String(demanda.id) === selecionada),
      );
      botao.append(
        criar("span", `Demanda ${texto(demanda.id)}`, "demand-id"),
        criar("strong", demanda.titulo, "queue-item-title"),
      );
      const meta = criar("span", undefined, "queue-item-meta");
      meta.append(
        criar("span", demanda.localizacao),
        criarStatus(demanda.status),
      );
      botao.appendChild(meta);
      botao.addEventListener("click", () => selecionarDemanda(demanda.id));
      item.appendChild(botao);
      fila.appendChild(item);
    }
    filaVazia.hidden = itens.length > 0;
    filaVazia.querySelector("h3").textContent = base.length
      ? "Nenhum resultado encontrado"
      : "Nenhuma demanda disponível";
    filaVazia.querySelector("p").textContent = base.length
      ? "Altere a busca ou limpe os filtros para consultar outras demandas."
      : "As demandas disponíveis aparecerão nesta fila.";
    limparFila.disabled = !buscaFila.value && !statusFila?.value;
    const contagem = document.querySelector("[data-contagem-fila]");
    if (contagem) contagem.textContent = String(itens.length);
  }

  function renderizarAuditoria() {
    const corpo = tela.querySelector("[data-auditoria]");
    if (!corpo) return;
    const itens = FullmetalFiltros.aplicar(demandas, {
      termo: buscaTodas.value,
      status: statusTodas.value,
    });
    corpo.replaceChildren();
    const colunas = {
      id: "ID",
      titulo: "Título",
      categoria: "Categoria",
      localizacao: "Localização",
      unidade: "Unidade",
      status: "Status",
    };
    for (const demanda of itens) {
      const linha = criar("tr");
      linha.setAttribute("role", "row");
      for (const [chave, rotulo] of Object.entries(colunas)) {
        const celula = criar("td");
        celula.setAttribute("role", "cell");
        celula.dataset.rotulo = rotulo;
        if (chave === "id") {
          const botao = criar("button", demanda.id, "audit-open");
          botao.type = "button";
          botao.setAttribute(
            "aria-label",
            `Consultar demanda ${texto(demanda.id)}`,
          );
          botao.addEventListener("click", () => selecionarDemanda(demanda.id));
          celula.appendChild(botao);
        } else if (chave === "status") {
          celula.appendChild(criarStatus(demanda.status));
        } else {
          celula.textContent =
            chave === "categoria"
              ? FullmetalCatalogos.nomeCategoria(demanda[chave])
              : chave === "unidade"
                ? demanda.unidade
                  ? FullmetalCatalogos.nomeUnidade(demanda.unidade)
                  : "Aguardando encaminhamento"
                : texto(demanda[chave]);
        }
        linha.appendChild(celula);
      }
      corpo.appendChild(linha);
    }
    const vazio = tela.querySelector("[data-auditoria-vazia]");
    vazio.hidden = itens.length > 0;
    vazio.querySelector("h3").textContent = demandas.length
      ? "Nenhum resultado encontrado"
      : "Nenhuma demanda disponível";
    vazio.querySelector("p").textContent = demandas.length
      ? "Altere a busca ou limpe os filtros para consultar outras demandas."
      : "As demandas disponíveis para consulta aparecerão aqui.";
    tela.querySelector("[data-tabela-auditoria]").hidden = itens.length === 0;
    limparAuditoria.disabled = !buscaTodas.value && !statusTodas.value;
    document.querySelector("[data-contagem-total]").textContent = String(
      demandas.length,
    );
  }

  function mostrarErro(
    mensagem = "Não foi possível carregar as demandas. Tente novamente mais tarde.",
  ) {
    demandas = [];
    limparDetalhe();
    renderizarFila();
    renderizarAuditoria();
    habilitarFiltros(false);
    erro.textContent = texto(mensagem);
    erro.hidden = false;
  }

  // Recebo apenas demandas já permitidas pela 04.03; não leio uma lista geral do armazenamento.
  // Contrato: { demandas: [{ id, titulo, status, categoria, localizacao, descricao,
  // solicitanteId, solicitante, unidade, dataCriacao, prioridade, historico: [{ descricao, data }] }], unidade }.
  // A 04.03 consulta FullmetalPerfis.obterUsuarioAtual() e fornece só a coleção permitida.
  // Depois de filtrar, chama atualizar(...) ou emite fullmetal:demandas-disponiveis.
  // A unidade do contexto deve ser a mesma chave de usuario.unidade e demanda.unidade.
  function atualizar(dados) {
    const ids = new Set();
    if (
      !dados ||
      !Array.isArray(dados.demandas) ||
      dados.demandas.some((item) => {
        if (
          !item ||
          !["string", "number"].includes(typeof item.id) ||
          !String(item.id).trim() ||
          ids.has(String(item.id))
        )
          return true;
        ids.add(String(item.id));
        return false;
      })
    ) {
      mostrarErro();
      return false;
    }
    erro.hidden = true;
    const usuario = FullmetalPerfis.obterUsuarioAtual();
    demandas =
      usuario?.perfil === perfil
        ? FullmetalVisibilidade.aplicar(dados.demandas, usuario).map(
            (item) => ({ ...item }),
          )
        : [];
    if (perfil === "responsavel") {
      const unidade =
        typeof usuario?.unidade === "string" ? usuario.unidade.trim() : "";
      // Sem contexto de unidade, mantenho a fila vazia em vez de exibir demandas de outros setores.
      if (!unidade) demandas = [];
    }
    habilitarFiltros(
      usuario?.perfil === perfil &&
        (perfil !== "responsavel" || Boolean(usuario.unidade)),
    );
    renderizarFila();
    renderizarAuditoria();
    const aberto = tela.dataset.detalheAberto;
    if (!selecionada || !selecionarDemanda(selecionada, false, false))
      limparDetalhe();
    else tela.dataset.detalheAberto = aberto;
    return true;
  }

  function habilitarFiltros(habilitar) {
    for (const campo of [buscaFila, statusFila, buscaTodas, statusTodas])
      if (campo) campo.disabled = !habilitar;
    tela.querySelector("#ajuda-busca").textContent = habilitar
      ? "Busque por ID, título ou localização."
      : "Busca indisponível no momento.";
  }

  buscaFila.addEventListener("input", () => {
    renderizarFila();
    anuncio.textContent = `${fila.children.length} demandas encontradas na fila.`;
  });
  statusFila?.addEventListener("change", () => {
    renderizarFila();
    anuncio.textContent = `${fila.children.length} demandas encontradas na fila.`;
  });
  limparFila.addEventListener("click", () => {
    buscaFila.value = "";
    if (statusFila) statusFila.value = "";
    renderizarFila();
    buscaFila.focus();
    anuncio.textContent = "Filtros da fila removidos.";
  });
  buscaTodas?.addEventListener("input", renderizarAuditoria);
  statusTodas?.addEventListener("change", renderizarAuditoria);
  limparAuditoria?.addEventListener("click", () => {
    buscaTodas.value = "";
    statusTodas.value = "";
    renderizarAuditoria();
    buscaTodas.focus();
    anuncio.textContent = "Filtros da consulta removidos.";
  });

  window.FullmetalAtendimento = Object.freeze({
    atualizar,
    selecionarDemanda,
    mostrarErro,
    obterDemandaSelecionada: () => selecionada,
  });
  document.addEventListener("fullmetal:demandas-disponiveis", (evento) =>
    atualizar(evento.detail),
  );
  // Se a identidade/unidade mudar, não mantenho na tela a coleção do contexto anterior.
  // A 04.03 deve fornecer novamente os dados permitidos para o novo contexto.
  function invalidarContexto() {
    atualizar({ demandas: [], unidade: null });
    habilitarFiltros(false);
    anuncio.textContent =
      "Identificação alterada. Aguardando as demandas disponíveis.";
  }
  document.addEventListener("fullmetal:usuario-alterado", invalidarContexto);
  document.addEventListener("fullmetal:perfil-alterado", invalidarContexto);
})();
