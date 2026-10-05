# Registro 01 — Estrutura e Interface

**Projeto:** Fullmetal  
**Período de referência:** 28–29/09/2026  
**Etapas:** Estrutura HTML, interface visual e responsividade  
**Registro consolidado retrospectivamente em:** 05/10/2026

> **Nota sobre o registro:** Este documento foi reconstruído retrospectivamente a partir do backlog, requisitos e implementação do projeto. As discussões não foram registradas formalmente no momento em que aconteceram; portanto, são apresentados apenas tópicos e decisões que podem ser relacionados às tarefas efetivamente realizadas.

### Tópicos abordados

- definição e divisão das telas principais;
- estrutura HTML semântica;
- formulário e acessibilidade básica;
- organização do header e componentes compartilhados;
- preparação da interface para dados dinâmicos;
- identidade visual e padronização dos componentes;
- responsividade e abordagem mobile;
- foco visível e estados da interface;
- divisão das tarefas entre os integrantes.

## 1. Objetivo do período

Construir a base visual e estrutural do MVP antes da implementação das regras de negócio.

Foram trabalhadas as três principais áreas da aplicação:

- **Listagem de Demandas**;
- **Cadastro de Demanda**;
- **Detalhes da Demanda**.

Também foram desenvolvidos o header, a navegação e os componentes utilizados entre diferentes páginas.

## 2. Principais decisões

### Separar estrutura, estilo e comportamento

A equipe optou por construir inicialmente as telas em HTML e, em seguida, aplicar o CSS, deixando a lógica JavaScript para a etapa seguinte.

Essa divisão facilitou a distribuição do trabalho e permitiu desenvolver as telas antes da integração com os dados simulados.

### Não inserir demandas diretamente no HTML

A listagem foi preparada para receber os registros posteriormente por JavaScript, evitando manter demandas fixas escritas diretamente nas páginas.

Foram deixadas regiões próprias para listagem, busca, filtros e estados da interface.

### Considerar acessibilidade desde a estrutura

O formulário foi construído com labels associados aos campos, botões identificados e espaço para mensagens de validação.

Também foi considerada a necessidade de navegação por teclado, o que posteriormente levou à preocupação com estados de foco visíveis no CSS.

### Padronizar elementos compartilhados

Header, botões, inputs, dropdowns, badges e outros elementos recorrentes receberam padrões visuais comuns para reduzir inconsistências entre as telas.

### Trabalhar responsividade desde o início

A interface foi adaptada para desktop e mobile durante a etapa de CSS, utilizando como referência o requisito de funcionamento em telas reduzidas, inclusive 320px.

A preocupação principal foi evitar sobreposição, elementos fora da tela e overflow horizontal.

## 3. Organização do trabalho

As tarefas do período foram divididas entre:

| Frente | Trabalho realizado |
|---|---|
| Listagem | Estrutura HTML, busca, filtros, estados e estilização |
| Cadastro | Formulário, labels, botões, erros e responsividade |
| Detalhes | Dados da demanda, histórico, ações, modal e estilização |
| Compartilhado | Header, navegação, perfil e componentes reutilizáveis |

Essa divisão permitiu trabalhar paralelamente em diferentes partes da aplicação.

## 4. Resultado

Ao final do período, as principais telas estavam estruturadas e visualmente preparadas para receber a lógica da aplicação.

A interface já possuía:

- estrutura das três telas principais;
- componentes compartilhados;
- formulário preparado para validações;
- regiões destinadas a dados dinâmicos;
- estados visuais básicos;
- adaptação para desktop e mobile;
- indicação visual de foco nos controles interativos.

A etapa seguinte ficou responsável por transformar essas telas estáticas em uma aplicação dinâmica utilizando JavaScript e dados simulados.

## 5. Avaliação posterior

Os testes realizados mais tarde mostraram que a estrutura responsiva funcionou adequadamente na maior parte dos cenários, inclusive em telas reduzidas.

Também foram encontrados pontos que não haviam sido percebidos nessa etapa, como quebra de layout com textos extremamente extensos e uma limitação de navegação por teclado em parte do fluxo da Triagem.

Esses problemas reforçaram a importância de não considerar acessibilidade e responsividade concluídas apenas pela implementação visual, mas também validá-las posteriormente por testes.