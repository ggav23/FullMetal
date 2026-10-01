(() => {
  // Centralizo o formato dos registros, sem ler armazenamento nem decidir visibilidade.
  const STATUS = Object.freeze({
    PENDENTE: "Pendente",
    EM_ATENDIMENTO: "Em atendimento",
    CONCLUIDA: "Concluída",
    CANCELADA: "Cancelada",
  });

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
    const dados = {};
    for (const campo of ["titulo", "descricao", "categoria", "localizacao"]) {
      if (typeof campos?.[campo] !== "string" || !campos[campo].trim()) {
        throw new Error("Informe título, descrição, categoria e localização.");
      }
      dados[campo] = campos[campo].trim();
    }

    // A validação detalhada do formulário continua sendo da 04.01.
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
  globalThis.FullmetalDemandas = Object.freeze({ STATUS, criar });
})();
