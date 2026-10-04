(() => {
  const detalhe = document.querySelector(".demand-details");
  if (!detalhe) return;
  const erro = document.querySelector("[data-erro-detalhes]");
  const anuncio = document.querySelector("[data-anuncio-detalhes]");
  const id = new URLSearchParams(location.search).get("id");
  function atualizar() {
    detalhe.hidden = true;
    erro.hidden = true;
    const usuario = FullmetalPerfis.obterUsuarioAtual();
    document.querySelector("[data-voltar-painel]").href =
      { triagem: "triagem.html", responsavel: "responsavel.html" }[
        usuario?.perfil
      ] || "painel-de-demandas.html";
    try {
      const demanda = id ? FullmetalDados.obter(id) : null;
      if (!demanda)
        throw new Error(
          "Demanda não encontrada ou indisponível para este usuário.",
        );
      for (const [elemento, valor] of Object.entries({
        "demanda-id": demanda.id,
        "titulo-demanda": demanda.titulo,
        "demanda-categoria": FullmetalCatalogos.nomeCategoria(
          demanda.categoria,
        ),
        "demanda-localizacao": demanda.localizacao,
        "demanda-solicitante": demanda.solicitante,
        "demanda-unidade": FullmetalUI.unidade(demanda),
        "demanda-descricao": demanda.descricao,
        "demanda-criacao": FullmetalUI.data(demanda.dataCriacao),
        "demanda-prioridade": FullmetalCatalogos.nomePrioridade(
          demanda.prioridade,
        ),
      }))
        document.getElementById(elemento).textContent =
          FullmetalUI.texto(valor);
      const badge = FullmetalUI.status(demanda.status);
      badge.id = "demanda-status";
      document.getElementById(badge.id).replaceWith(badge);
      FullmetalUI.historico(
        document.getElementById("demanda-historico"),
        demanda.historico,
        { titulo: "history-title", meta: "history-meta" },
      );
      detalhe.dataset.demandaId = String(demanda.id);
      detalhe.hidden = false;
      document.dispatchEvent(
        new CustomEvent("fullmetal:demanda-selecionada", {
          detail: { id: demanda.id },
        }),
      );
    } catch (falha) {
      erro.textContent = falha.message;
      erro.hidden = false;
    }
  }
  document.getElementById("copiar-id").addEventListener("click", async () => {
    try {
      await navigator.clipboard.writeText(
        document.getElementById("demanda-id").textContent,
      );
      anuncio.textContent = "Identificador copiado.";
    } catch {
      anuncio.textContent =
        "Não foi possível copiar automaticamente. Selecione o identificador para copiá-lo.";
    }
  });
  for (const nome of [
    "fullmetal:demandas-alteradas",
    "fullmetal:perfil-alterado",
    "fullmetal:usuario-alterado",
  ])
    document.addEventListener(nome, atualizar);
  window.addEventListener("storage", atualizar);
  atualizar();
})();
