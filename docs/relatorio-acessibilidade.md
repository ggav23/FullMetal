# Relatório de acessibilidade — Fullmetal

**Disciplina:** Projeto Aplicado — Programação Web  
**Data:** 17/10/2026  
**Escopo:** interface de cadastro de demandas e verificações complementares de listagem e demais fluxos  
**Referências:** WCAG 2.1 (nível AA, quando aplicável) e eMAG 3.1  
**Requisitos relacionados:** RNF-001, RNF-002, RF-001, RF-002, RF-003 e RF-004

## 1. Objetivo e método

Este relatório reúne os testes de acessibilidade realizados durante o desenvolvimento do Fullmetal, os problemas identificados e as medidas tomadas para corrigi-los.

A avaliação incluiu navegação por teclado, uso do NVDA, inspeção de HTML no navegador, validação de formulários, teste de responsividade em 320 px e auditoria com axe DevTools. Foram incorporados, como material complementar, os registros de auditoria automatizada e as comparações entre versões presentes no pacote `acessibilidade-2026-10-17.zip`.

Os resultados dos testes manuais foram registrados durante a avaliação do sistema. Os dados do pacote automatizado foram analisados documentalmente, sem nova execução do script ou confirmação dos commits. Quando uma verificação foi apenas informada pela equipe responsável pela implementação, essa condição está indicada no texto.

**Versões:** o commit dos primeiros testes manuais não foi registrado. O pacote de auditoria identifica `3917732` como versão de referência anterior à M-01. O identificador da alteração M-01 ainda precisa ser incluído.

## 2. Resumo dos testes

| Teste | Verificação | Resultado |
|---|---|---|
| TA-01 | Navegação por teclado e foco visível | Funcional; melhoria M-01 identificada e correção informada |
| TA-02 | Leitor de tela (NVDA) | Conforme nos cenários testados |
| TA-03 | Rótulos e instruções | Conforme; melhoria visual opcional |
| TA-04 | Validação de formulário | Conforme nos cenários testados |
| TA-05 | Auditoria automática de contraste | Nenhum problema apontado no cadastro |
| TA-06 | Responsividade em 320 px | Conforme nos cenários testados |
| TA-07 | Sucesso, lista vazia, carregamento e erro | Sucesso e lista vazia conformes; demais estados não testados |
| TA-08 | Estrutura semântica e rótulos associados | Conforme nos itens inspecionados |

### TA-01 — Navegação por teclado

O formulário foi preenchido e enviado sem uso do mouse. O foco permaneceu visível e a ordem de navegação foi considerada adequada. No cabeçalho, o indicador de foco foi avaliado como suficientemente perceptível.

Foi identificada, porém, uma dificuldade na distinção entre a borda de erro e o contorno de foco dos campos inválidos, tanto no tema normal quanto no modo de contraste. Essa observação originou a melhoria **M-01**, detalhada na seção 3.

**Referências:** WCAG 2.1, critérios 2.1.1, 2.4.3, 2.4.7 e 1.4.11 (conforme aplicabilidade).

### TA-02 — Leitor de tela

O teste foi executado com NVDA na tela de cadastro. O leitor anunciou os nomes dos campos, as mensagens de validação e a confirmação do envio. Também foi possível completar o cadastro sem recorrer à informação visual.

**Resultado:** não foram encontradas barreiras nos cenários testados. A avaliação não se estendeu a todos os perfis e telas, e não substitui testes com usuários de tecnologias assistivas.

**Referências:** WCAG 2.1, critérios 1.3.1, 3.3.1, 3.3.2, 4.1.2 e 4.1.3.

### TA-03 — Rótulos e instruções

Todos os campos apresentam rótulos. A instrução **“Todos os campos são obrigatórios.”** aparece antes do formulário, e as mensagens de erro explicam as correções necessárias.

**Resultado:** conforme nos itens verificados. Como melhoria de apresentação, recomenda-se destacar um pouco mais a instrução de obrigatoriedade, que atualmente se confunde com os textos próximos. Não foi constatada falha de acessibilidade nesse item.

**Referência:** WCAG 2.1, critério 3.3.2.

### TA-04 — Validação de erros

Foram realizados três testes: envio com campos vazios, envio com título de dois caracteres (`ab`) e correção das informações para concluir o cadastro. Os erros foram apresentados claramente, o título inválido foi rejeitado e as mensagens desapareceram após as correções.

**Resultado:** conforme nos cenários testados. O NVDA também anunciou os erros durante o TA-02.

**Referência:** WCAG 2.1, critério 3.3.1.

### TA-05 — Contraste e auditoria automática

O axe DevTools foi executado na tela de cadastro nos temas normal e de contraste. Não foram apontados problemas nessas execuções. A inspeção visual posterior identificou a oportunidade de melhoria M-01, não detectada como falha pelo teste automático.

**Resultado:** sem falhas automáticas relatadas na tela avaliada. O resultado não cobre, por si só, todos os estados dos controles e telas do sistema.

**Referências:** WCAG 2.1, critérios 1.4.3, 1.4.11 e 2.4.7.

### TA-06 — Responsividade

O formulário foi testado com largura de 320 px. Não houve rolagem horizontal desnecessária, cortes ou sobreposições. O cadastro foi concluído normalmente.

**Resultado:** conforme na tela e largura testadas. O resultado definitivo foi registrado após correção de uma resposta inicial preenchida incorretamente.

**Referência:** WCAG 2.1, critério 1.4.10.

### TA-07 — Estados da interface

| Estado | Resultado |
|---|---|
| Sucesso no cadastro | Mensagem visível; anúncio confirmado com NVDA no TA-02 |
| Busca sem resultados | Mensagem de lista vazia visível |
| Carregamento | Não observado neste teste |
| Falha no carregamento de dados | Não reproduzida neste teste |

**Resultado:** parcialmente verificado. Os cenários de carregamento e falha ainda devem ser simulados e avaliados, inclusive com leitor de tela, antes do encerramento dos testes.

**Referência:** WCAG 2.1, critério 4.1.3, quando aplicável.

### TA-08 — HTML semântico

A inspeção pelo Console encontrou um elemento `main`, um título `h1` com o texto **“Nova demanda”** e rótulos associados aos campos `input`, `select` e `textarea` consultados.

**Resultado:** conforme nos itens inspecionados. A verificação não abrangeu toda a hierarquia de títulos ou a estrutura completa de outras páginas.

**Referência:** WCAG 2.1, critério 1.3.1.

## 3. M-01 — Distinção do foco em campos inválidos

**Origem:** teste manual TA-01.  
**Componente:** campos do formulário “Nova demanda”.  
**Referências:** WCAG 2.1, critérios 2.4.7 (Foco Visível) e 1.4.11 (Contraste Não Textual).  
**Situação:** alteração de código informada pela implementação; reteste manual e evidências posteriores ainda não conferidos nesta documentação.

### 3.1. Situação anterior

Quando um campo apresentava erro, sua borda ficava vermelha ou rosada. Ao receber foco, surgia um segundo contorno da mesma tonalidade, dando principalmente a impressão de uma borda mais grossa. O comportamento era semelhante no modo de contraste, dificultando a diferenciação entre os estados **inválido** e **inválido com foco**.

As quatro capturas feitas durante o teste manual estão identificadas abaixo e foram incluídas no pacote de evidências anterior, em `docs/evidencias/acessibilidade/`.

| Tema | Sem foco | Com foco |
|---|---|---|
| Normal | `Foto2SemFoco_celula_erro.png` | `Foto2Foco_celula_erro.png` |
| Contraste | `Foto3SemFoco_celula_erro_Contraste.png` | `Foto3Foco_celula_erro_Contraste.png` |

### 3.2. Alteração implementada (informações fornecidas pela equipe de desenvolvimento)

Foi informada uma alteração localizada em `css/global.css`, próxima à linha 693. A regra anterior utilizava a cor do estado de erro também para o foco. A nova configuração separa as duas indicações:

| Estado | Apresentação prevista |
|---|---|
| Campo normal | Borda padrão |
| Campo normal com foco | Contorno externo azul; amarelo no modo de contraste |
| Campo inválido | Borda vermelha ou rosada e mensagem de erro |
| Campo inválido com foco | Borda de erro preservada e contorno externo independente |

Segundo o registro da implementação, o contorno é ativado por `:focus-visible`, possui **3 px de espessura** e **3 px de afastamento** da borda. Em modo de cores forçadas do sistema, o traçado passa a ser tracejado. Também foi realizado um ajuste de rolagem para evitar que o cabeçalho encubra o campo em foco. A mudança teria ficado restrita ao CSS, sem alterações nas validações ou no JavaScript.

Essas características são coerentes com o problema identificado e constituem uma solução apropriada em princípio. A verificação do CSS no commit final ainda é necessária para confirmar sua aplicação a todos os campos e temas.

### 3.3. Verificações informadas após a alteração

A implementação registrou testes nos quatro campos do formulário, nos temas normal e contraste, em desktop e em larguras de 390 px e 320 px. Não foram relatados deslocamentos de layout, cortes do contorno ou rolagem horizontal nos cenários avaliados. Também foi informado que **60 testes funcionais existentes passaram**.

Os contrastes informados para os indicadores foram de **6,62:1 e 11,18:1**. Ambos superam 3:1, valor de referência do critério 1.4.11 para indicadores visuais relevantes, desde que a medição tenha sido realizada entre as cores adjacentes apropriadas. Como os pares de cores, o CSS final e o procedimento de cálculo não foram fornecidos, os valores permanecem registrados como **medições informadas, não conferidas**. Isso não equivale a uma declaração de conformidade geral com a WCAG.

Foi indicada ainda a existência de **26 capturas de antes/depois** em um relatório específico da M-01, mantido fora do repositório (`verificacoes-fullmetal/acessibilidade-2026-10-17/M-01/M-01.md`). Esse material ainda não foi recebido nem examinado para a presente revisão.

### 3.4. Reteste a registrar pela equipe

1. Em “Nova demanda”, usar `Tab` até o campo Título e observar o anel de foco.
2. Deixar o campo inválido e retirar o foco; conferir a borda e a mensagem de erro.
3. Retornar ao campo com `Shift+Tab`; verificar se o anel fica nitidamente separado da borda de erro.
4. Repetir no modo de contraste e, se possível, em 320 px, conferindo se o contorno não é cortado.

Depois do reteste, anexar imagens do estado **com foco após a correção**, registrar o resultado visual observado e incluir o identificador do commit ou PR. Até essa confirmação, a M-01 fica **implementada segundo o registro técnico, com validação final pendente**.

## 4. Auditoria complementar e histórico de versões

O pacote `acessibilidade-2026-10-17.zip` contém `RELATORIO-ACESSIBILIDADE.md`, `resultados.json`, `auditoria.cjs` e capturas de tela de diferentes versões do Fullmetal. A coleta registra uso de Edge 155, Playwright e axe-core 4.14.0, com larguras de 1366, 390 e 320 px e os dois temas. As imagens históricas de comparação foram produzidas a partir de versões do repositório, não necessariamente nas datas originais das alterações.

### 4.1. Resultados registrados na coleta

| Indicador | Resultado |
|---|---|
| Execuções do axe-core | 56, sendo 52 na versão de referência |
| Alertas `label-content-name-mismatch` | 24 execuções envolvendo o mesmo botão `#perfil-toggle` |
| Verificações de rolagem horizontal | Sem rolagem horizontal nos 52 cenários atuais documentados |
| Erros de JavaScript nos cenários atuais | Nenhum registrado |

As 24 ocorrências do alerta de nome acessível não representam 24 defeitos diferentes. O botão `#perfil-toggle` deve ser revisado manualmente. Os resultados inconclusivos da auditoria também não podem ser classificados como aprovação.

O resultado do TA-05, sem erros no formulário de cadastro, não contradiz esses alertas, porque a auditoria complementar abrangeu outras telas e estados.

### 4.2. Comparações históricas antes/depois

| ID | Melhoria registrada | Evidências |
|---|---|---|
| EA-01 | Mensagem de erro de encaminhamento passou a aparecer no cartão, com `role="alert"` e foco direcionado | `erro-antes.png` / `erro-depois.png` |
| EA-02 | Ajuste da listagem para textos de localização muito extensos | `layout-antes.png` / `layout-depois.png` |
| EA-03 | Feedback visual após copiar o identificador da demanda | `copiar-feedback-antes.png` / `copiar-atual.png` |
| EA-04 | Quantidade de resultados da busca exibida próxima ao filtro em telas menores | `busca-feedback-antes.png` / `busca-atual.png` |
| EA-05 | Refinamento das cores do tema de contraste, sem falha formal de contraste comprovada na versão anterior | `contraste-antes-1366.png` / `contraste-depois-1366.png` |

As imagens constam do pacote de evidências anterior, em `docs/evidencias/acessibilidade/`. Os commits indicados pela coleta são: EA-01 `b95c84b` → `48673bc`; EA-02 `3039397` → `accbeb4`; EA-03 e EA-04 `a49d137` → `3917732`; EA-05 `0eaa93e` → `0b438f7`. Esses identificadores devem ser conferidos no repositório antes da apresentação.

## 5. Pendências e conclusão

A avaliação inicial confirmou o funcionamento do cadastro por teclado, com NVDA e em 320 px, além da presença de rótulos, instruções e mensagens de erro. A revisão manual identificou uma dificuldade de distinção do foco em campos inválidos, tratada na melhoria M-01. Sua implementação foi descrita pela equipe de desenvolvimento, mas ainda precisa do reteste manual registrado e da inclusão das evidências posteriores neste relatório.

Permanecem pendentes:

- Conferir o commit da M-01 e anexar as capturas do estado corrigido.
- Verificar os cenários de carregamento e erro do TA-07, inclusive os anúncios por leitor de tela.
- Revisar o alerta `label-content-name-mismatch` no seletor de perfil.
- Identificar as versões usadas nos testes manuais e, quando possível, guardar a exportação do axe DevTools e uma gravação do teste com NVDA.
- Ampliar a cobertura para outros fluxos, níveis de zoom e dispositivos reais, conforme o tempo disponível.

Os resultados sustentam as avaliações e melhorias descritas, mas não constituem certificação de conformidade integral com a WCAG ou o eMAG.

## Referências

- W3C. *Web Content Accessibility Guidelines (WCAG) 2.1*. https://www.w3.org/TR/WCAG21/
- W3C. *Understanding SC 2.4.7 — Focus Visible*. https://www.w3.org/WAI/WCAG21/Understanding/focus-visible.html
- W3C. *Understanding SC 1.4.11 — Non-text Contrast*. https://www.w3.org/WAI/WCAG21/Understanding/non-text-contrast.html
- Governo Federal. *Modelo de Acessibilidade em Governo Eletrônico (eMAG) 3.1*. https://emag.governoeletronico.gov.br/
