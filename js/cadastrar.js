(() => {
  const form = document.getElementById("formulario-demanda");
  if (!form) return;
  const campos = ["titulo", "descricao", "categoria", "localizacao"];
  const categoria = document.getElementById("categoria");
  const salvar = form.querySelector('button[type="submit"]');
  const erro = document.getElementById("mensagem-erro");
  const sucesso = document.getElementById("mensagem-sucesso");
  let enviando = false;
  let tentouEnviar = false;

  // Aproveito a captura do formulário, mas deixo perfil e contraste somente no header.js.
  for (const item of FullmetalCatalogos.categorias) {
    const opcao = document.createElement("option");
    opcao.value = item.id;
    opcao.textContent = item.nome;
    categoria.appendChild(opcao);
  }
  document.getElementById("ajuda-categoria").textContent =
    "Selecione a categoria adequada para sua solicitação.";
  for (const nome of campos) {
    const campo = document.getElementById(nome);
    const mensagem = document.createElement("p");
    mensagem.id = "erro-" + nome;
    mensagem.className = "field-error-msg";
    mensagem.hidden = true;
    campo.setAttribute(
      "aria-describedby",
      campo.getAttribute("aria-describedby") + " " + mensagem.id,
    );
    campo.after(mensagem);
    campo.addEventListener("blur", (evento) => {
      // O envio já valida todos os campos; não movo o botão entre pressionar e soltar o mouse.
      if (evento.relatedTarget !== salvar) validarCampo(nome);
    });
    campo.addEventListener("input", () => {
      sucesso.hidden = true;
      if (tentouEnviar || campo.getAttribute("aria-invalid") === "true")
        validarCampo(nome);
    });
  }
  function valores() {
    return Object.fromEntries(new FormData(form).entries());
  }
  function validarCampo(nome) {
    const mensagem = FullmetalDemandas.validar(valores()).erros[nome];
    const campo = document.getElementById(nome);
    campo.setAttribute("aria-invalid", String(Boolean(mensagem)));
    const ajuda = document.getElementById("erro-" + nome);
    ajuda.textContent = mensagem || "";
    ajuda.hidden = !mensagem;
  }
  function atualizarPermissao() {
    const permitido = FullmetalPerfis.pode("cadastrar_demanda");
    for (const nome of campos)
      document.getElementById(nome).disabled = !permitido;
    salvar.disabled = !permitido || enviando;
    form.hidden = !permitido;
    const bloqueio = document.getElementById("cadastro-indisponivel");
    bloqueio.hidden = permitido;
    bloqueio.textContent = permitido
      ? ""
      : "O cadastro está disponível somente para o perfil Solicitante.";
  }
  // Mostro os erros com links para os campos; não dependo só da cor para identificá-los.
  form.addEventListener("submit", (evento) => {
    evento.preventDefault();
    if (enviando) return;
    erro.hidden = true;
    sucesso.hidden = true;
    tentouEnviar = true;
    if (!FullmetalPerfis.pode("cadastrar_demanda")) {
      atualizarPermissao();
      return;
    }
    const { erros } = FullmetalDemandas.validar(valores());
    for (const nome of campos) validarCampo(nome);
    if (Object.keys(erros).length) {
      erro.replaceChildren();
      const titulo = document.createElement("strong");
      titulo.textContent = "Revise os campos antes de salvar.";
      const lista = document.createElement("ul");
      for (const [nome, mensagem] of Object.entries(erros)) {
        const item = document.createElement("li");
        const link = document.createElement("a");
        link.href = "#" + nome;
        link.textContent = mensagem;
        link.addEventListener("click", (evento) => {
          evento.preventDefault();
          document.getElementById(nome).focus();
        });
        item.appendChild(link);
        lista.appendChild(item);
      }
      erro.append(titulo, lista);
      erro.hidden = false;
      erro.focus();
      return;
    }
    enviando = true;
    salvar.disabled = true;
    salvar.textContent = "Salvando…";
    try {
      // O mesmo serviço salva status, autoria e histórico e atualiza as outras telas.
      const demanda = FullmetalDados.salvarNova(valores());
      sucesso.replaceChildren();
      sucesso.append(
        document.createTextNode("Demanda registrada com sucesso. "),
      );
      const link = document.createElement("a");
      link.href =
        "detalhes-da-demanda.html?id=" + encodeURIComponent(demanda.id);
      link.textContent = "Consultar a demanda";
      sucesso.appendChild(link);
      sucesso.hidden = false;
      form.reset();
      tentouEnviar = false;
      for (const nome of campos) {
        document.getElementById(nome).removeAttribute("aria-invalid");
        document.getElementById("erro-" + nome).hidden = true;
      }
      sucesso.focus();
    } catch (falha) {
      erro.textContent = falha.message;
      erro.hidden = false;
      erro.focus();
    } finally {
      enviando = false;
      salvar.textContent = "Salvar demanda";
      atualizarPermissao();
    }
  });
  document.addEventListener("fullmetal:perfil-alterado", atualizarPermissao);
  atualizarPermissao();
})();
