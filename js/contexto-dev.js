(() => {
  if (
    document.body.dataset.perfilPagina !== "responsavel" ||
    FullmetalPerfis.obterUsuarioAtual()?.origem !== "desenvolvimento"
  )
    return;
  const cabecalho = document.querySelector(".queue-header");
  if (!cabecalho) return;
  // Escolho a unidade explicitamente, somente no teste local; não simulo autenticação real.
  const grupo = document.createElement("div");
  grupo.className = "dev-unit-context";
  const rotulo = document.createElement("label");
  rotulo.htmlFor = "unidade-dev";
  rotulo.textContent = "Área:";
  const seletor = document.createElement("select");
  seletor.id = "unidade-dev";
  seletor.className = "form-control";
  const vazio = document.createElement("option");
  vazio.value = "";
  vazio.textContent = "Selecione a área";
  seletor.appendChild(vazio);
  for (const unidade of FullmetalCatalogos.unidades) {
    const opcao = document.createElement("option");
    opcao.value = unidade.id;
    opcao.textContent = unidade.nome;
    seletor.appendChild(opcao);
  }
  // Identifico a área junto da fila, sem criar uma faixa separada para o seletor.
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
