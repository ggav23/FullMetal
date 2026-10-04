(() => {
  const texto = (valor) =>
    ["string", "number"].includes(typeof valor)
      ? String(valor)
      : "Não informado";
  function elemento(tag, conteudo, classe) {
    const item = document.createElement(tag);
    if (conteudo !== undefined) item.textContent = texto(conteudo);
    if (classe) item.className = classe;
    return item;
  }
  function status(valor) {
    const classes = {
      Pendente: "status-pendente",
      "Em atendimento": "status-em-atendimento",
      Concluída: "status-concluida",
      Cancelada: "status-cancelada",
    };
    const conhecido = Object.prototype.hasOwnProperty.call(classes, valor);
    return elemento(
      "span",
      conhecido ? valor : "Status não informado",
      "status-badge " + (conhecido ? classes[valor] : "status-cancelada"),
    );
  }
  function data(valor) {
    if (!valor) return "Data não informada";
    const data = new Date(valor);
    return Number.isNaN(data.getTime())
      ? "Data não informada"
      : new Intl.DateTimeFormat("pt-BR", {
          dateStyle: "short",
          timeStyle: "short",
        }).format(data);
  }
  function unidade(demanda) {
    if (demanda.unidade) return FullmetalCatalogos.nomeUnidade(demanda.unidade);
    // Diferencio canceladas sem unidade das demandas que ainda aguardam triagem.
    if (demanda.status === "Cancelada") return "Não encaminhada";
    return demanda.status === "Pendente"
      ? "Aguardando encaminhamento"
      : "Não informada";
  }
  function historico(lista, registros, classes = {}) {
    lista.replaceChildren();
    for (const registro of Array.isArray(registros) ? registros : []) {
      if (!registro || typeof registro !== "object") continue;
      const item = elemento("li");
      if (registro.descricao === "Demanda cancelada.")
        item.className = "history-cancelada";
      const descricao = elemento("p", registro.descricao, classes.titulo);
      const horario = elemento("time", data(registro.data), classes.meta);
      if (registro.data && !Number.isNaN(new Date(registro.data).getTime()))
        horario.dateTime = new Date(registro.data).toISOString();
      item.append(descricao, horario);
      lista.appendChild(item);
    }
    if (!lista.children.length)
      lista.appendChild(elemento("li", "Nenhum andamento registrado."));
  }
  globalThis.FullmetalUI = Object.freeze({
    texto,
    elemento,
    status,
    data,
    unidade,
    historico,
  });
})();
