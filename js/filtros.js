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

  globalThis.FullmetalFiltros = Object.freeze({ aplicar });
})();
