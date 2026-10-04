(() => {
  function lerJSON(texto) {
    if (
      typeof texto !== "string" ||
      new TextEncoder().encode(texto).length > 128 * 1024
    )
      throw new Error("O arquivo JSON deve ter até 128 KB.");
    try {
      return JSON.parse(texto);
    } catch {
      throw new Error(
        "O arquivo não contém um JSON válido. Nenhuma demanda foi importada.",
      );
    }
  }
  function dataValida(valor) {
    if (typeof valor !== "string") return false;
    const data = new Date(valor);
    return !Number.isNaN(data.getTime()) && data.toISOString() === valor;
  }

  function preparar(conteudo, usuario) {
    if (
      !conteudo ||
      conteudo.versao !== 1 ||
      !Array.isArray(conteudo.demandas) ||
      conteudo.demandas.length === 0 ||
      conteudo.demandas.length > 100
    )
      throw new Error(
        "Use o formato dos exemplos: versão 1 e uma lista de 1 a 100 demandas.",
      );
    if (typeof usuario?.id !== "string" || !usuario.id.trim())
      throw new Error(
        "Não foi possível identificar o usuário local para importar os exemplos.",
      );

    const ids = new Set();
    return conteudo.demandas.map((item, indice) => {
      const falhar = () => {
        throw new Error(
          `O exemplo ${indice + 1} está inválido. Nenhuma demanda foi importada.`,
        );
      };
      if (!item || typeof item !== "object" || Array.isArray(item)) falhar();
      const { valores, erros } = FullmetalDemandas.validar(item);
      if (
        typeof item.id !== "string" ||
        !/^TESTE-[A-Z0-9-]{1,40}$/.test(item.id) ||
        ids.has(item.id) ||
        Object.keys(erros).length ||
        !["atual", "outro"].includes(item.autor) ||
        !Object.values(FullmetalDemandas.STATUS).includes(item.status) ||
        !(
          item.unidade === null ||
          FullmetalCatalogos.unidades.some((u) => u.id === item.unidade)
        ) ||
        ![null, "normal", "media", "alta"].includes(item.prioridade) ||
        !dataValida(item.dataCriacao) ||
        !Array.isArray(item.historico) ||
        item.historico.length === 0 ||
        item.historico.length > 30
      )
        falhar();
      if (
        (item.prioridade !== null && item.unidade === null) ||
        (["Em atendimento", "Concluída"].includes(item.status) &&
          item.unidade === null)
      )
        falhar();
      ids.add(item.id);
      let anterior = item.dataCriacao;
      const historico = item.historico.map((evento) => {
        if (
          !evento ||
          typeof evento.descricao !== "string" ||
          !evento.descricao.trim() ||
          evento.descricao.length > 600 ||
          !dataValida(evento.data) ||
          evento.data < anterior ||
          !["solicitante", "triagem", "responsavel"].includes(evento.perfil)
        )
          falhar();
        anterior = evento.data;
        return {
          descricao: evento.descricao.trim(),
          data: evento.data,
          perfil: evento.perfil,
        };
      });
      // Associo apenas os exemplos ao usuário local; não altero a autoria de registros existentes.
      const doUsuario = item.autor === "atual";
      return {
        id: item.id,
        ...valores,
        status: item.status,
        solicitanteId: doUsuario ? usuario.id : `teste-outro-${usuario.id}`,
        solicitante: doUsuario
          ? typeof usuario.nome === "string" && usuario.nome.trim()
            ? usuario.nome.trim()
            : null
          : "Outro solicitante (teste)",
        unidade: item.unidade,
        prioridade: item.prioridade,
        dataCriacao: item.dataCriacao,
        historico,
        origem: "exemplo-json",
      };
    });
  }
  globalThis.FullmetalExemplos = Object.freeze({ preparar, lerJSON });
})();
