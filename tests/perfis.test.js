const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const vm = require("node:vm");

const script = fs.readFileSync(
  path.join(__dirname, "..", "js", "header.js"),
  "utf8",
);

function iniciarPagina({
  protocol = "file:",
  hostname = "",
  dados = {},
  armazenamentoFalha = false,
  rascunho = false,
  confirmarTroca = true,
} = {}) {
  const eventos = [];
  const valor = { textContent: "A definir" };
  const indicador = { hidden: false };
  const recipiente = {
    filhos: [],
    querySelector(seletor) {
      return seletor === ".profile-indicator" ? indicador : valor;
    },
    appendChild(filho) {
      this.filhos.push(filho);
    },
  };
  const document = {
    body: { dataset: {} },
    listeners: {},
    addEventListener(nome, callback) {
      this.listeners[nome] = callback;
    },
    querySelector(seletor) {
      if (seletor === "#formulario-demanda" && rascunho)
        return { querySelectorAll: () => [{ value: "Rascunho" }] };
      return seletor === ".profile-container" ? recipiente : null;
    },
    createElement(tagName) {
      return {
        tagName,
        dataset: {},
        classList: { toggle() {} },
        filhos: [],
        listeners: {},
        appendChild(filho) {
          this.filhos.push(filho);
        },
        append(...filhos) {
          this.filhos.push(...filhos);
        },
        setAttribute(nome, conteudo) {
          this[nome] = conteudo;
        },
        addEventListener(nome, callback) {
          this.listeners[nome] = callback;
        },
        focus() {
          document.activeElement = this;
        },
        contains(alvo) {
          return (
            this === alvo || this.filhos.some((filho) => filho.contains(alvo))
          );
        },
      };
    },
    dispatchEvent(evento) {
      eventos.push(evento);
    },
  };
  const localStorage = {
    getItem(chave) {
      if (armazenamentoFalha) throw new Error("Armazenamento indisponível");
      return dados[chave] ?? null;
    },
    setItem(chave, conteudo) {
      if (armazenamentoFalha) throw new Error("Armazenamento indisponível");
      dados[chave] = conteudo;
    },
  };
  const destinos = [];
  const avisos = [];
  const window = {
    location: {
      protocol,
      hostname,
      assign: (destino) => destinos.push(destino),
    },
    confirm: () => confirmarTroca,
    alert: (mensagem) => avisos.push(mensagem),
  };
  class CustomEvent {
    constructor(type, options) {
      this.type = type;
      this.detail = options.detail;
    }
  }

  vm.runInNewContext(script, { document, window, localStorage, CustomEvent });
  const controle = recipiente.filhos[0];
  const seletor = controle?.filhos.find((filho) => filho.tagName === "select");
  const botao = controle?.filhos.find((filho) => filho.id === "perfil-toggle");
  const menu = controle?.filhos.find((filho) => filho.id === "perfil-menu");
  const opcoes = menu?.filhos[0].filhos;
  return {
    api: window.FullmetalPerfis,
    document,
    valor,
    indicador,
    seletor,
    eventos,
    dados,
    destinos,
    avisos,
    controle,
    botao,
    menu,
    opcoes,
  };
}

test("troca entre os três perfis e informa a tela sobre a mudança", () => {
  const pagina = iniciarPagina();
  assert.equal(pagina.api.obterPerfilAtual(), "solicitante");
  assert.equal(pagina.indicador.hidden, true);
  assert.equal(pagina.seletor.filhos.length, 3);
  assert.equal(pagina.api.pode("cadastrar_demanda"), true);

  pagina.api.definirPerfil("triagem");
  assert.equal(pagina.valor.textContent, "Triagem");
  assert.equal(pagina.document.body.dataset.perfilAtivo, "triagem");
  assert.equal(pagina.api.pode("cadastrar_demanda"), false);
  assert.equal(pagina.api.pode("alterar_status"), true);
  assert.equal(pagina.api.pode("encaminhar_demanda"), true);
  assert.equal(pagina.api.pode("definir_prioridade"), false);
  assert.equal(pagina.destinos.length, 0);

  pagina.api.definirPerfil("responsavel");
  assert.equal(pagina.valor.textContent, "Responsável");
  assert.equal(pagina.api.pode("definir_prioridade"), true);
  assert.equal(pagina.api.pode("concluir_demanda"), true);
  assert.equal(pagina.api.pode("encaminhar_demanda"), false);
  assert.equal(pagina.dados["fullmetal-dev-perfil"], "responsavel");
  assert.equal(pagina.destinos.length, 0);
  assert.deepEqual(
    pagina.eventos.map((evento) => evento.detail.perfil),
    ["triagem", "responsavel"],
  );
});

test("recupera o perfil ao abrir outra página e rejeita valores desconhecidos", () => {
  const dados = { "fullmetal-dev-perfil": "triagem" };
  assert.equal(iniciarPagina({ dados }).api.obterPerfilAtual(), "triagem");
  const pagina = iniciarPagina({ dados });
  assert.equal(pagina.api.definirPerfil("administrador"), false);
  assert.equal(pagina.api.obterPerfilAtual(), "triagem");
});

test("continua funcionando sem armazenamento e não mostra o seletor fora do ambiente local", () => {
  const local = iniciarPagina({ armazenamentoFalha: true });
  assert.equal(local.api.definirPerfil("responsavel"), true);
  assert.equal(local.api.obterPerfilAtual(), "responsavel");

  const publicado = iniciarPagina({
    protocol: "https:",
    hostname: "fullmetal.example",
  });
  assert.equal(publicado.seletor, undefined);
  assert.equal(publicado.indicador.hidden, false);
  assert.equal(publicado.api.obterUsuarioAtual(), null);
  assert.equal(publicado.api.definirPerfil("triagem"), false);
  assert.equal(publicado.api.definirUnidadeDesenvolvimento("unidade-1"), false);
});

test("mantém a identidade ao trocar de perfil e ao recarregar a página", () => {
  const dados = {};
  const pagina = iniciarPagina({ dados });
  const usuario = pagina.api.obterUsuarioAtual();
  assert.match(usuario.id, /^dev-.+/);
  assert.equal(usuario.nome, null);
  assert.equal(usuario.unidade, null);
  assert.equal(usuario.origem, "desenvolvimento");
  pagina.api.definirPerfil("responsavel");
  assert.equal(pagina.api.obterUsuarioAtual().id, usuario.id);
  assert.equal(pagina.api.obterUsuarioAtual().perfil, "responsavel");
  assert.equal(iniciarPagina({ dados }).api.obterUsuarioAtual().id, usuario.id);
  assert.equal(pagina.eventos[0].detail.usuario.id, usuario.id);
});

test("unidade precisa ser informada explicitamente e não pode ser alterada pela cópia retornada", () => {
  const dados = {};
  const pagina = iniciarPagina({ dados });
  assert.equal(
    pagina.api.definirUnidadeDesenvolvimento({ unidade: "unidade-1" }),
    false,
  );
  assert.equal(pagina.api.obterUsuarioAtual().unidade, null);
  assert.equal(pagina.api.definirUnidadeDesenvolvimento("  unidade-1  "), true);
  const usuario = pagina.api.obterUsuarioAtual();
  usuario.id = "outro";
  usuario.unidade = "outra";
  assert.equal(pagina.api.obterUsuarioAtual().unidade, "unidade-1");
  assert.notEqual(pagina.api.obterUsuarioAtual().id, "outro");
  assert.equal(
    iniciarPagina({ dados }).api.obterUsuarioAtual().unidade,
    "unidade-1",
  );
  assert.equal(pagina.eventos[0].type, "fullmetal:usuario-alterado");
  assert.equal(pagina.eventos[0].detail.usuario.unidade, "unidade-1");
  assert.equal(pagina.api.definirUnidadeDesenvolvimento(null), true);
  assert.equal(iniciarPagina({ dados }).api.obterUsuarioAtual().unidade, null);
});

test("recupera identidade inválida e funciona com armazenamento bloqueado", () => {
  for (const salvo of [
    "{inválido",
    JSON.stringify({ id: 42, unidade: "unidade-1" }),
  ]) {
    const dados = { "fullmetal-dev-usuario": salvo };
    const pagina = iniciarPagina({ dados });
    assert.match(pagina.api.obterUsuarioAtual().id, /^dev-.+/);
    assert.equal(pagina.api.obterUsuarioAtual().unidade, null);
    assert.equal(
      JSON.parse(dados["fullmetal-dev-usuario"]).id,
      pagina.api.obterUsuarioAtual().id,
    );
  }
  const pagina = iniciarPagina({ armazenamentoFalha: true });
  const id = pagina.api.obterUsuarioAtual().id;
  pagina.api.definirPerfil("triagem");
  assert.equal(pagina.api.obterUsuarioAtual().id, id);
  assert.equal(pagina.api.definirUnidadeDesenvolvimento("unidade-1"), true);
  assert.equal(pagina.api.obterUsuarioAtual().unidade, "unidade-1");
});

test("menu visual informa o perfil ativo e permite setas, Home, End e Escape", () => {
  const pagina = iniciarPagina();
  const tecla = (key) => ({ key, preventDefault() {} });
  assert.equal(pagina.seletor.hidden, true);
  assert.equal(pagina.botao["aria-expanded"], "false");
  assert.equal(pagina.opcoes[0]["aria-checked"], "true");
  pagina.botao.listeners.click();
  assert.equal(pagina.menu.hidden, false);
  assert.equal(pagina.document.activeElement, pagina.opcoes[0]);
  pagina.opcoes[0].listeners.keydown(tecla("ArrowDown"));
  assert.equal(pagina.document.activeElement, pagina.opcoes[1]);
  pagina.opcoes[1].listeners.keydown(tecla("End"));
  assert.equal(pagina.document.activeElement, pagina.opcoes[2]);
  pagina.opcoes[2].listeners.keydown(tecla("Home"));
  assert.equal(pagina.document.activeElement, pagina.opcoes[0]);
  pagina.controle.listeners.keydown(tecla("Escape"));
  assert.equal(pagina.menu.hidden, true);
  assert.equal(pagina.botao["aria-expanded"], "false");
  assert.equal(pagina.document.activeElement, pagina.botao);
});

test("opção visual salva o destino sem revalidar a tela antiga e fecha ao clicar fora ou sair com Tab", () => {
  const pagina = iniciarPagina();
  pagina.botao.listeners.click();
  pagina.opcoes[1].listeners.click();
  assert.equal(pagina.api.obterPerfilAtual(), "solicitante");
  assert.equal(pagina.api.pode("cadastrar_demanda"), true);
  assert.equal(pagina.eventos.length, 0);
  assert.equal(pagina.dados["fullmetal-dev-perfil"], "triagem");
  assert.equal(
    iniciarPagina({ dados: pagina.dados }).api.obterPerfilAtual(),
    "triagem",
  );
  assert.equal(pagina.destinos[0], "triagem.html");
  assert.equal(pagina.opcoes[0]["aria-checked"], "true");
  assert.equal(pagina.menu.hidden, true);
  pagina.botao.listeners.click();
  pagina.document.listeners.click({ target: {} });
  assert.equal(pagina.menu.hidden, true);
  pagina.botao.listeners.click();
  pagina.controle.listeners.keydown({ key: "Tab" });
  assert.equal(pagina.menu.hidden, true);
});

test("não descarta rascunho se a confirmação de troca for recusada", () => {
  const pagina = iniciarPagina({ rascunho: true, confirmarTroca: false });
  pagina.botao.listeners.click();
  pagina.opcoes[1].listeners.click();
  assert.equal(pagina.api.obterPerfilAtual(), "solicitante");
  assert.equal(pagina.destinos.length, 0);
  assert.equal(pagina.menu.hidden, true);
  assert.equal(pagina.document.activeElement, pagina.botao);
});

test("o seletor nativo também navega sem emitir alteração de perfil na tela antiga", () => {
  const pagina = iniciarPagina({
    dados: { "fullmetal-dev-perfil": "responsavel" },
  });
  pagina.seletor.value = "solicitante";
  pagina.seletor.listeners.change();
  assert.equal(pagina.api.obterPerfilAtual(), "responsavel");
  assert.equal(pagina.dados["fullmetal-dev-perfil"], "solicitante");
  assert.equal(pagina.destinos[0], "painel-de-demandas.html");
  assert.equal(pagina.eventos.length, 0);
  assert.equal(
    iniciarPagina({ dados: pagina.dados }).api.obterPerfilAtual(),
    "solicitante",
  );
});

test("não navega nem troca o contexto quando não consegue persistir a escolha", () => {
  const pagina = iniciarPagina({ armazenamentoFalha: true });
  pagina.botao.listeners.click();
  pagina.opcoes[1].listeners.click();
  assert.equal(pagina.api.obterPerfilAtual(), "solicitante");
  assert.equal(pagina.destinos.length, 0);
  assert.equal(pagina.eventos.length, 0);
  assert.equal(pagina.menu.hidden, true);
  assert.match(pagina.avisos[0], /Não foi possível salvar/);
});
