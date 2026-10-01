const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const ambiente = {};
vm.runInNewContext(fs.readFileSync(path.join(__dirname, '..', 'js', 'filtros.js'), 'utf8'), ambiente);
const aplicar = ambiente.FullmetalFiltros.aplicar;
const demandas = [
  { id: '1', titulo: 'Manutenção da iluminação', localizacao: 'Sala A', status: 'Pendente' },
  { id: '2', titulo: 'Manutenção da porta', localizacao: 'Sala B', status: 'Em atendimento' },
  { id: '3', titulo: 'Rede', localizacao: 'Sala A', status: 'Concluída' }
];
const ids = itens => Array.from(itens, item => item.id);

test('busca ignora acentos, espaços externos e diferença entre maiúsculas e minúsculas', () => {
  assert.deepEqual(ids(aplicar(demandas, { termo: '  ILUMINACAO  ' })), ['1']);
  assert.deepEqual(ids(aplicar(demandas, { termo: 'sala a' })), ['1', '3']);
  assert.deepEqual(ids(aplicar(demandas, { termo: '2' })), ['2']);
});

test('combina busca e status e retorna vazio quando ambos não coincidem', () => {
  assert.deepEqual(ids(aplicar(demandas, { termo: 'manutencao', status: 'Em atendimento' })), ['2']);
  assert.deepEqual(ids(aplicar(demandas, { termo: 'rede', status: 'Pendente' })), []);
});

test('limpar mantém apenas a coleção permitida recebida e não modifica os registros', () => {
  const permitidas = demandas.slice(0, 1);
  assert.deepEqual(ids(aplicar(permitidas)), ['1']);
  assert.equal(permitidas.length, 1);
  assert.equal(permitidas[0], demandas[0]);
});
