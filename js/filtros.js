(() => {
  const normalizar = (valor) =>
    String(valor ?? "")
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .toLowerCase()
      .trim();

  // Filtro somente a coleção recebida; limpar a busca nunca amplia o acesso do perfil.
  function aplicar(demandasPermitidas, { termo = "", status = "" } = {}) {
    const busca = normalizar(termo);
    const situacao = normalizar(status);
    return demandasPermitidas.filter((demanda) => {
      const correspondeTexto =
        !busca ||
        ["id", "titulo", "localizacao"].some((campo) =>
          normalizar(demanda[campo]).includes(busca),
        );
      const correspondeStatus =
        !situacao || normalizar(demanda.status) === situacao;
      return correspondeTexto && correspondeStatus;
    });
  }

  function ordenar(demandasPermitidas, ordem = "recentes") {
    const data = (demanda) =>
      typeof demanda.dataCriacao === "string"
        ? Date.parse(demanda.dataCriacao)
        : NaN;
    // Ordeno uma cópia para manter a lista original.
    return [...demandasPermitidas].sort((a, b) => {
      const primeira = data(a);
      const segunda = data(b);
      // Deixo os registros sem data válida no fim.
      if (Number.isNaN(primeira)) return Number.isNaN(segunda) ? 0 : 1;
      if (Number.isNaN(segunda)) return -1;
      return ordem === "antigas" ? primeira - segunda : segunda - primeira;
    });
  }

  globalThis.FullmetalFiltros = Object.freeze({ aplicar, ordenar });
})();
