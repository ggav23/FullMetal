const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const vm = require("node:vm");
const campos = {
  titulo: "Ajustar iluminação",
  descricao: "Verificar a sala.",
  categoria: "manutencao",
  localizacao: "Sala A",
};
function ambiente(inicial = "[]") {
  let salvo = inicial;
  let usuario = { id: "igor", perfil: "solicitante", unidade: null };
  let falhar = false;
  let eventos = 0;
  const contexto = {
    crypto: require("node:crypto").webcrypto,
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
  for (const arquivo of ["catalogos", "demandas", "visibilidade", "dados"])
    vm.runInNewContext(
      fs.readFileSync(
        path.join(__dirname, "..", "js", `${arquivo}.js`),
        "utf8",
      ),
      contexto,
    );
  return {
    api: contexto.FullmetalDados,
    vis: contexto.FullmetalVisibilidade,
    validar: contexto.FullmetalDemandas.validar,
    trocar: (valor) => {
      usuario = valor;
    },
    bloquear: () => {
      falhar = true;
    },
    salvo: () => salvo,
    eventos: () => eventos,
  };
}
test("integra cadastro, encaminhamento sem prioridade, início e conclusão com histórico persistente", () => {
  const a = ambiente();
  const nova = a.api.salvarNova(campos);
  assert.equal(nova.status, "Pendente");
  assert.equal(nova.prioridade, null);
  a.trocar({ id: "triagem", perfil: "triagem" });
  const enviada = a.api.executar(nova.id, "encaminhar", { unidade: "ti" });
  assert.equal(enviada.status, "Pendente");
  assert.equal(enviada.unidade, "ti");
  assert.equal(enviada.prioridade, null);
  assert.throws(
    () => a.api.executar(nova.id, "prioridade", { prioridade: "alta" }),
    /indisponível/,
  );
  a.trocar({ id: "responsavel", perfil: "responsavel", unidade: "ti" });
  a.api.executar(nova.id, "prioridade", { prioridade: "alta" });
  assert.equal(a.api.executar(nova.id, "iniciar").status, "Em atendimento");
  assert.throws(() => a.api.executar(nova.id, "iniciar"), /indisponível/);
  const concluida = a.api.executar(nova.id, "concluir", {
    resolucao: "  Serviço finalizado.  ",
  });
  assert.equal(concluida.status, "Concluída");
  assert.equal(concluida.historico.length, 5);
  assert.match(concluida.historico.at(-1).descricao, /Serviço finalizado\.$/);
  assert.equal(a.eventos(), 5);
  a.trocar({ id: "igor", perfil: "solicitante" });
  assert.equal(a.api.obter(nova.id).status, "Concluída");
  assert.throws(() => a.api.executar(nova.id, "cancelar"), /indisponível/);
});
test("limita lista e acesso direto por autoria e unidade, inclusive sem contexto", () => {
  const a = ambiente();
  const nova = a.api.salvarNova(campos);
  a.trocar({ id: "outro", perfil: "solicitante" });
  assert.equal(a.api.listarPermitidas().length, 0);
  assert.equal(a.api.obter(nova.id), null);
  assert.throws(() => a.api.executar(nova.id, "cancelar"), /indisponível/);
  a.trocar({ id: "r", perfil: "responsavel", unidade: null });
  assert.equal(a.api.listarPermitidas().length, 0);
  a.trocar({ id: "t", perfil: "triagem" });
  a.api.executar(nova.id, "encaminhar", { unidade: "ti" });
  a.trocar({ id: "r", perfil: "responsavel", unidade: "rh" });
  assert.equal(a.api.obter(nova.id), null);
  a.trocar({ id: "r", perfil: "responsavel", unidade: "ti" });
  assert.equal(a.api.listarPermitidas().length, 1);
});
test("solicitante pode cancelar somente a própria demanda; estado terminal bloqueia novas ações", () => {
  const a = ambiente();
  const nova = a.api.salvarNova(campos);
  assert.throws(
    () => a.api.executar(nova.id, "encaminhar", { unidade: "ti" }),
    /indisponível/,
  );
  assert.equal(a.api.executar(nova.id, "cancelar").status, "Cancelada");
  a.trocar({ id: "t", perfil: "triagem" });
  assert.throws(
    () => a.api.executar(nova.id, "encaminhar", { unidade: "ti" }),
    /indisponível/,
  );
  assert.throws(() => a.api.executar("ausente", "cancelar"), /indisponível/);
});
test("recusa categorias, unidades, prioridades e resumos inválidos sem gravar", () => {
  const a = ambiente();
  for (const alteracao of [
    { titulo: "    " },
    { titulo: "a".repeat(101) },
    { descricao: " " },
    { descricao: "a".repeat(501) },
    { categoria: "inventada" },
    { localizacao: " " },
  ]) {
    assert.throws(() => a.api.salvarNova({ ...campos, ...alteracao }));
  }
  assert.equal(a.eventos(), 0);
  const nova = a.api.salvarNova(campos);
  a.trocar({ id: "t", perfil: "triagem" });
  assert.throws(
    () => a.api.executar(nova.id, "encaminhar", { unidade: "inventada" }),
    /unidade válida/,
  );
  a.api.executar(nova.id, "encaminhar", { unidade: "ti" });
  a.trocar({ id: "r", perfil: "responsavel", unidade: "ti" });
  assert.throws(
    () => a.api.executar(nova.id, "prioridade", { prioridade: "urgente" }),
    /prioridade válida/,
  );
  a.api.executar(nova.id, "iniciar");
  const anterior = a.salvo();
  assert.throws(
    () => a.api.executar(nova.id, "concluir", { resolucao: "a".repeat(501) }),
    /500/,
  );
  assert.equal(a.salvo(), anterior);
});
test("armazenamento corrompido não é substituído e registros antigos não recebem autoria inventada", () => {
  for (const salvo of ["{", "{}", "[null]", '[{"id":"1"},{"id":1}]']) {
    const a = ambiente(salvo);
    assert.throws(() => a.api.listar());
    assert.throws(() => a.api.salvarNova(campos));
    assert.equal(a.salvo(), salvo);
  }
  const a = ambiente('[{"id":123,"titulo":"Antiga"}]');
  assert.equal(a.api.listarPermitidas().length, 0);
  a.trocar({ id: "t", perfil: "triagem" });
  assert.equal(a.api.obter("123").solicitanteId, undefined);
  assert.equal(
    a.vis.acoesPermitidas(a.api.obter("123"), { id: "t", perfil: "triagem" })
      .length,
    0,
  );
});
test("falha de gravação preserva dados e não anuncia sucesso", () => {
  const a = ambiente();
  const nova = a.api.salvarNova(campos);
  const anterior = a.salvo();
  const eventos = a.eventos();
  a.bloquear();
  assert.throws(() => a.api.executar(nova.id, "cancelar"), /Nenhuma alteração/);
  assert.equal(a.salvo(), anterior);
  assert.equal(a.eventos(), eventos);
  assert.equal(a.api.obter(nova.id).status, "Pendente");
});
test("não expõe referência mutável aos dados persistidos e nega usuário sem identidade", () => {
  const a = ambiente();
  const nova = a.api.salvarNova(campos);
  nova.status = "Cancelada";
  const copia = a.api.obter(nova.id);
  copia.historico.length = 0;
  assert.equal(a.api.obter(nova.id).historico.length, 1);
  a.trocar(null);
  assert.equal(a.api.listarPermitidas().length, 0);
  a.trocar({ id: "", perfil: "triagem" });
  assert.equal(a.api.listarPermitidas().length, 0);
});
