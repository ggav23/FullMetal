// Gero evidências fora do repositório, sempre em contextos de navegador descartáveis.
const fs = require('node:fs/promises');
const path = require('node:path');
const os = require('node:os');
const http = require('node:http');
const crypto = require('node:crypto');
const zlib = require('node:zlib');
const { execFileSync } = require('node:child_process');
const { chromium } = require(process.env.PLAYWRIGHT_MODULE || path.join(os.homedir(), '.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright'));
const repo = process.env.FULLMETAL_REPO || path.resolve(__dirname, '../../Fullmetal');
const edge = process.env.FULLMETAL_EDGE || 'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe';
const evidenceDir = path.join(__dirname, 'evidencias');
const axeVersion = '4.14.0';
const git = (...args) => execFileSync('git', args, { cwd: repo, encoding: 'utf8', windowsHide: true }).trim();
const resultado = { data: '2026-10-17', executadoEmUTC: new Date().toISOString(), objetivo: 'WCAG 2.1 A/AA e eMAG; amostra, não certificação', ambiente: {}, versoes: {}, comparacoes: [], auditorias: [], interacoes: [], errosExecucao: [] };
const fontes = {
  'contraste-antes': '0eaa93e', 'contraste-depois': '0b438f7',
  'layout-antes': '3039397', 'layout-depois': 'accbeb4',
  'erro-antes': 'b95c84b', 'erro-depois': '48673bc',
  'feedback-antes': 'a49d137', atual: '3917732',
};
let browser, server, base, axeSource, fixture;
const roots = {};

async function obterAxe() {
  const metadata = await (await fetch(`https://registry.npmjs.org/axe-core/${axeVersion}`)).json();
  const pacote = Buffer.from(await (await fetch(metadata.dist.tarball)).arrayBuffer());
  const integrity = 'sha512-' + crypto.createHash('sha512').update(pacote).digest('base64');
  if (integrity !== metadata.dist.integrity) throw new Error('Integridade do axe-core não confere.');
  const tar = zlib.gunzipSync(pacote);
  let script;
  for (let offset = 0; offset + 512 < tar.length;) {
    const nome = tar.subarray(offset, offset + 100).toString().replace(/\0.*$/, '');
    const tamanho = parseInt(tar.subarray(offset + 124, offset + 136).toString().replace(/\0.*$/, '').trim(), 8) || 0;
    if (nome === 'package/axe.min.js') { script = tar.subarray(offset + 512, offset + 512 + tamanho); break; }
    offset += 512 + Math.ceil(tamanho / 512) * 512;
  }
  if (!script) throw new Error('axe.min.js não encontrado no pacote.');
  await fs.mkdir(path.join(__dirname, 'ferramentas'), { recursive: true });
  await fs.writeFile(path.join(__dirname, 'ferramentas/axe.min.js'), script);
  resultado.ambiente.axe = { version: axeVersion, origem: metadata.dist.tarball, integridadePacote: integrity, sha256Script: crypto.createHash('sha256').update(script).digest('hex') };
  return script.toString('utf8');
}

async function preparar() {
  if (git('status', '--porcelain')) throw new Error('O repositório precisa estar sem alterações para uma base inequívoca.');
  resultado.gitInicial = { head: git('rev-parse', 'HEAD'), branch: git('branch', '--show-current') };
  await fs.mkdir(evidenceDir, { recursive: true });
  const temporario = await fs.mkdtemp(path.join(os.tmpdir(), 'fullmetal-a11y-'));
  for (const [apelido, ref] of Object.entries(fontes)) {
    const sha = git('rev-parse', ref);
    resultado.versoes[apelido] = { commit: sha, registro: git('show', '-s', '--format=%cI %s', sha) };
    const zip = path.join(temporario, `${apelido}.zip`);
    const destino = path.join(temporario, apelido);
    git('archive', '--format=zip', `--output=${zip}`, sha);
    execFileSync('powershell', ['-NoProfile', '-NonInteractive', '-Command', `Expand-Archive -LiteralPath '${zip.replaceAll("'", "''")}' -DestinationPath '${destino.replaceAll("'", "''")}'`], { windowsHide: true });
    roots[apelido] = destino;
  }
  resultado.ambiente = { ...resultado.ambiente, sistema: `Windows ${os.release()}`, node: process.version, viewportPadrao: '1366 × 900 CSS px', larguras: [1366, 390, 320], locale: 'pt-BR', fontes: 'Google Fonts bloqueado para reprodução offline; alternativas declaradas pelo CSS.', dados: 'JSON oficial em contextos isolados; nenhum dado pessoal do navegador.', zoom: 'Zoom do navegador 100%; largura de 320 CSS px não substitui teste de zoom real.' };
  axeSource = await obterAxe();
  fixture = JSON.parse(git('show', `${fontes.atual}:dados/demandas-exemplo.json`));
  server = http.createServer(async (req, res) => {
    try {
      const url = new URL(req.url, 'http://127.0.0.1');
      const segmentos = decodeURIComponent(url.pathname).split('/').filter(Boolean);
      const raiz = roots[segmentos.shift()];
      if (!raiz) { res.writeHead(404); res.end(); return; }
      const arquivo = path.resolve(raiz, segmentos.join('/') || 'index.html');
      if (path.relative(raiz, arquivo).startsWith('..') || segmentos.includes('.git')) { res.writeHead(403); res.end(); return; }
      const tipos = { '.html': 'text/html; charset=utf-8', '.js': 'text/javascript; charset=utf-8', '.css': 'text/css; charset=utf-8', '.svg': 'image/svg+xml', '.json': 'application/json' };
      res.writeHead(200, { 'Content-Type': tipos[path.extname(arquivo)] || 'application/octet-stream', 'Cache-Control': 'no-store' });
      res.end(await fs.readFile(arquivo));
    } catch { res.writeHead(404); res.end(); }
  });
  await new Promise(resolve => server.listen(0, '127.0.0.1', resolve));
  base = `http://127.0.0.1:${server.address().port}`;
  browser = await chromium.launch({ executablePath: edge, headless: true });
  resultado.ambiente.edge = await browser.version();
  console.log('Versões exportadas; axe-core verificado; navegador iniciado.');
}

async function abrir(apelido, largura = 1366, contraste = false, dados = false) {
  const context = await browser.newContext({ viewport: { width: largura, height: 900 }, locale: 'pt-BR' });
  await context.route(/fonts\.googleapis|fonts\.gstatic/, route => route.abort());
  await context.addInitScript(ativado => localStorage.setItem('fullmetal-high-contrast', String(ativado)), contraste);
  const page = await context.newPage();
  await page.bringToFront();
  const erros = [];
  page.on('pageerror', error => erros.push(error.message));
  const url = `${base}/${apelido}/`;
  if (dados) {
    await page.goto(url + 'dados-de-teste.html');
    await page.evaluate(conteudo => FullmetalDados.importarExemplos(conteudo), fixture);
  }
  return { context, page, url, apelido, largura, contraste, erros };
}

async function estabilizar(page) {
  await page.evaluate(() => document.fonts.ready);
  await page.waitForTimeout(180);
}
async function foto(caso, nome, paginaInteira = false) {
  await estabilizar(caso.page);
  const arquivo = `evidencias/${nome}.png`;
  await caso.page.screenshot({ path: path.join(__dirname, arquivo), fullPage: paginaInteira });
  return arquivo;
}
async function geometria(page, seletor) {
  const item = page.locator(seletor).first();
  if (!await item.count()) return null;
  return item.evaluate(el => {
    const r = el.getBoundingClientRect(), s = getComputedStyle(el);
    return { texto: el.textContent.trim().slice(0, 180), largura: r.width, altura: r.height, x: r.x, y: r.y, renderizado: !!el.getClientRects().length && s.visibility !== 'hidden', naJanela: !!el.getClientRects().length && r.top >= 0 && r.bottom <= innerHeight, role: el.getAttribute('role'), live: el.getAttribute('aria-live'), classe: el.className };
  });
}
async function cores(page) {
  return page.evaluate(() => {
    const rgb = texto => { const itens = texto.match(/[\d.]+/g)?.map(Number); return itens?.length >= 3 ? [...itens.slice(0, 3), itens[3] ?? 1] : [0, 0, 0, 0]; };
    const sobre = (frente, fundo) => [...frente.slice(0, 3).map((v, i) => v * frente[3] + fundo[i] * (1 - frente[3])), 1];
    const luminancia = cor => cor.slice(0, 3).map(v => { v /= 255; return v <= .04045 ? v / 12.92 : ((v + .055) / 1.055) ** 2.4; }).reduce((a, v, i) => a + v * [.2126, .7152, .0722][i], 0);
    const saida = [];
    for (const seletor of ['body', '.field-helper', '.btn-primary:not(:disabled)', '.form-control:not(:disabled)', '.error-summary:not([hidden])', '.copy-feedback', '.topbar-link']) {
      const el = document.querySelector(seletor);
      if (!el?.getClientRects().length) continue;
      const s = getComputedStyle(el), cadeia = [];
      for (let p = el; p; p = p.parentElement) cadeia.unshift(rgb(getComputedStyle(p).backgroundColor));
      let fundo = [255, 255, 255, 1];
      for (const camada of cadeia) fundo = sobre(camada, fundo);
      const frente = sobre(rgb(s.color), fundo), l1 = luminancia(frente), l2 = luminancia(fundo);
      const razao = (Math.max(l1, l2) + .05) / (Math.min(l1, l2) + .05);
      const grande = parseFloat(s.fontSize) >= 24 || (parseFloat(s.fontSize) >= 18.6667 && parseInt(s.fontWeight) >= 700);
      saida.push({ seletor, corCSS: s.color, fundoComposto: fundo.slice(0, 3).map(v => Math.round(v)), razao, limite: grande ? 3 : 4.5, atendeParMedido: razao >= (grande ? 3 : 4.5), tamanho: s.fontSize, peso: s.fontWeight });
    }
    return saida;
  });
}

async function auditar(caso, nome) {
  const page = caso.page;
  await estabilizar(page);
  await page.addScriptTag({ content: axeSource });
  const axe = await page.evaluate(async () => {
    const r = await axe.run(document, { runOnly: { type: 'tag', values: ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'] } });
    const resumir = item => ({ id: item.id, impacto: item.impact, ajuda: item.help, referencia: item.helpUrl, tags: item.tags, nos: item.nodes.map(n => ({ alvo: n.target, html: n.html, resumo: n.failureSummary, verificacoes: [...n.any, ...n.all, ...n.none].map(c => ({ id: c.id, dados: c.data })) })) });
    return { versao: r.testEngine.version, violacoes: r.violations.map(resumir), inconclusivos: r.incomplete.map(resumir), regrasAprovadas: r.passes.length };
  });
  const dom = await page.evaluate(() => ({
    titulo: document.title, idioma: document.documentElement.lang,
    larguraDocumento: document.documentElement.scrollWidth, larguraJanela: innerWidth,
    focosPositivos: [...document.querySelectorAll('[tabindex]')].filter(el => el.tabIndex > 0).map(el => el.outerHTML),
    rotulos: [...document.querySelectorAll('input:not([type=hidden]),select,textarea')].filter(el => !el.hidden && !el.disabled && el.getClientRects().length).map(el => ({ id: el.id, labels: [...el.labels || []].map(l => l.textContent.trim()), ariaLabel: el.getAttribute('aria-label'), descricoes: (el.getAttribute('aria-describedby') || '').split(/\s+/).filter(Boolean).map(id => ({ id, existe: !!document.getElementById(id) })) })),
  }));
  const registro = { nome, versao: caso.apelido, largura: caso.largura, contraste: caso.contraste, axe, dom, cores: await cores(page), errosJavaScript: caso.erros };
  resultado.auditorias.push(registro);
  console.log(`Axe ${nome} ${caso.largura}/${caso.contraste ? 'contraste' : 'claro'}: ${axe.violacoes.length} regras sinalizadas; ${axe.inconclusivos.length} inconclusivas.`);
  return registro;
}

async function comparacoes() {
  for (const largura of [1366, 320]) {
    for (const versao of ['contraste-antes', 'contraste-depois']) {
      const c = await abrir(versao, largura, true);
      await c.page.goto(c.url + 'cadastro.html');
      await c.page.keyboard.press('Tab');
      await c.page.locator('#titulo').focus();
      const imagem = await foto(c, `${versao}-${largura}`);
      const audit = await auditar(c, 'cadastro-contraste-historico');
      resultado.comparacoes.push({ caso: 'paleta-e-foco', versao, largura, imagem, cores: audit.cores, foco: await c.page.locator('#titulo').evaluate(el => { const s = getComputedStyle(el); return { largura: s.outlineWidth, cor: s.outlineColor, estilo: s.outlineStyle }; }) });
      await c.context.close();
    }
  }
  for (const versao of ['erro-antes', 'erro-depois']) {
    const c = await abrir(versao, 390, false, true);
    await c.page.goto(c.url + 'triagem.html?id=TESTE-001');
    await c.page.locator('[data-acao=encaminhar]').click();
    await estabilizar(c.page);
    resultado.comparacoes.push({ caso: 'erro-encaminhamento', versao, largura: 390, imagem: await foto(c, versao), erro: await geometria(c.page, '#erro-acao'), feedback: await geometria(c.page, '.action-feedback'), foco: await c.page.locator(':focus').getAttribute('id'), unidade: await c.page.evaluate(() => FullmetalDados.obter('TESTE-001').unidade) });
    await c.context.close();
  }
  for (const versao of ['layout-antes', 'layout-depois']) {
    const c = await abrir(versao, 1366, false, true);
    await c.page.evaluate(() => { const itens = JSON.parse(localStorage.getItem('demandas_fullmetal')); itens.find(d => d.id === 'TESTE-001').localizacao = 'f'.repeat(10000); localStorage.setItem('demandas_fullmetal', JSON.stringify(itens)); });
    await c.page.goto(c.url + 'triagem.html');
    await c.page.locator('#aba-todas').click();
    await c.page.locator('#busca-todas').fill('TESTE-001');
    const linha = c.page.locator('[data-auditoria] tr').first();
    resultado.comparacoes.push({ caso: 'localizacao-legada', versao, largura: 1366, imagem: await foto(c, versao), linha: await linha.boundingBox(), larguraID: await linha.locator('td').first().evaluate(el => el.getBoundingClientRect().width), textoPreservado: await linha.locator('td').nth(3).textContent().then(t => t.length), scroll: await c.page.evaluate(() => ({ documento: document.documentElement.scrollWidth, janela: innerWidth })) });
    await c.context.close();
  }
  for (const versao of ['feedback-antes', 'atual']) {
    const c = await abrir(versao, 390, false, true);
    await c.page.goto(c.url + 'detalhes-da-demanda.html?id=TESTE-001');
    await c.page.evaluate(() => Object.defineProperty(navigator, 'clipboard', { configurable: true, value: { writeText: async valor => { window.copiaControlada = valor; } } }));
    await c.page.locator('#copiar-id').click();
    resultado.comparacoes.push({ caso: 'feedback-copiar', versao, largura: 390, imagem: await foto(c, `copiar-${versao}`), mensagem: await geometria(c.page, '[data-anuncio-detalhes]'), copiado: await c.page.evaluate(() => window.copiaControlada) });
    await c.context.close();
    const lista = await abrir(versao, 320, false, true);
    await lista.page.goto(lista.url + 'painel-de-demandas.html');
    await lista.page.locator('#termo-busca').fill('rede');
    resultado.comparacoes.push({ caso: 'contador-resultados', versao, largura: 320, imagem: await foto(lista, `busca-${versao}`), mensagem: await geometria(lista.page, '[data-anuncio-listagem]'), busca: await lista.page.locator('#termo-busca').boundingBox(), foco: await lista.page.locator(':focus').getAttribute('id') });
    await lista.context.close();
  }
}

async function atual() {
  const telas = [
    ['painel', 'painel-de-demandas.html'], ['cadastro', 'cadastro.html'],
    ['detalhes', 'detalhes-da-demanda.html?id=TESTE-001'],
    ['triagem-fila', 'triagem.html?id=TESTE-001'], ['triagem-todas', 'triagem.html'],
    ['responsavel', 'responsavel.html'], ['importacao', 'dados-de-teste.html'],
  ];
  for (const largura of [1366, 390, 320]) for (const contraste of [false, true]) for (const [nome, tela] of telas) {
    const c = await abrir('atual', largura, contraste, true);
    await c.page.goto(c.url + tela);
    if (nome === 'triagem-todas') await c.page.locator('#aba-todas').click();
    if (nome === 'responsavel') { await c.page.locator('#unidade-dev').selectOption('manutencao'); await c.page.locator('.queue-item').first().click(); }
    if (nome === 'importacao') await c.page.locator('[data-arquivo-manual]').evaluate(el => el.open = true);
    await auditar(c, nome);
    if (nome === 'responsavel' && largura === 320 && !contraste) resultado.visaoAtualMobile = await foto(c, 'atual-responsavel-320');
    await c.context.close();
  }
  for (const largura of [1366, 320]) for (const contraste of [false, true]) {
    const form = await abrir('atual', largura, contraste, true);
    await form.page.goto(form.url + 'cadastro.html');
    await form.page.locator('button[type=submit]').click();
    const audit = await auditar(form, 'cadastro-invalido');
    resultado.interacoes.push({ caso: 'cadastro-invalido', largura, contraste, imagem: !contraste ? await foto(form, `atual-erros-cadastro-${largura}`) : null, foco: await form.page.locator(':focus').getAttribute('id'), erro: await geometria(form.page, '#mensagem-erro'), invalidos: await form.page.locator('[aria-invalid=true]').count(), violacoes: audit.axe.violacoes.length });
    await form.context.close();
    const modal = await abrir('atual', largura, contraste, true);
    await modal.page.goto(modal.url + 'detalhes-da-demanda.html?id=TESTE-001');
    await modal.page.locator('[data-acao=cancelar]').focus();
    await modal.page.keyboard.press('Enter');
    const passos = [];
    // O diálogo nativo pode passar pelo chrome do navegador. Registro isso sem esperar um :focus inexistente.
    for (let i = 0; i < 6; i++) { passos.push(await modal.page.evaluate(() => ({ tag: document.activeElement?.tagName, texto: document.activeElement?.textContent.trim().slice(0, 90), dentro: !!document.activeElement?.closest('dialog'), paginaTemFoco: document.hasFocus() }))); await modal.page.keyboard.press('Tab'); }
    await auditar(modal, 'modal-cancelamento');
    const imagem = !contraste ? await foto(modal, `atual-modal-${largura}`) : null;
    await modal.page.getByRole('button', { name: 'Manter demanda', exact: true }).focus();
    await modal.page.keyboard.press('Escape');
    resultado.interacoes.push({ caso: 'dialogo-teclado', largura, contraste, passos, imagem, retorno: await modal.page.locator(':focus').getAttribute('data-acao') });
    await modal.context.close();
  }
  const vazio = await abrir('atual', 320, false, false);
  await vazio.page.goto(vazio.url + 'painel-de-demandas.html');
  await auditar(vazio, 'lista-vazia');
  resultado.listaVazia = await foto(vazio, 'atual-lista-vazia-320');
  await vazio.context.close();
  const busca = await abrir('atual', 320, false, true);
  await busca.page.goto(busca.url + 'painel-de-demandas.html');
  await busca.page.locator('#termo-busca').fill('sem-resultado-a11y');
  await auditar(busca, 'busca-vazia');
  resultado.buscaVazia = await foto(busca, 'atual-busca-vazia-320');
  await busca.context.close();
}

async function teclado() {
  const c = await abrir('atual', 1366, false, true);
  for (const tela of ['painel-de-demandas.html', 'cadastro.html', 'triagem.html', 'responsavel.html', 'detalhes-da-demanda.html?id=TESTE-001', 'dados-de-teste.html']) {
    await c.page.goto(c.url + tela);
    await c.page.keyboard.press('Tab');
    const primeiro = await c.page.locator(':focus').getAttribute('class');
    await c.page.keyboard.press('Enter');
    resultado.interacoes.push({ caso: 'skip-link', tela, primeiro, destino: await c.page.locator(':focus').getAttribute('id') });
  }
  // As visitas anteriores incluem Responsável; volto explicitamente ao Solicitante antes do formulário.
  await c.page.goto(c.url + 'painel-de-demandas.html');
  await c.page.locator('#perfil-toggle').click();
  await Promise.all([c.page.waitForEvent('load'), c.page.locator('[data-solicitante=madeira]').click()]);
  await c.page.goto(c.url + 'cadastro.html');
  await c.page.keyboard.press('Tab'); await c.page.keyboard.press('Enter');
  const sequencia = [];
  for (let i = 0; i < 6; i++) { await c.page.keyboard.press('Tab'); sequencia.push(await c.page.evaluate(() => ({ id: document.activeElement?.id, tag: document.activeElement?.tagName, texto: document.activeElement?.textContent.trim().slice(0, 45) }))); }
  resultado.interacoes.push({ caso: 'ordem-formulario', sequencia });
  await c.page.locator('#titulo').focus();
  resultado.focoCadastro = await foto(c, 'atual-foco-cadastro');
  await c.page.goto(c.url + 'triagem.html');
  const abas = [];
  await c.page.locator('#aba-fila').focus();
  for (const tecla of ['ArrowRight', 'ArrowLeft', 'End', 'Home', 'Tab']) {
    await c.page.keyboard.press(tecla);
    abas.push({ tecla, foco: await c.page.locator(':focus').getAttribute('id'), abaAtiva: await c.page.locator('[role=tab][aria-selected=true]').getAttribute('id') });
  }
  resultado.interacoes.push({ caso: 'abas-triagem', abas });
  await c.page.locator('#aba-fila').focus();
  resultado.focoAbas = await foto(c, 'atual-foco-abas');
  await c.page.goto(c.url + 'painel-de-demandas.html');
  await c.page.locator('#perfil-toggle').click();
  await Promise.all([c.page.waitForEvent('load'), c.page.locator('[data-solicitante=madeira]').click()]);
  resultado.revisaoPerfil = await c.page.locator('#perfil-toggle').evaluate(el => ({ textoVisivel: el.innerText, textoDOM: el.textContent, nomeDeclarado: el.getAttribute('aria-label'), menuReferenciado: !!document.getElementById(el.getAttribute('aria-controls')) }));
  resultado.imagemPerfil = await foto(c, 'atual-nome-perfil');
  await c.page.locator('#perfil-toggle').click();
  resultado.revisaoPerfil.menuAbertoExiste = await c.page.locator('#perfil-menu').isVisible();
  await c.context.close();
}

async function espacamento() {
  resultado.espacamento = [];
  for (const largura of [1366, 320]) {
    const c = await abrir('atual', largura, false, true);
    await c.page.goto(c.url + 'painel-de-demandas.html');
    await c.page.addStyleTag({ content: '* { line-height: 1.5 !important; letter-spacing: .12em !important; word-spacing: .16em !important; } p { margin-bottom: 2em !important; }' });
    await estabilizar(c.page);
    const medida = await c.page.evaluate(() => ({ documento: document.documentElement.scrollWidth, janela: innerWidth, controles: [...document.querySelectorAll('.topbar a,.topbar button')].filter(el => el.getClientRects().length).map(el => ({ texto: el.innerText, x: el.getBoundingClientRect().x, largura: el.getBoundingClientRect().width, direita: el.getBoundingClientRect().right })) }));
    resultado.espacamento.push({ largura, ...medida, imagem: await foto(c, `atual-espacamento-${largura}`) });
    await c.context.close();
  }
}

(async () => {
  try {
    const complementar = process.argv.includes('--complementar');
    if (complementar) {
      const anterior = JSON.parse(await fs.readFile(path.join(__dirname, 'resultados.json'), 'utf8'));
      if (anterior.gitInicial.head !== git('rev-parse', 'HEAD')) throw new Error('A base mudou; execute a coleta inteira novamente.');
      Object.assign(resultado, anterior);
      resultado.errosExecucao = [];
      resultado.interacoes = resultado.interacoes.filter(i => !['skip-link', 'ordem-formulario', 'abas-triagem'].includes(i.caso));
      resultado.notasExecucao = ['Coleta de teclado repetida após corrigir o roteiro: visitas anteriores haviam deixado o perfil Responsável, que corretamente bloqueia o formulário. Nenhum código da aplicação foi alterado.'];
      resultado.complementadoEmUTC = new Date().toISOString();
    }
    await preparar();
    if (!complementar) { await comparacoes(); await atual(); }
    await teclado();
    await espacamento();
  } catch (erro) { resultado.errosExecucao.push({ mensagem: erro.message, stack: erro.stack }); process.exitCode = 1; }
  finally {
    resultado.gitFinal = { head: git('rev-parse', 'HEAD'), status: git('status', '--porcelain'), branch: git('branch', '--show-current') };
    resultado.resumo = { execucoesAxe: resultado.auditorias.length, atuais: resultado.auditorias.filter(a => a.versao === 'atual').length, comViolacoes: resultado.auditorias.filter(a => a.axe.violacoes.length).length, comInconclusivos: resultado.auditorias.filter(a => a.axe.inconclusivos.length).length };
    await fs.writeFile(path.join(__dirname, 'resultados.json'), JSON.stringify(resultado, null, 2));
    if (browser) await browser.close();
    if (server) await new Promise(resolve => server.close(resolve));
    console.log(JSON.stringify({ resumo: resultado.resumo, erros: resultado.errosExecucao, saida: __dirname }));
  }
})();
