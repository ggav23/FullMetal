(() => {
  if (
    document.body.dataset.perfilPagina !== "responsavel" ||
    FullmetalPerfis.obterUsuarioAtual()?.origem !== "desenvolvimento"
  )
    return;
  const cabecalho = document.querySelector(".queue-header");
  if (!cabecalho) return;
  // Escolho a área explicitamente; o visual do select vem do CSS global.
  const grupo = document.createElement("div");
  grupo.className = "dev-unit-context";
  const rotulo = document.createElement("label");
  rotulo.htmlFor = "unidade-dev";
  rotulo.textContent = "Área:";
  const seletor = document.createElement("select");
  seletor.id = "unidade-dev";
  seletor.className = "form-control";
  seletor.add(new Option("Selecione a área", ""));
  for (const unidade of FullmetalCatalogos.unidades)
    seletor.add(new Option(unidade.nome, unidade.id));
  grupo.append(rotulo, seletor);
  cabecalho.querySelector("h2").after(grupo);
  const atualizar = () => {
    seletor.value = FullmetalPerfis.obterUsuarioAtual()?.unidade || "";
  };
  seletor.addEventListener("change", () =>
    FullmetalPerfis.definirUnidadeDesenvolvimento(seletor.value || null),
  );
  document.addEventListener("fullmetal:usuario-alterado", atualizar);
  atualizar();
})();
