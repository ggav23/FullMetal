# Fullmetal

Sistema web para centralização do registro e acompanhamento de demandas do Instituto Alquimista de Aço.

## Projeto

Projeto desenvolvido para a disciplina de **Projeto Aplicado: Programação Web**.

O objetivo do MVP é disponibilizar uma interface web responsiva e acessível que permita o cadastro, a consulta, a listagem e a visualização de demandas.

Nesta etapa, o projeto será desenvolvido apenas no Front-end, utilizando dados simulados e sem implementação de Back-end real.

## Tecnologias

O projeto será desenvolvido utilizando apenas tecnologias fundamentais da Web:

- HTML5
- CSS3
- JavaScript

Não serão utilizados frameworks ou bibliotecas de Front-end nesta etapa do projeto.

## Documentação

A especificação funcional do projeto, incluindo escopo, perfis de usuário, requisitos funcionais e não funcionais, regras de negócio, permissões e definição das telas, está disponível em:

- [`docs/especificacao-funcional.md`](docs/especificacao-funcional.md)

A documentação será atualizada ao longo do desenvolvimento para manter a relação entre requisitos, implementação e testes.

## Planejamento

O backlog e a divisão das atividades da equipe estão sendo organizados no Notion:

- [Backlog do Projeto no Notion](https://app.notion.com/p/e89c07a7be5e8329a8388141c46b5491?v=a2cc07a7be5e82dfbb8208d3ede9fd58)

O projeto também possui wireframes e protótipos desenvolvidos no Figma.

- [Design do Fullmetal no Figma](https://www.figma.com/design/g2Nxh24OS4DwcEvNPWebBL/Design---Fullmetal?node-id=0-1&t=fSbwMxp3dIKWqhal-1)

## Fluxo de desenvolvimento

Para manter o desenvolvimento organizado e permitir revisão por pares, a equipe adotará o seguinte fluxo:

1. Atualizar a branch `main`.
2. Criar uma nova branch para a tarefa que será desenvolvida.
3. Realizar commits pequenos e descritivos.
4. Enviar a branch para o GitHub.
5. Abrir um Pull Request para a branch `main`.
6. Outro integrante da equipe deverá revisar o Pull Request.
7. Após a revisão, a alteração poderá ser integrada à `main`.

Exemplo de início de uma tarefa:

```bash
git checkout main
git pull
git checkout -b feat/detalhes-demanda