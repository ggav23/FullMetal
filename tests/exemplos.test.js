const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const vm = require("node:vm");
const fixture = JSON.parse(
  fs.readFileSync(
    path.join(__dirname, "..", "dados", "demandas-exemplo.json"),
    "utf8",
  ),
);
const copiar = (valor) => JSON.parse(JSON.stringify(valor));

function ambiente(inicial = "[]") {
  let salvo = inicial;
  let usuario = {
    id: "dev-igor-teste",
    perfil: "solicitante",
    origem: "desenvolvimento",
    unidade: null,
  };
  let eventos = 0;
  let falhar = false;
  const contexto = {
    TextEncoder,
    location: { protocol: "file:", hostname: "" },
    localStorage: {
      getItem: () => salvo,
      setItem: (_, valor) => {
        if (falhar) throw new Error("Quota");
        salvo = valor;
      },
    },
    FullmetalPerfis: { obterUsuarioAtual: () => usuario },
    document: { dispatchEvent: () => eventos++ },
    CustomEvent: class {},
  };
  for (const nome of [
    "catalogos",
    "demandas",
    "visibilidade",
    "dados",
    "exemplos",
  ])
    vm.runInNewContext(
      fs.readFileSync(path.join(__dirname, "..", "js", `${nome}.js`), "utf8"),
      contexto,
    );
  return {
    dados: contexto.FullmetalDados,
    exemplos: contexto.FullmetalExemplos,
    visibilidade: contexto.FullmetalVisibilidade,
    usuario: () => usuario,
    trocarUsuario: (valor) => {
      usuario = valor;
    },
    local: (valor) => {
      contexto.location = valor;
    },
    bloquear: () => {
      falhar = true;
    },
    salvo: () => salvo,
    eventos: () => eventos,
  };
}

test("carregar os módulos não importa nem modifica dados automaticamente", () => {
  const a = ambiente();
  assert.equal(a.salvo(), "[]");
  assert.equal(a.eventos(), 0);
});

test("JSON oficial cobre todos os status e unidades, sem trocar perfil ou atribuir prioridade à triagem", () => {
  const a = ambiente();
  const antes = copiar(fixture);
  const registros = a.exemplos.preparar(fixture, a.usuario());
  assert.equal(registros.length, 9);
  assert.deepEqual(
    [...new Set(registros.map((r) => r.status))].sort(),
    ["Cancelada", "Concluída", "Em atendimento", "Pendente"].sort(),
  );
  assert.deepEqual(
    [...new Set(registros.map((r) => r.unidade).filter(Boolean))].sort(),
    ["manutencao", "rh", "ti"],
  );
  assert.equal(
    registros.filter((r) => r.solicitanteId === a.usuario().id).length,
    8,
  );
  assert.equal(
    registros.find((r) => r.id === "TESTE-009").solicitanteId,
    "teste-outro-dev-igor-teste",
  );
  for (const registro of registros) {
    if (!registro.unidade) assert.equal(registro.prioridade, null);
    if (registro.prioridade)
      assert.ok(
        registro.historico.some(
          (h) =>
            h.perfil === "responsavel" &&
            h.descricao.startsWith("Prioridade definida:"),
        ),
      );
    assert.equal(registro.origem, "exemplo-json");
  }
  assert.equal(a.usuario().perfil, "solicitante");
  assert.equal(a.usuario().unidade, null);
  assert.deepEqual(fixture, antes);
});

test("importa sem sobrescrever registros anteriores e mantém as regras de visibilidade", () => {
  const anterior = {
    id: 123,
    titulo: "Registro anterior",
    solicitanteId: "outra-pessoa",
  };
  const a = ambiente(JSON.stringify([anterior]));
  const resultado = a.dados.importarExemplos(fixture);
  assert.deepEqual(copiar(resultado), {
    importadas: 9,
    ignoradas: 0,
    preservadas: 1,
  });
  assert.deepEqual(JSON.parse(a.salvo())[0], anterior);
  assert.equal(a.dados.listarPermitidas().length, 8);
  assert.equal(a.dados.obter("TESTE-009"), null);
  a.trocarUsuario({ ...a.usuario(), perfil: "triagem" });
  assert.equal(a.dados.listarPermitidas().length, 10);
  assert.equal(a.dados.obter("TESTE-009").titulo, fixture.demandas[8].titulo);
  assert.equal(
    a.visibilidade
      .acoesPermitidas(a.dados.obter("TESTE-003"), a.usuario())
      .includes("prioridade"),
    false,
  );
  a.trocarUsuario({
    ...a.usuario(),
    perfil: "responsavel",
    unidade: "manutencao",
  });
  assert.equal(a.dados.listarPermitidas().length, 3);
  assert.equal(a.eventos(), 1);
});

test("reimportar não duplica nem reverte ações já feitas nos exemplos", () => {
  const a = ambiente();
  a.dados.importarExemplos(fixture);
  a.trocarUsuario({
    ...a.usuario(),
    perfil: "responsavel",
    unidade: "manutencao",
  });
  a.dados.executar("TESTE-003", "prioridade", { prioridade: "alta" });
  a.dados.executar("TESTE-003", "iniciar");
  const salvo = a.salvo();
  const eventos = a.eventos();
  const resumo = a.dados.importarExemplos(fixture);
  assert.equal(resumo.importadas, 0);
  assert.equal(resumo.ignoradas, 9);
  assert.equal(a.salvo(), salvo);
  assert.equal(a.eventos(), eventos);
  assert.equal(a.dados.obter("TESTE-003").status, "Em atendimento");
  assert.equal(a.dados.obter("TESTE-003").prioridade, "alta");
});

test("uma colisão de ID preserva até um registro que não veio dos exemplos", () => {
  const anterior = { id: "TESTE-001", titulo: "Não substituir" };
  const a = ambiente(JSON.stringify([anterior]));
  const resumo = a.dados.importarExemplos(fixture);
  assert.equal(resumo.importadas, 8);
  assert.equal(resumo.ignoradas, 1);
  assert.deepEqual(JSON.parse(a.salvo())[0], anterior);
});

test("importação é restrita ao ambiente e usuário locais de desenvolvimento", () => {
  const a = ambiente();
  for (const local of [
    { protocol: "https:", hostname: "fullmetal.example" },
    { protocol: "http:", hostname: "localhost.example" },
  ]) {
    a.local(local);
    assert.throws(
      () => a.dados.importarExemplos(fixture),
      /desenvolvimento local/,
    );
  }
  a.local({ protocol: "http:", hostname: "127.0.0.1" });
  a.trocarUsuario({
    id: "usuario-real",
    perfil: "solicitante",
    origem: "autenticacao",
  });
  assert.throws(
    () => a.dados.importarExemplos(fixture),
    /desenvolvimento local/,
  );
  a.trocarUsuario(null);
  assert.throws(
    () => a.dados.importarExemplos(fixture),
    /desenvolvimento local/,
  );
  assert.equal(a.salvo(), "[]");
  assert.equal(a.eventos(), 0);
});

test("aceita importação nos três perfis locais, sem mudar o papel ativo", () => {
  for (const perfil of ["solicitante", "triagem", "responsavel"]) {
    const a = ambiente();
    a.local({ protocol: "http:", hostname: "localhost" });
    a.trocarUsuario({ ...a.usuario(), perfil });
    assert.equal(a.dados.importarExemplos(fixture).importadas, 9);
    assert.equal(a.usuario().perfil, perfil);
  }
});

test("JSON inválido ou acima do limite não é aceito, contando bytes UTF-8", () => {
  const a = ambiente();
  assert.equal(a.exemplos.lerJSON(JSON.stringify(fixture)).versao, 1);
  assert.throws(() => a.exemplos.lerJSON("{"), /JSON válido/);
  assert.throws(() => a.exemplos.lerJSON("é".repeat(65537)), /128 KB/);
  assert.throws(() => a.exemplos.lerJSON(null), /128 KB/);
  assert.equal(a.salvo(), "[]");
});

test("recusa formatos e registros inválidos antes de qualquer gravação parcial", () => {
  const a = ambiente('[{"id":"anterior"}]');
  for (const invalido of [
    null,
    [],
    {},
    { versao: 2, demandas: fixture.demandas },
    { versao: 1, demandas: [] },
    { versao: 1, demandas: Array(101).fill(fixture.demandas[0]) },
  ])
    assert.throws(() => a.dados.importarExemplos(invalido));
  for (const mudanca of [
    { id: "ID-NAO-RESERVADO" },
    { id: "TESTE-001" },
    { autor: "inventado" },
    { categoria: "inventada" },
    { titulo: " " },
    { descricao: "a".repeat(501) },
    { localizacao: " " },
    { status: "Aberta" },
    { unidade: "inexistente" },
    { prioridade: "urgente" },
    { prioridade: "alta" },
    { status: "Em atendimento" },
    { dataCriacao: "invalida" },
    { historico: [] },
    {
      historico: [{ descricao: "Evento", data: "invalida", perfil: "triagem" }],
    },
    {
      historico: [
        {
          descricao: "Evento",
          data: "2026-09-01T09:00:00.000Z",
          perfil: "triagem",
        },
      ],
    },
  ]) {
    const dados = copiar(fixture);
    Object.assign(dados.demandas[1], mudanca);
    assert.throws(
      () => a.dados.importarExemplos(dados),
      /exemplo 2 está inválido/,
    );
  }
  assert.equal(a.salvo(), '[{"id":"anterior"}]');
  assert.equal(a.eventos(), 0);
});

test("falha de leitura ou gravação preserva os dados e não anuncia importação", () => {
  const corrompido = ambiente("{");
  assert.throws(
    () => corrompido.dados.importarExemplos(fixture),
    /ler as demandas/,
  );
  assert.equal(corrompido.salvo(), "{");
  const a = ambiente('[{"id":"anterior"}]');
  a.bloquear();
  assert.throws(
    () => a.dados.importarExemplos(fixture),
    /Não foi possível salvar/,
  );
  assert.equal(a.salvo(), '[{"id":"anterior"}]');
  assert.equal(a.eventos(), 0);
});

test("ignora metadados extras e retorna registros novos sem modificar o arquivo", () => {
  const a = ambiente();
  const dados = copiar(fixture);
  dados.demandas[0].solicitanteId = "forjado";
  dados.demandas[0].origem = "real";
  const registro = a.exemplos.preparar(dados, a.usuario())[0];
  assert.equal(registro.solicitanteId, a.usuario().id);
  assert.equal(registro.origem, "exemplo-json");
  registro.titulo = "Modificado";
  registro.historico[0].descricao = "Modificado";
  assert.equal(dados.demandas[0].titulo, fixture.demandas[0].titulo);
  assert.equal(
    dados.demandas[0].historico[0].descricao,
    fixture.demandas[0].historico[0].descricao,
  );
});
