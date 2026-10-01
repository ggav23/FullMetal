const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const vm = require("node:vm");
const ambiente = { crypto: require("node:crypto").webcrypto };
vm.runInNewContext(
  fs.readFileSync(path.join(__dirname, "..", "js", "demandas.js"), "utf8"),
  ambiente,
);
const api = ambiente.FullmetalDemandas;
const campos = {
  titulo: "  Ajustar iluminação  ",
  descricao: "Verificar a iluminação da sala.",
  categoria: "categoria-1",
  localizacao: "Sala A",
};
const usuario = {
  id: "dev-usuario-1",
  perfil: "solicitante",
  nome: null,
  unidade: "unidade-origem",
};

test("cria demanda pendente com autoria, data, histórico e sem destino ou prioridade inventados", () => {
  const demanda = api.criar(campos, usuario);
  assert.match(demanda.id, /^[0-9a-f-]{36}$/);
  assert.equal(demanda.titulo, "Ajustar iluminação");
  assert.equal(demanda.status, api.STATUS.PENDENTE);
  assert.equal(demanda.solicitanteId, usuario.id);
  assert.equal(demanda.solicitante, null);
  assert.equal(demanda.unidade, null);
  assert.equal(demanda.prioridade, null);
  assert.equal(Number.isNaN(Date.parse(demanda.dataCriacao)), false);
  assert.equal(demanda.historico.length, 1);
  assert.equal(demanda.historico[0].data, demanda.dataCriacao);
  assert.notEqual(api.criar(campos, usuario).id, demanda.id);
  assert.equal(campos.titulo, "  Ajustar iluminação  ");
});

test("não aceita metadados de autoria, status ou prioridade vindos do formulário", () => {
  const demanda = api.criar(
    {
      ...campos,
      id: "forjado",
      status: "Concluída",
      solicitanteId: "outro",
      unidade: "outra",
      prioridade: "Alta",
      historico: [],
    },
    { ...usuario, nome: " Nome informado " },
  );
  assert.notEqual(demanda.id, "forjado");
  assert.equal(demanda.status, "Pendente");
  assert.equal(demanda.solicitanteId, usuario.id);
  assert.equal(demanda.solicitante, "Nome informado");
  assert.equal(demanda.unidade, null);
  assert.equal(demanda.prioridade, null);
  assert.equal(demanda.historico.length, 1);
});

test("exige identidade de solicitante e os quatro campos preenchidos", () => {
  for (const invalido of [
    null,
    {},
    { ...usuario, id: "" },
    { ...usuario, perfil: "triagem" },
  ]) {
    assert.throws(
      () => api.criar(campos, invalido),
      /identificar o solicitante/,
    );
  }
  for (const campo of Object.keys(campos)) {
    assert.throws(
      () => api.criar({ ...campos, [campo]: "  " }, usuario),
      /Informe título/,
    );
  }
  assert.throws(() => api.criar(null, usuario), /Informe título/);
});

test("expõe somente os quatro status canônicos e usa alternativa sem randomUUID", () => {
  assert.deepEqual(Array.from(Object.values(api.STATUS)), [
    "Pendente",
    "Em atendimento",
    "Concluída",
    "Cancelada",
  ]);
  assert.equal(Object.isFrozen(api.STATUS), true);
  const semCrypto = {};
  vm.runInNewContext(
    fs.readFileSync(path.join(__dirname, "..", "js", "demandas.js"), "utf8"),
    semCrypto,
  );
  assert.equal(
    typeof semCrypto.FullmetalDemandas.criar(campos, usuario).id,
    "string",
  );
});
