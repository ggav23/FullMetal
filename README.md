# Fullmetal

Sistema web para centralização do registro e acompanhamento de demandas do Instituto Alquimista de Aço.

## Projeto

Projeto desenvolvido para a disciplina de **Projeto Aplicado: Programação Web**.

O objetivo do MVP é disponibilizar uma interface web responsiva e acessível que permita o cadastro, a consulta, a listagem e a visualização de demandas.

O MVP usa apenas Front-end, com exemplos em JSON e dados salvos no localStorage.

## Como executar

1. Abra `index.html` no navegador.
2. Troque o perfil pelo cabeçalho. No perfil Responsável, selecione também a área de atendimento.

O sistema funciona por arquivo local ou HTTP em `localhost` e `127.0.0.1`. A troca de perfis serve para desenvolvimento, sem login real, e não fica habilitada em sites publicados.

## Dados de exemplo

1. Abra `dados-de-teste.html`.
2. Selecione `dados/demandas-exemplo.json` e clique em **Importar arquivo selecionado**. Por HTTP local, também pode usar **Importar exemplos do projeto**.
3. Clique em **Voltar ao sistema**.

Use o mesmo navegador e endereço para importar e abrir o sistema. Importar novamente não duplica nem substitui registros. As alterações ficam no localStorage, sem mudar o JSON. Limpar os dados do navegador pode apagar os registros locais.

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
git switch main
git pull --ff-only
git switch -c feat/detalhes-demanda
```

A revisão manual de acessibilidade ainda está pendente.
