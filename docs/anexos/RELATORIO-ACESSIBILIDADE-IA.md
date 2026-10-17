# Fullmetal — Relatório de acessibilidade

**Data:** 17/10/2026  
**Versão avaliada:** `3917732` — `main`, após o PR #18  
**Situação:** documento para revisão; conferência manual final pendente.

## 1. Resultado geral

O projeto tem evidências concretas de melhoria na identificação de erros, no retorno das ações e na apresentação de textos longos. A amostra atual também funcionou por teclado nos caminhos descritos abaixo e não apresentou rolagem horizontal nas larguras verificadas.

**Ainda não é possível declarar conformidade integral com WCAG nível AA.** Há um alerta automatizado a revisar no seletor de perfil e faltam testes atuais com leitor de tela, zoom real e celular físico. As capturas deste relatório foram produzidas agora a partir dos commits, não são fotografias dos testes históricos.

Resumo da coleta:

| Verificação | Resultado |
| --- | --- |
| Axe-core | 56 execuções: 4 históricas e 52 na versão atual |
| Alertas na versão atual | Um mesmo controle sinalizado em 24 das 52 execuções; não são 24 defeitos diferentes |
| Resultados inconclusivos | Presentes nas 56 execuções; exigem interpretação, não equivalem automaticamente a falhas |
| Rolagem horizontal | Não observada nos 52 estados atuais, a 100% de zoom |
| Erros JavaScript | Nenhum nos 52 estados auditados |
| `tabindex` positivo | Nenhum na amostra atual |
| Regressão funcional | Os 60 testes locais existentes passaram; isso não é uma certificação de acessibilidade |

Os dados completos estão em [resultados.json](resultados.json). Não foi calculado um “percentual de acessibilidade”: contar regras aprovadas não demonstra atendimento de todos os critérios.

## 2. Referência e ambiente

A [especificação funcional](../../Fullmetal/docs/especificacao-funcional.md), seção 4, estabelece **WCAG 2.1 nível AA e eMAG**. Essa é a referência principal. O eMAG não possui a mesma classificação A/AA/AAA da WCAG; suas recomendações são relacionadas separadamente. WCAG 2.2 pode orientar próximos ajustes, mas não foi adicionada como exigência retroativa.

- Windows, build `10.0.26200`; Microsoft Edge `155.0.4283.45`, sem janela, controlado por Playwright.
- Axe-core `4.14.0`, regras etiquetadas `wcag2a`, `wcag2aa`, `wcag21a` e `wcag21aa`.
- Larguras de 1366, 390 e 320 pixels CSS; altura de 900; idioma `pt-BR`; temas claro e contraste.
- Arquivos originais servidos por HTTP local. Os testes usaram contextos descartáveis e o JSON oficial, sem acessar os dados pessoais do navegador.
- Google Fonts foi bloqueado para estabilizar a execução offline; foram usadas as alternativas definidas no CSS. Falta reconferir com as fontes remotas carregadas.
- Zoom do navegador em 100%. A largura de 320 pixels não foi apresentada como teste real de zoom a 400%.

Foram avaliados painel, cadastro, detalhes, fila e tabela da Triagem, Responsável e importação. Também foram incluídos formulário inválido, modal de cancelamento, lista vazia e busca sem resultado. Essa amostra não cobre todas as combinações possíveis de dados e interação.

O arquivo [auditoria.cjs](auditoria.cjs) permite repetir a coleta. Ele mantém os commits fixos, exporta cópias temporárias e grava evidências fora do repositório. Requer Git, PowerShell, Edge e Playwright; nesta máquina utiliza o runtime já disponível. Executar nesta pasta:

```powershell
node auditoria.cjs
```

A primeira execução consulta o pacote oficial do axe-core no npm e verifica sua integridade SHA-512. A versão, a origem e o hash do script ficam registrados no JSON. O código da aplicação não é editado.

## 3. Versões comparadas

| Comparação | Antes | Depois |
| --- | --- | --- |
| Paleta do contraste | `0eaa93e`, 29/09/2026 às 18h07 | `0b438f7`, 29/09/2026 às 23h10 |
| Erro ao encaminhar sem unidade | `b95c84b`, 03/10 | `48673bc`, 03/10 |
| Localização antiga muito extensa | `3039397`, 04/10 | `accbeb4`, 04/10 |
| Retorno da cópia e da busca | `a49d137`, antes do ajuste `09824f5` | `3917732`, versão atual com o ajuste integrado |

Os hashes completos e as datas estão no JSON. Entre as duas versões da paleta, o commit alterou somente `css/global.css`; isso evita atribuir outras mudanças de interface ao contraste. Nas demais comparações há alterações adicionais: as conclusões abaixo se limitam ao comportamento reproduzido.

## 4. Evidências antes/depois

### 4.1. Paleta: refinamento visual sem perda do contraste medido

O fundo preto foi substituído por azul escuro. Isso não prova que a versão anterior era inacessível. Os três pares abaixo atendem ao mínimo de 4,5:1 para texto comum, antes e depois. O cálculo utilizou cores computadas pelo navegador, incluindo composição de fundos transparentes; não a cor de pixels suavizados da imagem. [Referência: WCAG 1.4.3](https://www.w3.org/WAI/WCAG21/Understanding/contrast-minimum.html).

| Par amostrado no cadastro | Antes | Depois |
| --- | --- | --- |
| Texto principal / fundo | 21,00:1 | 17,33:1 |
| Texto de ajuda / fundo | 14,25:1 | 12,16:1 |
| Texto / fundo do campo | 18,73:1 | 15,16:1 |

Os campos já apresentavam contorno de foco de 3 pixels nas duas versões. O contraste antigo e o novo não tiveram reprovação automática nos quatro cenários históricos, mas houve resultados inconclusivos. Portanto, o registro correto é **refinamento de apresentação preservando os pares medidos**, não “reprovação corrigida” nem aprovação de toda a paleta.

| Antes — 1366 × 900, contraste ativo | Depois — mesma tela e condições |
| --- | --- |
| ![Cadastro com fundo preto e campo Título em foco](evidencias/contraste-antes-1366.png) | ![Cadastro com fundo azul escuro e campo Título em foco](evidencias/contraste-depois-1366.png) |

Versões mobile: [antes, 320px](evidencias/contraste-antes-320.png) e [depois, 320px](evidencias/contraste-depois-320.png).

### 4.2. Encaminhamento inválido: erro visível e com foco

Ao encaminhar `TESTE-001` sem escolher unidade, a mensagem antiga ficava abaixo do cartão e parcialmente fora da janela de 390 × 900. Não recebia foco. Após a correção, a mensagem fica dentro do cartão, usa `role="alert"`, recebe foco em `#erro-acao` e o campo é marcado com `aria-invalid` e associado ao erro. A unidade continuou vazia nas duas tentativas: nenhum encaminhamento inválido foi salvo.

Isso ajuda Rafael a perceber o erro ao usar teclado e fornece relações programáticas para Bia. A leitura efetiva pelo NVDA ainda precisa ser reconferida. Relaciona-se aos critérios 3.3.1, 3.3.2 e 4.1.3 e ao eMAG 6.6. Implementação: [js/acoes.js](../../Fullmetal/js/acoes.js), `mostrarErro()`.

| Antes — mensagem cortada no fim da janela | Depois — mensagem e foco dentro do cartão |
| --- | --- |
| ![Tentativa sem unidade antes da correção](evidencias/erro-antes.png) | ![Tentativa sem unidade com o erro em destaque após a correção](evidencias/erro-depois.png) |

### 4.3. Texto legado longo: preservação da tabela e do conteúdo

Foi reproduzido um registro antigo com 10.000 caracteres na localização, inserido somente no armazenamento do contexto de teste. Não se trata de uma nova entrada aceita pelo formulário atual, que limita o campo a 100 caracteres.

Na tabela da Triagem, a linha passou de aproximadamente **1299 para 96 pixels**. A coluna do ID passou de cerca de **45 para 172 pixels**, deixando de ser esmagada pelo texto da localização. O DOM manteve os 10.000 caracteres; a lista usa uma prévia limitada e os detalhes continuam sendo o local para consultar o conteúdo completo.

É evidência de robustez e legibilidade. Não foi convertida automaticamente em reprovação formal do critério 1.4.10, pois tabelas podem exigir análise específica. Implementação: [css/atendimento.css](../../Fullmetal/css/atendimento.css) e [js/atendimento.js](../../Fullmetal/js/atendimento.js).

| Antes — colunas comprimidas | Depois — prévia com estrutura preservada |
| --- | --- |
| ![Tabela com localização extensa comprimindo os demais campos](evidencias/layout-antes.png) | ![Tabela após o tratamento da localização extensa](evidencias/layout-depois.png) |

### 4.4. Cópia: retorno visual sem retirar o anúncio acessível

A mensagem já existia para leitores de tela, mas ficava em uma região `sr-only` de 1 × 1 pixel. Agora “ID copiado” aparece junto ao botão, mantendo `role="status"` e `aria-live="polite"`. A mudança ajuda quem enxerga a tela; não é apresentada como criação de um anúncio que antes não existia. [Referência: WCAG 4.1.3](https://www.w3.org/WAI/WCAG21/Understanding/status-messages.html).

O teste usou uma API de cópia controlada para conferir o retorno, sem sobrescrever a área de transferência do usuário. A cópia real e a fala do leitor de tela permanecem no roteiro manual. Implementação: [js/detalhes.js](../../Fullmetal/js/detalhes.js) e [css/acoes.css](../../Fullmetal/css/acoes.css).

| Antes — mensagem apenas para tecnologia assistiva | Depois — retorno também visível |
| --- | --- |
| ![Detalhes sem confirmação visual da cópia](evidencias/copiar-feedback-antes.png) | ![Detalhes com a mensagem ID copiado ao lado do botão](evidencias/copiar-atual.png) |

### 4.5. Busca mobile: quantidade de resultados perto do campo

O contador anterior também era `sr-only` e ficava depois da listagem. Agora permanece anunciado e aparece no bloco da busca. Na comparação a 320 pixels, o foco continuou em `#termo-busca` e o retorno foi “1 demanda encontrada”. É melhoria de percepção para Dona Célia, sem alegar correção de uma falha de anúncio não demonstrada. Implementação: [painel-de-demandas.html](../../Fullmetal/painel-de-demandas.html) e [js/listagem-demandas.js](../../Fullmetal/js/listagem-demandas.js).

| Antes — contador não visível na busca | Depois — contador junto aos filtros |
| --- | --- |
| ![Busca mobile antes do contador visível](evidencias/busca-feedback-antes.png) | ![Busca mobile com quantidade de resultados visível](evidencias/busca-atual.png) |

## 5. Estado atual e necessidades dos usuários

| Item | Evidência atual | Classificação e limite |
| --- | --- | --- |
| Estrutura, rótulos e instruções — 1.3.1 / 3.3.2 | HTML semântico, labels associados, instruções e referências dos campos; nenhum campo ativo sem rótulo na amostra | Verificado na amostra; não comprova leitura real pela Bia |
| Atalho para conteúdo — 2.4.1 | Primeiro Tab alcançou o skip link e Enter moveu o foco para `#conteudo` nas seis páginas | Verificado por teclado automatizado |
| Ordem e foco — 2.4.3 / 2.4.7 | Cadastro: Título → Descrição → Categoria → Localização → Salvar → Cancelar; sem `tabindex` positivo | Verificado nesse caminho; falta exploração humana integral |
| Abas da Triagem — 2.1.1 | Setas alternaram as abas, Home/End foram respeitados e Tab seguiu para a busca | Relato de falha anterior não reproduzido no ambiente atual; não houve correção feita para encerrar esse relato |
| Modal — 2.1.1 / 2.1.2 | Enter abriu; Esc fechou e devolveu o foco a Cancelar, nos dois temas e larguras testadas | Nenhum controle da página de fundo recebeu foco; houve passagem pelo chrome do navegador, própria do diálogo nativo |
| Erros e mensagens — 3.3.1 / 4.1.3 | Resumo do cadastro recebeu foco, quatro campos foram marcados inválidos; status de busca e cópia possuem regiões de anúncio | Estrutura e comportamento verificados; fala efetiva pendente |
| Contraste — 1.4.3 | Pares textuais medidos atendem; nenhum alerta automático conclusivo dessa regra | Parcial: ícones e demais resultados inconclusivos ainda exigem revisão |
| Reflow — 1.4.10 | Sem rolagem horizontal nos 52 estados atuais em 1366, 390 e 320px | Parcial: não substitui zoom real nem teste no aparelho da Dona Célia |
| Espaçamento — 1.4.12 | Painel testado com entrelinha 1,5; parágrafos 2em; letras 0,12em e palavras 0,16em, em 1366 e 320px | Sem overflow horizontal; apenas uma tela amostrada. O botão Contraste encolheu: observação abaixo |
| Nome visível e nome acessível — 2.5.3 | Alerta do axe no botão `#perfil-toggle` quando há nome de Solicitante | Inconclusivo até revisão descrita na seção 6 |
| NVDA e TalkBack | Existe relato da equipe de 04/10 com leitura pelo NVDA aprovada | Não foi testado novamente nesta rodada; não comprova a versão atual |

As linhas da matriz remetem à [WCAG 2.1](https://www.w3.org/TR/WCAG21/). No eMAG, as relações principais são: 1.3/1.4 para estrutura e ordem; 1.5 para âncoras; 2.1 para teclado; 4.1/4.4 para contraste e foco; 6.2/6.5/6.6 para formulários e retorno. Esse mapeamento não representa avaliação completa de todas as recomendações do [eMAG](https://emag.governoeletronico.gov.br/).

O comportamento das abas segue o padrão de [Tabs da WAI-ARIA APG](https://www.w3.org/WAI/ARIA/apg/patterns/tabs/): Tab não precisa visitar todas as abas; as setas percorrem o conjunto. Para reconciliar o relato TEC-02, ainda é necessário registrar o navegador, as teclas e o modo do NVDA usados pelo avaliador.

Evidências adicionais: [foco no cadastro](evidencias/atual-foco-cadastro.png), [foco nas abas](evidencias/atual-foco-abas.png), [modal mobile](evidencias/atual-modal-320.png), [lista vazia](evidencias/atual-lista-vazia-320.png) e [Responsável a 320px](evidencias/atual-responsavel-320.png).

## 6. Alertas, limitações e próximos passos

### Nome do seletor de perfil — revisar, sem concluir falha só pelo axe

O axe-core sinalizou `label-content-name-mismatch`, relacionado a comandos de voz. No caso Madeira:

- Texto visível em linhas separadas: “Perfil:”, “Solicitante”, “Madeira”.
- `textContent` concatenado: `Perfil:SolicitanteMadeira`.
- `aria-label`: `Perfil: Solicitante, Madeira. Alterar perfil de demonstração`.

As palavras estão presentes no nome declarado. A orientação da WCAG permite desconsiderar diferenças de pontuação e capitalização; por isso, o alerta não foi tratado aqui como reprovação confirmada. A separação do texto em spans merece revisão e teste com entrada por voz antes de classificar o resultado. Não foi feita alteração para “zerar” a ferramenta. [Critério 2.5.3 e suas orientações](https://www.w3.org/WAI/WCAG21/Understanding/label-in-name.html).

O axe também deixou `aria-controls` para revisão. Foi conferido que `#perfil-menu` existe e fica visível ao abrir o seletor. Os resultados inconclusivos de contraste envolvem, entre outros, o símbolo decorativo `◐`; eles não autorizam declarar que toda a interface passou. A [documentação do axe-core](https://github.com/dequelabs/axe-core) distingue verificações automatizáveis das que precisam de avaliação humana.

### Observação de toque com texto espaçado

Com o espaçamento de texto aumentado a 320px, o botão Contraste ficou com cerca de **25px de largura**, embora o design use 44px como meta para toque. Não houve rolagem horizontal e o ícone permaneceu visível. Isso merece refinamento para Dona Célia, mas não foi rotulado como falha automática do nível AA da WCAG 2.1: a simples medida de 44px não é uma exigência desse nível. [Captura](evidencias/atual-espacamento-320.png); [orientação sobre espaçamento](https://www.w3.org/WAI/WCAG21/Understanding/text-spacing.html).

### Entrada do sistema e eMAG

`index.html` usa redirecionamento JavaScript automático, com um link alternativo disponível. A recomendação 2.4 do eMAG pede evitar redirecionamento automático de páginas. Esse ponto permanece **parcial** e deve ser justificado ou revisto ao definir a navegação de entrada; não foi escondido pela checagem de contraste.

### Testes manuais prioritários

1. **Bia / NVDA:** registrar versão do leitor, navegador, modo de navegação e avaliador. Percorrer títulos, campos, erros, confirmação de envio, detalhes, status, abas e modal. Anotar a fala realmente ouvida, inclusive “ID copiado”.
2. **Rafael / teclado real:** repetir o fluxo completo com Tab, Shift+Tab, Enter, Espaço, setas e Esc. Conferir retorno e visibilidade do foco, inclusive com a página rolada e o menu aberto.
3. **Zoom:** verificar 200% e 400% no navegador real. Não registrar apenas uma janela estreita como prova de zoom.
4. **Dona Célia / celular físico:** registrar aparelho, sistema, navegador e orientação. Conferir toque, teclado virtual, campos, seletores e retorno à fila; repetir com TalkBack se disponível.
5. **Entrada por voz e revisão visual:** confirmar ou descartar o alerta do seletor de perfil; medir os ícones e bordas essenciais nos estados normal, hover e foco; reconferir com as fontes oficiais.

Para cada teste, registrar: versão/commit, ambiente, passos, resultado esperado, resultado observado e evidência. Não marcar os itens acima como concluídos apenas porque a automação passou.

O relatório manual recebido da equipe, `RelatórioTestesGeraisMobileAcess.md` de 04/10, informa NVDA aprovado, mas mantém o responsável como “[preencher]” e não identifica versões do navegador/leitor nem o commit. O [registro retrospectivo do projeto](../../Fullmetal/docs/desenvolvimento/03-testes-correcoes-retrospectiva.md) resume os testes, mas não substitui essas informações. São relatos históricos úteis, não uma nova validação da versão de 17/10.

## 7. Conclusão

Há evidências reproduzíveis de evolução, principalmente no erro de encaminhamento, no retorno visual das ações e na resistência a textos antigos extensos. As duas paletas de contraste preservaram os mínimos nos pares medidos. Os atalhos, as abas e os modais funcionaram nos roteiros executados.

O próximo passo é a reconferência humana, especialmente NVDA, zoom e celular físico, além de revisar os alertas e a entrada automática. Este documento não declara que o projeto está integralmente conforme WCAG/eMAG.

**Preservação do projeto:** o repositório permaneceu na `main`, commit `3917732`, sem modificações. A largura oficial continua sendo 1080px; o experimento local de 1200px não faz parte desta coleta. Não houve commit, push ou alteração no GitHub Pages.
