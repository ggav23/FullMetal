(() => {
  // Centralizo o formato dos registros, sem ler armazenamento nem decidir visibilidade.
  const STATUS = Object.freeze({
    PENDENTE: "Pendente",
    EM_ATENDIMENTO: "Em atendimento",
    CONCLUIDA: "Concluída",
    CANCELADA: "Cancelada",
  });

  function validar(campos) {
    const valores = {};
    for (const campo of ["titulo", "descricao", "categoria", "localizacao"]) {
      valores[campo] =
        typeof campos?.[campo] === "string" ? campos[campo].trim() : "";
    }
    const erros = {};
    if (valores.titulo.length < 5 || valores.titulo.length > 100)
      erros.titulo = "O título deve conter entre 5 e 100 caracteres.";
    if (!valores.descricao || valores.descricao.length > 500)
      erros.descricao =
        "Por favor, descreva o problema com até 500 caracteres.";
    if (
      !FullmetalCatalogos.categorias.some(
        (item) => item.id === valores.categoria,
      )
    )
      erros.categoria = "Selecione uma categoria válida para a demanda.";
    if (!valores.localizacao)
      erros.localizacao = "Informe o local ou sala onde ocorreu a demanda.";
    else if (valores.localizacao.length > 100)
      erros.localizacao = "A localização deve conter até 100 caracteres.";
    return { valores, erros };
  }

  function criar(campos, usuario) {
    if (
      !usuario ||
      usuario.perfil !== "solicitante" ||
      typeof usuario.id !== "string" ||
      !usuario.id.trim()
    ) {
      throw new Error(
        "É necessário identificar o solicitante antes de cadastrar uma demanda.",
      );
    }
    const { valores: dados, erros } = validar(campos);
    if (Object.keys(erros).length) throw new Error(Object.values(erros)[0]);
    // Uso apenas campos conhecidos: o formulário não define status, autoria ou prioridade.
    const dataCriacao = new Date().toISOString();
    const id =
      globalThis.crypto?.randomUUID?.() ||
      `${Date.now().toString(36)}-${Math.random().toString(36).slice(2)}`;
    return {
      id,
      ...dados,
      status: STATUS.PENDENTE,
      solicitanteId: usuario.id.trim(),
      solicitante:
        typeof usuario.nome === "string" && usuario.nome.trim()
          ? usuario.nome.trim()
          : null,
      // A unidade é o destino do encaminhamento, não o setor de origem do solicitante.
      unidade: null,
      prioridade: null,
      dataCriacao,
      historico: [{ descricao: "Demanda registrada.", data: dataCriacao }],
    };
  }

  // Integração do cadastro, após carregar demandas.js antes de seu script:
  // const usuario = FullmetalPerfis.obterUsuarioAtual();
  // const demanda = FullmetalDemandas.criar(Object.fromEntries(new FormData(form)), usuario);
  // O cadastro salva esse objeto; este módulo não grava nada por conta própria.
  // solicitanteId identifica a autoria; solicitante é somente o nome de exibição.
  // unidade deve usar a mesma chave em usuário, demanda e contexto de atendimento.
  // Registros antigos sem autoria/unidade não devem receber esses valores por suposição.
  globalThis.FullmetalDemandas = Object.freeze({ STATUS, criar, validar });
})();
