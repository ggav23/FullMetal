(() => {
  // Uso a mesma regra na lista, nos detalhes e imediatamente antes de salvar uma ação.
  function podeVer(demanda, usuario) {
    if (
      !demanda ||
      !usuario ||
      typeof usuario.id !== "string" ||
      !usuario.id.trim()
    )
      return false;
    switch (usuario.perfil) {
      case "solicitante":
        return (
          typeof demanda.solicitanteId === "string" &&
          demanda.solicitanteId === usuario.id
        );
      case "triagem":
        return true;
      case "responsavel":
        return (
          typeof usuario.unidade === "string" &&
          Boolean(usuario.unidade.trim()) &&
          demanda.unidade === usuario.unidade
        );
      default:
        return false;
    }
  }
  function aplicar(demandas, usuario) {
    if (!Array.isArray(demandas))
      throw new Error("A coleção de demandas é inválida.");
    return demandas.filter((demanda) => podeVer(demanda, usuario));
  }
  function acoesPermitidas(demanda, usuario) {
    if (
      !podeVer(demanda, usuario) ||
      !["Pendente", "Em atendimento"].includes(demanda.status)
    )
      return [];
    // Depois de iniciar o atendimento, Solicitante e Triagem só acompanham.
    if (usuario.perfil === "solicitante")
      return demanda.status === "Pendente" ? ["cancelar"] : [];
    if (usuario.perfil === "triagem")
      return demanda.status === "Pendente"
        ? ["encaminhar", "cancelar"]
        : [];
    return demanda.status === "Pendente"
      ? ["prioridade", "iniciar"]
      : ["prioridade", "concluir"];
  }
  // O MVP é local. Um futuro servidor deverá aplicar sua própria autorização.
  globalThis.FullmetalVisibilidade = Object.freeze({
    podeVer,
    aplicar,
    acoesPermitidas,
  });
})();
