(() => {
  // Reúno as opções já existentes no cadastro e no painel; não crio dados de demandas.
  const categorias = [
    { id: "manutencao", nome: "Manutenção" },
    { id: "ti", nome: "Suporte de TI" },
    { id: "rh", nome: "Recursos Humanos" },
  ];
  const unidades = [
    { id: "manutencao", nome: "Manutenção" },
    { id: "ti", nome: "TI" },
    { id: "rh", nome: "Recursos Humanos" },
  ];
  const congelar = (itens) =>
    Object.freeze(itens.map((item) => Object.freeze(item)));
  const prioridades = [
    { id: "normal", nome: "Normal" },
    { id: "media", nome: "Média" },
    { id: "alta", nome: "Alta" },
  ];
  const rotulo = (itens, id) =>
    itens.find((item) => item.id === id)?.nome || id || "Não informado";
  globalThis.FullmetalCatalogos = Object.freeze({
    categorias: congelar(categorias),
    unidades: congelar(unidades),
    nomeCategoria: (id) => rotulo(categorias, id),
    nomeUnidade: (id) => rotulo(unidades, id),
    nomePrioridade: (id) => (id ? rotulo(prioridades, id) : "Não definida"),
  });
})();
