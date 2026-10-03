(() => {
  const local =
    location.protocol === "file:" ||
    ["localhost", "127.0.0.1"].includes(location.hostname);
  if (
    !local ||
    FullmetalPerfis.obterUsuarioAtual()?.origem !== "desenvolvimento"
  )
    return;
  const painel = document.querySelector("[data-importacao]");
  const botaoProjeto = document.querySelector("[data-importar-projeto]");
  const botaoArquivo = document.querySelector("[data-importar-arquivo]");
  const arquivo = document.getElementById("arquivo-exemplos");
  const erro = document.querySelector("[data-erro-importacao]");
  const resultado = document.querySelector("[data-resultado-importacao]");
  let ocupado = false;
  painel.hidden = false;
  document.querySelector("[data-indisponivel]").hidden = true;
  if (location.protocol === "file:") {
    document.querySelector("[data-importacao-projeto]").hidden = true;
    document.querySelector("[data-ajuda-arquivo]").hidden = false;
    document.querySelector("[data-arquivo-manual]").open = true;
  }
  function atualizarControles() {
    botaoProjeto.disabled = ocupado;
    arquivo.disabled = ocupado;
    botaoArquivo.disabled = ocupado || !arquivo.files.length;
    painel.setAttribute("aria-busy", String(ocupado));
  }
  async function importar(lerTexto) {
    if (ocupado) return;
    ocupado = true;
    erro.hidden = true;
    resultado.textContent = "";
    atualizarControles();
    try {
      const conteudo = FullmetalExemplos.lerJSON(await lerTexto());
      const resumo = FullmetalDados.importarExemplos(conteudo);
      resultado.textContent = `${resumo.importadas} exemplo(s) importado(s). ${resumo.ignoradas} ID(s) já existente(s) ignorado(s). ${resumo.preservadas} registro(s) anterior(es) preservado(s).`;
    } catch (falha) {
      erro.textContent =
        falha.message ||
        "Não foi possível importar os exemplos. Nenhuma alteração foi confirmada.";
      erro.hidden = false;
      erro.focus();
    } finally {
      ocupado = false;
      atualizarControles();
    }
  }
  botaoProjeto.addEventListener("click", () =>
    importar(async () => {
      // Leio um arquivo estático do próprio projeto; não faço chamadas para um backend.
      let resposta;
      try {
        resposta = await fetch("dados/demandas-exemplo.json", {
          cache: "no-store",
        });
      } catch {
        throw new Error(
          "Não foi possível carregar o JSON. Tente selecionar o arquivo manualmente.",
        );
      }
      if (!resposta.ok)
        throw new Error(
          "Não foi possível carregar o JSON do projeto. Selecione o arquivo manualmente.",
        );
      return resposta.text();
    }),
  );
  arquivo.addEventListener("change", atualizarControles);
  document
    .querySelector("[data-form-importacao]")
    .addEventListener("submit", (evento) => {
      evento.preventDefault();
      // A seleção explícita funciona em file:// sem reduzir a segurança do navegador.
      const selecionado = arquivo.files[0];
      importar(async () => {
        if (!selecionado) throw new Error("Selecione um arquivo JSON.");
        if (selecionado.size > 128 * 1024)
          throw new Error("O arquivo JSON deve ter até 128 KB.");
        return selecionado.text();
      });
    });
  atualizarControles();
})();
