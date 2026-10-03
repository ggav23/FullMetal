(() => {
  const detalhe = document.querySelector("[data-detalhe]");
  const card = detalhe?.querySelector(".action-card, .actions-card");
  if (!card) return;
  let selecionada = null;
  const unidade = card.querySelector("#unidade-destino");
  const prioridade = card.querySelector("#prioridade");
  const criar = FullmetalUI.elemento;
  const feedback = criar("p", "", "action-feedback");
  feedback.setAttribute("role", "status");
  feedback.setAttribute("aria-live", "polite");
  // Deixo o resultado fora do cartão: ele continua visível quando a ação encerra a demanda.
  card.after(feedback);
  if (unidade) {
    unidade.replaceChildren(new Option("Selecione uma unidade", ""));
    for (const item of FullmetalCatalogos.unidades)
      unidade.add(new Option(item.nome, item.id));
  }
  function atualizar() {
    try {
      const demanda = selecionada ? FullmetalDados.obter(selecionada) : null;
      const acoes = FullmetalVisibilidade.acoesPermitidas(
        demanda,
        FullmetalPerfis.obterUsuarioAtual(),
      );
      card.hidden = !acoes.length;
      for (const botao of card.querySelectorAll("[data-acao]")) {
        botao.hidden = !acoes.includes(botao.dataset.acao);
        botao.disabled = botao.hidden;
      }
      for (const [campo, acao, valor] of [
        [unidade, "encaminhar", demanda?.unidade],
        [prioridade, "prioridade", demanda?.prioridade],
      ]) {
        if (!campo) continue;
        const disponivel = acoes.includes(acao);
        campo.disabled = !disponivel;
        const grupo = campo.closest("[data-grupo-acao]");
        if (grupo) grupo.hidden = !disponivel;
        else {
          campo.hidden = !disponivel;
          card.querySelector(`label[for="${campo.id}"]`).hidden = !disponivel;
        }
        campo.value = valor || "";
      }
      const ajuda = card.querySelector(".field-helper");
      if (ajuda)
        ajuda.textContent = "As alterações são salvas neste navegador.";
    } catch (erro) {
      card.hidden = true;
      feedback.textContent = erro.message;
    }
  }
  // Uso um diálogo nativo para preservar navegação por teclado, foco e fechamento com Escape.
  const dialogo = criar("dialog", undefined, "action-dialog");
  dialogo.setAttribute("aria-labelledby", "titulo-confirmacao");
  dialogo.setAttribute("aria-describedby", "texto-confirmacao");
  const titulo = criar("h2");
  titulo.id = "titulo-confirmacao";
  const texto = criar("p");
  texto.id = "texto-confirmacao";
  const grupoResumo = criar("div", undefined, "dialog-resolution");
  const label = criar(
    "label",
    "Resumo do atendimento (opcional)",
    "form-label",
  );
  label.htmlFor = "resumo-atendimento";
  const resumo = criar("textarea", undefined, "form-control");
  resumo.id = "resumo-atendimento";
  resumo.maxLength = 500;
  resumo.rows = 4;
  const ajudaResumo = criar("p", "Até 500 caracteres.", "field-helper");
  ajudaResumo.id = "ajuda-resumo";
  resumo.setAttribute("aria-describedby", ajudaResumo.id);
  grupoResumo.append(label, resumo, ajudaResumo);
  const erroDialogo = criar("p", "", "error-summary");
  erroDialogo.setAttribute("role", "alert");
  erroDialogo.hidden = true;
  const botoes = criar("div", undefined, "dialog-actions");
  const manter = criar("button", "Voltar", "btn btn-secondary");
  manter.type = "button";
  manter.autofocus = true;
  const confirmar = criar("button", "", "btn");
  confirmar.type = "button";
  botoes.append(manter, confirmar);
  dialogo.append(titulo, texto, grupoResumo, erroDialogo, botoes);
  document.body.append(dialogo);
  let pendente = null;
  let origem = null;
  manter.addEventListener("click", () => dialogo.close());
  dialogo.addEventListener("close", () => {
    pendente = null;
    const destino =
      origem && origem.getClientRects().length
        ? origem
        : document.querySelector("[data-painel-detalhe]") ||
          document.querySelector("main");
    destino?.focus({ preventScroll: true });
  });
  function executar(id, acao, parametros) {
    FullmetalDados.executar(id, acao, parametros);
    feedback.textContent = {
      encaminhar: "Demanda encaminhada.",
      prioridade: "Prioridade salva.",
      iniciar: "Atendimento iniciado.",
      concluir: "Atendimento concluído.",
      cancelar: "Demanda cancelada.",
    }[acao];
    atualizar();
  }
  confirmar.addEventListener("click", () => {
    if (!pendente) return;
    confirmar.disabled = true;
    try {
      executar(pendente.id, pendente.acao, { resolucao: resumo.value });
      dialogo.close();
    } catch (erro) {
      erroDialogo.textContent = erro.message;
      erroDialogo.hidden = false;
    } finally {
      confirmar.disabled = false;
    }
  });
  for (const botao of card.querySelectorAll("[data-acao]"))
    botao.addEventListener("click", () => {
      const acao = botao.dataset.acao;
      feedback.textContent = "";
      if (["cancelar", "concluir"].includes(acao)) {
        pendente = { id: selecionada, acao };
        origem = botao;
        const cancelar = acao === "cancelar";
        titulo.textContent = cancelar
          ? "Cancelar demanda?"
          : "Concluir atendimento?";
        texto.textContent = cancelar
          ? "A demanda será encerrada como cancelada. Esta ação não pode ser desfeita."
          : "Confirme que o atendimento foi finalizado. A demanda será encerrada como concluída.";
        manter.textContent = cancelar
          ? "Manter demanda"
          : "Continuar atendimento";
        confirmar.textContent = cancelar
          ? "Confirmar cancelamento"
          : "Confirmar conclusão";
        confirmar.className = `btn ${cancelar ? "btn-danger-solid" : "btn-success"}`;
        grupoResumo.hidden = cancelar;
        resumo.value = "";
        erroDialogo.hidden = true;
        dialogo.showModal();
        manter.focus();
      } else {
        try {
          executar(selecionada, acao, {
            unidade: unidade?.value,
            prioridade: prioridade?.value,
          });
        } catch (erro) {
          feedback.textContent = erro.message;
        }
        if (!botao.getClientRects().length)
          (
            document.querySelector("[data-painel-detalhe]") ||
            document.querySelector("main")
          ).focus({ preventScroll: true });
      }
    });
  document.addEventListener("fullmetal:demanda-selecionada", (evento) => {
    const mudou = selecionada !== String(evento.detail.id);
    selecionada = String(evento.detail.id);
    if (mudou) feedback.textContent = "";
    atualizar();
  });
  function invalidar() {
    selecionada = null;
    feedback.textContent = "";
    card.hidden = true;
    if (dialogo.open) dialogo.close();
  }
  for (const nome of [
    "fullmetal:perfil-alterado",
    "fullmetal:usuario-alterado",
  ])
    document.addEventListener(nome, invalidar);
  document.addEventListener("fullmetal:demandas-alteradas", atualizar);
  window.addEventListener("storage", () => {
    if (dialogo.open) dialogo.close();
    atualizar();
  });
  card.hidden = true;
})();
