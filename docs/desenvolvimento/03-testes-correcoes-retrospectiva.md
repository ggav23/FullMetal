# Registro de Desenvolvimento 03 — Testes, Correções e Retrospectiva

**Projeto:** Fullmetal  
**Período de referência:** 02–05/10/2026  
**Etapa:** Integração final, testes e correções  
**Registro consolidado retrospectivamente em:** 05/10/2026

> **Nota sobre o registro:** Este documento foi reconstruído retrospectivamente a partir do backlog, aplicação implementada e registros de testes. Como nem todas as discussões foram documentadas no momento em que ocorreram, foram incluídos principalmente problemas, decisões e correções que puderam ser relacionados ao comportamento efetivamente observado no sistema.

### Tópicos abordados

- integração dos fluxos dos três perfis;
- testes do Solicitante, Triagem e Responsável;
- testes em mobile e largura de 320px;
- navegação completa por teclado;
- verificação com leitor de tela NVDA;
- estados de erro, lista vazia e busca sem resultado;
- persistência e consistência entre telas;
- correção de regressões;
- revisão de regras de negócio;
- melhorias de usabilidade;
- levantamento das limitações ainda existentes.

## 1. Objetivo do período

Validar a aplicação já integrada e verificar se os fluxos principais continuavam funcionando de forma coerente após a união das diferentes partes desenvolvidas pela equipe.

Além dos testes funcionais, foram realizados testes de responsividade e acessibilidade, com atenção especial ao uso em 320px, navegação sem mouse e utilização com leitor de tela.

Os problemas encontrados passaram a orientar as últimas correções e discussões da equipe.

## 2. Estratégia de testes

Os testes foram separados em quatro frentes principais:

| Frente | Verificação |
|---|---|
| **Fluxos por perfil** | Solicitante, Triagem e Responsável |
| **Testes gerais** | Estados, erros, persistência, modais e integração |
| **Mobile** | Layout, formulários, listagem, detalhes e modais |
| **Acessibilidade** | Teclado, foco e leitor de tela NVDA |

No fluxo do Solicitante, por exemplo, foi testado o caminho completo de criação e acompanhamento de uma demanda:

**Minhas Demandas → Nova Demanda → Salvar → Detalhes → Cancelar.**

## 3. Principais resultados

De forma geral, os fluxos principais permaneceram funcionais após a integração.

Foram validados comportamentos como:

- cadastro e validação de demandas;
- geração e consulta de identificadores;
- atualização coerente entre telas;
- filtros, pesquisa e ordenação;
- abertura e fechamento de modais;
- persistência de alterações;
- tratamento de IDs inexistentes;
- adaptação das telas para dispositivos móveis;
- navegação por teclado na maior parte da aplicação;
- leitura das principais informações utilizando NVDA.

Também não foram observados erros JavaScript não tratados no console durante a execução dos testes gerais.

## 4. Problemas e melhorias identificados

Os testes revelaram situações que não haviam ficado evidentes durante a implementação isolada das funcionalidades.

### Navegação por teclado na Triagem

Foi identificado que determinadas áreas do perfil de Triagem não podiam ser acessadas entre si utilizando exclusivamente o teclado.

Esse comportamento foi tratado como um problema de acessibilidade, já que a aplicação deveria permitir operação sem mouse.

### Conteúdo excessivamente longo

Uma localização com texto extremamente extenso podia provocar quebra no layout de algumas telas da Triagem.

O problema mostrou a necessidade de considerar não apenas diferentes larguras de tela, mas também valores inesperados inseridos pelo usuário.

### Identificação do Solicitante

Durante os testes, não foi possível comprovar completamente a regra de que cada Solicitante visualizava apenas as próprias demandas.

Alguns registros apresentavam o Solicitante como **“não informado”**, limitando a possibilidade de realizar o teste com usuários diferentes.

### Feedback das ações

Algumas ações funcionavam tecnicamente, mas ofereciam pouco retorno ao usuário.

Um exemplo foi o botão de copiar ID, cuja execução não apresentava uma confirmação suficientemente clara.

Também foram revisadas mensagens e títulos da interface para tornar o contexto do perfil mais compreensível.

## 5. Revisão das regras de negócio

A execução dos fluxos completos também revelou comportamentos que precisavam ser discutidos pela equipe, principalmente:

- possibilidade de encaminhar repetidamente uma mesma demanda;
- troca sucessiva da unidade responsável;
- cancelamento após a demanda já ter sido encaminhada;
- cancelamento pela Triagem depois do encaminhamento;
- alterações repetidas de prioridade;
- excesso de registros gerados no Histórico de Andamento.

Esses pontos mostraram que algumas regras estavam pouco especificadas.

Nem todo comportamento observado foi considerado automaticamente um defeito: quando a especificação não determinava claramente o resultado esperado, o item foi registrado para discussão antes de qualquer alteração.

## 6. Correções e ajustes

A partir dos testes, parte dos problemas e observações foi corrigida diretamente na aplicação.

As correções priorizaram principalmente:

- falhas que impediam ou dificultavam fluxos;
- problemas de acessibilidade;
- inconsistências entre telas;
- comportamentos que poderiam gerar ações repetidas;
- clareza do feedback apresentado ao usuário.

Algumas melhorias permaneceram como pendências ou pontos de discussão por dependerem de decisão de produto ou de regra de negócio.

Os testes foram repetidos após as correções mais relevantes para verificar se os fluxos principais permaneciam funcionais.

## 7. Resultado final do período

Ao final desta etapa, a aplicação possuía os principais fluxos demonstráveis e havia sido submetida a testes funcionais, responsivos e de acessibilidade.

A etapa também gerou evidências mais concretas sobre:

- funcionalidades que funcionaram conforme esperado;
- limitações ainda existentes;
- defeitos encontrados;
- correções realizadas;
- decisões que ainda precisavam ser formalizadas.

Os relatórios detalhados de testes foram mantidos separadamente deste registro para evitar duplicação.

## 8. Retrospectiva

A principal dificuldade percebida durante esta fase foi que algumas funcionalidades haviam sido implementadas antes de suas regras estarem completamente definidas.

Isso ficou mais evidente quando as telas e perfis passaram a ser testados como um fluxo único.

Entre os principais aprendizados do projeto estão:

- critérios de aceitação precisam ser suficientemente específicos antes da implementação;
- acessibilidade precisa ser testada na prática, e não apenas considerada no HTML/CSS;
- testes com dados extremos revelam problemas que o fluxo normal não demonstra;
- funcionalidades integradas precisam ser testadas novamente mesmo quando funcionam isoladamente;
- regras de transição de estado devem ser formalizadas antes de implementar ações disponíveis para vários perfis;
- decisões e problemas deveriam ter sido registrados com maior frequência durante o desenvolvimento, em vez de reconstruídos apenas ao final.

Para uma futura etapa com backend, a equipe deverá revisar principalmente as regras de identificação dos usuários, permissões, transições de status e persistência dos dados antes de avançar na implementação.