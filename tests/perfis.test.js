const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');

const script = fs.readFileSync(path.join(__dirname, '..', 'js', 'header.js'), 'utf8');

function iniciarPagina({ protocol = 'file:', hostname = '', dados = {}, armazenamentoFalha = false } = {}) {
  const eventos = [];
  const valor = { textContent: 'A definir' };
  const indicador = { hidden: false };
  const recipiente = {
    filhos: [],
    querySelector(seletor) {
      return seletor === '.profile-indicator' ? indicador : valor;
    },
    appendChild(filho) {
      this.filhos.push(filho);
    }
  };
  const document = {
    body: { dataset: {} },
    querySelector(seletor) {
      return seletor === '.profile-container' ? recipiente : null;
    },
    createElement(tagName) {
      return {
        tagName,
        filhos: [],
        listeners: {},
        appendChild(filho) { this.filhos.push(filho); },
        append(...filhos) { this.filhos.push(...filhos); },
        setAttribute(nome, conteudo) { this[nome] = conteudo; },
        addEventListener(nome, callback) { this.listeners[nome] = callback; }
      };
    },
    dispatchEvent(evento) {
      eventos.push(evento);
    }
  };
  const localStorage = {
    getItem(chave) {
      if (armazenamentoFalha) throw new Error('Armazenamento indisponível');
      return dados[chave] ?? null;
    },
    setItem(chave, conteudo) {
      if (armazenamentoFalha) throw new Error('Armazenamento indisponível');
      dados[chave] = conteudo;
    }
  };
  const window = { location: { protocol, hostname } };
  class CustomEvent {
    constructor(type, options) {
      this.type = type;
      this.detail = options.detail;
    }
  }

  vm.runInNewContext(script, { document, window, localStorage, CustomEvent });
  const controle = recipiente.filhos[0];
  const seletor = controle?.filhos.find(filho => filho.tagName === 'select');
  return { api: window.FullmetalPerfis, document, valor, indicador, seletor, eventos, dados };
}

test('troca entre os três perfis e informa a tela sobre a mudança', () => {
  const pagina = iniciarPagina();
  assert.equal(pagina.api.obterPerfilAtual(), 'solicitante');
  assert.equal(pagina.indicador.hidden, true);
  assert.equal(pagina.seletor.filhos.length, 3);
  assert.equal(pagina.api.pode('cadastrar_demanda'), true);

  pagina.seletor.value = 'triagem';
  pagina.seletor.listeners.change();
  assert.equal(pagina.valor.textContent, 'Triagem');
  assert.equal(pagina.document.body.dataset.perfilAtivo, 'triagem');
  assert.equal(pagina.api.pode('cadastrar_demanda'), false);
  assert.equal(pagina.api.pode('alterar_status'), true);

  pagina.seletor.value = 'responsavel';
  pagina.seletor.listeners.change();
  assert.equal(pagina.valor.textContent, 'Responsável');
  assert.equal(pagina.dados['fullmetal-dev-perfil'], 'responsavel');
  assert.deepEqual(pagina.eventos.map(evento => evento.detail.perfil), ['triagem', 'responsavel']);
});

test('recupera o perfil ao abrir outra página e rejeita valores desconhecidos', () => {
  const dados = { 'fullmetal-dev-perfil': 'triagem' };
  assert.equal(iniciarPagina({ dados }).api.obterPerfilAtual(), 'triagem');
  const pagina = iniciarPagina({ dados });
  assert.equal(pagina.api.definirPerfil('administrador'), false);
  assert.equal(pagina.api.obterPerfilAtual(), 'triagem');
});

test('continua funcionando sem armazenamento e não mostra o seletor fora do ambiente local', () => {
  const local = iniciarPagina({ armazenamentoFalha: true });
  assert.equal(local.api.definirPerfil('responsavel'), true);
  assert.equal(local.api.obterPerfilAtual(), 'responsavel');

  const publicado = iniciarPagina({ protocol: 'https:', hostname: 'fullmetal.example' });
  assert.equal(publicado.seletor, undefined);
  assert.equal(publicado.indicador.hidden, false);
  assert.equal(publicado.api.obterUsuarioAtual(), null);
  assert.equal(publicado.api.definirPerfil('triagem'), false);
});
