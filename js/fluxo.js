(() => {
  if (!globalThis.FullmetalAtendimento) return;
  function carregar() {
    try {
      const usuario = FullmetalPerfis.obterUsuarioAtual();
      if (!usuario || usuario.perfil !== document.body.dataset.perfilPagina)
        throw new Error(
          "Identifique o perfil correspondente para consultar este painel.",
        );
      FullmetalAtendimento.atualizar({
        demandas: FullmetalDados.listarPermitidas(),
        unidade: usuario.unidade,
      });
    } catch (erro) {
      FullmetalAtendimento.mostrarErro(erro.message);
    }
  }
  // Recarrego sem apagar a busca quando uma ação ou outra aba altera os dados.
  for (const nome of [
    "fullmetal:demandas-alteradas",
    "fullmetal:perfil-alterado",
    "fullmetal:usuario-alterado",
  ])
    document.addEventListener(nome, carregar);
  window.addEventListener("storage", carregar);
  carregar();
  const id = new URLSearchParams(location.search).get("id");
  if (id) FullmetalAtendimento.selecionarDemanda(id, false);
})();
