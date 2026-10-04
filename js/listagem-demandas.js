/* Mantenho o gerador de cartões, agora conectado aos registros do navegador. */
"use strict";
const PainelDemandas = {
  demandas: [],
  init() {
    this.listaContainer = document.getElementById("lista-demandas");
    if (!this.listaContainer) return;
    this.formProcura = document.querySelector("search form");
    this.inputBusca = document.getElementById("termo-busca");
    this.selectDepartamento = document.getElementById("filtro-departamento");
    this.selectStatus = document.getElementById("Status");
    this.ordenacao = document.getElementById("ordem-demandas");
    this.limpar = document.querySelector("[data-limpar-listagem]");
    this.erro = document.querySelector("[data-erro-listagem]");
    this.anuncio = document.querySelector("[data-anuncio-listagem]");
    for (const unidade of FullmetalCatalogos.unidades)
      this.selectDepartamento.add(new Option(unidade.nome, unidade.id));
    this.registarEventos();
    this.atualizar();
  },
  atualizar() {
    this.listaContainer.replaceChildren();
    this.erro.hidden = true;
    document.querySelector("[data-carregando-listagem]").hidden = true;
    const usuario = FullmetalPerfis.obterUsuarioAtual();
    document.querySelector("[data-nova-demanda]").hidden =
      usuario?.perfil !== "solicitante";
    try {
      if (!usuario)
        throw new Error("Identifique o usuário para consultar as demandas.");
      this.demandas = FullmetalDados.listarPermitidas();
      this.habilitar(true);
      this.filtrar();
    } catch (erro) {
      this.demandas = [];
      this.habilitar(false);
      this.erro.textContent = erro.message;
      this.erro.hidden = false;
      this.anuncio.textContent = "Listagem indisponível.";
    }
  },
  habilitar(valor) {
    for (const campo of this.formProcura.elements) campo.disabled = !valor;
    this.ordenacao.disabled = !valor;
  },
  registarEventos() {
    this.formProcura.addEventListener("submit", (evento) => {
      evento.preventDefault();
      this.filtrar();
    });
    this.inputBusca.addEventListener("input", () => this.filtrar());
    this.selectDepartamento.addEventListener("change", () => this.filtrar());
    this.selectStatus.addEventListener("change", () => this.filtrar());
    this.ordenacao.addEventListener("change", () => this.filtrar());
    this.limpar.addEventListener("click", () => {
      this.formProcura.reset();
      this.filtrar();
      this.inputBusca.focus();
    });
    for (const nome of [
      "fullmetal:demandas-alteradas",
      "fullmetal:perfil-alterado",
      "fullmetal:usuario-alterado",
    ])
      document.addEventListener(nome, () => this.atualizar());
    window.addEventListener("storage", () => this.atualizar());
  },
  filtrar() {
    // Filtro somente a coleção permitida, nunca a lista geral.
    const filtradas = FullmetalFiltros.aplicar(this.demandas, {
      termo: this.inputBusca.value,
      status: this.selectStatus.value,
    }).filter(
      (item) =>
        !this.selectDepartamento.value ||
        item.unidade === this.selectDepartamento.value,
    );
    this.limpar.disabled =
      !this.inputBusca.value &&
      !this.selectDepartamento.value &&
      !this.selectStatus.value;
    this.renderizarListagem(
      FullmetalFiltros.ordenar(filtradas, this.ordenacao.value),
    );
    this.anuncio.textContent = `${filtradas.length} demandas encontradas.`;
  },
  renderizarListagem(dados) {
    this.listaContainer.replaceChildren();
    const criar = FullmetalUI.elemento;
    if (!dados.length) {
      this.listaContainer.append(
        criar(
          "li",
          this.demandas.length
            ? "Nenhum resultado. Altere a busca ou limpe os filtros."
            : "Nenhuma demanda disponível para este usuário.",
          "empty-state",
        ),
      );
      return;
    }
    const fragmento = document.createDocumentFragment();
    for (const demanda of dados) {
      const li = criar("li");
      const card = criar("article", undefined, "card-demanda");
      const header = criar("header", undefined, "card-header");
      header.append(
        criar("span", `#${demanda.id}`, "card-id"),
        FullmetalUI.status(demanda.status),
      );
      const conteudo = criar("div");
      conteudo.append(criar("h3", demanda.titulo, "card-title"));
      const meta = criar("div", undefined, "card-metadata");
      for (const [nome, valor] of [
        ["Categoria", FullmetalCatalogos.nomeCategoria(demanda.categoria)],
        ["Localização", demanda.localizacao],
        ["Unidade", FullmetalUI.unidade(demanda)],
      ]) {
        const p = criar("p");
        if (nome === "Localização") {
          p.className = "card-location";
          p.title = FullmetalUI.texto(valor);
        }
        p.append(
          criar("strong", `${nome}: `),
          document.createTextNode(FullmetalUI.texto(valor)),
        );
        meta.append(p);
      }
      conteudo.append(meta);
      const footer = criar("footer", undefined, "card-footer");
      const time = criar("time", FullmetalUI.data(demanda.dataCriacao));
      if (
        demanda.dataCriacao &&
        !Number.isNaN(new Date(demanda.dataCriacao).getTime())
      )
        time.dateTime = new Date(demanda.dataCriacao).toISOString();
      const link = criar("a", "Ver detalhes", "btn btn-secondary");
      link.href = `detalhes-da-demanda.html?id=${encodeURIComponent(demanda.id)}`;
      link.setAttribute(
        "aria-label",
        `Ver detalhes: ${FullmetalUI.texto(demanda.titulo)}`,
      );
      footer.append(time, link);
      card.append(header, conteudo, footer);
      li.append(card);
      fragmento.append(li);
    }
    this.listaContainer.append(fragmento);
  },
};
document.addEventListener("DOMContentLoaded", () => PainelDemandas.init());
