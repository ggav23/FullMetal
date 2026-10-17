# Relatório de Acessibilidade — Fullmetal

**Disciplina:** Projeto Aplicado — Programação Web  
**Status:** Em andamento — testes manuais iniciais  
**Data dos registros:** 17/10/2026  
**Versão/commit avaliado:** 3917732
**Escopo desta rodada:** Cadastro de Demanda  
**Referenciais:** WCAG 2.1 (critérios aplicáveis) e eMAG (recomendações pertinentes)

> Resultados relatados durante a execução manual pelo integrante da equipe. Evidências visuais, versão do código e retestes ainda devem ser vinculados. Os resultados não constituem uma auditoria completa.

## TA-01 — Navegação por teclado

**Resultado:** Navegação funcional; cabeçalho considerado satisfatório pelo avaliador; foco em campo inválido com melhoria pendente.  
**Requisito associado:** RNF-001.  
**Critérios de referência:** WCAG 2.1 — 2.1.1, 2.4.3, 2.4.7; avaliar também 1.4.11 para contraste não textual, conforme aplicável.

**Procedimento:** Navegação, preenchimento e envio do formulário sem utilização de mouse.

**Resultados relatados:**
- O foco pôde ser identificado visualmente.
- A ordem de navegação foi considerada lógica.
- O cadastro pôde ser realizado somente com o teclado.

**Ressalvas registradas:**
1. **Cabeçalho — encerrado nesta rodada:** o avaliador retomou a inspeção e relatou que o foco é visível e que considera possível manter o estilo atual. Não foi observado problema que justifique mudança imediata.
2. **Campo inválido — melhoria pendente:** o avaliador relatou que o foco é perceptível, mas pouco nítido, pois se confunde com a borda vermelha do estado de erro. A mesma dificuldade foi observada com o modo de contraste ativo. Recomenda-se diferenciar visualmente a indicação de foco da indicação de erro, mantendo ambas reconhecíveis.

**Registro de melhoria M-01 — distinção do foco em campo inválido**
- **Antes:** campo inválido apresenta borda vermelha; ao receber foco, a diferença parece ser sobretudo o aumento da espessura dessa mesma borda, inclusive no modo de contraste ativo.
- **Impacto potencial:** dificuldade para identificar rapidamente qual campo está focado usando o teclado.
- **Situação:** melhoria identificada e ainda não implementada. Não foi comprovada violação formal da WCAG; requer inspeção e, se necessário, avaliação de contraste do indicador.
- **Referências:** WCAG 2.1 — 2.4.7 (Foco Visível) e 1.4.11 (Contraste Não Textual), conforme aplicabilidade.
- **Evidência antes:** pendente de anexar captura do campo inválido sem foco e com foco, em modo normal e de contraste ativo.
- **Correção sugerida:** adotar indicador de foco visualmente distinto da borda de erro (por exemplo, contorno externo com afastamento e contraste adequado), sem remover a sinalização vermelha do erro.
- **Commit, evidência depois e reteste:** pendentes.

**Reavaliação informada pelo avaliador:** “O cabeçalho está visível, acho que dá para manter” e “o do campo inválido não achei tão claro (...) no modo com contraste ativo tem o mesmo problema”.

## TA-02 — Leitor de tela (NVDA)

**Resultado:** Conforme nos cenários testados manualmente com NVDA.  
**Requisito associado:** RNF-001.  
**Referências pertinentes:** WCAG 2.1 — 1.3.1 (Informações e Relações), 3.3.1 (Identificação do Erro), 3.3.2 (Rótulos ou Instruções), 4.1.2 (Nome, Função, Valor) e 4.1.3 (Mensagens de Status), conforme aplicabilidade.

**Ferramenta:** NVDA (leitor de tela).  
**Tela/fluxo:** Cadastro de Demanda.  
**Procedimento relatado:** Percorrer o formulário utilizando o leitor de tela; verificar os nomes dos campos; provocar erros de validação; corrigir os dados e cadastrar uma demanda, verificando o anúncio da confirmação.

| Verificação | Resultado relatado |
|---|---|
| Nomes dos campos anunciados corretamente | Sim |
| Mensagens de erro anunciadas | Sim |
| Confirmação de cadastro anunciada | Sim |
| Navegação pelo formulário com apoio do NVDA | Realizada sem dificuldade relatada |

**Observação do avaliador:** “Leitor falou tudo, até testei fechar o olho para me colocar no lugar da pessoa e consegui navegar normalmente.”

**Conclusão:** Nos três cenários observados, o NVDA anunciou as informações esperadas e não foram relatadas barreiras. O teste não demonstra, sozinho, conformidade integral com WCAG/eMAG nem substitui testes com usuários reais. Fechar os olhos foi uma experiência informal complementar, não uma simulação equivalente à experiência de uma pessoa cega.

**Defeitos identificados:** Nenhum relatado nos cenários executados.  
**Evidência audiovisual:** Não anexada; recomenda-se uma gravação curta com áudio do NVDA e sem dados pessoais.  
**Versão/commit e versão do NVDA:** Não informados.  
**Limitação:** Teste concentrado no fluxo de cadastro; outras telas e estados de erro/carregamento permanecem pendentes.

## TA-03 — Rótulos e instruções do formulário

**Resultado:** Conforme nos itens verificados manualmente (reavaliação do registro inicial).  
**Requisitos associados:** RNF-001 e RF-004.  
**Critério de referência:** WCAG 2.1 — 3.3.2 (Rótulos ou Instruções).

**Procedimento:** Inspeção dos rótulos visíveis, identificação dos campos obrigatórios e envio de formulário vazio para observar mensagens de erro.

| Verificação | Resultado relatado |
|---|---|
| Rótulos visíveis em todos os campos | Sim |
| Indicação clara de obrigatoriedade | Sim — o topo do formulário informa “Todos os campos são obrigatórios.” |
| Mensagens de erro claras ao enviar vazio | Sim |

**Retificação:** Na avaliação inicial, a identificação de obrigatoriedade havia sido registrada como parcial. Em nova observação, o avaliador percebeu a instrução existente no topo do formulário. A classificação foi corrigida; **não foi identificado defeito neste item**, portanto nenhuma correção antes/depois é necessária para ele.

**Observação de melhoria (sem defeito confirmado):** Embora a instrução “Todos os campos são obrigatórios.” esteja presente, o avaliador relatou que ela não se diferencia visualmente tanto quanto poderia do texto próximo. Vale considerar maior destaque visual, sem depender apenas de cor. A clareza já foi considerada suficiente no teste funcional; não há reprovação confirmada.

**Complemento:** O TA-02 verificou os anúncios de rótulos, erros e confirmação com NVDA no fluxo de cadastro. A instrução geral de obrigatoriedade não foi avaliada isoladamente.

## TA-04 — Validação e identificação dos erros

**Resultado:** Conforme nos três cenários verificados manualmente.  
**Requisitos associados:** RF-004, RNF-001 e validação VAL-001 (título de 5 a 100 caracteres).  
**Critério de referência:** WCAG 2.1 — 3.3.1 (Identificação do Erro); relacionado também a 3.3.2 (Rótulos ou Instruções).

**Procedimento realizado:** Tentativa de envio com campos vazios; tentativa de envio com título de dois caracteres (`ab`); correção dos campos inválidos e nova tentativa de cadastro.

| Verificação | Resultado relatado |
|---|---|
| Campos inválidos identificados por mensagens claras | Sim |
| Título com dois caracteres rejeitado | Sim |
| Após correção, mensagens/estados de erro desaparecem e o cadastro é concluído | Sim |

**Observação do avaliador:** “Tudo em conformidade. Mensagens claras, título com 2 caracteres rejeitado, após correção o cadastro funciona e o erro na célula desaparece.”

**Defeitos identificados neste teste:** Nenhum relatado.  
**Correção/reteste de código:** Não se aplica a estes cenários, pois não houve falha identificada.  
**Evidência visual:** Ainda não anexada.  
**Limitação:** O resultado comprova apenas os cenários experimentados. Em teste posterior (TA-02), foi relatado que o NVDA anunciou as mensagens de erro.

## TA-05 — Auditoria automática de contraste visual

**Resultado:** Nenhum erro detectado pela ferramenta nos modos testados; avaliação manual do foco pendente.  
**Requisito associado:** RNF-001.  
**Referências:** WCAG 2.1 — 1.4.3 (Contraste Mínimo), 1.4.11 (Contraste Não Textual), conforme aplicabilidade; a inspeção do foco do TA-01 também se relaciona ao critério 2.4.7 (Foco Visível).

**Ferramenta utilizada:** axe DevTools (conforme relato do avaliador).  
**Tela:** Cadastro de Demanda.  
**Procedimento relatado:** Execução de auditoria automática no modo normal e em um modo denominado pelo avaliador “modo contraste”.

| Verificação | Resultado relatado |
|---|---|
| Erros reportados pelo axe DevTools no modo normal | Nenhum |
| Erros reportados pelo axe DevTools no modo contraste | Nenhum |
| Problemas de contraste detectados automaticamente | Nenhum relatado |
| Inspeção manual do foco no cabeçalho e nos campos inválidos | Cabeçalho satisfatório; campo inválido com melhoria M-01 pendente |

**Observação do avaliador:** “Não encontrou nenhum erro (tanto no modo normal quanto no modo contraste).”

**Interpretação:** Não foram identificadas falhas pela auditoria automática executada. Isso **não comprova ausência de todas as barreiras de contraste**, pois indicadores de foco e determinadas mudanças de estado podem exigir verificação manual. A inspeção manual posterior considerou satisfatório o foco do cabeçalho, mas identificou oportunidade de melhoria no foco do campo inválido (M-01). Não foi confirmada uma violação formal de contraste.

**Evidência da auditoria:** Resultado informado verbalmente; captura/exportação do relatório da ferramenta ainda não anexada.  
**Versão/commit:** Não informado.  
**Correção/reteste:** Não houve correção motivada por este teste até o momento.

## TA-06 — Responsividade (320 px)

**Resultado:** Conforme nos cenários verificados manualmente.  
**Requisito associado:** RNF-002 (funcionamento a partir de 320 px).  
**Referência:** WCAG 2.1 — 1.4.10 (Reflow), no que for aplicável.

**Procedimento relatado:** Avaliação do formulário de Cadastro de Demanda com viewport de 320 px, percorrendo os componentes e realizando cadastro.

| Verificação | Resultado relatado |
|---|---|
| Rolagem horizontal desnecessária | Não |
| Elementos cortados ou sobrepostos | Não |
| Preenchimento e cadastro concluídos nessa largura | Sim |

**Observação do avaliador:** “Passou em tudo. Cadastrei normalmente, nada cortado.” O avaliador reiterou uma sugestão de melhoria visual: dar mais destaque à instrução “Todos os campos são obrigatórios.”, já existente no topo do formulário. Esta sugestão está registrada no TA-03, sem classificar automaticamente como falha de acessibilidade.

**Retificação do registro:** Uma mensagem anterior indicava rolagem horizontal, mas o avaliador corrigiu expressamente a informação para **“não”**. Este relatório considera o resultado corrigido.

**Defeitos identificados neste teste:** Nenhum relatado.  
**Evidência visual:** Captura do viewport de 320 px ainda não anexada.  
**Limitação:** O resultado se refere à tela e à largura testadas; não comprova conformidade de todas as telas ou dispositivos.

## TA-07 — Comunicação dos estados da interface

**Resultado:** Parcialmente verificado; os dois cenários executados foram conformes.  
**Requisitos associados:** Escopo dos estados de carregamento, lista vazia, sucesso e erro; RNF-001.  
**Referências para avaliação posterior:** WCAG 2.1 — 4.1.3 (Mensagens de Status), quando aplicável, e 1.3.1 (Informações e Relações).

**Procedimento relatado:** Realização de cadastro válido e verificação da confirmação de sucesso; execução de busca sem correspondências na listagem e verificação do estado de lista vazia. Os cenários de carregamento e falha não foram observados nem reproduzidos.

| Estado | Resultado relatado | Classificação |
|---|---|---|
| Sucesso após cadastrar demanda | Mensagem de confirmação visível | Conforme no cenário testado |
| Lista vazia após busca sem resultados | Mensagem explicativa visível | Conforme no cenário testado |
| Carregamento | Não foi possível observar | Não testado |
| Erro/falha na obtenção de dados | Não foi possível simular ou observar | Não testado |

**Observação do avaliador:** “Não consegui observar o 3 e o 4. 1 e 2 conforme.”

**Conclusão:** O teste TA-07 **não está inteiramente concluído**. Não foram encontrados problemas nos estados de sucesso e lista vazia, mas ainda não há evidência que permita aprovar ou reprovar os estados de carregamento e erro. A presença visual de mensagens não comprova que sejam anunciadas corretamente por tecnologias assistivas. O TA-02 confirmou por relato o anúncio de sucesso no fluxo de cadastro, mas não verificou lista vazia, carregamento e erro com o NVDA.

**Evidências:** Capturas dos estados de sucesso e lista vazia ainda não anexadas.  
**Defeitos identificados:** Nenhum defeito confirmado nos cenários executados.  
**Pendência:** Reproduzir os estados de carregamento e erro em momento oportuno (por exemplo, por cenários simulados controlados pela equipe, sem backend real) e verificar anúncio das mensagens em leitor de tela.

## TA-08 — Estrutura semântica (verificação inicial)

**Resultado:** Conforme nos itens inspecionados (região principal, título e rótulos); verificação semântica ainda incompleta.  
**Tela:** Cadastro de Demanda.  
**Requisito associado:** RNF-001; requisito do enunciado sobre uso de HTML semântico.  
**Referência:** WCAG 2.1 — 1.3.1 (Informações e Relações), conforme aplicabilidade.

**Procedimento relatado:** Inspeção pelo Console do navegador da presença de uma região principal (`main`) e do título principal (`h1`), seguida de verificação inicial das associações de rótulos de campos:

```javascript
document.querySelectorAll('main').length
[...document.querySelectorAll('h1')].map(el => el.textContent.trim())
```

| Verificação | Resultado relatado | Avaliação |
|---|---|---|
| Número de elementos `main` | `1` | Conforme neste item |
| Título do elemento `h1` | `Nova demanda` | Conforme neste item |
| Rótulos de `input`, `select` e `textarea` | Todos os campos exibiram rótulos no comando de inspeção | Conforme na inspeção inicial |

**Observação do avaliador:** Nenhuma.  
**Defeitos identificados nos itens inspecionados:** Nenhum relatado.  
**Evidência:** Saídas do Console informadas pelo avaliador; captura/exportação ainda não anexada.  
**Continuação — associação dos rótulos:** O avaliador executou o comando de inspeção que lista os controles `input`, `select` e `textarea` e seus rótulos via `labels`, `aria-label` ou indicação da presença de `aria-labelledby`. Relatou: “Todos os campos possuem rótulos”, sem observações adicionais. Nenhum controle sem rótulo foi apontado.

**Limitação:** Os resultados são favoráveis, mas a presença de `main`, `h1` e nomes retornados pelo script não comprova, isoladamente, conformidade integral com a WCAG. O script não resolve nem valida o conteúdo referenciado por `aria-labelledby`; a hierarquia dos demais títulos ainda precisa ser avaliada. O anúncio real dos campos foi verificado no TA-02, por relato de teste com NVDA.

**Próxima atividade:** Registrar a evidência anterior da melhoria M-01, ajustar o estilo do foco em campos inválidos e repetir o teste nos modos normal e de contraste ativo; depois retornar aos estados de carregamento e erro do TA-07.

## Pendências para o relatório final

- Vincular os commits ou identificadores das versões avaliadas.
- Anexar capturas do foco em campo inválido (M-01), antes/depois da melhoria, nos modos normal e contraste ativo; o foco do cabeçalho foi considerado visível pelo avaliador.
- Salvar captura ou exportação da auditoria axe DevTools (TA-05) e, se possível, gravação curta do NVDA (TA-02).
- Registrar correções efetivamente implementadas e seus retestes com evidências de depois.
- Concluir os estados ainda não testados no TA-07 (carregamento e erro), aprofundar a estrutura semântica (TA-08) e ampliar os testes com leitor de tela (TA-02) para outras telas e estados.

---

## Anexo A — Complementação por auditoria automatizada e histórico de versões

**Origem:** pacote `acessibilidade-2026-10-17.zip`, produzido por ferramenta de IA e fornecido à equipe para revisão. A análise a seguir utiliza `RELATORIO-ACESSIBILIDADE.md`, `resultados.json`, `auditoria.cjs` e as capturas contidas nesse pacote. **Não é uma nova auditoria independente:** os registros e as capturas foram examinados, mas não houve reexecução do script nem validação independente dos commits contra o repositório.

**Versão declarada da aplicação atual:** `3917732` (`main`, após PR #18). **Coleta declarada:** 17/10/2026, Edge 155, Windows, axe-core 4.14.0, Playwright, larguras de 1366, 390 e 320 pixels CSS, zoom de 100%, nos modos normal e contraste. A coleta automatizada bloqueou Google Fonts e utilizou fontes alternativas. As capturas de *antes/depois* foram **geradas posteriormente a partir de commits históricos**; não foram tiradas nas datas originais das alterações.

### A.1. Síntese da auditoria fornecida

| Indicador | Resultado documentado | Interpretação |
|---|---|---|
| Execuções do axe-core | 56 ao todo; 52 na versão atual | Diversos estados e larguras; não são 56 testes independentes de critérios diferentes |
| Violações automatizadas na versão atual | 24 execuções sinalizaram `label-content-name-mismatch` no mesmo botão `#perfil-toggle` | **Um problema potencial recorrente**, não 24 defeitos distintos; exige revisão manual |
| Resultados inconclusivos | Presentes nas 56 execuções | Não se devem contar como aprovação nem falha confirmada |
| Rolagem horizontal nas 52 verificações atuais | Não observada | Complementa TA-06; não substitui zoom 400% ou celular real |
| Erros de JavaScript nos cenários atuais | Nenhum documentado | Não é teste integral de acessibilidade |

**Comparação com nosso TA-05:** no teste manual relatado pela equipe, o axe DevTools não apontou erros **na tela de cadastro** nos modos testados. O conjunto do ZIP percorre também outras telas, perfis e estados, onde o alerta de nome acessível foi encontrado. Portanto, os dois registros não devem ser apresentados como medições equivalentes nem como resultados contraditórios.

### A.2. Evidências de antes e depois aproveitáveis

As imagens abaixo devem ser mantidas em `docs/evidencias/acessibilidade/` (ou pasta equivalente, com os caminhos atualizados no relatório). A situação descrita é aquela documentada pela coleta automatizada, e não uma observação manual do integrante que executou os testes TA-01 a TA-08.

| ID | Melhoria demonstrada | Arquivos de evidência | Observação importante |
|---|---|---|---|
| EA-01 | Erro ao encaminhar demanda sem unidade: mensagem passou a ficar dentro do cartão, com `role="alert"` e foco no erro | `erro-antes.png`, `erro-depois.png` | Melhor comparação de uma barreira concreta; anúncio por leitor de tela não foi revalidado nessa rodada |
| EA-02 | Localização antiga com 10.000 caracteres: tabela deixou de comprimir as colunas; o texto completo foi preservado no DOM | `layout-antes.png`, `layout-depois.png` | Dado de teste excepcional; melhoria de robustez e legibilidade, não reprovação WCAG comprovada |
| EA-03 | Confirmação da ação de copiar ID tornou-se visualmente perceptível sem retirar o anúncio acessível já existente | `copiar-feedback-antes.png`, `copiar-atual.png` | Houve melhoria visual; não afirmar que antes não havia anúncio para leitor de tela |
| EA-04 | Quantidade de resultados da busca passou a aparecer próxima ao filtro no mobile | `busca-feedback-antes.png`, `busca-atual.png` | Melhoria de feedback para usuários visuais, mantendo a região acessível |
| EA-05 | Paleta do modo contraste foi refinada de fundo preto para azul escuro, mantendo contraste textual medido nos pares amostrados | `contraste-antes-1366.png`, `contraste-depois-1366.png` | **Não afirmar que o contraste anterior reprovava**: pares medidos passaram antes e depois |

**Commits declarados pela coleta:** EA-01: `b95c84b` → `48673bc`; EA-02: `3039397` → `accbeb4`; EA-03 e EA-04: `a49d137` → `3917732` (com alterações integradas); EA-05: `0eaa93e` → `0b438f7`. A equipe deve confirmar esses identificadores no histórico do próprio repositório antes da entrega.

### A.3. Questões ainda abertas

1. **M-01 — foco no campo inválido:** continua pendente. A imagem `atual-foco-cadastro.png` do ZIP mostra um estado com erros, mas **não comprova a comparação com e sem foco, nem a correção que ainda será implementada**. As capturas manuais que o integrante informou possuir precisam ser adicionadas ao repositório; após eventual ajuste, repetir o teste nos modos normal e contraste e capturar o *depois*.
2. **Nome acessível no seletor de perfil:** o axe-core retornou `label-content-name-mismatch` (impacto `serious`) para `#perfil-toggle` em 24 cenários atuais. O relatório da IA considera a interpretação discutível por diferenças de espaçamento/pontuação. **Não declarar o alerta como resolvido sem conferência humana** e, se possível, teste com comando de voz.
3. **TA-07 — carregamento e erro:** não foram reproduzidos nos testes manuais anteriores. As capturas de erro no encaminhamento e de lista vazia do ZIP são úteis, mas não demonstram, por si só, os estados de carregamento e erro na obtenção de dados. Mantê-los pendentes até o cenário correto ser testado.
4. **Escopo:** o teste com NVDA que o integrante realizou é válido para o fluxo de cadastro; a auditoria automatizada não testou novamente os anúncios de leitor de tela na versão atual de todas as telas. Faltam zoom real de 200%/400%, celular físico e revisão do foco nos controles não cobertos.
5. **Outras observações automatizadas:** o botão de contraste ficou estreito sob espaçamento de texto aumentado a 320px; `index.html` usa redirecionamento JavaScript automático, que requer exame em relação ao eMAG. Registros úteis para backlog, sem classificar automaticamente como violações comprovadas da WCAG 2.1 AA.

### A.4. Situação após a integração

O conjunto atual permite apresentar **testes manuais registrados pela equipe** (TA-01 a TA-08), **resultados automatizados complementares** e **cinco comparações históricas antes/depois** documentadas com capturas. A equipe ainda deve anexar as capturas que produziu, confirmar o commit efetivamente testado e realizar o reteste M-01. O material **não comprova conformidade integral** com WCAG 2.1 AA/eMAG, e esse limite deve constar da apresentação.

### A.5. Arquivos de origem e rastreabilidade

- `anexos/RELATORIO-ACESSIBILIDADE-IA.md`: relatório técnico fornecido no ZIP, preservado como fonte de consulta.
- `anexos/resultados.json`: dados de auditoria, referências aos commits e condições de coleta.
- `anexos/auditoria.cjs`: script de auditoria fornecido; antes de executar, inspecionar as dependências, caminhos locais e instruções específicas do ambiente.
- `evidencias/acessibilidade/`: capturas organizadas segundo o nome original. **As capturas referentes aos testes manuais do integrante não estão incluídas**, porque foram informadas, mas ainda não foram enviadas neste diálogo.

