(() => {
  const chave = "demandas_fullmetal";
  const usuarioAtual = () =>
    globalThis.FullmetalPerfis?.obterUsuarioAtual() || null;
  const copiar = (valor) => JSON.parse(JSON.stringify(valor));

  function listar() {
    let registros;
    try {
      const salvo = localStorage.getItem(chave);
      registros = salvo === null ? [] : JSON.parse(salvo);
    } catch {
      throw new Error(
        "Não foi possível ler as demandas. Verifique o armazenamento local do navegador.",
      );
    }
    const ids = new Set();
    if (
      !Array.isArray(registros) ||
      registros.some((item) => {
        if (
          !item ||
          !["string", "number"].includes(typeof item.id) ||
          !String(item.id).trim() ||
          ids.has(String(item.id))
        )
          return true;
        ids.add(String(item.id));
        return false;
      })
    )
      throw new Error(
        "Os dados locais estão inválidos. Os registros existentes não foram substituídos.",
      );
    // Não atribuo autoria ou unidade a registros antigos por suposição.
    return registros;
  }
  function listarPermitidas() {
    return FullmetalVisibilidade.aplicar(listar(), usuarioAtual());
  }
  function obter(id) {
    return (
      listarPermitidas().find((item) => String(item.id) === String(id)) || null
    );
  }
  function gravar(registros) {
    try {
      localStorage.setItem(chave, JSON.stringify(registros));
    } catch {
      throw new Error(
        "Não foi possível salvar. Nenhuma alteração foi confirmada.",
      );
    }
    if (globalThis.document && globalThis.CustomEvent)
      document.dispatchEvent(new CustomEvent("fullmetal:demandas-alteradas"));
  }
  function salvarNova(campos) {
    const nova = FullmetalDemandas.criar(campos, usuarioAtual());
    const registros = listar();
    if (registros.some((item) => String(item.id) === nova.id))
      throw new Error(
        "Já existe uma demanda com este identificador. Tente novamente.",
      );
    gravar([...registros, nova]);
    return copiar(nova);
  }
  function executar(id, acao, parametros = {}) {
    // Releio os dados e as permissões: uma seleção antiga não autoriza uma alteração.
    const usuario = usuarioAtual();
    const registros = listar();
    const indice = registros.findIndex(
      (item) => String(item.id) === String(id),
    );
    const atual = registros[indice];
    if (!FullmetalVisibilidade.acoesPermitidas(atual, usuario).includes(acao))
      throw new Error(
        "Ação indisponível para seu perfil ou para o estado atual da demanda.",
      );
    const nova = copiar(atual);
    let descricao;
    switch (acao) {
      case "encaminhar": {
        const unidade = FullmetalCatalogos.unidades.find(
          (item) => item.id === parametros.unidade,
        );
        if (!unidade)
          throw new Error(
            "Selecione uma unidade válida para o encaminhamento.",
          );
        nova.unidade = unidade.id;
        descricao = `Demanda encaminhada para ${unidade.nome}.`;
        break;
      }
      case "prioridade":
        if (!["normal", "media", "alta"].includes(parametros.prioridade))
          throw new Error("Selecione uma prioridade válida.");
        nova.prioridade = parametros.prioridade;
        descricao = `Prioridade definida: ${{ normal: "Normal", media: "Média", alta: "Alta" }[parametros.prioridade]}.`;
        break;
      case "iniciar":
        nova.status = FullmetalDemandas.STATUS.EM_ATENDIMENTO;
        descricao = "Atendimento iniciado.";
        break;
      case "concluir":
        if (
          parametros.resolucao !== undefined &&
          (typeof parametros.resolucao !== "string" ||
            parametros.resolucao.trim().length > 500)
        )
          throw new Error(
            "O resumo do atendimento deve ter até 500 caracteres.",
          );
        nova.status = FullmetalDemandas.STATUS.CONCLUIDA;
        descricao = parametros.resolucao?.trim()
          ? `Atendimento concluído. ${parametros.resolucao.trim()}`
          : "Atendimento concluído.";
        break;
      case "cancelar":
        nova.status = FullmetalDemandas.STATUS.CANCELADA;
        descricao = "Demanda cancelada.";
        break;
      default:
        throw new Error("Ação desconhecida.");
    }
    nova.historico = [
      ...(Array.isArray(nova.historico) ? nova.historico : []),
      {
        descricao,
        data: new Date().toISOString(),
        usuarioId: usuario.id,
        perfil: usuario.perfil,
      },
    ];
    registros[indice] = nova;
    gravar(registros);
    return copiar(nova);
  }
  globalThis.FullmetalDados = Object.freeze({
    listar,
    listarPermitidas,
    obter,
    salvarNova,
    executar,
  });
})();
